const wallpapers = [
  "images/tux-1.webp",
  "images/tux-2.webp",
  "images/tux-3.webp",
  "images/tux-4.webp",
  "images/tux-5.webp",
];

const previousButton = document.getElementById("previousWallpaper");
const nextButton = document.getElementById("nextWallpaper");
const favoriteButton = document.getElementById("favoriteWallpaper");
const wallpaperCounter = document.getElementById("wallpaperCounter");

const timeElement = document.getElementById("time");
const dateElement = document.getElementById("date");

const favoriteWallpapers =
  JSON.parse(localStorage.getItem("tuxdashFavorites")) || [];

let currentIndex = Math.floor(Math.random() * wallpapers.length);

/**
 * Wallpaper
 */

function getCurrentWallpaper() {
  return wallpapers[currentIndex];
}

function isFavorite() {
  return favoriteWallpapers.includes(getCurrentWallpaper());
}

function updateFavoriteButton() {
  const favorite = isFavorite();

  favoriteButton.textContent = favorite ? "♥" : "♡";

  favoriteButton.classList.toggle("is-favorite", favorite);

  favoriteButton.setAttribute("aria-pressed", favorite);
}

function updateCounter() {
  wallpaperCounter.textContent = `${currentIndex + 1} / ${wallpapers.length}`;
}

function showWallpaper() {
  document.body.style.backgroundImage = `url("${getCurrentWallpaper()}")`;

  updateCounter();
  updateFavoriteButton();
}

function nextWallpaper() {
  currentIndex = (currentIndex + 1) % wallpapers.length;

  showWallpaper();
}

function previousWallpaper() {
  currentIndex = (currentIndex - 1 + wallpapers.length) % wallpapers.length;

  showWallpaper();
}

function toggleFavorite() {
  const wallpaper = getCurrentWallpaper();

  const favoriteIndex = favoriteWallpapers.indexOf(wallpaper);

  if (favoriteIndex === -1) {
    favoriteWallpapers.push(wallpaper);
  } else {
    favoriteWallpapers.splice(favoriteIndex, 1);
  }

  localStorage.setItem("tuxdashFavorites", JSON.stringify(favoriteWallpapers));

  updateFavoriteButton();
}

nextButton.addEventListener("click", nextWallpaper);

previousButton.addEventListener("click", previousWallpaper);

favoriteButton.addEventListener("click", toggleFavorite);

/**
 * Clock
 */

function updateClock() {
  const now = new Date();

  const time = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const date = now.toLocaleDateString([], {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  timeElement.textContent = time;
  dateElement.textContent = date;
}

updateClock();

setInterval(updateClock, 1000);

/**
 * Start
 */

showWallpaper();
