if (globalThis.chrome?.runtime?.id && chrome.permissions && chrome.storage) {
  const permission = { origins: ["https://www.google.com/*"] };
  const photoKey = "googleProfilePhotoUrl";
  const defaultAvatar = "icons/apps/account.svg";
  const settings = document.getElementById("photoSettings");
  const toggle = document.getElementById("photoToggle");
  const status = document.getElementById("photoStatus");
  const googleLink = document.getElementById("photoGoogleLink");
  let enabled = false;
  let savedPhoto = "";
  let failedPhoto = "";
  let revision = 0;

  function showAvatar() {
    const source = savedPhoto && savedPhoto !== failedPhoto ? savedPhoto : defaultAvatar;
    for (const avatar of document.querySelectorAll("[data-account-avatar]")) {
      if (avatar.getAttribute("src") !== source) avatar.src = source;
    }
    toggle.setAttribute("aria-pressed", String(enabled));
    toggle.textContent = enabled ? "Turn off Google photo" : "Use Google profile photo";
    googleLink.hidden = !enabled || source !== defaultAvatar;
    if (!enabled) {
      status.textContent = "Update your photo when you visit Google.";
    } else if (source !== defaultAvatar) {
      status.textContent = "Photo updates when you visit Google.";
    } else if (failedPhoto && failedPhoto === savedPhoto) {
      status.textContent = "Photo unavailable. Visit Google to refresh it.";
    } else {
      status.textContent = "Visit Google while signed in to show your photo.";
    }
  }

  async function refresh() {
    const request = ++revision;
    const granted = await chrome.permissions.contains(permission);
    const photo = granted ? (await chrome.storage.local.get(photoKey))[photoKey] : "";
    if (request !== revision) return;
    enabled = granted;
    if (savedPhoto !== photo) failedPhoto = "";
    savedPhoto = photo || "";
    showAvatar();
    settings.hidden = false;
  }

  toggle.addEventListener("click", async () => {
    toggle.disabled = true;
    try {
      if (enabled) {
        await chrome.permissions.remove(permission);
        await chrome.storage.local.remove(photoKey);
        await refresh();
      } else {
        // The permissions request must run directly from this click.
        const granted = await chrome.permissions.request(permission);
        await refresh();
        if (!granted) status.textContent = "Google access was declined. You can enable it here later.";
      }
    } catch {
      await refresh();
      status.textContent = "Couldn’t update the photo setting. Please try again.";
    } finally {
      toggle.disabled = false;
    }
  });

  document.addEventListener("error", event => {
    const image = event.target;
    if (savedPhoto && image instanceof HTMLImageElement && image.hasAttribute("data-account-avatar")
        && image.getAttribute("src") === savedPhoto) {
      failedPhoto = savedPhoto;
      showAvatar();
    }
  }, true);

  function retryPhoto() {
    if (!document.hidden && failedPhoto) {
      failedPhoto = "";
      showAvatar();
    }
  }
  window.addEventListener("online", retryPhoto);
  document.addEventListener("visibilitychange", retryPhoto);

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && photoKey in changes) refresh();
  });
  chrome.permissions.onAdded.addListener(refresh);
  chrome.permissions.onRemoved.addListener(refresh);
  refresh();
}
