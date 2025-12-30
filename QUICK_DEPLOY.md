# Quick Deployment Guide

## 🚀 Deploy trong 5 phút

### Bước 1: SSH vào server
```bash
ssh ubuntu@YOUR_SERVER_IP
# Enter your password
```

### Bước 2: Chạy lệnh deploy tự động
```bash
# Download và chạy script
curl -o deploy.sh https://raw.githubusercontent.com/Vantrieu2000/rental-backend-api/main/deploy.sh
chmod +x deploy.sh
./deploy.sh
```

### Bước 3: Cấu hình .env (nếu chưa có)
```bash
cd /home/ubuntu/rental-backend-api
cp .env.production .env
nano .env
```

**Thay đổi các giá trị sau:**
- `JWT_SECRET` → Đổi thành chuỗi ngẫu nhiên mạnh
- `JWT_REFRESH_SECRET` → Đổi thành chuỗi ngẫu nhiên khác
- `ALLOWED_ORIGINS` → Thêm URL frontend của bạn

**Lưu file:** Ctrl+X → Y → Enter

### Bước 4: Restart ứng dụng
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

## ✅ Kiểm tra API hoạt động

Mở trình duyệt hoặc dùng curl:
```bash
# Health check
curl http://YOUR_SERVER_IP:3000

# Swagger docs
http://YOUR_SERVER_IP:3000/api/docs
```

## 📊 Các lệnh hữu ích

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

# Xem memory usage
free -h
```

## 🔄 Update code mới

```bash
cd /home/ubuntu/rental-backend-api
git pull origin main
npm ci --only=production
npm run build
pm2 restart rental-api
```

Hoặc chạy lại script:
```bash
./deploy.sh
```

## ⚠️ Lưu ý quan trọng

1. **Server chỉ có 1GB RAM** → PM2 đã được cấu hình tối ưu
2. **Không chạy nhiều process** → Chỉ 1 instance
3. **Monitor memory thường xuyên**: `pm2 monit`
4. **Đổi JWT secrets** trong production
5. **Mở port 3000** nếu firewall chặn:
   ```bash
   sudo ufw allow 3000/tcp
   ```

## 🆘 Troubleshooting

### App không start được
```bash
pm2 logs rental-api --lines 100
```

### Hết memory
```bash
pm2 restart rental-api
free -h
```

### Không connect được
```bash
# Kiểm tra app đang chạy
pm2 status

# Kiểm tra port
sudo lsof -i :3000

# Test local
curl http://localhost:3000
```

## 📞 Support

Nếu gặp vấn đề, check:
1. Logs: `pm2 logs rental-api`
2. Memory: `free -h`
3. Disk: `df -h`
4. MongoDB connection trong logs
