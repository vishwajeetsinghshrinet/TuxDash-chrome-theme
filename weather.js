const cityKey = "tuxdashWeatherCity";
const readingKey = "tuxdashWeatherReading";
const refreshMs = 15 * 60_000;
const button = document.getElementById("weatherButton");
const summary = document.getElementById("weatherSummary");
const icon = document.getElementById("weatherIcon");
const meta = document.getElementById("weatherMeta");
const asOf = document.getElementById("weatherAsOf");
const panel = document.getElementById("weatherSettings");
const input = document.getElementById("cityName");
const status = document.getElementById("cityStatus");
const results = document.getElementById("cityResults");
const removeButton = document.getElementById("removeWeather");

function readSetting(key) {
  try { return JSON.parse(localStorage.getItem(key)); }
  catch { return null; }
}

function writeSetting(key, value) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // The widget also works for this tab when local storage is full or disabled.
  }
}

function validCity(place) {
  return Number.isInteger(place?.id) && typeof place.name === "string" && place.name.trim() &&
    Number.isFinite(place.latitude) && Math.abs(place.latitude) <= 90 &&
    Number.isFinite(place.longitude) && Math.abs(place.longitude) <= 180;
}

function validReading(data, place) {
  return !!place && data?.cityId === place.id && Number.isFinite(data.temperature) &&
    Number.isInteger(data.code) && Number.isFinite(new Date(data.time).getTime()) &&
    Number.isFinite(data.time) && data.time > 0 &&
    Number.isFinite(data.fetched) && data.fetched > 0;
}

const conditions = [
  [[0], "Clear", "☀️"], [[1], "Mostly clear", "🌤️"], [[2], "Partly cloudy", "⛅"],
  [[3], "Overcast", "☁️"], [[45, 48], "Fog", "🌫️"], [[51, 53, 55], "Drizzle", "🌦️"],
  [[56, 57], "Freezing drizzle", "🌧️"], [[61, 63, 65], "Rain", "🌧️"],
  [[66, 67], "Freezing rain", "🌧️"], [[71, 73, 75, 77], "Snow", "🌨️"],
  [[80, 81, 82], "Rain showers", "🌦️"], [[85, 86], "Snow showers", "🌨️"],
  [[95], "Thunderstorm", "⛈️"], [[96, 99], "Thunderstorm with hail", "⛈️"],
];

let city = readSetting(cityKey);
if (!validCity(city)) city = null;
let reading = readSetting(readingKey);
if (!validReading(reading, city)) reading = null;
let activeRequest;
let searchVersion = 0;
let retryAfter = 0;

function render() {
  removeButton.hidden = !city;
  meta.hidden = !city;
  icon.textContent = "☁";
  button.title = city ? "Change weather location" : "Set weather city";
  if (!city) {
    summary.textContent = "Set weather city";
    return;
  }
  if (!reading) {
    summary.textContent = city.name + " · " + (retryAfter ? "Weather unavailable" : "Loading weather…");
    asOf.textContent = retryAfter ? "Will retry" : "Source";
    return;
  }
  const [, description, symbol] = conditions.find(([codes]) => codes.includes(reading.code)) || [[], "", "🌡️"];
  icon.textContent = !reading.day && [0, 1].includes(reading.code) ? "☾" : symbol;
  summary.textContent = [city.name, Math.round(reading.temperature) + " °C", description].filter(Boolean).join(" · ");
  const old = retryAfter || Date.now() - reading.time > 2 * refreshMs;
  const timeFormat = {hour: "numeric", minute: "2-digit"};
  if (new Date(reading.time).toDateString() !== new Date().toDateString()) {
    Object.assign(timeFormat, {month: "short", day: "numeric"});
  }
  asOf.textContent = (old ? "Last reading " : "As of ") + new Intl.DateTimeFormat(undefined, timeFormat).format(reading.time);
}

async function getJson(endpoint, params, signal) {
  const url = new URL(endpoint);
  url.search = new URLSearchParams(params);
  const response = await fetch(url, {
    credentials: "omit", referrerPolicy: "no-referrer", signal,
  });
  if (!response.ok) throw new Error("Weather service unavailable");
  return response.json();
}

async function refresh() {
  render();
  if (!city || document.hidden || activeRequest || Date.now() < retryAfter) return;
  if (reading && Date.now() - reading.fetched < refreshMs && Date.now() >= reading.fetched) return;
  const place = city;
  const controller = new AbortController();
  activeRequest = controller;
  const timer = setTimeout(() => controller.abort(), 10_000);
  try {
    const { current } = await getJson("https://api.open-meteo.com/v1/forecast", {
      latitude: place.latitude, longitude: place.longitude, current: "temperature_2m,weather_code,is_day",
      temperature_unit: "celsius", timeformat: "unixtime", forecast_days: 1,
    }, controller.signal);
    if (activeRequest !== controller) return;
    if (!Number.isInteger(current?.time) || current.time <= 0 || !Number.isFinite(current.temperature_2m) ||
        !Number.isInteger(current.weather_code)) throw new Error("Incomplete reading");
    reading = {cityId: place.id, temperature: current.temperature_2m, code: current.weather_code,
      day: current.is_day, time: current.time * 1000, fetched: Date.now()};
    retryAfter = 0;
    writeSetting(readingKey, reading);
  } catch {
    if (activeRequest === controller) retryAfter = Date.now() + 3 * 60_000;
  } finally {
    clearTimeout(timer);
    if (activeRequest === controller) {
      activeRequest = null;
      render();
    }
  }
}

function setCity(place) {
  activeRequest?.abort();
  activeRequest = null;
  city = place;
  retryAfter = 0;
  const cached = readSetting(readingKey);
  reading = validReading(cached, city) ? cached : null;
  refresh();
}

document.getElementById("cityForm").addEventListener("submit", async event => {
  event.preventDefault();
  const name = input.value.trim();
  const version = ++searchVersion;
  results.replaceChildren();
  if (name.length < 2) {
    status.textContent = "Enter at least two characters.";
    return;
  }
  status.textContent = "Searching…";
  try {
    const data = await getJson("https://geocoding-api.open-meteo.com/v1/search",
      {name, count: 5, language: "en", format: "json"}, AbortSignal.timeout(10_000));
    if (version !== searchVersion) return;
    const matches = (data.results || []).filter(validCity);
    status.textContent = matches.length ? "Choose a location" : "No cities found. Try a nearby city.";
    for (const match of matches) {
      const choice = document.createElement("button");
      choice.type = "button";
      choice.textContent = [...new Set([match.name, match.admin1, match.country].filter(Boolean))].join(", ");
      choice.addEventListener("click", () => {
        const {id, name, latitude, longitude} = match;
        const place = {id, name, latitude, longitude};
        writeSetting(cityKey, place);
        setCity(place);
        panel.hidePopover();
      });
      const li = document.createElement("li");
      li.append(choice);
      results.append(li);
    }
  } catch {
    if (version === searchVersion) status.textContent = "City search is unavailable. Try again.";
  }
});

panel.addEventListener("beforetoggle", () => {
  ++searchVersion;
  results.replaceChildren();
  status.textContent = "";
  input.value = "";
});
removeButton.addEventListener("click", () => {
  writeSetting(cityKey, null);
  writeSetting(readingKey, null);
  setCity(null);
  panel.hidePopover();
});
window.addEventListener("storage", event => {
  if (event.key === cityKey || event.key === null) {
    const place = readSetting(cityKey);
    setCity(validCity(place) ? place : null);
  } else if (event.key === readingKey) {
    const cached = readSetting(readingKey);
    if (validReading(cached, city)) {
      reading = cached;
      retryAfter = 0;
      render();
    }
  }
});
window.addEventListener("online", () => { retryAfter = 0; refresh(); });
document.addEventListener("visibilitychange", () => { if (!document.hidden) refresh(); });
setInterval(() => { if (!document.hidden) refresh(); }, 60_000);
refresh();
