# Automatic Facebook videos — one-time setup

The website already contains everything needed (`api/facebook-videos.js` + the video grid).
Until you finish the steps below, the site safely shows the school's Facebook page feed instead.
Once finished, the latest 12 videos appear as a grid and update by themselves (about every 15 minutes).

This works on **Vercel**. On another host (Netlify, GitHub Pages, ...) the function needs a small change — ask Claude.

## What you need
- A personal Facebook account that is an **admin** of the school page (full control).
- Access to the site's Vercel project settings.

## Steps
1. Go to https://developers.facebook.com, log in, then **My Apps → Create App** (type "Other" or "Business"; name it e.g. "SAPS Website"). Leave it in **Development** mode. Because you are admin of both the app and the page, Meta's App Review is not needed for your own page.
2. Open **Tools → Graph API Explorer**. Pick your app, choose **Get User Access Token**, and add the permissions `pages_show_list` and `pages_read_engagement`. Click **Generate Access Token** and select the school page when asked.
3. Make the token last: open **Tools → Access Token Debugger**, paste the token, click **Extend Access Token**, and copy the new long-lived token.
4. Back in Graph API Explorer, paste that long-lived token into the token box and run `GET /me/accounts`. Find the school page in the result and copy two values: its `id` and its `access_token`. (A page token created this way does not expire.)
5. In **Vercel → your project → Settings → Environment Variables**, add:
   - `FB_PAGE_ID` = the page `id` (it should be 100057359203508, the number at the end of the page's web address)
   - `FB_PAGE_TOKEN` = the page `access_token`
6. **Redeploy** the project (Deployments → ⋯ → Redeploy).

## Check that it works
Open `https://YOUR-SITE/api/facebook-videos`. You should see JSON starting with `{"videos":[...`.

| You see | Meaning |
|---|---|
| `not_configured` | The two variables are missing, or you did not redeploy after adding them. |
| `facebook_error` with `"code":190` | The token is invalid or expired — repeat steps 2–4. |
| `facebook_error` with code `10` or `200` | A permission is missing — repeat step 2 and tick both permissions. |
| `{"videos":[]}` | The page has no videos Facebook shares through this connection; the site keeps showing the page feed. |

## Keep safe
- The token is a password for your page. Only ever put it in Vercel's environment variables — never in `index.html`, never in a chat or email.
- If it leaks, in Facebook go to Settings → Business Integrations (or Security) and remove the app, then repeat the steps.
- Facebook retires old API versions after about two years. If the videos suddenly stop, set `FB_GRAPH_VERSION` in Vercel to the newest version (currently v26.0 is the default).
