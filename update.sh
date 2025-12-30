#!/bin/bash

# Quick update script - Pull latest code and restart

set -e

echo "🔄 Updating Rental Backend API..."

# Navigate to project directory
cd /home/ubuntu/rental-backend-api

# Pull latest code
echo "📥 Pulling latest code from GitHub..."
git pull origin main

# Install any new dependencies
echo "📦 Installing dependencies..."
npm ci --only=production --no-audit --prefer-offline

# Build application
echo "🔨 Building application..."
npm run build

# Restart PM2
echo "🔄 Restarting application..."
pm2 restart rental-api

# Show status
echo "✅ Update complete!"
pm2 status
pm2 logs rental-api --lines 20 --nostream

echo ""
echo "🎉 Application updated and restarted successfully!"
