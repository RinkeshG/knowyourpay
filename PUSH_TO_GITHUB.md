# Push to GitHub

Your project is ready to push. One-time setup:

## 1. Create the repo on GitHub

1. Open **https://github.com/new**
2. **Repository name:** `knowyourpay` (or any name you like)
3. Leave it **empty** (no README, no .gitignore)
4. Click **Create repository**

## 2. Connect and push (if repo name is `knowyourpay`)

If you used a different name, replace `knowyourpay` in the URL below.

```bash
cd /Users/rinkeshgorasia/knowyourpay

# If you already added origin, update the URL if your repo name or username differs:
# git remote set-url origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

git push -u origin main
```

## 3. If commit fails with "unknown option trailer"

Your global git config uses a commit template. Use:

```bash
git -c commit.template= -c format.commitMessage= commit -m "Your message"
```

---

**Already done for you:**
- Git repo initialized in `knowyourpay`
- Initial commit created (17 files; `.env` is gitignored)
- Branch set to `main`
- Remote `origin` set to `https://github.com/rinkeshg/knowyourpay.git`

After you create the repo on GitHub, run: **`git push -u origin main`**
