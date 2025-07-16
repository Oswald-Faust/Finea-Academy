# Script de configuration pour l'application Finéa Académie (Windows)
Write-Host "🚀 Configuration de l'application Finéa Académie" -ForegroundColor Blue
Write-Host "===============================================" -ForegroundColor Blue
Write-Host ""

# Fonctions pour afficher les messages avec couleurs
function Write-Step {
    param($Message)
    Write-Host "📋 $Message" -ForegroundColor Cyan
}

function Write-Success {
    param($Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Warning {
    param($Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Write-Error {
    param($Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

# Vérifier que nous sommes dans le bon répertoire
if (-not (Test-Path "pubspec.yaml")) {
    Write-Error "Ce script doit être exécuté depuis la racine du projet Flutter"
    exit 1
}

# 1. Installation des dépendances Flutter
Write-Step "Installation des dépendances Flutter..."
try {
    flutter pub get
    Write-Success "Dépendances Flutter installées"
} catch {
    Write-Error "Erreur lors de l'installation des dépendances Flutter"
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

# 2. Génération des fichiers JSON
Write-Step "Génération des modèles JSON..."
try {
    flutter packages pub run build_runner build --delete-conflicting-outputs
    Write-Success "Modèles JSON générés"
} catch {
    Write-Warning "Erreur lors de la génération des modèles JSON (peut être ignoré pour l'instant)"
}

# 3. Configuration du backend
if (Test-Path "backend") {
    Write-Step "Configuration du backend..."
    
    # Installation des dépendances Node.js
    Set-Location backend
    try {
        npm install
        Write-Success "Dépendances backend installées"
    } catch {
        Write-Error "Erreur lors de l'installation des dépendances backend"
        Write-Host $_.Exception.Message -ForegroundColor Red
        exit 1
    }
    
    # Création du fichier .env s'il n'existe pas
    if (-not (Test-Path ".env")) {
        Write-Step "Création du fichier .env..."
        
        $envContent = @"
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
"@
        
        $envContent | Out-File -FilePath ".env" -Encoding UTF8
        Write-Success "Fichier .env créé"
        Write-Warning "N'oubliez pas de configurer vos paramètres email dans backend\.env"
    } else {
        Write-Success "Fichier .env existe déjà"
    }
    
    # Création des dossiers d'upload
    if (-not (Test-Path "uploads\avatars")) {
        New-Item -ItemType Directory -Path "uploads\avatars" -Force | Out-Null
        Write-Success "Dossiers d'upload créés"
    } else {
        Write-Success "Dossiers d'upload existent déjà"
    }
    
    Set-Location ..
} else {
    Write-Warning "Dossier backend non trouvé, création du backend ignorée"
}

Write-Host ""
Write-Host "🎉 Configuration terminée !" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green
Write-Host ""

Write-Step "Prochaines étapes :"
Write-Host "1. Installez MongoDB :" -ForegroundColor White
Write-Host "   - Local: https://docs.mongodb.com/manual/installation/" -ForegroundColor Gray
Write-Host "   - Cloud: https://www.mongodb.com/cloud/atlas" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Configurez les emails (optionnel) :" -ForegroundColor White
Write-Host "   - Éditez backend\.env" -ForegroundColor Gray
Write-Host "   - Configurez EMAIL_USER et EMAIL_PASS" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Démarrez le backend :" -ForegroundColor White
Write-Host "   cd backend" -ForegroundColor Yellow
Write-Host "   npm run dev" -ForegroundColor Yellow
Write-Host ""
Write-Host "4. Démarrez l'application Flutter :" -ForegroundColor White
Write-Host "   flutter run" -ForegroundColor Yellow
Write-Host ""

Write-Success "Votre application est prête ! 🚀"
Write-Host ""
Write-Host "📚 Consultez INTEGRATION_GUIDE.md pour plus de détails" -ForegroundColor Cyan 