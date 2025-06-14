
const startBtn = document.getElementById('start-button');
const startScreen = document.getElementById('start-screen');
const playerScreen = document.getElementById('player-screen');
const voice = document.getElementById('voice');
const track = document.getElementById('track');
const canvas = document.getElementById('visualizer');
const pauseBtn = document.getElementById('pause-button');
const closeBtn = document.getElementById('close-button');
const ctx = canvas.getContext('2d');

let audioCtx, analyser, source, dataArray, bufferLength;
let visualIndex = 0;
let visuals = [];

startBtn.onclick = async () => {
  startScreen.classList.add('hidden');
  playerScreen.classList.remove('hidden');
  voice.play();
  voice.onended = () => {
    initAudio();
    track.play();
  };
};

pauseBtn.onclick = () => {
  if (track.paused) {
    track.play();
    pauseBtn.textContent = '⏸️';
  } else {
    track.pause();
    pauseBtn.textContent = '▶️';
  }
};

closeBtn.onclick = () => {
  location.reload();
};

function initAudio() {
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  analyser = audioCtx.createAnalyser();
  source = audioCtx.createMediaElementSource(track);
  source.connect(analyser);
  analyser.connect(audioCtx.destination);
  analyser.fftSize = 256;
  bufferLength = analyser.frequencyBinCount;
  dataArray = new Uint8Array(bufferLength);
  resizeCanvas();
  requestAnimationFrame(draw);
  setInterval(() => {
    visualIndex = (visualIndex + 1) % visuals.length;
  }, 10000);
}

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.onresize = resizeCanvas;

visuals = [
  function bars() {
    analyser.getByteFrequencyData(dataArray);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const barWidth = canvas.width / bufferLength;
    for (let i = 0; i < bufferLength; i++) {
      const h = dataArray[i];
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.fillRect(i * barWidth, canvas.height - h, barWidth - 2, h);
    }
  },
  function circle() {
    analyser.getByteFrequencyData(dataArray);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const radius = 100;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    for (let i = 0; i < bufferLength; i++) {
      const angle = (i / bufferLength) * 2 * Math.PI;
      const length = dataArray[i];
      const x1 = cx + Math.cos(angle) * radius;
      const y1 = cy + Math.sin(angle) * radius;
      const x2 = cx + Math.cos(angle) * (radius + length);
      const y2 = cy + Math.sin(angle) * (radius + length);
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
  }
];

function draw() {
  if (visuals[visualIndex]) {
    visuals[visualIndex]();
  }
  requestAnimationFrame(draw);
}
