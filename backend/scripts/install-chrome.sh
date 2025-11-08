#!/bin/bash

echo "🔧 Installation de Chrome pour Puppeteer sur Render..."

# Installer les dépendances système nécessaires pour Chrome
echo "📦 Installation des dépendances système..."

# Vérifier si on est sur Render (environnement Linux)
if [ -f /etc/os-release ]; then
  . /etc/os-release
  echo "OS: $NAME $VERSION"
fi

# Installer Chrome via Puppeteer
echo "🌐 Installation de Chrome via Puppeteer..."
npx puppeteer browsers install chrome

# Vérifier que Chrome a été installé
if [ -d "$HOME/.cache/puppeteer" ]; then
  echo "✅ Chrome installé dans: $HOME/.cache/puppeteer"
  ls -la "$HOME/.cache/puppeteer"
else
  echo "❌ Erreur: Chrome n'a pas été installé correctement"
  exit 1
fi

echo "✅ Installation de Chrome terminée"

