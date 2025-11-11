#!/bin/bash

# Script pour mettre à jour automatiquement l'IP locale dans api_config.dart

# Couleurs pour les messages
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Détection de l'adresse IP locale...${NC}"

# Récupérer l'IP locale (exclut 127.0.0.1)
CURRENT_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -n 1)

if [ -z "$CURRENT_IP" ]; then
    echo -e "${RED}❌ Impossible de détecter l'adresse IP${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Adresse IP détectée: $CURRENT_IP${NC}"

# Fichier à mettre à jour
CONFIG_FILE="lib/config/api_config.dart"

if [ ! -f "$CONFIG_FILE" ]; then
    echo -e "${RED}❌ Fichier $CONFIG_FILE introuvable${NC}"
    exit 1
fi

# Extraire l'IP actuelle dans le fichier
OLD_IP=$(grep "_localDevMachineIP = " "$CONFIG_FILE" | sed "s/.*'\(.*\)'.*/\1/")

if [ "$OLD_IP" == "$CURRENT_IP" ]; then
    echo -e "${GREEN}✅ L'IP est déjà à jour ($CURRENT_IP)${NC}"
    exit 0
fi

echo -e "${BLUE}🔄 Mise à jour de $OLD_IP vers $CURRENT_IP${NC}"

# Mettre à jour l'IP dans le fichier
sed -i '' "s/_localDevMachineIP = '[^']*'/_localDevMachineIP = '$CURRENT_IP'/" "$CONFIG_FILE"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ IP mise à jour avec succès dans $CONFIG_FILE${NC}"
    echo -e "${BLUE}💡 N'oubliez pas de faire un Hot Restart (R) dans Flutter !${NC}"
else
    echo -e "${RED}❌ Erreur lors de la mise à jour${NC}"
    exit 1
fi

