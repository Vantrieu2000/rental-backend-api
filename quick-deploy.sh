#!/bin/bash

# Quick deployment script - Only pull, build and restart
# Use this when you only changed code, no new dependencies

set -e

echo "🚀 Quick Deploy - No dependency installation"

# Navigate to project directory
cd /home/ubuntu/rental-backend-api

# Pull latest code
echo "📥 Pulling latest code from GitHub..."
git pull origin main

# Build application
echo "🔨 Building application..."
npm run build

# Restart PM2
echo "🔄 Restarting application..."
pm2 restart rental-api

# Show status
echo "✅ Quick deploy complete!"
pm2 status
pm2 logs rental-api --lines 20 --nostream

echo ""
echo "🎉 Application updated and restarted successfully!"
echo "⚡ Skipped dependency installation for faster deployment"
