# TechNova Market - GitHub Pages Deploy

## 1) Upload project to GitHub

```bash
git init
git add .
git commit -m "Initial university project site"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

## 2) Enable GitHub Pages

1. Open repository on GitHub.
2. Go to `Settings` -> `Pages`.
3. In `Build and deployment` choose:
   - `Source`: `Deploy from a branch`
   - `Branch`: `main` and `/ (root)`
4. Save and wait for deploy.

Your URL will be:

`https://YOUR_USERNAME.github.io/YOUR_REPO/`

## 3) Replace placeholders

Project is already prepared with this placeholder:

`https://YOUR_USERNAME.github.io/YOUR_REPO`

After creating repo, replace it with your real URL in:

- all `*.html` (`canonical`, `og:url`, JSON-LD)
- `robots.txt`
- `sitemap.xml`

## 4) Verify pages

Check these URLs after deploy:

- `/index.html`
- `/categories.html`
- `/blog.html`
- `/contact.html`
- `/404.html`
