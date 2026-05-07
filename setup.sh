#!/bin/bash

set -e  # Exit on any error

echo "🚀 Starting deployment..."

# Go to home directory
cd ~

# Go into FindYourShoot
cd FindYourShoot

# Remove old FindYourShoot and Website folders
echo "🗑️  Removing old folders..."
rm -rf FindYourShoot Website

# Clone fresh FindYourShoot repo
echo "📦 Cloning FindYourShoot repository..."
git clone git@github.com:guudc/FindYourShoot.git

# Duplicate FindYourShoot and name it Website
echo "📁 Duplicating FindYourShoot to Website..."
cp -R FindYourShoot Website

# Go into FindYourShoot, install dependencies, restart PM2
echo "⚙️  Setting up FindYourShoot app..."
cd FindYourShoot
git fetch
git switch waitlist

# Copy .env file
echo "🔑 Copying .env..."
cp ../.env .env

npm install 

# Restart PM2 if app exists, otherwise start it fresh
if pm2 describe "FindYourShoot app" > /dev/null 2>&1; then
  echo "🔄 Restarting existing PM2 process..."
  pm2 restart "FindYourShoot app"
else
  echo "▶️  Starting FindYourShoot app in PM2 for the first time..."
  pm2 start npm --name "FindYourShoot app" -- start
fi

cd ..

# Go into Website, fetch and switch to Website branch
echo "🌐 Setting up Website..."
cd Website
sudo cp -r /root/FindYourShoot/Website/* /var/www/FindYourShoot/

echo "✅ Deployment complete!"