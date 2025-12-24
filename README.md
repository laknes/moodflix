
# Moodflix - AI Cinema Therapy 🎬

Moodflix is an intelligent movie recommendation engine that uses AI (Gemini API) to analyze the user's emotional state and suggest the best cinematic works from Iran and the world.

## 🛠 Dependencies

The following packages are required to run this project locally:

1. **React 19 & ReactDOM**
2. **@google/genai**
3. **html2canvas**
4. **TailwindCSS**

---

## 🚀 Automatic Server Installation

To quickly install on Ubuntu servers, resolve common `nodejs` and `npm` dependency conflicts, and automatically configure **Nginx** for port redirection (80/443), use the following script.

### `install.sh` Script:

```bash
#!/bin/bash

# --- Moodflix Professional Installer & Nginx Proxy ---

echo "🚀 Starting Moodflix Smart Installation..."

# 1. Remove old versions and fix package conflicts
echo "扫 Cleaning up old packages to prevent conflicts..."
sudo apt-get remove -y nodejs npm nodejs-doc
sudo apt-get autoremove -y

# 2. Install Node.js from official NodeSource (Version 20 LTS)
echo "📦 Installing Node.js v20 via NodeSource..."
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | sudo gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
NODE_MAJOR=20
echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" | sudo tee /etc/apt/sources.list.d/nodesource.list
sudo apt-get update
sudo apt-get install nodejs -y

# 3. Install other required tools
echo "🛠 Installing Nginx and network tools..."
sudo apt-get install -y nginx git certbot python3-certbot-nginx

# 4. Get User Configuration
read -p "🌐 Enter your Domain (e.g., moodflix.com): " DOMAIN
read -p "🔌 Internal App Port (Default 3000): " PORT
PORT=${PORT:-3000}

# 5. Install Project Dependencies and Build
echo "🏗 Installing project dependencies and generating build files..."
npm install
npm run build

# 6. Configure Nginx as a Reverse Proxy (Redirect to Port 80)
echo "⚙️ Configuring Nginx to redirect port $PORT to 80..."

NGINX_CONF="/etc/nginx/sites-available/$DOMAIN"

sudo bash -c "cat > $NGINX_CONF <<EOF
server {
    listen 80;
    server_name $DOMAIN;

    # Auto-redirect to HTTPS if SSL is active
    # listen 443 ssl; 

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

# 7. Enable and Test Nginx
sudo ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx

# 8. Automatic SSL (HTTPS) Activation
read -p "🔒 Do you want to enable free SSL (HTTPS)? (y/n): " SSL_CHOICE
if [ "$SSL_CHOICE" == "y" ]; then
    echo "🔐 Obtaining SSL Certificate from Let's Encrypt..."
    sudo certbot --nginx -d $DOMAIN --non-interactive --agree-tos -m admin@$DOMAIN
fi

echo "✅ Operation completed successfully!"
echo "📍 Access URL: http://$DOMAIN"
echo "🚀 The application is running on internal port $PORT, and Nginx is handling the traffic."
```

### How to Execute:
1. Create the file: `nano install.sh`
2. Copy and paste the code above, then save (Ctrl+O, Enter, Ctrl+X).
3. Grant execution permissions: `chmod +x install.sh`
4. Run the script: `./install.sh`

---

## 🔐 Access Levels & Login (Simulated)

### 1. Standard User:
*   **Email:** Any valid email format (e.g., `user@example.com`)
*   **Password:** Any string (minimum 1 character)

### 2. Admin User:
*   **Email:** Must contain the word **admin**.
*   **Access:** This account reveals the "Admin Panel" and the "System Reset" button.

## 🔑 Setup Wizard
On the first launch, the application will prompt you for database credentials and the server address you configured during the Nginx installation phase to generate the final APK file accordingly.

---
Developed by **Moodflix Team** with love for cinema ❤️
