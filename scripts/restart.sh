# scripts/restart.sh
#!/bin/bash

echo "🔄 Konfi-System Neustart..."

cd /opt/konfi-points-system

# Container neustarten
docker-compose restart

# 30 Sekunden warten
sleep 30

# Status prüfen
if docker-compose ps | grep -q "Up"; then
    echo "✅ System erfolgreich neugestartet"
    echo "🌐 Frontend: Port 8624"
    echo "🔧 Backend: Port 8623"
else
    echo "❌ Fehler beim Neustart!"
    docker-compose logs --tail=20
fi
