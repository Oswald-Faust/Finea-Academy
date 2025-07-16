#!/bin/bash

echo "🚀 Configuration de l'application Finéa Académie"
echo "=============================================="

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages avec couleurs
print_step() {
    echo -e "${BLUE}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "pubspec.yaml" ]; then
    print_error "Ce script doit être exécuté depuis la racine du projet Flutter"
    exit 1
fi

# 1. Installation des dépendances Flutter
print_step "Installation des dépendances Flutter..."
if flutter pub get; then
    print_success "Dépendances Flutter installées"
else
    print_error "Erreur lors de l'installation des dépendances Flutter"
    exit 1
fi

# 2. Génération des fichiers JSON
print_step "Génération des modèles JSON..."
if flutter packages pub run build_runner build --delete-conflicting-outputs; then
    print_success "Modèles JSON générés"
else
    print_warning "Erreur lors de la génération des modèles JSON (peut être ignoré pour l'instant)"
fi

# 3. Vérification de l'existence du dossier backend
if [ -d "backend" ]; then
    print_step "Configuration du backend..."
    
    # Installation des dépendances Node.js
    cd backend
    if npm install; then
        print_success "Dépendances backend installées"
    else
        print_error "Erreur lors de l'installation des dépendances backend"
        exit 1
    fi
    
    # Création du fichier .env s'il n'existe pas
    if [ ! -f ".env" ]; then
        print_step "Création du fichier .env..."
        cat > .env << EOL
# Configuration du serveur
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# Base de données MongoDB
MONGODB_URI=mongodb://localhost:27017/finea-academie

# JWT Secret
JWT_SECRET=finea-academie-super-secret-jwt-key-change-in-production
JWT_EXPIRE=30d

# Configuration Email (Gmail)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@finea-academie.fr

# URLs de redirection
RESET_PASSWORD_URL=http://localhost:3000/reset-password

# Autres configurations
BCRYPT_SALT_ROUNDS=12
MAX_LOGIN_ATTEMPTS=5
LOCK_TIME=2h

# Configuration pour les uploads
MAX_FILE_SIZE=5MB
UPLOAD_PATH=./uploads
EOL
        print_success "Fichier .env créé"
        print_warning "N'oubliez pas de configurer vos paramètres email dans backend/.env"
    else
        print_success "Fichier .env existe déjà"
    fi
    
    # Création des dossiers d'upload
    mkdir -p uploads/avatars
    print_success "Dossiers d'upload créés"
    
    cd ..
else
    print_warning "Dossier backend non trouvé, création du backend ignorée"
fi

echo ""
echo "🎉 Configuration terminée !"
echo "=============================================="
echo ""
print_step "Prochaines étapes :"
echo "1. Installez MongoDB :"
echo "   - Local: https://docs.mongodb.com/manual/installation/"
echo "   - Cloud: https://www.mongodb.com/cloud/atlas"
echo ""
echo "2. Configurez les emails (optionnel) :"
echo "   - Éditez backend/.env"
echo "   - Configurez EMAIL_USER et EMAIL_PASS"
echo ""
echo "3. Démarrez le backend :"
echo "   cd backend && npm run dev"
echo ""
echo "4. Démarrez l'application Flutter :"
echo "   flutter run"
echo ""
print_success "Votre application est prête ! 🚀"
echo ""
echo "📚 Consultez INTEGRATION_GUIDE.md pour plus de détails" 