#!/bin/bash

echo "🚀 Build Netlify pour admin-dashboard..."

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "package.json" ]; then
    echo "❌ Erreur: package.json non trouvé"
    exit 1
fi

# Vérifier que le dossier public existe
if [ ! -d "public" ]; then
    echo "❌ Erreur: dossier public non trouvé"
    exit 1
fi

# Vérifier que index.html existe
if [ ! -f "public/index.html" ]; then
    echo "❌ Erreur: public/index.html non trouvé"
    exit 1
fi

echo "✅ Fichiers requis trouvés"

# Installer les dépendances
echo "📦 Installation des dépendances..."
npm install

# Construire le projet
echo "🏗️ Construction du projet..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build Netlify terminé avec succès !"
    echo "📁 Fichiers générés dans: $(pwd)/build"
else
    echo "❌ Erreur lors du build"
    exit 1
fi
