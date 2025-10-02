# Railway Deployment Instructions

## Method 1: Railway Web Interface

1. **Go to [railway.app](https://railway.app)**
2. **Login with GitHub**
3. **Click "New Project"**
4. **Select "Deploy from GitHub repo"**
5. **Search for: `revision-socket-server`**
6. **Select: `onalenna/revision-socket-server`**

## Method 2: Direct Repository URL

If search doesn't work:
1. **Use this direct URL:** `https://github.com/onalenna/revision-socket-server`
2. **In Railway, select "Deploy from GitHub repo"**
3. **Paste the URL**

## Method 3: Railway CLI

1. **Open Terminal**
2. **Run:**
   ```bash
   cd /Users/moengfullstack/v/api/socket
   railway login
   ```
3. **Follow browser authentication**
4. **Run:**
   ```bash
   railway init
   railway up
   ```

## Method 4: Fix GitHub Permissions

1. **Go to GitHub.com → Settings → Applications → Authorized OAuth Apps**
2. **Find "Railway" → Revoke access**
3. **Go back to Railway and login again**
4. **Grant access to repositories**

## Troubleshooting

- **Repository not visible**: Check GitHub permissions
- **Still not working**: Try incognito/private browser mode
- **Alternative**: Use Railway CLI method

## Expected Result

After deployment, you'll get a URL like:
`https://revision-socket-server-production-xxxx.up.railway.app`

Test with:
```bash
curl https://your-url.up.railway.app/health
curl https://your-url.up.railway.app/
curl https://your-url.up.railway.app/calls
```
