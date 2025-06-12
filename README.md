# 🏛️ Konfi-Punkte-System

Ein modernes, webbasiertes Verwaltungssystem für Konfirmanden-Punkte in der evangelischen Kirche. Konfirmanden sammeln Punkte durch gottesdienstliche und gemeindliche Aktivitäten. 

![Konfi-Punkte-System](https://img.shields.io/badge/Version-1.2.0-blue.svg)
![Docker](https://img.shields.io/badge/Docker-Ready-brightgreen.svg)
![License](https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg)

## ✨ Features

### 👨‍💼 **Für Pastoren & Admins**
- 📅 **Jahrgänge verwalten** - Neue Konfirmanden-Jahrgänge erstellen
- 👥 **Konfis verwalten** - Konfirmanden hinzufügen mit automatischer Passwort-Generierung
- 🎯 **Aktivitäten definieren** - Gottesdienstliche und gemeindliche Aktivitäten mit Punktwerten
- 📊 **Punkte zuordnen** - Einfache Zuordnung mit Datum-Auswahl
- 🎁 **Zusatzpunkte** - Freie Punktevergabe für besondere Leistungen
- 👤 **Admin-Tracking** - Nachverfolgung wer wann Punkte vergeben hat
- 🗑️ **Korrektur-Funktion** - Aktivitäten und Punkte können entfernt werden

### 👤 **Für Konfirmanden**
- 🔍 **Eigene Punkte einsehen** - Persönliche Übersicht der gesammelten Punkte
- 📊 **Fortschrittsbalken** - Visueller Fortschritt zu den Zielpunkten
- 🎨 **Farbige Darstellung** - Unterschiedliche Farben für verschiedene Aktivitätstypen
- 📱 **Mobile-optimiert** - Perfekt für Smartphones und Tablets
- 📅 **Deutsches Datum** - Alle Daten im Format "01. April 2025"

### 🔐 **Sicherheit**
- 🔑 **Biblische Passwörter** - Automatisch generierte Passwörter (z.B. `Johannes3,16`)
- 🛡️ **JWT-Authentifizierung** - Sichere Anmeldung mit Token-System
- 👤 **Rollentrennung** - Getrennte Admin- und Konfi-Bereiche
- 🔒 **Passwort-Hashing** - Sichere Speicherung mit bcrypt

## 🚀 Quick Start

### Voraussetzungen
- Docker & Docker Compose
- 2GB freier Speicherplatz

### Installation
```bash
# Repository klonen
git clone https://github.com/Revisor01/Konfipoints.git
cd Konfipoints

# System starten
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### Zugriff
- **Frontend:** http://localhost:8624
- **Admin Login:** `admin` / `pastor2025`

## 🎯 **Erste Schritte**

### 1. Admin-Bereich
1. Mit `admin` / `pastor2025` anmelden
2. Neuen Jahrgang erstellen (z.B. "2025/26")
3. Konfirmanden hinzufügen
4. Aktivitäten definieren
5. Punkte zuordnen

### 2. Konfi-Bereich
1. Mit generiertem Username anmelden (z.B. `anna.mueller`)
2. Biblisches Passwort verwenden (z.B. `Johannes3,16`)
3. Eigene Punkte und Fortschritt einsehen

## 🏗️ **Architektur**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│    Frontend     │────│     Backend     │────│   SQLite DB     │
│   (React/Nginx) │    │  (Node.js/API)  │    │   (Data Layer)  │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
    Port 8624              Port 8623              Volume Mount
```

### Tech Stack
- **Frontend:** React 18, Tailwind CSS, Lucide Icons
- **Backend:** Node.js, Express, JWT
- **Datenbank:** SQLite3
- **Container:** Docker, Docker Compose
- **Proxy:** Nginx

## 📁 **Projektstruktur**

```
Konfipoints/
├── backend/                 # Node.js Backend
│   ├── server.js           # Hauptserver
│   ├── package.json        # Dependencies
│   └── Dockerfile          # Backend Container
├── frontend/               # React Frontend
│   ├── src/App.js         # Hauptkomponente
│   ├── public/index.html  # HTML Template
│   ├── package.json       # Dependencies
│   └── Dockerfile         # Frontend Container
├── scripts/               # Utility Scripts
│   ├── setup.sh          # Installation
│   ├── backup.sh         # Backup
│   └── status.sh         # Status Check
├── docker-compose.yml    # Container Setup
└── README.md           # Diese Datei
```

## ⚙️ **Konfiguration**

### Umgebungsvariablen
```bash
# .env
JWT_SECRET=your-super-secure-jwt-secret
NODE_ENV=production
```

### Standard-Einstellungen
- **Gottesdienst-Ziel:** 10 Punkte
- **Gemeinde-Ziel:** 10 Punkte
- **Admin:** admin / pastor2025

## 💾 **Backup & Wartung**

### Backup erstellen
```bash
./scripts/backup.sh
```

### System-Status
```bash
./scripts/status.sh
```

### Updates
```bash
git pull origin main
docker-compose up --build -d
```

## 🔧 **API Dokumentation**

### Hauptendpunkte
- `POST /api/admin/login` - Admin-Anmeldung
- `POST /api/konfi/login` - Konfi-Anmeldung
- `GET /api/konfis` - Alle Konfis (Admin)
- `POST /api/konfis/:id/activities` - Aktivität zuordnen
- `POST /api/konfis/:id/bonus-points` - Zusatzpunkte vergeben

## 📱 **Screenshots**

### Admin-Dashboard
- Übersicht aller Konfis mit Fortschrittsbalken
- Farbige Darstellung verschiedener Aktivitätstypen
- Mobile-optimierte Verwaltung

### Konfi-Ansicht
- Persönliche Punkte-Übersicht
- Fortschrittsanzeige bis zum Ziel
- Chronologische Aktivitätsliste

## 🆘 **Support**

### Community
- 📋 **Issues:** [GitHub Issues](https://github.com/Revisor01/Konfipoints/issues)
- 💬 **Discussions:** [GitHub Discussions](https://github.com/Revisor01/Konfipoints/discussions)

## 📄 **Lizenz**

Dieses Werk ist lizenziert unter einer [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International Lizenz][cc-by-nc-sa].

[![CC BY-NC-SA 4.0][cc-by-nc-sa-image]][cc-by-nc-sa]

### ✅ **Erlaubt:**
- **Freie Nutzung** für Gemeinden und kirchliche Einrichtungen
- **Anpassungen** an lokale Bedürfnisse
- **Weitergabe** von Verbesserungen an andere Gemeinden
- **Teilen** mit anderen Pastor:innen und Ehrenamtlichen

### ❌ **Nicht erlaubt:**
- **Kommerzielle Nutzung** (Verkauf als Produkt oder Service)
- **Proprietäre Versionen** ohne Quellcode-Weitergabe
- **Nutzung ohne Namensnennung**

### 💼 **Kommerzielle Lizenz:**
Für kommerzielle Nutzung kontaktieren Sie: simon.luthe@kirche-dithmarschen.de

### 🙏 **Namensnennung:**
Bei Nutzung oder Weiterentwicklung bitte nennen:
``` 
Konfi-Punkte-System
Ursprünglich entwickelt von Pastor Simon Luthe
Lizenz: CC BY-NC-SA 4.0
```

---

[cc-by-nc-sa]: http://creativecommons.org/licenses/by-nc-sa/4.0/
[cc-by-nc-sa-image]: https://licensebuttons.net/l/by-nc-sa/4.0/88x31.png

## 👥 **Credits**

- **Entwickelt für:** Gemeinde Büsum, Neuenkirchen & Wesselburen
- **Pastor:** Simon Luthe

---

*Entwickelt für die christliche Gemeinschaft - frei für alle Gemeinden.*