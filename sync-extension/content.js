// content.js (injected into Netflix)
const socket = io('http://192.168.5.145:5001'); // Change the URL to your WebSocket server
const roomId = new URL(window.location.href).searchParams.get('roomId');

if (roomId) {
  // Join the WebSocket room using the roomId
  socket.emit('joinStreamingRoom', roomId);

  // Get the video element on the Netflix page
  const video = document.querySelector('video');

  // Listen for play/pause events on the Netflix player
  video.addEventListener('play', () => {
    socket.emit('playMovie', roomId);
  });

  video.addEventListener('pause', () => {
    socket.emit('pauseMovie', roomId);
  });

  // Listen for WebSocket events to control Netflix player
  socket.on('playSync', () => {
    if (video.paused) {
      video.play();
    }
  });

  socket.on('pauseSync', () => {
    if (!video.paused) {
      video.pause();
    }
  });
}
