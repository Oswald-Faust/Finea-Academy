# 📅 Guide du Calendrier Économique

## 🎯 Fonctionnement

Le calendrier économique utilise **Puppeteer** pour scraper les données de ForexFactory en temps réel.

---

## ⚙️ Installation Locale

### 1. Installer Chrome pour Puppeteer

```bash
cd backend
npx puppeteer browsers install chrome
```

### 2. Vérifier l'installation

```bash
node -e "console.log(require('puppeteer').executablePath())"
```

Vous devriez voir le chemin vers Chrome.

---

## 🚀 Déploiement sur Render

### Configuration automatique

Le fichier `render-build.sh` installe automatiquement Chrome lors du build :

```bash
#!/usr/bin/env bash
npm install
npx puppeteer browsers install chrome
```

### Vérification sur Render

Après le déploiement, vérifiez les logs :
- ✅ `✅ Navigateur initialisé` → Chrome fonctionne
- ❌ `❌ Erreur lors du lancement de Puppeteer` → Problème d'installation

---

## 🔄 Gestion des Erreurs

### Si Chrome n'est pas disponible

L'API retournera :
```json
{
  "success": true,
  "count": 0,
  "data": [],
  "warning": "Le calendrier économique est temporairement indisponible",
  "suggestion": "Visitez directement https://www.forexfactory.com/calendar"
}
```

**L'application continuera de fonctionner** sans crasher.

---

## 📱 Côté App Flutter

L'app doit gérer le cas où `data` est vide :

```dart
if (response.count == 0) {
  // Afficher un message d'indisponibilité
  // avec un bouton pour ouvrir ForexFactory
}
```

---

## 🐛 Problèmes Courants

### 1. "Browser was not found at the configured executablePath"

**Cause** : Chrome n'est pas installé

**Solution** :
- Local : `npx puppeteer browsers install chrome`
- Render : Vérifier que `render-build.sh` s'exécute

### 2. "Could not find Chrome (ver. X.X.X)"

**Cause** : Version de Chrome manquante

**Solution** :
```bash
npx puppeteer browsers clear
npx puppeteer browsers install chrome
```

### 3. Timeout lors du scraping

**Cause** : ForexFactory bloque le scraping ou serveur lent

**Solution** : 
- Augmenter le timeout dans le service
- Vérifier les headers anti-détection

---

## 🔮 Alternatives Futures

### Option 1 : API Tierce (Recommandé)

- **FCS API** : https://fcsapi.com/ (500 req/mois gratuit)
- **Trading Economics** : https://tradingeconomics.com/api
- **Alpha Vantage** : https://www.alphavantage.co/

**Avantages** :
- ✅ Plus fiable
- ✅ Pas besoin de Puppeteer/Chrome
- ✅ Moins de ressources serveur

### Option 2 : Cache MongoDB

Sauvegarder les dernières données en DB :
- Quand Puppeteer fonctionne → Save to MongoDB
- Si échec → Return cached data
- Expiration après 24h

### Option 3 : Service dédié

Héberger un service séparé uniquement pour le scraping :
- Micro-service avec Puppeteer
- API REST pour consommer les données
- Peut tourner sur un serveur avec plus de ressources

---

## 📊 Métriques

### Performances actuelles

- **Temps de scraping** : ~5-10 secondes
- **Nombre d'événements** : ~50-100 par jour
- **Taux de succès** : Variable (dépend de ForexFactory)

### Ressources

- **RAM** : ~200MB par instance Puppeteer
- **CPU** : Pic pendant le scraping
- **Disque** : ~300MB pour Chrome

---

## 🛠️ Maintenance

### Mise à jour de Puppeteer

```bash
npm update puppeteer
npm update puppeteer-extra puppeteer-extra-plugin-stealth
npx puppeteer browsers install chrome
```

### Vérification régulière

Tester l'endpoint :
```bash
curl https://finea-academy-1.onrender.com/api/forexfactory/calendar
```

---

## 📞 Support

Si le calendrier ne fonctionne pas :
1. Vérifier les logs Render
2. Tester localement
3. Consulter la documentation Puppeteer : https://pptr.dev/
4. Vérifier que ForexFactory n'a pas changé sa structure HTML

