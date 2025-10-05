#!/bin/bash

# Script de build pour Vercel
echo "🔧 Début du build pour Vercel..."

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

echo "✅ Build terminé avec succès"
