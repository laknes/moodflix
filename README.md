
# Moodflix - Enterprise Multi-Site Hosting 🎬

اگر قصد دارید مودفلیکس را در کنار سایت‌های دیگر روی یک سرور اجرا کنید، این راهنما به شما کمک می‌کند.

## 🌐 نحوه میزبانی چندین سایت روی یک آی‌پی
انجین‌ایکس (Nginx) می‌تواند درخواست‌ها را بر اساس نام دامنه فیلتر کند. برای این کار:
1. سایت اول شما (مثلاً `site1.com`) یک فایل کانفیگ دارد.
2. سایت مودفلیکس (`moodflix.com`) یک فایل کانفیگ جداگانه خواهد داشت.
3. هر دو دامنه در پنل DNS باید به آی‌پی سرور شما (A Record) اشاره کنند.

### `install.sh` (نسخه مولتی-سایت):

```bash
#!/bin/bash

# --- Moodflix Multi-Site Installer ---
echo "🚀 Starting Moodflix Multi-Site Installation..."

# 1. نصب پیش‌نیازها (اگر نصب نیستند)
sudo apt-get update
sudo apt-get install -y nodejs npm nginx pm2

# 2. دریافت اطلاعات سایت جدید
read -p "🌐 دامنه جدید را وارد کنید (e.g. mood.mysite.com): " DOMAIN
read -p "🔌 پورت داخلی اپلیکیشن (Default 3000): " PORT
PORT=${PORT:-3000}

# 3. بیلد پروژه
echo "🏗 Building Project..."
npm install
npm run build

# 4. اجرای پروژه با PM2 (با نام منحصر به فرد بر اساس دامنه)
echo "⚡ Starting App with PM2..."
pm2 start npm --name "moodflix-$DOMAIN" -- start -- --port $PORT
pm2 save

# 5. تنظیم انجین‌ایکس (بدون تداخل با سایت‌های قبلی)
echo "⚙️ Configuring Nginx Server Block..."
NGINX_CONF="/etc/nginx/sites-available/$DOMAIN"

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

# فعال‌سازی کانفیگ جدید
sudo ln -sf $NGINX_CONF /etc/nginx/sites-enabled/

# تست و ریستارت انجین‌ایکس
echo "🧪 Testing Nginx..."
sudo nginx -t && sudo systemctl restart nginx

echo "✅ سایت جدید با موفقیت روی دامنه $DOMAIN بالا آمد!"
echo "📍 حالا هر دو سایت شما روی یک آی‌پی اما با دامنه‌های متفاوت در دسترس هستند."
```

### 💡 نکات مهم برای پایداری:
- **تداخل پورت**: دقت کنید که پورت داخلی (مثلاً ۳۰۰۰) توسط سایت دیگری اشغال نشده باشد.
- **SSL**: برای هر دامنه می‌توانید جداگانه گواهی SSL بگیرید:
  `sudo certbot --nginx -d mood.mysite.com`
- **فایل Default**: اگر انجین‌ایکس سایت اشتباهی را باز می‌کند، فایل پیش‌فرض را حذف کنید:
  `sudo rm /etc/nginx/sites-enabled/default` و سپس `sudo systemctl restart nginx`.

---
Developed with ❤️ by Moodflix Team
