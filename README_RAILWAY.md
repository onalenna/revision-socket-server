# Deploy to Railway (Free Alternative)

## 🚀 Quick Deployment Steps:

### 1. **Create Railway Account**
- Go to [railway.app](https://railway.app)
- Sign up with GitHub (free)

### 2. **Push to GitHub**
```bash
# Initialize git (if not already)
git init
git add .
git commit -m "Socket.IO server ready for Railway"

# Create GitHub repo and push
git remote add origin https://github.com/yourusername/revision-socket-server.git
git push -u origin main
```

### 3. **Deploy on Railway**
1. **New Project** → **Deploy from GitHub repo**
2. **Select your repository**
3. **Railway will auto-detect** Node.js and deploy
4. **Get your URL**: `https://your-app-name.up.railway.app`

### 4. **Update Mobile App**
```javascript
// In SocketVideoService.js
this.socket = io('https://your-app-name.up.railway.app', {
  transports: ['websocket', 'polling'],
  timeout: 10000,
  forceNew: true,
});
```

## 🔧 **Railway Configuration:**

- **Start Command**: `node socket_server_cpanel.js`
- **Port**: Railway sets `process.env.PORT` automatically
- **Environment**: `production`
- **Health Check**: `/health` endpoint

## 📱 **Benefits:**

- ✅ **Free Tier**: 500 hours/month
- ✅ **Auto HTTPS**: SSL certificates included
- ✅ **Easy Updates**: Push to GitHub = auto-deploy
- ✅ **Environment Variables**: Easy configuration
- ✅ **Logs**: Real-time application logs
- ✅ **Custom Domains**: Add your own domain later

## 🧪 **Testing:**

After deployment, test with:
```bash
curl https://your-app-name.up.railway.app/health
curl https://your-app-name.up.railway.app/
curl https://your-app-name.up.railway.app/calls
```

## 🔄 **Alternative: Render.com**

If Railway doesn't work, try Render:
1. Go to [render.com](https://render.com)
2. **New** → **Web Service**
3. Connect GitHub repo
4. **Build Command**: `npm install`
5. **Start Command**: `node socket_server_cpanel.js`
6. **Deploy**

## 💡 **Why These Are Better:**

- **No cPanel complexity**
- **Automatic SSL/HTTPS**
- **Easy environment management**
- **Real-time logs and monitoring**
- **Free tiers with good limits**
- **Git-based deployment**
