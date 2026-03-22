#!/bin/bash
# Build PWA-ready web export
set -e

echo "🔨 Building web export..."
npx expo export --platform web

echo "📦 Adding PWA files..."
cp web/manifest.json dist/manifest.json
cp web/register-sw.js dist/register-sw.js
cp web/sw.js dist/sw.js
cp assets/icon-192.png dist/assets/icon-192.png
cp assets/icon-512.png dist/assets/icon-512.png

# Patch index.html with PWA tags
node -e "
const fs = require('fs');
let html = fs.readFileSync('dist/index.html', 'utf8');

// Add manifest + apple meta tags if missing
if (!html.includes('manifest.json')) {
  html = html.replace('</head>',
    '    <link rel=\"manifest\" href=\"/manifest.json\" />\n' +
    '    <meta name=\"apple-mobile-web-app-capable\" content=\"yes\" />\n' +
    '    <meta name=\"apple-mobile-web-app-status-bar-style\" content=\"default\" />\n' +
    '    <meta name=\"apple-mobile-web-app-title\" content=\"Trucker\" />\n' +
    '    <link rel=\"apple-touch-icon\" href=\"/assets/icon-192.png\" />\n' +
    '  </head>');
}

// Add service worker registration if missing
if (!html.includes('register-sw.js')) {
  html = html.replace('</body>',
    '    <script src=\"/register-sw.js\"></script>\n  </body>');
}

fs.writeFileSync('dist/index.html', html);
"

echo "✅ PWA build complete → dist/"
