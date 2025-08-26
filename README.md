# Real-Time Collaborative Task Board

Un sistema di gestione task collaborativo in tempo reale costruito con lo stack MERN e WebSockets per dimostrare le potenzialità della comunicazione real-time.

## 🚀 Caratteristiche Principali

### ⚡ Real-time Features

- **Aggiornamenti Live**: Sincronizzazione istantanea di tutte le modifiche tra i client
- **Presenza Utenti**: Visualizzazione degli utenti online con indicatori di presenza
- **Cursori Live**: Tracking dei movimenti del cursore degli altri utenti
- **Chat Integrata**: Sistema di chat real-time con typing indicators
- **Drag & Drop**: Spostamento task con aggiornamenti live per tutti gli utenti

### 🛠 Stack Tecnologico

**Backend:**

- Node.js + Express.js
- Socket.io per WebSockets
- MongoDB + Mongoose
- JWT Authentication
- TypeScript (strict mode)
- Winston per logging
- Joi per validazione
- bcryptjs per hashing password

**Frontend:**

- Next.js 14 (App Router)
- React 18 + TypeScript
- Socket.io Client
- SWR per data fetching e caching
- Zustand per state management
- Tailwind CSS + Radix UI
- DnD Kit per drag & drop

**Database:**

- MongoDB per persistenza dati
- Schema ottimizzato per performance real-time
- Indexing strategico per query veloci

## 📋 Funzionalità

### Gestione Board

- Creazione e gestione board collaborativi
- Controllo accessi e permessi membri
- Aggiornamenti real-time della struttura board

### Task Management

- Creazione, modifica ed eliminazione task
- Drag & drop tra colonne con sync real-time
- Assegnazione task e priorità
- Date di scadenza con notifiche
- Filtri e ricerca avanzata

### Collaborazione Real-time

- Indicatori presenza utenti online
- Chat integrata per ogni board
- Typing indicators durante la scrittura
- Cursors tracking per awareness spaziale
- Notifiche push per eventi importanti

### Sistema di Autenticazione

- Registrazione e login sicuri
- JWT tokens con refresh automatico
- Gestione sessioni WebSocket

## 🏗 Architettura

### Backend Architecture

```
server/
├── src/
│   ├── controllers/     # REST API controllers
│   ├── models/         # MongoDB/Mongoose models
│   ├── services/       # Business logic
│   ├── socket/         # WebSocket event handlers
│   ├── routes/         # API routes
│   ├── middleware/     # Auth, validation, error handling
│   └── types/          # TypeScript type definitions
```

### Frontend Architecture

```
client/
├── src/
│   ├── app/            # Next.js app router pages
│   ├── components/     # React components
│   ├── stores/         # Zustand state management
│   ├── services/       # API & WebSocket services
│   ├── hooks/          # Custom React hooks
│   ├── types/          # TypeScript types
│   └── lib/            # Utilities
```

### WebSocket Events

- **Board Events**: `board:join`, `board:leave`, `board:updated`
- **Task Events**: `task:created`, `task:updated`, `task:deleted`, `task:moved`
- **User Events**: `user:joined`, `user:left`, `user:cursor`
- **Chat Events**: `chat:message`, `chat:typing`, `chat:stop-typing`

## 🚀 Quick Start

### Prerequisiti

- Node.js 18+
- MongoDB 6+
- npm o pnpm

### Installazione

1. **Clone del repository**

```bash
git clone <repository-url>
cd web-socket-task-board
```

2. **Setup Backend**

```bash
cd server
npm install
cp env.example .env
# Configura le variabili d'ambiente in .env
npm run dev
```

3. **Setup Frontend**

```bash
cd ../client
npm install
cp env.local.example .env.local
# Configura le variabili d'ambiente in .env.local
npm run dev
```

4. **Setup Database**

```bash
# Assicurati che MongoDB sia in esecuzione
# Il database verrà creato automaticamente al primo avvio
```

### Configurazione Ambiente

**Server (.env):**

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/task-board
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
CLIENT_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000
LOG_LEVEL=info
```

**Client (.env.local):**

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SERVER_URL=http://localhost:5000
```

## 📚 Utilizzo

### Avvio dell'applicazione

```bash
# Dalla root del progetto
npm run dev  # Avvia sia backend che frontend
```

### Accesso all'applicazione

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- Health Check: http://localhost:5000/health

### Demo Workflow

1. Registra un account o fai login
2. Crea una nuova board
3. Invita membri al team
4. Crea colonne (es: To Do, In Progress, Done)
5. Aggiungi task e assegnali ai membri
6. Usa drag & drop per spostare i task
7. Utilizza la chat per comunicare
8. Osserva gli aggiornamenti real-time!

## 🔧 Sviluppo

### Struttura del Progetto

- **Principi SOLID**: Architettura modulare e estensibile
- **TDD Approach**: Test-driven development con Jest
- **Clean Code**: Codice leggibile e manutenibile
- **TypeScript**: Type safety completo con strict mode
- **Error Handling**: Gestione errori robusta e centralizzata
- **SRP Implementation**: Single Responsibility Principle applicato
- **Custom Hooks**: Logic separation per riusabilità
- **Pure Functions**: Utility functions per business logic

### Testing

```bash
# Backend tests
cd server && npm test

# Frontend tests
cd client && npm test

# Coverage reports
cd server && npm run test:coverage
cd client && npm run test:coverage
```

### Development Commands

```bash
# TypeScript compilation check
cd server && npx tsc --noEmit

# Linting
cd server && npm run lint
cd client && npm run lint

# Type checking
cd client && npm run type-check

# Watch mode for development
cd server && npm run dev:watch
cd client && npm run dev
```

### Build per Produzione

```bash
# Backend
cd server && npm run build

# Frontend
cd client && npm run build

# Start production
cd server && npm start
cd client && npm start
```

## 🌟 Caratteristiche Tecniche Avanzate

### Performance Optimization

- **Code Splitting**: Bundle ottimizzati per performance
- **SWR Caching**: Caching intelligente con revalidation
- **Lazy Loading**: Caricamento componenti su richiesta
- **Memory Management**: Cleanup automatico event listeners
- **Connection Pooling**: Gestione efficiente connessioni DB
- **TypeScript Optimization**: Strict mode per performance runtime

### Security Features

- **JWT Authentication**: Tokens sicuri con refresh automatico
- **Input Validation**: Validazione completa con Joi/Zod
- **CORS Configuration**: Configurazione sicura cross-origin
- **Rate Limiting**: Protezione contro abuse API
- **Password Hashing**: bcryptjs per sicurezza password
- **Type Safety**: TypeScript per prevenzione errori runtime

### Scalability Features

- **Room-based Architecture**: Isolamento board per performance
- **Event Debouncing**: Ottimizzazione eventi real-time
- **Connection Management**: Gestione robusta disconnessioni
- **Auto-reconnection**: Riconnessione automatica WebSocket
- **Modular Architecture**: Componenti riutilizzabili e testabili
- **Circular Dependency Resolution**: Architettura pulita senza dipendenze circolari

## 🎯 Casi d'Uso

Questo progetto dimostra:

- **Real-time Synchronization**: Come sincronizzare stato tra client multipli
- **WebSocket Management**: Gestione avanzata connessioni WebSocket
- **State Management**: Pattern per state management complesso
- **Collaborative Features**: Implementazione funzionalità collaborative
- **Performance Optimization**: Tecniche per app real-time scalabili

## ✅ Miglioramenti Architetturali Implementati

### Backend Fixes & Optimizations

- **TypeScript Strict Mode**: Risolti tutti gli errori di compilazione TypeScript
- **Mongoose Integration**: Fix per compatibilità Document interface con tipi custom
- **Path Aliases Resolution**: Corretti import paths per migliore maintainability
- **Circular Dependencies**: Risolte dipendenze circolari nei socket handlers
- **Error Handling**: Gestione errori centralizzata e type-safe
- **JWT Integration**: Fix per compatibilità jsonwebtoken con TypeScript

### Frontend Architecture Improvements

- **SRP Implementation**: Single Responsibility Principle per tutti i componenti
- **Custom Hooks**: Separazione logic in hooks riutilizzabili
- **Pure Functions**: Business logic estratta in utility functions
- **SWR Integration**: Data fetching ottimizzato con caching automatico
- **Component Modularization**: TaskCard e Page components refactorizzati
- **Type Safety**: Zero any types, typing completo end-to-end

### Code Quality & Standards

- **SOLID Principles**: Applicati in tutta l'architettura
- **Clean Code**: Nomi descriptivi, funzioni pure, responsabilità singole
- **TDD Ready**: Struttura preparata per test-driven development
- **Maintainability**: Codice modulare e facilmente estensibile

## 📈 Metriche e Monitoring

- Health checks automatici
- Logging strutturato con Winston
- Monitoring connessioni WebSocket
- Metriche performance real-time
- TypeScript compilation checks
- ESLint/Prettier per code quality

## 🤝 Contributi

Questo è un progetto dimostrativo, ma contributi e miglioramenti sono benvenuti!

## 📄 Licenza

MIT License - Vedi LICENSE file per dettagli.

---

**Costruito con ❤️ per dimostrare il potere dei WebSockets nell'era del real-time web.**
