# Socket.IO Server Deployment Guide for cPanel

## 📁 Files to Upload to `ezrlab.com/vision/api/socket/`

Upload these files to your cPanel file manager:

```
socket/
├── socket_server_cpanel.js    # Main server file
├── package_cpanel.json        # Rename to package.json
├── .htaccess                  # Apache routing rules
├── DEPLOYMENT_GUIDE.md        # This guide
└── start_server.sh           # Startup script (optional)
```

## 🚀 Deployment Steps

### 1. Upload Files
- Upload all files to `/public_html/vision/api/socket/` directory
- Rename `package_cpanel.json` to `package.json`

### 2. Install Dependencies
In cPanel Terminal or SSH:
```bash
cd /public_html/vision/api/socket/
npm install
```

### 3. Start the Server
Choose one of these methods:

#### Option A: PM2 (Recommended for Production)
```bash
# Install PM2 globally
npm install -g pm2

# Start the server
pm2 start socket_server_cpanel.js --name revision-socket

# Save PM2 configuration
pm2 save
pm2 startup
```

#### Option B: Node.js Application (cPanel)
1. Go to cPanel → Node.js Applications
2. Create new application:
   - **Application Root**: `/public_html/vision/api/socket/`
   - **Application URL**: `socket`
   - **Application Startup File**: `socket_server_cpanel.js`
   - **Node.js Version**: Latest available
3. Click "Create"
4. Click "Start App"

#### Option C: Manual Start
```bash
cd /public_html/vision/api/socket/
node socket_server_cpanel.js
```

### 4. Configure Environment Variables (Optional)
In cPanel Node.js Applications:
- Set `PORT` to `3001` (or available port)
- Set `NODE_ENV` to `production`
- Set `ALLOWED_ORIGINS` to your domain

## 🔧 Configuration

### Port Configuration
The server will use:
- Default port: `3001`
- Environment variable: `PORT` or `NODE_PORT`
- cPanel Node.js apps usually auto-assign ports

### URL Configuration
Your Socket.IO server will be available at:
- **Main URL**: `https://ezrlab.com/vision/api/socket/`
- **Health Check**: `https://ezrlab.com/vision/api/socket/health`
- **Active Calls**: `https://ezrlab.com/vision/api/socket/calls`
- **Socket.IO Endpoint**: `https://ezrlab.com/vision/api/socket/socket.io/`

## 🧪 Testing

### 1. Health Check
```bash
curl https://ezrlab.com/vision/api/socket/health
```

### 2. Test Socket.IO Connection
Use browser console:
```javascript
const socket = io('https://ezrlab.com', {
  path: '/vision/api/socket/socket.io/'
});

socket.on('connect', () => {
  console.log('Connected to Socket.IO server!');
});
```

## 📱 Update Mobile App

Update the Socket.IO service in your mobile app:
```javascript
// In SocketVideoService.js
this.socket = io('https://ezrlab.com', {
  path: '/vision/api/socket/socket.io/',
  transports: ['websocket', 'polling'],
  timeout: 10000,
  forceNew: true,
});
```

## 🔍 Troubleshooting

### Common Issues:

1. **Server Not Starting**
   - Check Node.js version (needs 16+)
   - Verify all dependencies installed
   - Check port availability

2. **Socket.IO Connection Failed**
   - Verify `.htaccess` file is uploaded
   - Check if WebSocket support is enabled
   - Try polling transport as fallback

3. **CORS Errors**
   - Update `ALLOWED_ORIGINS` environment variable
   - Check server logs for specific errors

### Logs and Monitoring:
```bash
# PM2 logs
pm2 logs revision-socket

# PM2 status
pm2 status

# Restart server
pm2 restart revision-socket
```

## 🔒 Security Considerations

1. **Rate Limiting**: Server includes frame rate limiting (20 FPS per user)
2. **CORS**: Configure `ALLOWED_ORIGINS` for production
3. **Cleanup**: Automatic cleanup of inactive calls after 30 minutes
4. **Error Handling**: Comprehensive error handling and logging

## 📊 Monitoring

Monitor your server:
- **Health**: `https://ezrlab.com/vision/api/socket/health`
- **Active Calls**: `https://ezrlab.com/vision/api/socket/calls`
- **PM2 Status**: `pm2 status` (if using PM2)

## 🔄 Updates

To update the server:
1. Upload new files
2. Restart the application:
   ```bash
   pm2 restart revision-socket
   ```
   or restart via cPanel Node.js Applications

## 📞 Support

If you encounter issues:
1. Check server logs
2. Verify all files uploaded correctly
3. Test health endpoint
4. Check cPanel Node.js application status
