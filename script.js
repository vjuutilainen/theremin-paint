
window.onload = () => {

  let width = window.innerWidth;
  let height = window.innerHeight;
  let mouse = {x: 0, y: 0};
  let playing = false;
  let c = document.getElementById('canvas').getContext('2d');
  let audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  let oscillator = audioCtx.createOscillator();
  oscillator.type = 'sine';
  oscillator.start();
  let gainNode = audioCtx.createGain();
  let analyser = audioCtx.createAnalyser();
  analyser.fftSize = 2048;
  let bufferLength = analyser.fftSize;
  let dataArray = new Uint8Array(bufferLength);
  analyser.connect(audioCtx.destination);
  oscillator.connect(gainNode);
  gainNode.connect(analyser);

  Array.prototype.slice.call(document.querySelectorAll('nav button')).forEach(button => {
    button.onclick = () => {
      oscillator.type = button.getAttribute('data-id');
    };
  });
  
  let updateVisuals = () => {
    analyser.getByteTimeDomainData(dataArray);
    c.globalAlpha = 0.1;
    c.beginPath();
    dataArray.forEach((d,i) => {
      let x = i / dataArray.length * width;
      let y = d / 128 * height / 2;
      c.strokeStyle = 'hsl(' + (d / 128 * 360) + ',100%,50%)';  
      c.lineTo(x, y);
    });
    c.stroke();
  };

  let updateSound = () => {
    let frequency = mouse.x / width * 400;
    let amplitude = playing ? 1 - (mouse.y / height) : 0;
    oscillator.frequency.value = frequency;
    gainNode.gain.linearRampToValueAtTime(amplitude, audioCtx.currentTime + 0.1);
  };

  window.onclick = () => {
    playing = !playing;
    if(playing) c.clearRect(0,0,width,height);
  };

  window.onmousemove = (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  };

  window.onresize = () => {
    width = window.innerWidth;
    height = window.innerHeight;
    resizeCanvas();
  };

  let resizeCanvas = () => {
    let ratio = window.devicePixelRatio;
    c.canvas.width = width * ratio;
    c.canvas.height = height * ratio;
    c.canvas.style.width = width + 'px';
    c.canvas.style.height = height + 'px';
    c.scale(ratio,ratio);
  };

  let tick = () => {
    requestAnimationFrame(tick);
    updateSound();
    if(playing) updateVisuals();
  };

  resizeCanvas();
  requestAnimationFrame(tick);

};
