#!/bin/bash

BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="konfi_backup_$DATE.tar.gz"

echo "💾 Erstelle vollständiges Backup..."
mkdir -p $BACKUP_DIR

# Komplettes Backup von Datenbank + Bildern
tar -czf $BACKUP_DIR/$BACKUP_FILE \
    --exclude='./backups' \
    ./data ./uploads

echo "✅ Backup erstellt: $BACKUP_DIR/$BACKUP_FILE"
echo "📁 Enthält: Datenbank + alle Bilder"
echo "📏 Größe: $(du -h $BACKUP_DIR/$BACKUP_FILE | cut -f1)"