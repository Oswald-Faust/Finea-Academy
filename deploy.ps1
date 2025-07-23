# Script de déploiement Vercel pour Finéa Académie
# Usage: .\deploy.ps1 [backend|admin|both]

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("backend", "admin", "both")]
    [string]$Target = "both"
)

Write-Host "🚀 Déploiement Vercel - Finéa Académie" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green

# Vérifier si Vercel CLI est installé
try {
    $vercelVersion = vercel --version
    Write-Host "✅ Vercel CLI détecté: $vercelVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Vercel CLI non trouvé. Installation..." -ForegroundColor Red
    npm install -g vercel
}

# Fonction pour déployer le backend
function Deploy-Backend {
    Write-Host "`n🔧 Déploiement du Backend..." -ForegroundColor Yellow
    Set-Location "backend"
    
    # Vérifier les variables d'environnement
    if (-not (Test-Path ".env")) {
        Write-Host "⚠️  Fichier .env manquant. Créez-le avec les variables nécessaires." -ForegroundColor Yellow
        Write-Host "   Consultez env.example pour la structure." -ForegroundColor Yellow
    }
    
    # Déploiement
    try {
        vercel --prod --yes
        Write-Host "✅ Backend déployé avec succès!" -ForegroundColor Green
    } catch {
        Write-Host "❌ Erreur lors du déploiement du backend" -ForegroundColor Red
        exit 1
    }
    
    Set-Location ".."
}

# Fonction pour déployer le frontend admin
function Deploy-Admin {
    Write-Host "`n🎨 Déploiement du Frontend Admin..." -ForegroundColor Yellow
    Set-Location "admin-dashboard"
    
    # Build du projet
    Write-Host "📦 Build du projet..." -ForegroundColor Blue
    npm run build
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Erreur lors du build" -ForegroundColor Red
        exit 1
    }
    
    # Déploiement
    try {
        vercel --prod --yes
        Write-Host "✅ Frontend Admin déployé avec succès!" -ForegroundColor Green
    } catch {
        Write-Host "❌ Erreur lors du déploiement du frontend admin" -ForegroundColor Red
        exit 1
    }
    
    Set-Location ".."
}

# Fonction pour tester les endpoints
function Test-Endpoints {
    Write-Host "`n🧪 Test des endpoints..." -ForegroundColor Yellow
    
    # Récupérer l'URL du backend depuis Vercel
    $backendUrl = vercel ls --json | ConvertFrom-Json | Where-Object { $_.name -like "*backend*" } | Select-Object -First 1
    
    if ($backendUrl) {
        Write-Host "🔗 URL du backend: $($backendUrl.url)" -ForegroundColor Blue
        
        # Test de l'endpoint health
        try {
            $response = Invoke-RestMethod -Uri "$($backendUrl.url)/api/health" -Method GET
            Write-Host "✅ Endpoint /api/health: OK" -ForegroundColor Green
        } catch {
            Write-Host "❌ Endpoint /api/health: ÉCHEC" -ForegroundColor Red
        }
    }
}

# Exécution selon le paramètre
switch ($Target) {
    "backend" {
        Deploy-Backend
    }
    "admin" {
        Deploy-Admin
    }
    "both" {
        Deploy-Backend
        Deploy-Admin
        Test-Endpoints
    }
}

Write-Host "`n🎉 Déploiement terminé!" -ForegroundColor Green
Write-Host "📋 Prochaines étapes:" -ForegroundColor Blue
Write-Host "   1. Configurez les variables d'environnement dans Vercel" -ForegroundColor White
Write-Host "   2. Testez les endpoints de l'API" -ForegroundColor White
Write-Host "   3. Vérifiez le dashboard admin" -ForegroundColor White
Write-Host "   4. Mettez à jour l'URL de l'API dans l'app Flutter" -ForegroundColor White 