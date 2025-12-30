# Deployment Guide - Oracle Cloud Free Tier (1GB RAM)

## Server Information
- **IP**: YOUR_SERVER_IP
- **User**: ubuntu
- **Password**: YOUR_PASSWORD
- **RAM**: 1GB + 2GB Swap
- **OS**: Ubuntu

## Prerequisites on Server
- Node.js 20.x
- PM2 (Process Manager)
- Git

## Quick Deployment

### Option 1: Automated Deployment (Recommended)

1. **SSH into server:**
```bash
ssh ubuntu@YOUR_SERVER_IP
# Enter your password
```

2. **Download and run deployment script:**
```bash
# Download the deploy script
curl -o deploy.sh https://raw.githubusercontent.com/Vantrieu2000/rental-backend-api/main/deploy.sh

# Make it executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

3. **Configure environment variables:**
```bash
cd /home/ubuntu/rental-backend-api
nano .env
```

Update the following:
- `JWT_SECRET` - Change to a strong random string
- `JWT_REFRESH_SECRET` - Change to a different strong random string
- `ALLOWED_ORIGINS` - Add your frontend URL

4. **Restart the application:**
```bash
pm2 restart rental-api
```

### Option 2: Manual Deployment

1. **SSH into server:**
```bash
ssh ubuntu@YOUR_SERVER_IP
```

2. **Install Node.js:**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

3. **Install PM2:**
```bash
sudo npm install -g pm2
```

4. **Clone repository:**
```bash
cd ~
git clone https://github.com/Vantrieu2000/rental-backend-api.git
cd rental-backend-api
```

5. **Install dependencies:**
```bash
npm ci --only=production
```

6. **Create .env file:**
```bash
cp .env.production .env
nano .env
```

7. **Build application:**
```bash
npm run build
```

8. **Start with PM2:**
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Memory Optimization Tips

### 1. PM2 Configuration
The `ecosystem.config.js` is already optimized for 1GB RAM:
- Single instance (no cluster mode)
- Max memory restart at 400MB
- Node heap size limited to 512MB

### 2. Swap Usage
Monitor swap usage:
```bash
free -h
```

### 3. Clear Build Cache
After deployment, clear unnecessary files:
```bash
cd /home/ubuntu/rental-backend-api
rm -rf node_modules/.cache
npm cache clean --force
```

### 4. Monitor Memory
```bash
# Real-time monitoring
pm2 monit

# Memory usage
pm2 status
```

## Firewall Configuration

Open port 3000 for API access:
```bash
sudo ufw allow 3000/tcp
sudo ufw status
```

## Nginx Reverse Proxy (Optional but Recommended)

For production, use Nginx as reverse proxy:

1. **Install Nginx:**
```bash
sudo apt-get install -y nginx
```

2. **Configure Nginx:**
```bash
sudo nano /etc/nginx/sites-available/rental-api
```

Add:
```nginx
server {
    listen 80;
    server_name YOUR_SERVER_IP;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

3. **Enable site:**
```bash
sudo ln -s /etc/nginx/sites-available/rental-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## PM2 Commands

```bash
# View status
pm2 status

# View logs
pm2 logs rental-api

# Restart
pm2 restart rental-api

# Stop
pm2 stop rental-api

# Monitor resources
pm2 monit

# View detailed info
pm2 show rental-api
```

## Update Deployment

To update the application:

```bash
cd /home/ubuntu/rental-backend-api
git pull origin main
npm ci --only=production
npm run build
pm2 restart rental-api
```

Or run the deploy script again:
```bash
./deploy.sh
```

## Troubleshooting

### Application won't start
```bash
# Check logs
pm2 logs rental-api --lines 100

# Check if port is in use
sudo lsof -i :3000

# Check environment variables
cat .env
```

### Out of memory
```bash
# Check memory usage
free -h
pm2 monit

# Restart application
pm2 restart rental-api

# Check swap
sudo swapon --show
```

### Can't connect to API
```bash
# Check if app is running
pm2 status

# Check firewall
sudo ufw status

# Test locally
curl http://localhost:3000

# Check from outside
curl http://158.178.236.169:3000
```

## API Endpoints

Once deployed, access:
- **API Base**: http://YOUR_SERVER_IP:3000
- **Swagger Docs**: http://YOUR_SERVER_IP:3000/api/docs
- **Health Check**: http://YOUR_SERVER_IP:3000

## Security Recommendations

1. **Change default passwords** in .env
2. **Use Nginx** as reverse proxy
3. **Enable HTTPS** with Let's Encrypt (if you have a domain)
4. **Configure firewall** properly
5. **Regular updates**: `sudo apt-get update && sudo apt-get upgrade`
6. **Monitor logs** regularly: `pm2 logs`

## Backup Strategy

Regular backups of:
1. `.env` file (contains secrets)
2. MongoDB database (already on Atlas)
3. PM2 configuration: `pm2 save`

## Performance Monitoring

```bash
# CPU and Memory
htop

# PM2 monitoring
pm2 monit

# Disk usage
df -h

# Network
netstat -tulpn | grep :3000
```

## Support

If you encounter issues:
1. Check logs: `pm2 logs rental-api`
2. Check system resources: `free -h` and `df -h`
3. Restart application: `pm2 restart rental-api`
4. Check MongoDB connection in logs
