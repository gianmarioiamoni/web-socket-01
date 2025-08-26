# Real-Time Collaborative Task Board

A real-time collaborative task management system built with MERN stack and WebSockets to demonstrate the power of real-time communication.

## 🚀 Key Features

### ⚡ Real-time Features

- **Live Updates**: Instant synchronization of all changes across clients
- **User Presence**: Online user visualization with presence indicators
- **Live Cursors**: Real-time cursor tracking of other users
- **Integrated Chat**: Real-time chat system with typing indicators
- **Drag & Drop**: Task movement with live updates for all users

### 🛠 Tech Stack

**Backend:**

- Node.js + Express.js
- Socket.io for WebSockets
- MongoDB + Mongoose
- JWT Authentication
- TypeScript (strict mode)
- Winston for logging
- Joi for validation
- bcryptjs for password hashing

**Frontend:**

- Next.js 14 (App Router)
- React 18 + TypeScript
- Socket.io Client
- SWR for data fetching and caching
- Zustand for state management
- Tailwind CSS + Radix UI
- DnD Kit for drag & drop

**Database:**

- MongoDB for data persistence
- Schema optimized for real-time performance
- Strategic indexing for fast queries

## 📋 Features

### Board Management

- Creation and management of collaborative boards
- Access control and member permissions
- Real-time board structure updates

### Task Management

- Create, edit and delete tasks
- Drag & drop between columns with real-time sync
- Task assignment and priorities
- Due dates with notifications
- Advanced filters and search

### Real-time Collaboration

- Online user presence indicators
- Integrated chat for each board
- Typing indicators during writing
- Cursor tracking for spatial awareness
- Push notifications for important events

### Authentication System

- Secure registration and login
- JWT tokens with automatic refresh
- WebSocket session management

## 🏗 Architecture

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

### Prerequisites

- Node.js 18+
- MongoDB 6+
- npm or pnpm

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd web-socket-task-board
```

2. **Backend Setup**

```bash
cd server
npm install
cp env.example .env
# Configure environment variables in .env
npm run dev
```

3. **Frontend Setup**

```bash
cd ../client
npm install
cp env.local.example .env.local
# Configure environment variables in .env.local
npm run dev
```

4. **Database Setup**

```bash
# Make sure MongoDB is running
# Database will be created automatically on first startup
```

### Environment Configuration

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

## 📚 Usage

### Starting the application

```bash
# From project root
npm run dev  # Starts both backend and frontend
```

### Accessing the application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- Health Check: http://localhost:5000/health

### Demo Workflow

1. Register an account or login
2. Create a new board
3. Invite team members
4. Create columns (e.g.: To Do, In Progress, Done)
5. Add tasks and assign them to members
6. Use drag & drop to move tasks
7. Use chat to communicate
8. Watch real-time updates!

## 🔧 Development

### Project Structure

- **SOLID Principles**: Modular and extensible architecture
- **TDD Approach**: Test-driven development with Jest
- **Clean Code**: Readable and maintainable code
- **TypeScript**: Complete type safety with strict mode
- **Error Handling**: Robust and centralized error management
- **SRP Implementation**: Single Responsibility Principle applied
- **Custom Hooks**: Logic separation for reusability
- **Pure Functions**: Utility functions for business logic

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

## 🌟 Advanced Technical Features

### Performance Optimization

- **Code Splitting**: Optimized bundles for performance
- **SWR Caching**: Intelligent caching with revalidation
- **Lazy Loading**: On-demand component loading
- **Memory Management**: Automatic event listener cleanup
- **Connection Pooling**: Efficient database connection management
- **TypeScript Optimization**: Strict mode for runtime performance

### Security Features

- **JWT Authentication**: Secure tokens with automatic refresh
- **Input Validation**: Complete validation with Joi/Zod
- **CORS Configuration**: Secure cross-origin configuration
- **Rate Limiting**: Protection against API abuse
- **Password Hashing**: bcryptjs for password security
- **Type Safety**: TypeScript for runtime error prevention

### Scalability Features

- **Room-based Architecture**: Board isolation for performance
- **Event Debouncing**: Real-time event optimization
- **Connection Management**: Robust disconnection handling
- **Auto-reconnection**: Automatic WebSocket reconnection
- **Modular Architecture**: Reusable and testable components
- **Circular Dependency Resolution**: Clean architecture without circular dependencies

## 🎯 Use Cases

This project demonstrates:

- **Real-time Synchronization**: How to synchronize state across multiple clients
- **WebSocket Management**: Advanced WebSocket connection management
- **State Management**: Patterns for complex state management
- **Collaborative Features**: Implementation of collaborative functionalities
- **Performance Optimization**: Techniques for scalable real-time apps

## ✅ Implemented Architectural Improvements

### Backend Fixes & Optimizations

- **TypeScript Strict Mode**: Resolved all TypeScript compilation errors
- **Mongoose Integration**: Fixed Document interface compatibility with custom types
- **Path Aliases Resolution**: Corrected import paths for better maintainability
- **Circular Dependencies**: Resolved circular dependencies in socket handlers
- **Error Handling**: Centralized and type-safe error management
- **JWT Integration**: Fixed jsonwebtoken compatibility with TypeScript

### Frontend Architecture Improvements

- **SRP Implementation**: Single Responsibility Principle for all components
- **Custom Hooks**: Logic separation into reusable hooks
- **Pure Functions**: Business logic extracted into utility functions
- **SWR Integration**: Optimized data fetching with automatic caching
- **Component Modularization**: TaskCard and Page components refactored
- **Type Safety**: Zero any types, complete end-to-end typing

### Code Quality & Standards

- **SOLID Principles**: Applied throughout the architecture
- **Clean Code**: Descriptive names, pure functions, single responsibilities
- **TDD Ready**: Structure prepared for test-driven development
- **Maintainability**: Modular and easily extensible code

## 📈 Metrics and Monitoring

- Automatic health checks
- Structured logging with Winston
- WebSocket connection monitoring
- Real-time performance metrics
- TypeScript compilation checks
- ESLint/Prettier for code quality

## 🤝 Contributing

This is a demonstration project, but contributions and improvements are welcome!

## 📄 License

MIT License - See LICENSE file for details.

---

**Built with ❤️ to demonstrate the power of WebSockets in the real-time web era.**
