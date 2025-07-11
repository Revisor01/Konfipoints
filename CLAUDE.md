# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Konfipoints is a modern web-based management system for confirmation points in the evangelical church. It's a React + Node.js application with Ionic/Capacitor for mobile deployment, particularly focused on iOS.

## Architecture

### Frontend (React + Ionic)
- **Main Framework**: React 18 with Ionic React for mobile-first UI
- **Mobile Platform**: Capacitor for iOS deployment
- **State Management**: React Context API (`AppContext`) for global state
- **Entry Point**: `frontend/src/App.js` → `IonicApp` component
- **Navigation**: Ionic routing with tab-based navigation for admin and konfi users

### Backend (Node.js + Express)
- **API Server**: Express.js with JWT authentication
- **Database**: SQLite3 for data persistence
- **Authentication**: Two-tier system (admin/konfi) with biblical password generation
- **File Uploads**: Multer for image handling
- **Port**: 5000 (exposed as 8623 in Docker)

### Key Components Structure
- `frontend/src/components/ionic/`: Ionic-specific components and navigation
- `frontend/src/components/admin/`: Admin dashboard and management views
- `frontend/src/components/konfi/`: Konfi (confirmation student) views
- `frontend/src/components/chat/`: Chat functionality with polls
- `frontend/src/services/`: API service layer
- `frontend/src/hooks/`: Custom React hooks for Capacitor integration

## Development Commands

### Frontend Development
```bash
cd frontend
npm start              # Development server
npm run build          # Production build
npm test               # Run tests
```

### iOS Development
```bash
cd frontend
npm run build && npx cap sync ios  # Build and sync with Xcode
# Then open and build in Xcode manually
```

### Backend Development
```bash
cd backend
npm start              # Production server
npm run dev            # Development with nodemon
```

### Docker Operations (Backend Only)
```bash
docker-compose up -d          # Start backend server
docker-compose up --build -d  # Rebuild and start backend
docker-compose down           # Stop backend service
```

## Key Technical Details

### Authentication System
- Admin login: `admin` / `pastor2025`
- Konfi passwords: Generated biblical references (e.g., `Johannes3,16`)
- JWT tokens with role-based access (`admin` vs `konfi`)

### Database Schema
- SQLite database with tables for konfis, activities, badges, jahrgaenge (year groups)
- Foreign key relationships between konfis and their activities/points
- Admin tracking for point assignments

### Mobile Integration
- Capacitor plugins for camera, keyboard, push notifications, file picker
- iOS-specific configuration in `frontend/ios/`
- Custom hooks for Capacitor functionality in `frontend/src/hooks/`

### State Management
- `AppContext` provides global state for user, konfis, activities, badges
- Loading states managed per data type
- Error/success message handling

## Important Files

### Configuration
- `docker-compose.yml`: Container orchestration
- `frontend/capacitor.config.ts`: Capacitor/iOS configuration
- `backend/package.json`: Backend dependencies and scripts
- `frontend/package.json`: Frontend dependencies including Ionic/Capacitor

### Core Components
- `frontend/src/components/ionic/IonicApp.js`: Main app wrapper
- `frontend/src/contexts/AppContext.js`: Global state management
- `backend/server.js`: Main API server with all endpoints

## Git Branch Strategy
- Currently on `ios` branch for iOS-specific development
- Main development appears to focus on mobile/iOS functionality

## Testing
- Frontend: React Testing Library setup
- Backend: No tests currently configured
- Use `npm test` in frontend directory for React tests

## Database Location
- Development: `backend/data/` directory
- Production: Docker volume mount to `./data/`

## Common Development Patterns
- Use Ionic components for UI consistency
- Leverage Capacitor hooks for native functionality
- Follow the existing service layer pattern for API calls
- Use the AppContext for state management rather than prop drilling

## Git Commit Guidelines
- Standard commit messages without AI attribution
- Focus on clear, descriptive commit messages
- No requirement to mention Claude or AI assistance
- **Language**: All commit messages and code comments in German

## Development Language
- **Primary Language**: German for all development communication
- **Code Comments**: Write in German
- **Variable Names**: Can be English/German mix as appropriate
- **Documentation**: German preferred

## Framework Updates
- **Use MCP Context7**: Always check for current framework versions and best practices
- **Ionic Framework**: Currently using Ionic 8 - verify latest patterns and updates
- **Dependencies**: Check for current versions and migration guides when updating