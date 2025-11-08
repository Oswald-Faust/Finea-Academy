#!/usr/bin/env bash
# Script de build pour Render avec installation de Chrome

set -e

echo "🚀 Début du build pour Render..."

# Installer les dépendances Node
echo "📦 Installation des dépendances Node..."
npm install

# Installer Chrome pour Puppeteer
echo "🌐 Installation de Chrome pour Puppeteer..."
npx puppeteer browsers install chrome

# Vérifier l'installation
CHROME_PATH=$(node -e "console.log(require('puppeteer').executablePath())" 2>/dev/null || echo "")
if [ -n "$CHROME_PATH" ]; then
  echo "✅ Chrome trouvé à: $CHROME_PATH"
else
  echo "⚠️  Chrome pourrait ne pas être correctement installé"
fi

echo "✅ Build terminé avec succès"

