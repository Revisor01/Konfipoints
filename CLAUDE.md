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

### API Testing
- **Backend URL**: https://konfipoints.godsapp.de/api
- **Auth Token**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidHlwZSI6ImFkbWluIiwiZGlzcGxheV9uYW1lIjoiUGFzdG9yIFNpbW9uIEx1dGhlIiwiaWF0IjoxNzUyMzUzOTM3LCJleHAiOjE3NTM1NjM1Mzd9.StuYdxqfGwrmykmKBu6G7G3EaTtW2ydJvnWfOFjXpEU`
- **Test Command**: `curl -H "Authorization: Bearer <token>" https://konfipoints.godsapp.de/api/badges`

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

## Ionic Modal Implementation Pattern

### Korrekte IonModal Backdrop Implementation

Für Modals mit korrektem Backdrop-Verhalten (wie in KonfiModal und BadgeModal) muss folgendes Pattern verwendet werden:

**1. Parent Component (Page-Level):**
```jsx
// WICHTIG: Parent Component muss IonPage verwenden!
const ParentPage = () => {
  const pageRef = React.useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <IonPage ref={pageRef}>
      <IonHeader style={{ '--min-height': '0px' }}>
        <IonToolbar style={{ '--min-height': '0px', '--padding-top': '0px', '--padding-bottom': '0px' }}>
          <IonTitle style={{ display: 'none' }}>Page Title</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="app-gradient-background" fullscreen>
        {/* Page Content */}
      </IonContent>
      
      {/* Modal */}
      <IonModal 
        isOpen={isModalOpen} 
        onDidDismiss={() => setIsModalOpen(false)}
        presentingElement={pageRef.current || undefined}
        canDismiss={true}
        backdropDismiss={true}
      >
        <ModalComponent onClose={() => setIsModalOpen(false)} />
      </IonModal>
    </IonPage>
  );
};
```

**2. Modal Component:**
```jsx
// Modal Component muss IonPage innerhalb des Modals verwenden
const ModalComponent = ({ onClose }) => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Modal Title</IonTitle>
          <IonButtons slot="start">
            <IonButton onClick={onClose}>Abbrechen</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {/* Modal Content */}
      </IonContent>
    </IonPage>
  );
};
```

**Kritische Punkte:**
- Parent Component MUSS `IonPage` als Root-Element verwenden
- `pageRef` ist essentiell für `presentingElement`
- Modal Component verwendet `IonPage` innerhalb des `IonModal`
- `presentingElement={pageRef.current || undefined}` aktiviert das Backdrop

**Falsche Implementation (funktioniert NICHT):**
```jsx
// FALSCH: div als Root-Element
const WrongParent = () => {
  const pageRef = React.useRef(null);
  
  return (
    <div ref={pageRef}>  {/* FALSCH! Muss IonPage sein */}
      {/* Content */}
      <IonModal presentingElement={pageRef.current}>
        {/* Modal wird keinen Backdrop haben */}
      </IonModal>
    </div>
  );
};
```