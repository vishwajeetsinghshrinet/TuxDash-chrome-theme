const wallpapers = [
  "wallpaper/wallpaper1.jpg",
  "wallpaper/wallpaper2.jpg",
  "wallpaper/wallpaper3.jpg",
];

const randomImage = wallpapers[Math.floor(Math.random() * wallpapers.length)];

document.body.style.backgroundImage = `url(${randomImage})`;
