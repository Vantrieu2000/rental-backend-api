# 🚀 Deploy Ngay Bây Giờ

## Cách 1: Tự động (Khuyến nghị)

### Bước 1: Mở PowerShell hoặc CMD và chạy:

```powershell
ssh ubuntu@158.178.236.169
```

Nhập password: `Admin@02122000`

### Bước 2: Sau khi đã SSH vào server, chạy các lệnh sau:

```bash
# Download deployment script
curl -o deploy.sh https://raw.githubusercontent.com/Vantrieu2000/rental-backend-api/main/deploy.sh

# Make it executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

Script sẽ tự động:
- ✅ Cài đặt Node.js 20
- ✅ Cài đặt PM2
- ✅ Clone code từ GitHub
- ✅ Install dependencies
- ✅ Build application
- ✅ Start với PM2

### Bước 3: Cấu hình .env (chỉ lần đầu)

```bash
cd /home/ubuntu/rental-backend-api
cp .env.production .env
nano .env
```

**Thay đổi các dòng sau:**
```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
```

Đổi thành chuỗi ngẫu nhiên mạnh (ví dụ: `aB3$xY9#mK2@pL7!qR5&wT8*`).

**Lưu file:**
- Nhấn `Ctrl + X`
- Nhấn `Y`
- Nhấn `Enter`

### Bước 4: Restart application

```bash
pm2 restart rental-api
```

### Bước 5: Kiểm tra

```bash
# Xem status
pm2 status

# Xem logs
pm2 logs rental-api --lines 50
```

## Kiểm tra API

Mở trình duyệt:
- **API**: http://158.178.236.169:3000
- **Swagger Docs**: http://158.178.236.169:3000/api/docs

Hoặc dùng curl:
```bash
curl http://158.178.236.169:3000
```

## Cách 2: Thủ công (Nếu script không chạy)

```bash
# 1. SSH vào server
ssh ubuntu@158.178.236.169

# 2. Cài Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Cài PM2
sudo npm install -g pm2

# 4. Clone code
cd ~
git clone https://github.com/Vantrieu2000/rental-backend-api.git
cd rental-backend-api

# 5. Cấu hình .env
cp .env.production .env
nano .env
# Đổi JWT secrets

# 6. Install dependencies
npm ci --only=production

# 7. Build
npm run build

# 8. Start với PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Các lệnh hữu ích

```bash
# Xem status
pm2 status

# Xem logs real-time
pm2 logs rental-api

# Monitor tài nguyên
pm2 monit

# Restart
pm2 restart rental-api

# Stop
pm2 stop rental-api

# Xem memory
free -h
```

## Mở port 3000 (nếu cần)

```bash
sudo ufw allow 3000/tcp
sudo ufw status
```

## Update code sau này

```bash
cd /home/ubuntu/rental-backend-api
git pull origin main
npm ci --only=production
npm run build
pm2 restart rental-api
```

## Troubleshooting

### Nếu gặp lỗi "out of memory"
```bash
pm2 restart rental-api
free -h
```

### Nếu không connect được
```bash
# Kiểm tra app đang chạy
pm2 status

# Kiểm tra port
sudo lsof -i :3000

# Test local
curl http://localhost:3000
```

### Xem logs chi tiết
```bash
pm2 logs rental-api --lines 100
```

## 🎉 Hoàn tất!

Sau khi deploy xong, API sẽ chạy tại:
- http://158.178.236.169:3000
- http://158.178.236.169:3000/api/docs (Swagger)

PM2 sẽ tự động:
- ✅ Restart nếu app crash
- ✅ Restart nếu dùng quá 400MB RAM
- ✅ Start lại khi server reboot
- ✅ Ghi logs vào file
