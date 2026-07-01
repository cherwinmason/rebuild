# Deploying REBUILD

The app is built and committed locally. Node.js was installed to `~/.local/node`
and added to your `~/.zshrc`, so **open a new Terminal window** and `node`, `npm`,
`gh`, and `netlify` will all be available.

```bash
cd ~/Desktop/rebuild
```

## 1. Push to GitHub (one-time login)

```bash
gh auth login          # choose GitHub.com → HTTPS → login with browser
gh repo create rebuild --public --source=. --push
```

This creates `https://github.com/<your-username>/rebuild` and pushes `main`.

## 2. Deploy to Netlify (one-time login)

Option A — connect the GitHub repo (recommended, auto-deploys on every push):

```bash
netlify login         # opens browser
netlify init          # "Create & configure a new site" → pick your team
                      #  build command: npm run build   publish dir: dist
netlify deploy --prod
```

Option B — deploy the already-built folder directly (no GitHub needed):

```bash
netlify login
netlify deploy --prod --dir=dist
```

Netlify prints the live URL when it finishes.

## Making updates later

```bash
cd ~/Desktop/rebuild
# edit files...
npm run build         # optional local check
git add . && git commit -m "your change"
git push              # if connected via Option A, Netlify auto-deploys
```

## Install on iPhone

1. Open the Netlify URL in **Safari** on your iPhone.
2. Tap the **Share** icon (square with an arrow pointing up).
3. Scroll down → **Add to Home Screen**.
4. Name it **REBUILD** → tap **Add**.
