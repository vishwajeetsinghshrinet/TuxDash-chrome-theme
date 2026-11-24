# TuxDash

TuxDash is a Chrome New Tab extension with 13 Linux-inspired Tux wallpapers. Each new tab opens with a random wallpaper. Use the arrows to browse and the heart to save a favorite.

## Install from GitHub

1. Clone this repository or download and extract the ZIP.
2. Open `chrome://extensions` in Chrome and turn on **Developer mode**.
3. Click **Load unpacked** and select the folder containing `manifest.json`.
4. Open a new tab. After updating the local files, click **Reload** on the TuxDash extension and open a fresh tab.

## Features

- Local clock and date, with optional weather for a city you choose.
- Google search and shortcuts to Gmail, Airtable, Teamwork, Slack, and ChatGPT. The Airtable, Teamwork, and Slack links point to the project's configured workspaces.
- Searchable launcher with 82 apps. Use the pencil to choose favorites.
- Optional Google account photo in the header and account menu.

## Privacy

The account menu offers **Use Google profile photo**. If you enable it, Chrome asks for access to `https://www.google.com/*`. When you visit Google, TuxDash reads the image from its account button and saves the image URL in this browser profile. New tabs load the photo from Google. Turning the option off removes the saved URL and revokes the site permission.

**Weather:** Select **Set weather city**, search by name, and choose a result. TuxDash sends the search text and selected city coordinates to [Open-Meteo](https://open-meteo.com/) and stores the city and latest reading locally. Visible tabs refresh current conditions about every 15 minutes. Times use the browser's local timezone. **Clear weather location** removes the selection and stops updates.

This setup uses Open-Meteo’s [free non-commercial API](https://open-meteo.com/en/pricing). The extension does not require a backend or database.

## Credits and license

TuxDash code is distributed under the [MIT License](LICENSE). The launcher includes product artwork from [Google's product directory](https://about.google/products/) and [Google Workspace](https://workspace.google.com/). The product names and logos belong to their respective owners. Open-Meteo uses [GeoNames](https://www.geonames.org/) for city search.
