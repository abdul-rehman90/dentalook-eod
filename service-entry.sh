#!/bin/sh
set -e

echo "Building Next.js app..."
npm run build

echo "Starting Next.js on port 3000..."
exec npm start
