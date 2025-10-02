# ReVision Socket.IO Server

This folder contains all the necessary files to deploy the Socket.IO video streaming server to cPanel.

## 📁 Files Included:

- **`socket_server_cpanel.js`** - Main Socket.IO server (production-ready)
- **`package.json`** - Node.js dependencies and configuration
- **`.htaccess`** - Apache routing rules for Socket.IO
- **`test_connection.html`** - Test page to verify deployment
- **`start_server.sh`** - Startup script (optional)
- **`DEPLOYMENT_GUIDE.md`** - Complete deployment instructions
- **`README.md`** - This file

## 🚀 Quick Deployment:

1. **Upload all files** to `/public_html/vision/api/socket/` on your cPanel
2. **Create Node.js Application** in cPanel:
   - Application Root: `vision/api/socket`
   - Application Startup File: `socket_server_cpanel.js`
   - Node.js Version: 16.20.2 (recommended)
3. **Start the application**
4. **Test**: Visit `https://ezrlab.com/vision/api/socket/test_connection.html`

## 🧪 Testing:

- **Health Check**: `https://ezrlab.com/vision/api/socket/health`
- **Active Calls**: `https://ezrlab.com/vision/api/socket/calls`
- **Test Page**: `https://ezrlab.com/vision/api/socket/test_connection.html`

## 📱 Mobile App Integration:

The mobile app is already configured to connect to:
```
https://ezrlab.com/vision/api/socket/socket.io/
```

## 🔧 Features:

- ✅ Real-time video streaming
- ✅ Multiple concurrent calls
- ✅ Rate limiting (20 FPS per user)
- ✅ Auto cleanup of inactive calls
- ✅ Health monitoring
- ✅ Production-ready error handling
- ✅ CORS support
- ✅ WebSocket + Polling fallback

## 📞 Support:

For issues or questions, check the `DEPLOYMENT_GUIDE.md` file or contact the ReVision team.
