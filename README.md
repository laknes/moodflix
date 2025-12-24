
# Moodflix - Enterprise Multi-Site Hosting 🎬

اگر همچنان خطای **502 Bad Gateway** دارید، این اسکریپت جدید را اجرا کنید. این نسخه پایداری بیشتری دارد و مشکلات مربوط به "اجرا نشدن برنامه" را حل می‌کند.

## 🛠 اسکریپت نصب نهایی (حل مشکل 502 و Multi-Site)

این اسکریپت پروژه را Build کرده و فایل‌های خروجی را در یک مسیر استاندارد قرار می‌دهد تا انجین‌اکس به راحتی به آن‌ها دسترسی داشته باشد.

### `deploy.sh`:

```bash
#!/bin/bash

# --- Moodflix Professional Deployment Script ---
echo "🚀 Starting Robust Deployment..."

# 1. نصب پکیج‌های ضروری
sudo apt-get update
sudo apt-get install -y nodejs npm nginx pm2

# 2. نصب 'serve' به صورت گلوبال (برای پایداری بیشتر)
sudo npm install -g serve

# 3. دریافت تنظیمات
read -p "🌐 دامنه یا زیردامنه (e.g. mood.site.com): " DOMAIN
read -p "🔌 پورت اختصاصی برای این سایت (پیش‌فرض 3000): " PORT
PORT=${PORT:-3000}

# 4. آماده‌سازی پوشه مقصد
DEST_DIR="/var/www/moodflix-$DOMAIN"
sudo mkdir -p $DEST_DIR
sudo chown -R $USER:$USER $DEST_DIR

# 5. بیلد پروژه
echo "🏗 Building React application..."
npm install
npm run build

# 6. انتقال فایل‌ها به پوشه استاندارد وب
cp -r dist/* $DEST_DIR/

# 7. اجرای برنامه با PM2
echo "⚡ Starting background process on port $PORT..."
pm2 delete "moodflix-$DOMAIN" 2>/dev/null
pm2 start serve --name "moodflix-$DOMAIN" -- -s $DEST_DIR -l $PORT

# ذخیره وضعیت برای ریبوت سرور
pm2 save

# 8. تنظیم Nginx
echo "⚙️ Configuring Nginx Server Block..."
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
        proxy_set_header X-Real-IP \\\$remote_addr;
        proxy_set_header X-Forwarded-For \\\$proxy_add_x_forwarded_for;
    }
}
EOF"

# فعال‌سازی و ریستارت
sudo ln -sf $NGINX_CONF /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default 2>/dev/null
sudo nginx -t && sudo systemctl restart nginx

echo "------------------------------------------------"
echo "✅ بررسی نهایی وضعیت پورت $PORT:"
netstat -tuln | grep $PORT
echo "✅ بررسی وضعیت PM2:"
pm2 status "moodflix-$DOMAIN"
echo "------------------------------------------------"
echo "🚀 سایت شما با موفقیت روی http://$DOMAIN بالا آمد."
```

### 🔍 اگر باز هم 502 دیدید:
۱. دستور `pm2 logs moodflix-DOMAIN` را بزنید (بجای DOMAIN نام دامنه خود را بگذارید) تا ببینید آیا خطایی در اجرا وجود دارد یا خیر.
۲. مطمئن شوید که پورت در فایروال باز است: `sudo ufw allow 80`.
۳. بررسی کنید که آیا فایل `index.html` در مسیر `/var/www/moodflix-DOMAIN` وجود دارد یا خیر.

---
Developed with ❤️ by Moodflix Team
