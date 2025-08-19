# Script de démarrage du système de concours hebdomadaire - Finéa Académie
# PowerShell script pour Windows

Write-Host "🎯 Démarrage du système de concours hebdomadaire Finéa Académie" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan

# Vérifier si Node.js est installé
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js détecté: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js n'est pas installé ou n'est pas dans le PATH" -ForegroundColor Red
    Write-Host "Veuillez installer Node.js depuis https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Vérifier si MongoDB est accessible
Write-Host "`n🔍 Vérification de la connexion MongoDB..." -ForegroundColor Yellow

# Vérifier si le fichier .env existe
if (-not (Test-Path "backend\.env")) {
    Write-Host "❌ Fichier .env manquant dans le dossier backend" -ForegroundColor Red
    Write-Host "Veuillez créer le fichier .env avec votre URI MongoDB" -ForegroundColor Yellow
    exit 1
}

# Installer les dépendances du backend
Write-Host "`n📦 Installation des dépendances backend..." -ForegroundColor Yellow
Set-Location "backend"
if (-not (Test-Path "node_modules")) {
    Write-Host "Installation des packages npm..." -ForegroundColor Blue
    npm install
} else {
    Write-Host "Dépendances déjà installées" -ForegroundColor Green
}

# Installer les dépendances de l'admin dashboard
Write-Host "`n📦 Installation des dépendances admin dashboard..." -ForegroundColor Yellow
Set-Location "..\admin-dashboard"
if (-not (Test-Path "node_modules")) {
    Write-Host "Installation des packages npm..." -ForegroundColor Blue
    npm install
} else {
    Write-Host "Dépendances déjà installées" -ForegroundColor Green
}

# Retourner au dossier racine
Set-Location ".."

# Démarrer le backend
Write-Host "`n🚀 Démarrage du serveur backend..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm start" -WindowStyle Normal

# Attendre un peu pour que le backend démarre
Write-Host "Attente du démarrage du backend..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Démarrer l'admin dashboard
Write-Host "`n🌐 Démarrage de l'admin dashboard..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd admin-dashboard; npm start" -WindowStyle Normal

# Démarrer l'application Flutter (optionnel)
Write-Host "`n📱 Démarrage de l'application Flutter..." -ForegroundColor Green
Write-Host "Note: Assurez-vous qu'un émulateur Flutter est en cours d'exécution" -ForegroundColor Yellow

# Afficher les informations de connexion
Write-Host "`n📋 Informations de connexion:" -ForegroundColor Cyan
Write-Host "Backend API: http://localhost:5000" -ForegroundColor White
Write-Host "Admin Dashboard: http://localhost:3000" -ForegroundColor White
Write-Host "API Health: http://localhost:5000/api/health" -ForegroundColor White
Write-Host "Scheduler Status: http://localhost:5000/api/scheduler/status" -ForegroundColor White

# Afficher les commandes utiles
Write-Host "`n🔧 Commandes utiles:" -ForegroundColor Cyan
Write-Host "Test du concours: cd backend; node test-weekly-contest.js" -ForegroundColor White
Write-Host "Logs backend: cd backend; npm run dev" -ForegroundColor White
Write-Host "Logs admin: cd admin-dashboard; npm run dev" -ForegroundColor White

Write-Host "`n🎉 Système démarré avec succès !" -ForegroundColor Green
Write-Host "Le planificateur de concours hebdomadaires est maintenant actif." -ForegroundColor Green
Write-Host "Un nouveau concours sera créé chaque dimanche automatiquement." -ForegroundColor Green

# Garder la fenêtre ouverte
Write-Host "`nAppuyez sur une touche pour fermer cette fenêtre..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
