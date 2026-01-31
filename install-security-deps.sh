#!/bin/bash

# Security Dependencies Installation Script for UniSupport Portal
# Run this script to install required security packages

echo "Installing security dependencies for UniSupport Portal..."

# Navigate to server directory
cd server

# Install security packages
npm install express-rate-limit@^6.0.0 express-mongo-sanitize@^2.0.0 express-validator@^6.0.0

echo "✅ Security dependencies installed successfully!"
echo ""
echo "📋 Installed packages:"
echo "  - express-rate-limit: API rate limiting"
echo "  - express-mongo-sanitize: NoSQL injection prevention"  
echo "  - express-validator: Input validation"
echo ""
echo "🔒 Your application security has been enhanced!"
