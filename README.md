
# Moodflix - Enterprise Multi-Site Hosting 🎬

## 🛠 رفع مشکل صفحه سفید (White Page)
اگر بعد از نصب، فقط صفحه سفید می‌بینید:
1. مطمئن شوید فایل `index.html` حاوی تگ `<script type="module" src="./index.tsx"></script>` است.
2. کنسول مرورگر (F12) را چک کنید. اگر خطای `process is not defined` دارید، اسکریپت `deploy.sh` زیر را مجدد اجرا کنید.

### `deploy.sh` (نسخه اصلاح شده):

```bash
#!/bin/bash
# --- Moodflix Robust Multi-Site Deployment ---
echo "🚀 Starting Deployment..."

# 1. نصب پیش‌نیازها
sudo apt-get update
sudo apt-get install -y nodejs npm nginx pm2
sudo npm install -g serve

# 2. دریافت اطلاعات
read -p "🌐 دامنه (e.g. mood.mysite.com): " DOMAIN
read -p "🔌 پورت (Default 3000): " PORT
PORT=${PORT:-3000}

# 3. بیلد پروژه (مهم: اطمینان از صحت مسیرها)
echo "🏗 Building application..."
npm install
npm run build

# 4. آماده‌سازی پوشه استاندارد
DEST_DIR="/var/www/moodflix-$DOMAIN"
sudo mkdir -p $DEST_DIR
sudo chown -R $USER:$USER $DEST_DIR

# کپی فایل‌های بیلد شده (اگر از Vite استفاده می‌کنید معمولا در dist هستند)
if [ -d "dist" ]; then
    cp -r dist/* $DEST_DIR/
else
    # اگر مستقیما فایل‌ها را سرو می‌کنید
    cp -r ./* $DEST_DIR/
fi

# 5. اجرای سرویس با PM2
echo "⚡ Starting serve with PM2..."
pm2 delete "moodflix-$DOMAIN" 2>/dev/null
pm2 start serve --name "moodflix-$DOMAIN" -- -s $DEST_DIR -l $PORT
pm2 save

# 6. تنظیم Nginx (بدون تداخل با سایت‌های دیگر)
NGINX_CONF="/etc/nginx/sites-available/$DOMAIN"
sudo bash -c "cat > $NGINX_CONF <<EOF
server {
    listen 80;
    server_name $DOMAIN;

    location / {
        proxy_pass http://127.0.0.1:$PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \\\$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \\\$host;
        proxy_cache_bypass \\\$http_upgrade;
    }
}
EOF"

sudo ln -sf $NGINX_CONF /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl restart nginx

echo "✅ تمام! سایت شما در http://$DOMAIN آماده است."
```
