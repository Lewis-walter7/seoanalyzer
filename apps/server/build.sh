#!/bin/bash
echo "🔧 Installing dev deps..."
npm install --include=dev
echo "🔨 Building..."
npm run build
