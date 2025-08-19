# 🚨 Dépannage Rapide - Routes 404

## ❌ Problème Identifié
Les routes `/api/contests/weekly/*` retournent des erreurs 404 (Route non trouvée).

## 🔍 Cause du Problème
Les routes spécifiques `/weekly/*` étaient définies **après** la route générique `/:id`, ce qui faisait que Express traitait `/weekly/current` comme un ID au lieu d'une route spécifique.

## ✅ Solution Appliquée
1. **Réorganisation des routes** dans `backend/routes/contests.js`
2. **Routes spécifiques AVANT** la route générique
3. **Ordre correct** : `/weekly/*` → `/:id`

## 🚀 Étapes de Résolution

### 1. Vérifier que le serveur est redémarré
```bash
# Arrêter le serveur (Ctrl+C)
# Puis redémarrer
cd backend
npm start
```

### 2. Tester les routes
```bash
# Test rapide des routes
cd backend
node test-routes-quick.js

# Test de l'API
node test-api-quick.js
```

### 3. Vérifier dans le navigateur
- `http://localhost:5000/api/health` ✅
- `http://localhost:5000/api/scheduler/status` ✅
- `http://localhost:5000/api/contests/weekly/current` ✅
- `http://localhost:5000/api/contests/weekly/stats` ✅

## 🔧 Vérifications

### Routes Correctement Ordonnées
```javascript
// ✅ CORRECT - Routes spécifiques AVANT /:id
router.get('/weekly/current', getCurrentWeeklyContest);
router.get('/weekly/stats', getWeeklyContestStats);
router.get('/weekly/history', getWeeklyContestHistory);

// Route générique APRÈS
router.get('/:id', getContestById);
```

### Routes Incorrectement Ordonnées (AVANT)
```javascript
// ❌ INCORRECT - Route générique AVANT les routes spécifiques
router.get('/:id', getContestById);

// Ces routes ne seront jamais atteintes !
router.get('/weekly/current', getCurrentWeeklyContest);
router.get('/weekly/stats', getWeeklyContestStats);
```

## 📋 Tests de Validation

### Test 1: Vérification des Routes
```bash
cd backend
node test-routes-quick.js
```
**Résultat attendu :**
```
1. GET    /api/contests/
2. GET    /api/contests/stats/overview
3. GET    /api/contests/type/:type
4. GET    /api/contests/weekly/current      ← AVANT /:id
5. GET    /api/contests/weekly/stats        ← AVANT /:id
6. GET    /api/contests/weekly/history      ← AVANT /:id
7. POST   /api/contests/weekly/participate ← AVANT /:id
8. POST   /api/contests/
9. POST   /api/contests/weekly             ← AVANT /:id
10. POST  /api/contests/weekly/draw        ← AVANT /:id
11. GET   /api/contests/:id                ← APRÈS
```

### Test 2: Test de l'API
```bash
cd backend
node test-api-quick.js
```
**Résultat attendu :**
```
✅ Status: 200
📊 Réponse: Succès
```

## 🚨 Si le Problème Persiste

### 1. Vérifier l'ordre des routes
```bash
cd backend
node test-routes-quick.js
```

### 2. Vérifier que le serveur est redémarré
- Arrêter complètement le serveur (Ctrl+C)
- Redémarrer avec `npm start`

### 3. Vérifier les logs du serveur
```bash
# Dans les logs du serveur, vous devriez voir :
Planificateur de concours hebdomadaires démarré
Routes /api/contests enregistrées
```

### 4. Vérifier la connexion MongoDB
```bash
# Le serveur doit se connecter à MongoDB
MongoDB connecté: [hostname]
```

## 🎯 Résultat Final
Après ces corrections, l'admin dashboard devrait pouvoir :
- ✅ Charger le concours actuel
- ✅ Afficher les statistiques
- ✅ Créer un nouveau concours
- ✅ Effectuer le tirage

Et l'application Flutter devrait pouvoir :
- ✅ Récupérer le concours actuel
- ✅ Participer au concours
- ✅ Vérifier le statut de participation

---

**💡 Conseil :** Toujours définir les routes spécifiques AVANT les routes génériques avec des paramètres !
