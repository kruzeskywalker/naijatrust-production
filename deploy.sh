#!/bin/bash

# Naija Trust 2 - Automated Deployment Script
# This script will guide you through deploying your application

set -e  # Exit on error

PROD_DIR="/Users/skywalker/Desktop/Devs/Naija Trust 2 - Production"
GITHUB_REPO_NAME="naijatrust-production"

echo "🚀 Naija Trust 2 - Production Deployment"
echo "========================================"
echo ""

# Step 1: Git Setup
echo "📦 Step 1: Setting up Git repository..."
cd "$PROD_DIR"

if [ ! -d ".git" ]; then
    git init
    echo "✅ Git repository initialized"
else
    echo "✅ Git repository already exists"
fi

# Add all files
git add .
echo "✅ Files staged for commit"

# Create initial commit
if git diff-index --quiet HEAD -- 2>/dev/null; then
    echo "✅ No changes to commit"
else
    git commit -m "Initial production deployment commit" || git commit -m "Production deployment update"
    echo "✅ Changes committed"
fi

echo ""
echo "📋 Next Steps:"
echo ""
echo "1️⃣  CREATE GITHUB REPOSITORY"
echo "   Go to: https://github.com/new"
echo "   Repository name: $GITHUB_REPO_NAME"
echo "   Visibility: Private (recommended)"
echo "   Don't initialize with README"
echo ""
echo "2️⃣  PUSH TO GITHUB"
echo "   After creating the repository, run these commands:"
echo ""
echo "   cd \"$PROD_DIR\""
echo "   git remote add origin https://github.com/kruzeSkywalker/$GITHUB_REPO_NAME.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "3️⃣  DEPLOY BACKEND (Render)"
echo "   • Go to: https://render.com/dashboard"
echo "   • Click 'New +' → 'Web Service'"
echo "   • Connect your GitHub repository: $GITHUB_REPO_NAME"
echo "   • Settings:"
echo "     - Name: naijatrust-backend"
echo "     - Root Directory: backend"
echo "     - Build Command: npm install"
echo "     - Start Command: npm run start:prod"
echo "     - Instance Type: Free"
echo ""
echo "   • Environment Variables (copy from backend/.env.production):"
echo "     NODE_ENV=production"
echo "     MONGODB_URI=<your-mongodb-connection-string>"
echo "     JWT_SECRET=<already-in-env-file>"
echo "     SESSION_SECRET=<already-in-env-file>"
echo "     EMAIL_USER=<your-email>"
echo "     EMAIL_PASSWORD=<your-email-password>"
echo "     GOOGLE_CLIENT_ID=<your-google-client-id>"
echo "     GOOGLE_CLIENT_SECRET=<your-google-client-secret>"
echo "     FRONTEND_URL=<will-update-after-vercel>"
echo "     PORT=5001"
echo ""
echo "4️⃣  DEPLOY FRONTEND (Vercel)"
echo "   • Go to: https://vercel.com/new"
echo "   • Import your GitHub repository: $GITHUB_REPO_NAME"
echo "   • Settings:"
echo "     - Framework Preset: Vite"
echo "     - Root Directory: frontend"
echo "     - Build Command: npm run build (auto-detected)"
echo "     - Output Directory: dist (auto-detected)"
echo ""
echo "   • Environment Variable:"
echo "     VITE_API_URL=<your-render-backend-url>/api/auth"
echo ""
echo "5️⃣  POST-DEPLOYMENT"
echo "   • Update FRONTEND_URL in Render with your Vercel URL"
echo "   • Update Google OAuth redirect URIs in Google Cloud Console"
echo "   • Test your application!"
echo ""
echo "📖 For detailed instructions, see:"
echo "   $PROD_DIR/DEPLOYMENT.md"
echo ""
echo "Press Enter to open the GitHub repository creation page..."
read -r

# Open GitHub new repository page
open "https://github.com/new"

echo ""
echo "✅ Script complete! Follow the steps above to deploy your application."
