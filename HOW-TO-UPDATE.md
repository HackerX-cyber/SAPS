# Updating the SAPS website

Open `index.html` and search for **SITE DATA — EDIT HERE**. It holds everything the school updates:

| What | Where | Notes |
|---|---|---|
| Events | `events: [...]` | Date as `YYYY-MM-DD`. Shown as Upcoming/Past automatically. |
| Notices | `notices: [...]` | `pinned:true` keeps it on top. `expires:'YYYY-MM-DD'` hides it automatically. |
| Photos | `gallery: [...]` | Put photos in `public/photos/` and add `{src:'photos/name.jpg', caption:'Library', ur:'لائبریری'}`. Click-to-enlarge works automatically. |
| Downloads | `downloads: [...]` | Put files in `public/downloads/`, then add `{title:'Fee Structure (PDF)', href:'downloads/fees.pdf', ur:'...'}`. |
| Facebook videos | automatic | One-time connection: see `FACEBOOK-SETUP.md`. Until then the Facebook page feed is shown. Optional: paste video links into `FB_VIDEOS` (bottom of the page) to pin them on top. |
| Urdu wording | `window.SAPS_UR` (just below SITE DATA) | English text on the left, Urdu on the right. |

`api/facebook-videos.js` is the small server function behind the automatic videos (Vercel).

Files in `public/` are copied as-is when the site is built (`manifest.webmanifest`, `sw.js`, `icons/`, `downloads/`, `robots.txt`).
