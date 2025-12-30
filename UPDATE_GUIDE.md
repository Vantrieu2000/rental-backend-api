# 🔄 Hướng Dẫn Update Code

## Khi nào cần update?

Khi bạn:
- ✅ Push code mới lên GitHub
- ✅ Sửa bug
- ✅ Thêm tính năng mới
- ✅ Thay đổi cấu hình

## 3 Cách Update

### 🚀 Cách 1: Dùng script update (Nhanh nhất - Khuyến nghị)

```bash
# SSH vào server
ssh ubuntu@YOUR_SERVER_IP

# Chạy script update
cd /home/ubuntu/rental-backend-api
./update.sh
```

Script sẽ tự động:
1. Pull code mới từ GitHub
2. Install dependencies mới (nếu có)
3. Build lại application
4. Restart PM2
5. Hiển thị status và logs

**Thời gian:** ~1-2 phút

---

### 🔧 Cách 2: Dùng script deploy đầy đủ

```bash
# SSH vào server
ssh ubuntu@YOUR_SERVER_IP

# Chạy script deploy
cd /home/ubuntu/rental-backend-api
./deploy.sh
```

Script này sẽ làm mọi thứ từ đầu (cài Node.js, PM2, dependencies...).

**Khi nào dùng:** Khi có vấn đề với dependencies hoặc muốn cài lại từ đầu.

**Thời gian:** ~3-5 phút

---

### ⚡ Cách 3: Update thủ công (Nhanh nhất nếu biết rõ)

```bash
# SSH vào server
ssh ubuntu@YOUR_SERVER_IP

# Vào thư mục project
cd /home/ubuntu/rental-backend-api

# Pull code mới
git pull origin main

# Build lại
npm run build

# Restart
pm2 restart rental-api

# Xem logs
pm2 logs rental-api
```

**Khi nào dùng:** Khi chỉ thay đổi code nhỏ, không có dependencies mới.

**Thời gian:** ~30 giây

---

## 📝 Lần đầu tiên setup

Nếu chưa deploy lần nào:

```bash
# SSH vào server
ssh ubuntu@YOUR_SERVER_IP

# Download và chạy deploy script
curl -o deploy.sh https://raw.githubusercontent.com/Vantrieu2000/rental-backend-api/main/deploy.sh
chmod +x deploy.sh
./deploy.sh

# Cấu hình .env (chỉ lần đầu)
cd /home/ubuntu/rental-backend-api
cp .env.production .env
nano .env
# Đổi JWT_SECRET và JWT_REFRESH_SECRET

# Restart
pm2 restart rental-api
```

---

## 🔍 Kiểm tra sau khi update

```bash
# Xem status
pm2 status

# Xem logs
pm2 logs rental-api --lines 50

# Monitor real-time
pm2 monit

# Test API
curl http://localhost:3000
```

---

## 🆘 Troubleshooting

### Update bị lỗi "merge conflict"

```bash
cd /home/ubuntu/rental-backend-api
git reset --hard origin/main
./update.sh
```

### App không restart được

```bash
pm2 delete rental-api
pm2 start ecosystem.config.js
pm2 save
```

### Hết memory

```bash
pm2 restart rental-api
free -h
```

### Xem logs chi tiết

```bash
pm2 logs rental-api --lines 100
```

---

## 📊 Workflow thông thường

1. **Sửa code trên máy local** → Commit → Push lên GitHub
2. **SSH vào server:** `ssh ubuntu@YOUR_SERVER_IP`
3. **Chạy update:** `cd /home/ubuntu/rental-backend-api && ./update.sh`
4. **Kiểm tra:** `pm2 logs rental-api`
5. **Test API:** Mở browser http://YOUR_SERVER_IP:3000/api/docs

---

## 💡 Tips

### Tạo alias để update nhanh hơn

Thêm vào `~/.bashrc`:

```bash
alias update-api='cd /home/ubuntu/rental-backend-api && ./update.sh'
```

Sau đó chỉ cần gõ:
```bash
update-api
```

### Xem logs real-time

```bash
pm2 logs rental-api -f
```

### Restart nhanh

```bash
pm2 restart rental-api
```

### Xem memory usage

```bash
pm2 monit
```

---

## 🎯 Tóm tắt

**Update thường xuyên (code mới):**
```bash
ssh ubuntu@YOUR_SERVER_IP
cd /home/ubuntu/rental-backend-api
./update.sh
```

**Deploy lần đầu hoặc cài lại:**
```bash
ssh ubuntu@YOUR_SERVER_IP
cd /home/ubuntu/rental-backend-api
./deploy.sh
```

**Restart nhanh:**
```bash
ssh ubuntu@YOUR_SERVER_IP
pm2 restart rental-api
```

Đơn giản vậy thôi! 🚀
