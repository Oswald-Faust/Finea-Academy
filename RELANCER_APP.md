# 🔄 Comment redémarrer l'app Flutter correctement

## Pourquoi le spinner tourne à l'infini ?

L'app essaie de se connecter à l'ancien serveur local (`192.168.100.21:5001`) au lieu d'utiliser Render.

## ✅ Solution : Redémarrage complet

### Option 1 : Via l'IDE (VSCode / Android Studio)

1. **Arrêter l'app complètement** :
   - Appuyez sur le bouton **Stop** (carré rouge) dans votre IDE
   - OU appuyez sur `Ctrl+C` dans le terminal où Flutter tourne

2. **Relancer l'app** :
   ```bash
   flutter run
   ```

### Option 2 : Hot Restart (plus rapide)

Si l'app est déjà en cours d'exécution :

1. Dans le terminal où Flutter tourne, appuyez sur :
   - **`R`** (majuscule R) pour un **Hot Restart complet**
   - Pas juste **`r`** (minuscule) qui est un Hot Reload partiel

2. Ou dans VSCode/Android Studio :
   - Cliquez sur l'icône **🔄 Hot Restart** (pas le lightning bolt)

### Option 3 : Clean & Rebuild (si les options ci-dessus ne marchent pas)

```bash
cd /Users/oswaldfaust/Code/Finea-Academy
flutter clean
flutter pub get
flutter run
```

## 🎯 Ce qui va changer

Après le restart, l'app va maintenant se connecter à :
```
✅ https://finea-academy-1.onrender.com/api
```

Au lieu de :
```
❌ http://192.168.100.21:5001/api
```

Le spinner devrait disparaître et l'app devrait se charger normalement !

## ⚠️ Important

Pour l'instant, j'ai configuré l'app pour **toujours** utiliser Render (même en développement).

Si plus tard vous voulez revenir au développement local, il faudra :
1. Ouvrir `lib/config/api_config.dart`
2. Supprimer la ligne 15 : `return 'https://finea-academy-1.onrender.com';`
3. Décommenter le bloc de code ligne 17-38
4. Redémarrer l'app

