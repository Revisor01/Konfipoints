echo "📊 Konfi-System Status"
echo "======================"

cd /opt/konfi-points-system

# Container Status
echo "📦 Container:"
docker-compose ps

echo ""
echo "💾 Speicher:"
df -h .

echo ""
echo "🗄️ Datenbank Größe:"
du -h $(docker volume inspect konfi-points-system_konfi_data | grep Mountpoint | cut -d'"' -f4) 2>/dev/null || echo "Volume nicht gefunden"

echo ""
echo "📁 Backups:"
ls -la backups/ 2>/dev/null || echo "Keine Backups gefunden"

echo ""
echo "🔍 Letzte Logs (Backend):"
docker-compose logs backend --tail=5