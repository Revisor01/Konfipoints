#!/bin/bash

echo "🚀 Konfi-Punkte-System Setup"
echo "================================"

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker ist nicht installiert"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose ist nicht installiert"
    exit 1
fi

echo "✅ Docker gefunden"

# Create directories
echo "📁 Erstelle Verzeichnisse..."
mkdir -p backend/data
mkdir -p backups
chmod 755 backend/data backups

echo "📦 Starte Container..."
docker-compose up --build -d

echo "⏳ Warte auf Backend..."
sleep 30

echo "✅ System gestartet!"
echo ""
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:5000/api"
echo ""
echo "🔐 Admin Login:"
echo "   Benutzername: admin"
echo "   Passwort: pastor2025"