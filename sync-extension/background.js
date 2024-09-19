chrome.runtime.onInstalled.addListener(() => {
    console.log('Netflix Sync Extension Installed');
  });
  
  // You could also establish WebSocket connection in background
  const socket = io('http://localhost:5001');
  socket.on('connect', () => {
    console.log('Connected to WebSocket server');
  });
  