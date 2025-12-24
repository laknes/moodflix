
# Moodflix - AI Cinema Therapy 🎬

Moodflix is an intelligent movie recommendation engine that uses AI (Gemini API) to analyze the user's emotional state and suggest the best cinematic works.

## 🚀 Automatic Server Installation (Fixes 502 Gateway Error)

The "502 Bad Gateway" error usually means Nginx is running but the Moodflix app isn't. Use this updated script to install **PM2**, which keeps your app running in the background.

### `install.sh` Script:

```bash
#!/bin/bash

# --- Moodflix Professional Installer (PM2 + Nginx) ---

echo "🚀 Starting Moodflix Enterprise Installation..."

# 1. Cleanup & Preparation
sudo apt-get remove -y nodejs npm
sudo apt-get autoremove -y

# 2. Install Node.js v20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs nginx git certbot python3-certbot-nginx

# 3. Install PM2 (Process Manager) - CRITICAL to fix 502 error
sudo npm install -g pm2

# 4. Configure App
read -p "🌐 Enter your Domain (e.g., moodflix.com): " DOMAIN
read -p "🔌 Internal App Port (Default 3000): " PORT
PORT=${PORT:-3000}

# 5. Build & Start App
echo "🏗 Building application..."
npm install
npm run build

echo "⚡ Starting background process with PM2..."
pm2 delete moodflix 2>/dev/null
pm2 start npm --name "moodflix" -- start -- --port $PORT

# 6. Save PM2 state for auto-reboot
pm2 save
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME

# 7. Configure Nginx Proxy
NGINX_CONF="/etc/nginx/sites-available/$DOMAIN"
sudo bash -c "cat > $NGINX_CONF <<EOF
server {
    listen 80;
    server_name $DOMAIN;

    location / {
        proxy_pass http://localhost:$PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF"

sudo ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx

echo "✅ Installation Success! Access your site at: http://$DOMAIN"
```

### 🛠 Troubleshooting 502 Error:
If you still see a 502 error, run:
`pm2 status` - Check if the "moodflix" process is online.
`pm2 logs moodflix` - See internal errors.
`sudo systemctl status nginx` - Check if Nginx is active.

---
Developed by **Moodflix Team** ❤️
