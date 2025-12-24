
# Moodflix - AI Cinema Therapy 🎬

Moodflix is an intelligent movie recommendation engine that uses AI (Gemini API) to analyze the user's emotional state and suggest the best cinematic works.

## 🚀 Automatic Server Installation (Fixes 502 & Nginx Config Errors)

This script installs **PM2** for process management and configures **Nginx** as a reverse proxy. It includes fixes for the common "invalid number of arguments" error in Nginx configuration.

### `install.sh` Script:

```bash
#!/bin/bash

# --- Moodflix Professional Installer (PM2 + Nginx) ---

echo "🚀 Starting Moodflix Enterprise Installation..."

# 1. Cleanup & Preparation
echo "🧹 Cleaning old Node.js versions..."
sudo apt-get remove -y nodejs npm
sudo apt-get autoremove -y

# 2. Install Node.js v20 LTS
echo "📦 Installing Node.js v20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs nginx git certbot python3-certbot-nginx

# 3. Install PM2 (Process Manager)
echo "⚙️ Installing PM2..."
sudo npm install -g pm2

# 4. Configure App Details
read -p "🌐 Enter your Domain or IP (e.g., moodflix.com or 1.2.3.4): " DOMAIN
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
echo "🛠 Configuring Nginx for $DOMAIN..."
NGINX_CONF="/etc/nginx/sites-available/$DOMAIN"

# Note: Dollar signs are escaped with \ to prevent Bash from interpreting them
sudo bash -c "cat > $NGINX_CONF <<EOF
server {
    listen 80;
    server_name $DOMAIN;

    location / {
        proxy_pass http://localhost:$PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \\\$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \\\$host;
        proxy_cache_bypass \\\$http_upgrade;
        proxy_set_header X-Real-IP \\\$remote_addr;
        proxy_set_header X-Forwarded-For \\\$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \\\$scheme;
    }
}
EOF"

sudo ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default 2>/dev/null
echo "🧪 Testing Nginx configuration..."
sudo nginx -t && sudo systemctl restart nginx

echo "✅ Installation Success!"
echo "📍 Access your site at: http://$DOMAIN"
```

### 🛠 Troubleshooting:
1. **502 Bad Gateway**: Usually means the app isn't running. Run `pm2 status` to check if "moodflix" is online. If not, run `pm2 start moodflix`.
2. **Nginx Config Error**: If `nginx -t` fails with "invalid number of arguments", it means the `$` signs in the config file were deleted. The updated script above uses `\\\$` to prevent this.
3. **Logs**: Check app errors with `pm2 logs moodflix` or Nginx errors with `sudo tail -f /var/log/nginx/error.log`.

---
Developed by **Moodflix Team** ❤️
