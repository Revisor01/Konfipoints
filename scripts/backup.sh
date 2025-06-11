#!/bin/bash

BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="konfi_backup_$DATE.db"

echo "💾 Erstelle Backup..."
mkdir -p $BACKUP_DIR

docker-compose exec -T backend sqlite3 /app/data/konfi.db ".backup /app/data/$BACKUP_FILE"
docker cp $(docker-compose ps -q backend):/app/data/$BACKUP_FILE $BACKUP_DIR/
docker-compose exec -T backend rm /app/data/$BACKUP_FILE

echo "✅ Backup erstellt: $BACKUP_DIR/$BACKUP_FILE"