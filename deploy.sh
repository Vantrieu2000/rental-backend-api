#!/bin/bash

# Deployment script for low-memory server (1GB RAM)
# Oracle Cloud Free Tier optimized

set -e

echo "🚀 Starting deployment..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
APP_DIR="/home/ubuntu/rental-backend-api"
REPO_URL="https://github.com/Vantrieu2000/rental-backend-api.git"
NODE_VERSION="20"

echo -e "${YELLOW}📦 Step 1: Installing system dependencies...${NC}"

# Update system
sudo apt-get update

# Install Node.js if not installed
if ! command -v node &> /dev/null; then
    echo "Installing Node.js ${NODE_VERSION}..."
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Install PM2 globally if not installed
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2..."
    sudo npm install -g pm2
fi

# Install Git if not installed
if ! command -v git &> /dev/null; then
    echo "Installing Git..."
    sudo apt-get install -y git
fi

echo -e "${GREEN}✅ System dependencies installed${NC}"

echo -e "${YELLOW}📥 Step 2: Cloning/Updating repository...${NC}"

# Clone or pull repository
if [ -d "$APP_DIR" ]; then
    echo "Repository exists, pulling latest changes..."
    cd $APP_DIR
    git pull origin main
else
    echo "Cloning repository..."
    git clone $REPO_URL $APP_DIR
    cd $APP_DIR
fi

echo -e "${GREEN}✅ Repository updated${NC}"

echo -e "${YELLOW}📝 Step 3: Setting up environment variables...${NC}"

# Check if .env exists
if [ ! -f ".env" ]; then
    echo -e "${RED}⚠️  .env file not found!${NC}"
    echo "Please create .env file with your configuration."
    echo "You can copy from .env.example:"
    echo "  cp .env.example .env"
    echo "  nano .env"
    exit 1
fi

echo -e "${GREEN}✅ Environment variables configured${NC}"

echo -e "${YELLOW}📦 Step 4: Installing dependencies (this may take a while)...${NC}"

# Clear npm cache to save space
npm cache clean --force

# Install production dependencies only
npm ci --only=production --no-audit --prefer-offline

echo -e "${GREEN}✅ Dependencies installed${NC}"

echo -e "${YELLOW}🔨 Step 5: Building application...${NC}"

# Build the application
npm run build

# Remove source files to save space (optional)
# rm -rf src test

echo -e "${GREEN}✅ Application built${NC}"

echo -e "${YELLOW}🗂️  Step 6: Creating logs directory...${NC}"

# Create logs directory
mkdir -p logs

echo -e "${GREEN}✅ Logs directory created${NC}"

echo -e "${YELLOW}🔄 Step 7: Starting application with PM2...${NC}"

# Stop existing PM2 process if running
pm2 stop rental-api 2>/dev/null || true
pm2 delete rental-api 2>/dev/null || true

# Start application with PM2
pm2 start ecosystem.config.js

# Save PM2 process list
pm2 save

# Setup PM2 to start on system boot
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu

echo -e "${GREEN}✅ Application started with PM2${NC}"

echo -e "${YELLOW}🔍 Step 8: Checking application status...${NC}"

# Wait for app to start
sleep 5

# Show PM2 status
pm2 status

# Show logs
echo -e "\n${YELLOW}📋 Recent logs:${NC}"
pm2 logs rental-api --lines 20 --nostream

echo -e "\n${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "\n${YELLOW}📊 Useful commands:${NC}"
echo "  pm2 status              - Check application status"
echo "  pm2 logs rental-api     - View logs"
echo "  pm2 restart rental-api  - Restart application"
echo "  pm2 stop rental-api     - Stop application"
echo "  pm2 monit               - Monitor resources"
echo ""
echo -e "${YELLOW}🌐 API should be running at:${NC}"
echo "  http://YOUR_SERVER_IP:3000"
echo "  http://YOUR_SERVER_IP:3000/api/docs (Swagger)"
