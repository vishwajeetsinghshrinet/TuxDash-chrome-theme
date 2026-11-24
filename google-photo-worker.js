// Host access is granted from the account menu and checked again before saving.
const googleOrigin = "https://www.google.com";
const photoPermission = { origins: [googleOrigin + "/*"] };
const photoKey = "googleProfilePhotoUrl";
let latestVisit = 0;

// Chrome runs this function in an isolated world on the active Google page.
async function readAccountPhoto() {
  if (location.origin !== "https://www.google.com" || document.hidden) return;
  function readHeader() {
    const header = document.getElementById("gb");
    if (!header) return;
    const account = header.querySelector('a[href^="https://accounts.google.com/SignOutOptions"], [aria-label^="Google Account:"]');
    if (account) {
      const image = account.querySelector("img");
      const src = image?.currentSrc || image?.src;
      if (src) {
        const url = new URL(src, document.baseURI);
        if (url.protocol === "https:" && /^lh\d+\.googleusercontent\.com$/.test(url.hostname)
            && !url.port && !url.username && !url.password && /^\/(ogw|a|a-)\//.test(url.pathname)) {
          return url.href;
        }
      }
      return;
    }
    if (header.querySelector('a[href^="https://accounts.google.com/ServiceLogin"], a[href^="https://accounts.google.com/v3/signin/"], a[href^="https://accounts.google.com/signin/"]')) {
      return null;
    }
  }

  const photo = readHeader();
  if (photo !== undefined) return { photo };
  // The Google header can arrive after the page's load event.
  return new Promise(resolve => {
    const observer = new MutationObserver(check);
    const timer = setTimeout(() => finish(undefined), 6000);
    function finish(result) {
      clearTimeout(timer);
      observer.disconnect();
      resolve(result);
    }
    function check() {
      if (document.hidden) return finish(undefined);
      const photo = readHeader();
      if (photo !== undefined) finish({ photo });
    }
    observer.observe(document.documentElement, {
      subtree: true, childList: true, attributes: true, attributeFilter: ["src", "srcset", "href", "aria-label"],
    });
  });
}

async function syncFromTab(tab) {
  if (!tab.active || tab.incognito || !tab.url?.startsWith(googleOrigin + "/")) return;
  const visit = ++latestVisit;
  if (!await chrome.permissions.contains(photoPermission)) return;
  const [frame] = await chrome.scripting.executeScript({
    target: { tabId: tab.id }, func: readAccountPhoto,
  });
  if (!frame?.result || !await chrome.permissions.contains(photoPermission) || visit !== latestVisit) return;
  const photo = frame.result.photo;
  if (photo === null) {
    await chrome.storage.local.remove(photoKey);
  } else if (typeof photo === "string") {
    await chrome.storage.local.set({ [photoKey]: photo });
  }
}

chrome.tabs.onUpdated.addListener((_id, change, tab) => {
  if (change.status === "complete") {
    // A tab may close or navigate while Chrome is injecting the script.
    syncFromTab(tab).catch(() => {});
  }
});

chrome.tabs.onActivated.addListener(({ tabId }) => {
  chrome.tabs.get(tabId).then(syncFromTab).catch(() => {});
});

chrome.permissions.onRemoved.addListener(({ origins }) => {
  if (origins?.length) {
    ++latestVisit;
    chrome.permissions.contains(photoPermission).then(granted => {
      if (!granted) return chrome.storage.local.remove(photoKey);
    });
  }
});
