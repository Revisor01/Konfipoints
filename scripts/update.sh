# scripts/update.sh
#!/bin/bash

echo "🔄 Konfi-System Update..."

cd /opt/Konfipoints

# Backup erstellen
echo "💾 Erstelle Backup..."
./scripts/backup.sh

# Git Pull
echo "📥 Lade Updates..."
git pull origin main

# Container stoppen
echo "🛑 Stoppe Container..."
docker-compose down

# Neu bauen und starten
echo "🔨 Baue Container neu..."
docker-compose up --build -d

# Warten auf Start
echo "⏳ Warte auf Start..."
sleep 60

# Status prüfen
if docker-compose ps | grep -q "Up"; then
    echo "✅ Update erfolgreich!"
    echo "🌐 Frontend: http://localhost:8624"
    echo "🔧 Backend: http://localhost:8623"
else
    echo "❌ Fehler beim Update!"
    docker-compose logs --tail=20
fi