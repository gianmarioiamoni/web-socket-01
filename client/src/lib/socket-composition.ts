import { Socket } from "socket.io-client";
import type { ServerToClientEvents, ClientToServerEvents } from "@/types";

// 🎭 Types for composition
type SocketInstance = Socket<ServerToClientEvents, ClientToServerEvents>;
type SocketMiddleware = (socket: SocketInstance) => SocketInstance;
type SocketEnhancer = (socket: SocketInstance) => void;

// 📊 Logging middleware
export const withLogging: SocketMiddleware = (socket) => {
  socket.onAny((eventName, ...args) => {
    console.log(`🔌 Socket Event [${eventName}]:`, args);
  });

  socket.onAnyOutgoing((eventName, ...args) => {
    console.log(`📤 Socket Emit [${eventName}]:`, args);
  });

  return socket;
};

// 🔄 Auto-retry middleware
export const withAutoRetry = (maxRetries: number = 3, delay: number = 1000): SocketMiddleware => 
  (socket) => {
    let retryCount = 0;

    const handleDisconnect = (reason: string) => {
      if (reason === "io server disconnect" && retryCount < maxRetries) {
        retryCount++;
        console.log(`🔄 Auto-retry attempt ${retryCount}/${maxRetries}`);
        
        setTimeout(() => {
          socket.connect();
        }, delay * retryCount); // Exponential backoff
      }
    };

    socket.on("disconnect", handleDisconnect);
    
    socket.on("connect", () => {
      retryCount = 0; // Reset on successful connection
    });

    return socket;
  };

// 📈 Metrics collection middleware
export const withMetrics: SocketMiddleware = (socket) => {
  const metrics = {
    eventsReceived: 0,
    eventsSent: 0,
    connectionTime: Date.now(),
    lastActivity: Date.now(),
    eventHistory: [] as Array<{ event: string; timestamp: number; direction: 'in' | 'out' }>,
  };

  socket.onAny((eventName) => {
    metrics.eventsReceived++;
    metrics.lastActivity = Date.now();
    metrics.eventHistory.push({
      event: eventName,
      timestamp: Date.now(),
      direction: 'in',
    });
  });

  socket.onAnyOutgoing((eventName) => {
    metrics.eventsSent++;
    metrics.lastActivity = Date.now();
    metrics.eventHistory.push({
      event: eventName,
      timestamp: Date.now(),
      direction: 'out',
    });
  });

  // Expose metrics via socket
  (socket as any).getMetrics = () => ({
    ...metrics,
    uptime: Date.now() - metrics.connectionTime,
    eventsPerSecond: (metrics.eventsReceived + metrics.eventsSent) / 
                     Math.max(1, (Date.now() - metrics.connectionTime) / 1000),
  });

  return socket;
};

// 🛡️ Error handling middleware
export const withErrorHandling: SocketMiddleware = (socket) => {
  socket.on("connect_error", (error) => {
    console.error("🚨 Socket connection error:", error);
  });

  socket.on("error", (error) => {
    console.error("🚨 Socket error:", error);
  });

  // Wrap emit to catch errors
  const originalEmit = socket.emit.bind(socket);
  socket.emit = (event: any, ...args: any[]) => {
    try {
      return originalEmit(event, ...args);
    } catch (error) {
      console.error(`🚨 Error emitting event ${event}:`, error);
      return socket;
    }
  };

  return socket;
};

// ⏱️ Heartbeat middleware
export const withHeartbeat = (interval: number = 30000): SocketMiddleware =>
  (socket) => {
    let heartbeatInterval: NodeJS.Timeout;

    const startHeartbeat = () => {
      heartbeatInterval = setInterval(() => {
        if (socket.connected) {
          socket.emit("ping" as any, Date.now());
        }
      }, interval);
    };

    const stopHeartbeat = () => {
      if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
      }
    };

    socket.on("connect", startHeartbeat);
    socket.on("disconnect", stopHeartbeat);

    socket.on("pong" as any, (timestamp: number) => {
      const latency = Date.now() - timestamp;
      console.log(`💓 Heartbeat latency: ${latency}ms`);
    });

    return socket;
  };

// 🎯 Performance monitoring middleware
export const withPerformanceMonitoring: SocketMiddleware = (socket) => {
  const performanceData = {
    startTime: performance.now(),
    eventTimes: new Map<string, number[]>(),
  };

  socket.onAny((eventName) => {
    const now = performance.now();
    
    if (!performanceData.eventTimes.has(eventName)) {
      performanceData.eventTimes.set(eventName, []);
    }
    
    performanceData.eventTimes.get(eventName)!.push(now);
  });

  // Expose performance data
  (socket as any).getPerformanceData = () => {
    const data: any = {
      totalUptime: performance.now() - performanceData.startTime,
      eventFrequency: {},
    };

    performanceData.eventTimes.forEach((times, eventName) => {
      data.eventFrequency[eventName] = {
        count: times.length,
        avgInterval: times.length > 1 
          ? (times[times.length - 1] - times[0]) / (times.length - 1)
          : 0,
      };
    });

    return data;
  };

  return socket;
};

// 🔗 Compose multiple middlewares
export const composeMiddlewares = (...middlewares: SocketMiddleware[]): SocketMiddleware =>
  (socket) => middlewares.reduce((enhancedSocket, middleware) => 
    middleware(enhancedSocket), socket);

// 🚀 Pre-configured middleware compositions
export const developmentMiddlewares = composeMiddlewares(
  withLogging,
  withErrorHandling,
  withMetrics,
  withPerformanceMonitoring,
  withAutoRetry(3, 1000)
);

export const productionMiddlewares = composeMiddlewares(
  withErrorHandling,
  withAutoRetry(5, 2000),
  withHeartbeat(30000)
);

// 🎨 Enhancer functions (side effects only)
export const addSocketEnhancers = (socket: SocketInstance, ...enhancers: SocketEnhancer[]): void => {
  enhancers.forEach(enhancer => enhancer(socket));
};

// 🔧 Utility enhancers
export const logConnectionEvents: SocketEnhancer = (socket) => {
  socket.on("connect", () => {
    console.log("✅ Socket connected:", socket.id);
  });

  socket.on("disconnect", (reason) => {
    console.log("❌ Socket disconnected:", reason);
  });
};

export const trackConnectionState: SocketEnhancer = (socket) => {
  (socket as any).connectionHistory = [];

  socket.on("connect", () => {
    (socket as any).connectionHistory.push({
      event: "connect",
      timestamp: Date.now(),
      socketId: socket.id,
    });
  });

  socket.on("disconnect", (reason) => {
    (socket as any).connectionHistory.push({
      event: "disconnect",
      timestamp: Date.now(),
      reason,
    });
  });
};

// 🎯 Main factory function with composition
export const createEnhancedSocket = (
  socket: SocketInstance,
  environment: 'development' | 'production' = 'production'
): SocketInstance => {
  // Apply middleware based on environment
  const middlewares = environment === 'development' 
    ? developmentMiddlewares 
    : productionMiddlewares;

  const enhancedSocket = middlewares(socket);

  // Add enhancers
  addSocketEnhancers(
    enhancedSocket,
    logConnectionEvents,
    trackConnectionState
  );

  return enhancedSocket;
};

// 🧪 Functional utilities for testing
export const createMockSocketMiddleware = (mockBehavior: any): SocketMiddleware =>
  (socket) => {
    Object.keys(mockBehavior).forEach(method => {
      (socket as any)[method] = mockBehavior[method];
    });
    return socket;
  };

// 📊 Analytics middleware
export const withAnalytics = (analyticsProvider: any): SocketMiddleware =>
  (socket) => {
    socket.onAny((eventName, data) => {
      analyticsProvider.track('socket_event_received', {
        event: eventName,
        timestamp: Date.now(),
        userId: (socket as any).userId,
      });
    });

    return socket;
  };

// 🔄 State synchronization middleware
export const withStateSynchronization = (stateManager: any): SocketMiddleware =>
  (socket) => {
    const syncEvents = [
      'task:created',
      'task:updated', 
      'task:deleted',
      'board:updated',
      'user:joined',
      'user:left'
    ];

    syncEvents.forEach(event => {
      socket.on(event as any, (data: any) => {
        stateManager.handleSocketEvent(event, data);
      });
    });

    return socket;
  };
