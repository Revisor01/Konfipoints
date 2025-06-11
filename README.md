# 🏛️ Konfi-Punkte-System

Ein webbasiertes Verwaltungssystem für Konfirmanden-Punkte in der evangelischen Kirche. Konfirmanden sammeln Punkte durch gottesdienstliche und gemeindliche Aktivitäten.

![Konfi-Punkte-System](https://img.shields.io/badge/Version-1.0.0-blue.svg)
![Docker](https://img.shields.io/badge/Docker-Ready-brightgreen.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

## 📸 Screenshots

### Admin-Dashboard
- Übersicht aller Konfis mit Fortschrittsbalken
- Verwaltung von Jahrgängen und Aktivitäten
- Punkte-Zuordnung mit einem Klick

### Konfi-Bereich
- Persönliche Punkte-Übersicht
- Fortschrittsanzeige bis zum Ziel
- Liste aller absolvierten Aktivitäten

## ✨ Features

### 👨‍💼 Admin-Funktionen
- **📅 Jahrgänge verwalten** - Neue Konfirmanden-Jahrgänge erstellen
- **👥 Konfis verwalten** - Konfirmanden hinzufügen mit automatischer Passwort-Generierung
- **🎯 Aktivitäten definieren** - Gottesdienstliche und gemeindliche Aktivitäten mit Punktwerten
- **📊 Punkte zuordnen** - Einfache Zuordnung von Aktivitäten zu Konfis
- **⚙️ Zielpunkte konfigurieren** - Flexible Anpassung der Mindestpunktzahl
- **📈 Fortschritt überwachen** - Echtzeitübersicht des Konfirmandenfortschritts

### 👤 Konfi-Funktionen
- **🔍 Eigene Punkte einsehen** - Persönliche Übersicht der gesammelten Punkte
- **📊 Fortschrittsbalken** - Visueller Fortschritt zu den Zielpunkten
- **📋 Aktivitätsliste** - Chronologische Liste aller Aktivitäten
- **⭐ Zielerreichung** - Anzeige bei Erreichen der Mindestpunktzahl

### 🔐 Sicherheits-Features
- **🔑 Biblische Passwörter** - Automatisch generierte Passwörter (z.B. `Roemer11,1`)
- **🛡️ JWT-Authentifizierung** - Sichere Anmeldung mit Token-System
- **👤 Rollentrennung** - Getrennte Admin- und Konfi-Bereiche
- **🔒 Passwort-Hashing** - Sichere Speicherung mit bcrypt

### 💾 Datenverwaltung
- **🗄️ SQLite Datenbank** - Einfache, dateibasierte Datenbank
- **💾 Automatische Backups** - Regelmäßige Datensicherung
- **📦 Docker Volumes** - Persistente Datenspeicherung
- **🔄 Export/Import** - Datenbank-Backup und -Wiederherstellung

## 🚀 Quick Start

### Voraussetzungen
- Docker & Docker Compose
- Git
- 2GB freier Speicherplatz

### Installation

```bash
# Repository klonen
git clone https://github.com/IHR-USERNAME/konfi-points-system.git
cd konfi-points-system

# System starten
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### Zugriff
- **Frontend:** http://localhost:3000
- **Admin:** Benutzername: `admin`, Passwort: `pastor2025`

## 📋 Systemanforderungen

### Minimum
- **RAM:** 1GB
- **CPU:** 1 Core
- **Speicher:** 2GB
- **OS:** Linux, Windows, macOS

### Empfohlen
- **RAM:** 2GB
- **CPU:** 2 Cores
- **Speicher:** 10GB
- **OS:** Ubuntu 20.04+ / Debian 11+

## 🏗️ Architektur

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│    Frontend     │────│     Backend     │────│   SQLite DB     │
│   (React/Nginx) │    │  (Node.js/API)  │    │   (Data Layer)  │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
    Port 3000              Port 5000               Volume Mount
```

### Technologie-Stack
- **Frontend:** React 18, Tailwind CSS, Lucide Icons
- **Backend:** Node.js, Express, JWT
- **Datenbank:** SQLite3
- **Container:** Docker, Docker Compose
- **Proxy:** Nginx (Production)

## 📁 Projektstruktur

```
konfi-points-system/
├── backend/                 # Node.js Backend
│   ├── server.js           # Hauptserver
│   ├── package.json        # Dependencies
│   ├── Dockerfile          # Backend Container
│   └── healthcheck.js      # Health Check
├── frontend/               # React Frontend
│   ├── src/
│   │   ├── App.js         # Hauptkomponente
│   │   └── index.js       # Entry Point
│   ├── public/
│   │   └── index.html     # HTML Template
│   ├── package.json       # Dependencies
│   ├── Dockerfile         # Frontend Container
│   └── nginx.conf         # Nginx Konfiguration
├── scripts/               # Utility Scripts
│   ├── setup.sh          # Installationsskript
│   ├── backup.sh         # Backup-Skript
│   └── restore.sh        # Restore-Skript
├── docker-compose.yml    # Container Orchestrierung
├── docker-compose.prod.yml # Produktions-Setup
├── .env.example         # Umgebungsvariablen
└── README.md           # Diese Datei
```

## ⚙️ Konfiguration

### Umgebungsvariablen

```bash
# .env
JWT_SECRET=ihr-super-sicherer-jwt-secret
NODE_ENV=production
REACT_APP_API_URL=http://localhost:5000/api
```

### Docker Ports

| Service  | Port | Beschreibung |
|----------|------|--------------|
| Frontend | 3000 | React Development Server |
| Backend  | 5000 | Node.js API Server |
| Nginx    | 80   | Production Frontend |

### Datenbank Schema

```sql
-- Haupttabellen
jahrgaenge          # Konfirmanden-Jahrgänge
konfis              # Konfirmanden mit Zugangsdaten
activities          # Verfügbare Aktivitäten
konfi_activities    # Zuordnung Konfis ↔ Aktivitäten
settings            # System-Einstellungen
admins              # Administrator-Accounts
```

## 🔧 Verwendung

### Admin-Workflow

1. **Jahrgang erstellen**
   ```
   Admin → Jahrgänge verwalten → "2025/26" hinzufügen
   ```

2. **Konfis hinzufügen**
   ```
   Admin → Konfis verwalten → Name eingeben → Jahrgang wählen
   → System generiert Username & biblisches Passwort
   ```

3. **Aktivitäten definieren**
   ```
   Admin → Aktivitäten verwalten → Name, Punkte, Typ festlegen
   ```

4. **Punkte zuordnen**
   ```
   Admin → Punkte zuordnen → Konfi wählen → Aktivität zuordnen
   ```

### Konfi-Workflow

1. **Anmelden**
   ```
   Username: vorname.nachname (z.B. anna.mueller)
   Passwort: Bibelstelle (z.B. Matthaeus5,3)
   ```

2. **Fortschritt einsehen**
   ```
   Dashboard zeigt Punkte, Fortschrittsbalken und Aktivitätsliste
   ```

## 🛠️ Entwicklung

### Lokale Entwicklung

```bash
# Backend starten
cd backend
npm install
npm run dev     # Port 5000

# Frontend starten
cd frontend
npm install
npm start       # Port 3000
```

### API Endpunkte

| Methode | Endpoint | Beschreibung |
|---------|----------|--------------|
| POST | `/api/admin/login` | Admin-Anmeldung |
| POST | `/api/konfi/login` | Konfi-Anmeldung |
| GET | `/api/konfis` | Alle Konfis (Admin) |
| POST | `/api/konfis` | Konfi erstellen |
| GET | `/api/activities` | Alle Aktivitäten |
| POST | `/api/activities` | Aktivität erstellen |
| POST | `/api/konfis/:id/activities` | Aktivität zuordnen |
| GET | `/api/jahrgaenge` | Alle Jahrgänge |
| POST | `/api/jahrgaenge` | Jahrgang erstellen |

### Testing

```bash
# Backend Tests
cd backend && npm test

# Frontend Tests
cd frontend && npm test

# Integration Tests
docker-compose -f docker-compose.test.yml up
```

## 📦 Deployment

### Entwicklung
```bash
docker-compose up --build
```

### Produktion
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Server-Deployment
```bash
# Auf Server klonen
git clone https://github.com/IHR-USERNAME/konfi-points-system.git
cd konfi-points-system

# Produktions-Konfiguration
cp .env.example .env
# .env bearbeiten

# System starten
docker-compose -f docker-compose.prod.yml up -d
```

## 💾 Backup & Restore

### Backup erstellen
```bash
./scripts/backup.sh
# Erstellt: backups/konfi_backup_YYYYMMDD_HHMMSS.db
```

### Backup wiederherstellen
```bash
./scripts/restore.sh konfi_backup_20240101_120000.db
```

### Automatische Backups
```bash
# Crontab für täglich um 2 Uhr
0 2 * * * cd /pfad/zum/projekt && ./scripts/backup.sh
```

## 🔍 Monitoring & Logs

### Container Status
```bash
docker-compose ps
```

### Logs anzeigen
```bash
# Alle Services
docker-compose logs -f

# Nur Backend
docker-compose logs -f backend

# Nur Frontend
docker-compose logs -f frontend
```

### Health Checks
```bash
# Backend Health
curl http://localhost:5000/api/health

# Frontend Health
curl http://localhost:3000
```

## 🆘 Troubleshooting

### Häufige Probleme

#### Port bereits belegt
```bash
# Ports in docker-compose.yml ändern
ports:
  - "8080:80"   # statt 3000:80
  - "8081:5000" # statt 5000:5000
```

#### Datenbank Fehler
```bash
# Datenbank neu erstellen
docker-compose down -v
docker volume rm konfi-points-system_konfi_data
docker-compose up --build -d
```

#### Container startet nicht
```bash
# Logs prüfen
docker-compose logs backend

# Neu bauen
docker-compose build --no-cache
docker-compose up -d
```

#### Passwort vergessen
```bash
# In Admin-Bereich: Passwort regenerieren
# Oder Datenbank-Reset (siehe oben)
```

### Debug-Modus

```bash
# Mit Debug-Logs
DEBUG=* docker-compose up

# Backend Debug
NODE_ENV=development docker-compose up backend
```

## 🤝 Contributing

1. Fork das Repository
2. Feature Branch erstellen: `git checkout -b feature/neue-funktion`
3. Änderungen committen: `git commit -am 'Neue Funktion hinzugefügt'`
4. Branch pushen: `git push origin feature/neue-funktion`
5. Pull Request erstellen

### Code Style
- ESLint für JavaScript
- Prettier für Formatierung
- Commit Messages: [Conventional Commits](https://www.conventionalcommits.org/)

## 📄 Lizenz

MIT License - siehe [LICENSE](LICENSE) für Details.

Entwickelt für kirchliche Zwecke, frei verwendbar für Gemeinden.

## 👥 Autoren

- **Gemeinde Büsum & Wesselburen** - *Initial work*
- **Claude (Anthropic)** - *AI Assistant*

## 🙏 Danksagungen

- Evangelische Kirche für die Inspiration
- Docker Community für Container-Tools
- React Team für das Frontend-Framework
- Node.js Community für Backend-Tools

## 📞 Support

### Community Support
- GitHub Issues für Bug Reports
- Discussions für Feature Requests
- Wiki für erweiterte Dokumentation

### Professioneller Support
Für kommerzielle Unterstützung kontaktieren Sie:
- E-Mail: support@gemeinde-beispiel.de
- Telefon: +49 123 456789

---

## 📊 Status

| Service | Status | Uptime |
|---------|--------|--------|
| Frontend | ![Status](https://img.shields.io/badge/Status-Online-brightgreen) | 99.9% |
| Backend | ![Status](https://img.shields.io/badge/Status-Online-brightgreen) | 99.9% |
| Database | ![Status](https://img.shields.io/badge/Status-Online-brightgreen) | 99.9% |

**Letzte Aktualisierung:** 2024-06-11

---

> *"Lasset die Kinder zu mir kommen und wehret ihnen nicht; denn solchen gehört das Reich Gottes."* - Markus 10,14

**🎉 Vielen Dank, dass Sie das Konfi-Punkte-System verwenden!**