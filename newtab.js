const wallpapers = [
  "images/tux-1.webp",
  "images/tux-2.webp",
  "images/tux-3.webp",
  "images/tux-4.webp",
  "images/tux-5.webp",
  "images/tux-6.webp",
  "images/tux-7.webp",
  "images/tux-8.webp",
  "images/tux-9.webp",
  "images/tux-10.webp",
  "images/tux-11.webp",
  "images/tux-12.webp",
  "images/tux-13.webp",
];

const previousButton = document.getElementById("previousWallpaper");
const nextButton = document.getElementById("nextWallpaper");
const favoriteButton = document.getElementById("favoriteWallpaper");
const wallpaperCounter = document.getElementById("wallpaperCounter");

const timeElement = document.getElementById("time");
const dateElement = document.getElementById("date");

const wallpaperStorageKey = "tuxdashFavorites";
let favoriteWallpapers = new Set();
let canStoreWallpapers = true;

function loadWallpaperFavorites() {
  if (!canStoreWallpapers) return;
  let raw;
  try {
    raw = localStorage.getItem(wallpaperStorageKey);
  } catch {
    canStoreWallpapers = false;
    return;
  }
  try {
    const saved = JSON.parse(raw);
    favoriteWallpapers = new Set(Array.isArray(saved) ? saved.filter(path => wallpapers.includes(path)) : []);
  } catch {
    favoriteWallpapers.clear();
  }
}

loadWallpaperFavorites();
let currentIndex = Math.floor(Math.random() * wallpapers.length);

/**
 * Wallpaper
 */

function getCurrentWallpaper() {
  return wallpapers[currentIndex];
}

function isFavorite() {
  return favoriteWallpapers.has(getCurrentWallpaper());
}

function updateFavoriteButton() {
  const favorite = isFavorite();

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

  loadWallpaperFavorites();
  if (favoriteWallpapers.has(wallpaper)) {
    favoriteWallpapers.delete(wallpaper);
  } else {
    favoriteWallpapers.add(wallpaper);
  }
  if (canStoreWallpapers) {
    try {
      localStorage.setItem(wallpaperStorageKey, JSON.stringify([...favoriteWallpapers]));
    } catch {
      canStoreWallpapers = false;
    }
  }
  updateFavoriteButton();
}

window.addEventListener("storage", event => {
  if (event.key === wallpaperStorageKey || event.key === null) {
    loadWallpaperFavorites();
    updateFavoriteButton();
  }
});

nextButton.addEventListener("click", nextWallpaper);

previousButton.addEventListener("click", previousWallpaper);

favoriteButton.addEventListener("click", toggleFavorite);

/**
 * App launcher
 */

const googleApps = [
  { id: "account", name: "Account", url: "https://myaccount.google.com/" },
  { id: "search", name: "Search", url: "https://www.google.com/" },
  { id: "maps", name: "Maps", url: "https://maps.google.com/" },
  { id: "youtube", name: "YouTube", url: "https://www.youtube.com/" },
  { id: "gemini", name: "Gemini", url: "https://gemini.google.com/" },
  { id: "gmail", name: "Gmail", url: "https://mail.google.com/" },
  { id: "meet", name: "Meet", url: "https://meet.google.com/" },
  { id: "docs", name: "Docs", url: "https://docs.google.com/" },
  { id: "sheets", name: "Sheets", url: "https://sheets.google.com/" },
  { id: "keep", name: "Keep", url: "https://keep.google.com/", keywords: "notes reminders" },
  { id: "earth", name: "Earth", url: "https://earth.google.com/web/" },
  { id: "slides", name: "Slides", url: "https://docs.google.com/presentation/", keywords: "presentations powerpoint" },
  { id: "drive", name: "Drive", url: "https://drive.google.com/" },
  { id: "calendar", name: "Calendar", url: "https://calendar.google.com/" },
  { id: "news", name: "News", url: "https://news.google.com/" },
  { id: "photos", name: "Photos", url: "https://photos.google.com/" },
  { id: "translate", name: "Translate", url: "https://translate.google.com/" },
  { id: "play", name: "Play", url: "https://play.google.com/" },
  { id: "contacts", name: "Contacts", url: "https://contacts.google.com/" },
  { id: "chat", name: "Chat", url: "https://chat.google.com/" },
  { id: "classroom", name: "Classroom", url: "https://classroom.google.com/" },
  { id: "forms", name: "Forms", url: "https://docs.google.com/forms/" },
  { id: "tasks", name: "Tasks", url: "https://tasks.google.com/" },
  { id: "notebook", name: "Gemini Notebook", url: "https://notebooklm.google/", keywords: "notebooklm notes" },
  { id: "sites", name: "Sites", url: "https://sites.google.com/" },
  { id: "vids", name: "Vids", url: "https://vids.google.com/", icon: "vids.svg" },
  { id: "pics", name: "Pics", url: "https://workspace.google.com/products/pics/", icon: "pics.svg" },
  { id: "voice", name: "Voice", url: "https://voice.google.com/" },
  { id: "messages", name: "Messages", url: "https://messages.google.com/web/" },
  { id: "finance", name: "Finance", url: "https://www.google.com/finance/" },
  { id: "find-hub", name: "Find Hub", url: "https://www.google.com/android/find/", keywords: "find my device" },
  { id: "flights", name: "Flights", url: "https://www.google.com/travel/flights" },
  { id: "arts-culture", name: "Arts & Culture", url: "https://artsandculture.google.com/" },
  { id: "family-link", name: "Family Link", url: "https://familylink.google.com/" },
  { id: "fonts", name: "Fonts", url: "https://fonts.google.com/" },
  { id: "home", name: "Home", url: "https://home.google.com/" },
  { id: "one", name: "Google One", url: "https://one.google.com/" },
  { id: "pay", name: "Google Pay", url: "https://pay.google.com/" },
  { id: "play-books", name: "Play Books", url: "https://play.google.com/books" },
  { id: "play-games", name: "Play Games", url: "https://play.google.com/googleplaygames" },
  { id: "trends", name: "Trends", url: "https://trends.google.com/trends/" },
  { id: "tv", name: "Google TV", url: "https://tv.google/" },
  { id: "wallet", name: "Wallet", url: "https://wallet.google.com/" },
  { id: "lens", name: "Lens", url: "https://lens.google/" },
  { id: "scholar", name: "Scholar", url: "https://scholar.google.com/" },
  { id: "shopping", name: "Shopping", url: "https://shopping.google.com/" },
  { id: "street-view", name: "Street View", url: "https://www.google.com/streetview/" },
  { id: "travel", name: "Travel", url: "https://www.google.com/travel/" },
  { id: "waze", name: "Waze", url: "https://www.waze.com/live-map/" },
  { id: "youtube-kids", name: "YouTube Kids", url: "https://www.youtubekids.com/" },
  { id: "youtube-music", name: "YouTube Music", url: "https://music.youtube.com/" },
  { id: "youtube-tv", name: "YouTube TV", url: "https://tv.youtube.com/" },
  { id: "blogger", name: "Blogger", url: "https://www.blogger.com/" },
  { id: "business-profile", name: "Business Profile", url: "https://www.google.com/business/" },
  { id: "ads", name: "Google Ads", url: "https://ads.google.com/" },
  { id: "admob", name: "AdMob", url: "https://admob.google.com/" },
  { id: "adsense", name: "AdSense", url: "https://www.google.com/adsense/" },
  { id: "ad-manager", name: "Ad Manager", url: "https://admanager.google.com/" },
  { id: "analytics", name: "Analytics", url: "https://analytics.google.com/" },
  { id: "cloud", name: "Google Cloud", url: "https://console.cloud.google.com/" },
  { id: "marketing-platform", name: "Marketing Platform", url: "https://marketingplatform.google.com/" },
  { id: "search-console", name: "Search Console", url: "https://search.google.com/search-console/" },
  { id: "merchant-center", name: "Merchant Center", url: "https://merchants.google.com/" },
  { id: "manufacturer-center", name: "Manufacturer Center", url: "https://manufacturers.google.com/" },
  { id: "firebase", name: "Firebase", url: "https://console.firebase.google.com/" },
  { id: "labs", name: "Google Labs", url: "https://labs.google/" },
  { id: "appsheet", name: "AppSheet", url: "https://www.appsheet.com/", icon: "appsheet.svg" },
  { id: "admin", name: "Admin console", url: "https://admin.google.com/", icon: "admin.svg" },
  { id: "workspace-studio", name: "Workspace Studio", url: "https://workspace.google.com/studio/", icon: "workspace-studio.svg" },
  { id: "files", name: "Files", url: "https://files.google.com/" },
  { id: "authenticator", name: "Authenticator", url: "https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2" },
  { id: "gboard", name: "Gboard", url: "https://play.google.com/store/apps/details?id=com.google.android.inputmethod.latin" },
  { id: "chrome", name: "Chrome", url: "https://www.google.com/chrome/" },
  { id: "fit", name: "Google Fit", url: "https://www.google.com/fit/" },
  { id: "assistant", name: "Google Assistant", url: "https://assistant.google.com/" },
  { id: "fi", name: "Fi Wireless", url: "https://fi.google.com/" },
  { id: "fitbit", name: "Fitbit", url: "https://www.fitbit.com/" },
  { id: "play-pass", name: "Play Pass", url: "https://play.google.com/about/play-pass/" },
  { id: "play-protect", name: "Play Protect", url: "https://www.android.com/play-protect/" },
  { id: "developers", name: "Google for Developers", url: "https://developers.google.com/" },
  { id: "flutter", name: "Flutter", url: "https://flutter.dev/" },
  { id: "tensorflow", name: "TensorFlow", url: "https://www.tensorflow.org/" },
];

const appStorageKey = "tuxdashFavoriteApps";
const defaultAppIds = ["account", "search", "maps", "youtube", "gemini", "gmail", "meet", "docs", "sheets"];
const appsMenu = document.getElementById("appsMenu");
const editApps = document.getElementById("editApps");
const favoritesGrid = document.getElementById("favoriteApps");
const moreGrid = document.getElementById("moreApps");
const appSearch = document.getElementById("appSearch");
const favoriteSection = document.getElementById("favoritesSection");
const moreSection = document.getElementById("moreAppsSection");
const noMatches = document.getElementById("noMatchingApps");
let editingApps = false;
let canStoreFavoriteApps = true;
let favoriteAppIds = new Set(defaultAppIds);

function loadFavoriteApps() {
  if (!canStoreFavoriteApps) return;
  try {
    const saved = JSON.parse(localStorage.getItem(appStorageKey));
    favoriteAppIds = new Set(Array.isArray(saved) ? saved : defaultAppIds);
  } catch {
    // Keep the current selection in memory if storage is unavailable.
  }
}

function buildAppTile(app) {
  const tile = document.createElement(editingApps ? "label" : "a");
  tile.className = "app-tile";
  if (editingApps) {
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = app.id;
    checkbox.checked = favoriteAppIds.has(app.id);
    tile.append(checkbox);
  } else {
    tile.href = app.url;
  }
  const icon = document.createElement("img");
  if (app.id === "account") {
    icon.className = "account-avatar";
    icon.src = "icons/tuxdash-128.png";
  } else {
    icon.src = "icons/apps/" + (app.icon ?? app.id + ".webp");
  }
  icon.alt = "";
  icon.width = 36;
  icon.height = 36;
  const name = document.createElement("span");
  name.textContent = app.name;
  tile.append(icon, name);
  return tile;
}

function renderApps() {
  favoritesGrid.replaceChildren();
  moreGrid.replaceChildren();
  const terms = appSearch.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const searching = terms.length > 0;
  for (const app of googleApps) {
    const searchText = ["google", app.name, app.keywords ?? ""].join(" ").toLowerCase();
    if (!terms.every((term) => searchText.includes(term))) continue;
    const inFavorites = editingApps || (!searching && favoriteAppIds.has(app.id));
    const grid = inFavorites ? favoritesGrid : moreGrid;
    grid.append(buildAppTile(app));
  }
  favoriteSection.hidden = searching && !editingApps;
  moreSection.hidden = !moreGrid.childElementCount;
  noMatches.hidden = !searching || favoritesGrid.childElementCount + moreGrid.childElementCount > 0;
  document.getElementById("moreAppsTitle").textContent = searching ? "Search results" : "More apps";
  document.getElementById("emptyFavorites").hidden = searching || !!favoritesGrid.childElementCount;
  document.getElementById("favoritesTitle").textContent = editingApps ? "Choose favorites" : "Your favorites";
  const action = editingApps ? "Done" : "Edit favorites";
  editApps.setAttribute("aria-label", action);
  editApps.title = action;
  editApps.querySelector("svg").style.display = editingApps ? "none" : "";
  editApps.querySelector("span").hidden = !editingApps;
}

appsMenu.addEventListener("beforetoggle", (event) => {
  if (event.newState === "open") {
    loadFavoriteApps();
    appSearch.value = "";
    editingApps = false;
    renderApps();
    appsMenu.scrollTop = 0;
  }
});

appSearch.addEventListener("input", () => {
  renderApps();
  appsMenu.scrollTop = 0;
});

editApps.addEventListener("click", () => {
  appSearch.value = "";
  editingApps = !editingApps;
  renderApps();
  appsMenu.scrollTop = 0;
});

favoritesGrid.addEventListener("change", (event) => {
  const checkbox = event.target;
  if (!checkbox.matches('input[type="checkbox"]')) return;
  loadFavoriteApps();
  if (checkbox.checked) {
    favoriteAppIds.add(checkbox.value);
  } else {
    favoriteAppIds.delete(checkbox.value);
  }
  try {
    localStorage.setItem(appStorageKey, JSON.stringify([...favoriteAppIds]));
  } catch {
    canStoreFavoriteApps = false;
  }
});

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

showWallpaper();
