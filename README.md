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
- TypeScript
- Winston per logging

**Frontend:**

- Next.js 14 (App Router)
- React 18 + TypeScript
- Socket.io Client
- Zustand per state management
- Tailwind CSS + Radix UI
- DnD Kit per drag & drop

**Database:**

- MongoDB per persistenza dati
- Schema ottimizzato per performance real-time

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
CLIENT_URL=http://localhost:3000
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
- **TDD Approach**: Test-driven development
- **Clean Code**: Codice leggibile e manutenibile
- **TypeScript**: Type safety completo
- **Error Handling**: Gestione errori robusta

### Testing

```bash
# Backend tests
cd server && npm test

# Frontend tests
cd client && npm test
```

### Build per Produzione

```bash
# Backend
cd server && npm run build

# Frontend
cd client && npm run build
```

## 🌟 Caratteristiche Tecniche Avanzate

### Performance Optimization

- **Code Splitting**: Bundle ottimizzati per performance
- **Lazy Loading**: Caricamento componenti su richiesta
- **Memory Management**: Cleanup automatico event listeners
- **Connection Pooling**: Gestione efficiente connessioni DB

### Security Features

- **JWT Authentication**: Tokens sicuri con refresh automatico
- **Input Validation**: Validazione completa con Joi
- **CORS Configuration**: Configurazione sicura cross-origin
- **Rate Limiting**: Protezione contro abuse API

### Scalability Features

- **Room-based Architecture**: Isolamento board per performance
- **Event Debouncing**: Ottimizzazione eventi real-time
- **Connection Management**: Gestione robusta disconnessioni
- **Auto-reconnection**: Riconnessione automatica WebSocket

## 🎯 Casi d'Uso

Questo progetto dimostra:

- **Real-time Synchronization**: Come sincronizzare stato tra client multipli
- **WebSocket Management**: Gestione avanzata connessioni WebSocket
- **State Management**: Pattern per state management complesso
- **Collaborative Features**: Implementazione funzionalità collaborative
- **Performance Optimization**: Tecniche per app real-time scalabili

## 📈 Metriche e Monitoring

- Health checks automatici
- Logging strutturato con Winston
- Monitoring connessioni WebSocket
- Metriche performance real-time

## 🤝 Contributi

Questo è un progetto dimostrativo, ma contributi e miglioramenti sono benvenuti!

## 📄 Licenza

MIT License - Vedi LICENSE file per dettagli.

---

**Costruito con ❤️ per dimostrare il potere dei WebSockets nell'era del real-time web.**
