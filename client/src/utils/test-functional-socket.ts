// 🧪 Test utility for functional socket implementation
import { 
  connectSocket, 
  disconnectSocket, 
  isSocketConnected,
  socketAPI,
  createBoardEventHandlers,
  createTaskEventHandlers,
  createChatEventHandlers,
} from "@/services/socket-functional";

// 🎯 Test functions for functional socket implementation
export const testFunctionalSocket = async (token: string) => {
  console.log("🧪 Testing Functional Socket Implementation");
  
  try {
    // 🔌 Test connection
    console.log("1. Testing connection...");
    const socket = connectSocket(token);
    console.log("✅ Socket connected:", socket.id);
    
    // 📊 Test state
    console.log("2. Testing socket state...");
    console.log("Connected:", isSocketConnected());
    
    // 🏠 Test board handlers
    console.log("3. Testing board handlers...");
    const boardHandlers = createBoardEventHandlers();
    
    const unsubscribeBoardUpdated = boardHandlers.onBoardUpdated((board) => {
      console.log("📋 Board updated:", board);
    });
    
    const unsubscribeUserJoined = boardHandlers.onUserJoined((userId) => {
      console.log("👤 User joined:", userId);
    });
    
    // 📋 Test task handlers
    console.log("4. Testing task handlers...");
    const taskHandlers = createTaskEventHandlers();
    
    const unsubscribeTaskCreated = taskHandlers.onTaskCreated((task) => {
      console.log("✅ Task created:", task);
    });
    
    // 💬 Test chat handlers
    console.log("5. Testing chat handlers...");
    const chatHandlers = createChatEventHandlers();
    
    const unsubscribeChatMessage = chatHandlers.onMessage((message) => {
      console.log("💬 Chat message:", message);
    });
    
    // 🎭 Test API object
    console.log("6. Testing socketAPI object...");
    console.log("API methods available:", Object.keys(socketAPI));
    
    // 🧹 Test cleanup
    setTimeout(() => {
      console.log("7. Testing cleanup...");
      unsubscribeBoardUpdated();
      unsubscribeUserJoined();
      unsubscribeTaskCreated();
      unsubscribeChatMessage();
      
      disconnectSocket();
      console.log("✅ All tests completed successfully!");
    }, 2000);
    
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
};

// 🔄 Comparison test between class and functional implementations
export const compareImplementations = async (token: string) => {
  console.log("🔄 Testing Functional Implementation Performance");
  
  console.time("Functional Implementation Setup");
  try {
    connectSocket(token);
    console.timeEnd("Functional Implementation Setup");
    console.log("✅ Functional implementation connected");
  } catch (error) {
    console.error("❌ Functional implementation failed:", error);
  }
  
  // Memory usage for functional implementation
  const functionalMemoryUsage = process.memoryUsage();
  console.log("📊 Functional implementation memory usage:");
  console.log("Memory:", functionalMemoryUsage);
  
  // Cleanup
  disconnectSocket();
};

// 🎯 Performance test
export const performanceTest = async (token: string) => {
  console.log("⚡ Performance Testing Functional Socket");
  
  const iterations = 1000;
  const results = {
    connect: 0,
    emit: 0,
    subscribe: 0,
    unsubscribe: 0,
  };
  
  // Test connection performance
  console.time("Connection Performance");
  for (let i = 0; i < 10; i++) {
    const start = performance.now();
    connectSocket(token);
    disconnectSocket();
    results.connect += performance.now() - start;
  }
  console.timeEnd("Connection Performance");
  
  // Test event handling performance
  connectSocket(token);
  const taskHandlers = createTaskEventHandlers();
  
  console.time("Event Handling Performance");
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    const unsub = taskHandlers.onTaskCreated(() => {});
    results.subscribe += performance.now() - start;
    
    const unsubStart = performance.now();
    unsub();
    results.unsubscribe += performance.now() - unsubStart;
  }
  console.timeEnd("Event Handling Performance");
  
  console.log("📈 Performance Results (avg per operation):");
  console.log(`Connect: ${(results.connect / 10).toFixed(2)}ms`);
  console.log(`Subscribe: ${(results.subscribe / iterations).toFixed(2)}ms`);
  console.log(`Unsubscribe: ${(results.unsubscribe / iterations).toFixed(2)}ms`);
  
  disconnectSocket();
};

// 🧠 Memory leak test
export const memoryLeakTest = async (token: string) => {
  console.log("🧠 Testing for Memory Leaks");
  
  const initialMemory = process.memoryUsage().heapUsed;
  console.log("Initial memory:", (initialMemory / 1024 / 1024).toFixed(2), "MB");
  
  // Create and destroy many connections
  for (let i = 0; i < 100; i++) {
    connectSocket(token);
    
    const boardHandlers = createBoardEventHandlers();
    const taskHandlers = createTaskEventHandlers();
    const chatHandlers = createChatEventHandlers();
    
    // Subscribe to events
    const unsubs = [
      boardHandlers.onBoardUpdated(() => {}),
      boardHandlers.onUserJoined(() => {}),
      taskHandlers.onTaskCreated(() => {}),
      taskHandlers.onTaskUpdated(() => {}),
      chatHandlers.onMessage(() => {}),
      chatHandlers.onUserTyping(() => {}),
    ];
    
    // Cleanup
    unsubs.forEach(unsub => unsub());
    disconnectSocket();
    
    if (i % 20 === 0) {
      const currentMemory = process.memoryUsage().heapUsed;
      console.log(`Iteration ${i}: ${(currentMemory / 1024 / 1024).toFixed(2)} MB`);
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
    }
  }
  
  const finalMemory = process.memoryUsage().heapUsed;
  const memoryDiff = finalMemory - initialMemory;
  
  console.log("Final memory:", (finalMemory / 1024 / 1024).toFixed(2), "MB");
  console.log("Memory difference:", (memoryDiff / 1024 / 1024).toFixed(2), "MB");
  
  if (memoryDiff < 5 * 1024 * 1024) { // Less than 5MB difference
    console.log("✅ No significant memory leaks detected");
  } else {
    console.log("⚠️ Potential memory leak detected");
  }
};

// 🎮 Interactive test runner
export const runInteractiveTests = async (token: string) => {
  console.log("🎮 Running Interactive Functional Socket Tests");
  console.log("═".repeat(50));
  
  await testFunctionalSocket(token);
  console.log("\n" + "═".repeat(50));
  
  await performanceTest(token);
  console.log("\n" + "═".repeat(50));
  
  await memoryLeakTest(token);
  console.log("\n" + "═".repeat(50));
  
  console.log("🎉 All tests completed!");
};
