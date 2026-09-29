// UI controls: wires the control bar to callbacks. No knowledge of canvas or sprites.

export function bindControls({ onFile, onPlay, onPause, onRestart, onFps, onLoop }, { fps, loop }) {
  const $ = (id) => document.getElementById(id);
  const upload = $('upload');
  const picker = $('file-input');
  const play = $('play');
  const pause = $('pause');
  const restart = $('restart');
  const fpsSlider = $('fps');
  const fpsValue = $('fps-value');
  const loopBox = $('loop');
  const status = $('status');
  const empty = $('empty');

  fpsSlider.value = fps;
  fpsValue.textContent = fps;
  loopBox.checked = loop;

  upload.addEventListener('click', () => picker.click());
  picker.addEventListener('change', () => {
    const file = picker.files[0];
    picker.value = ''; // allow re-picking the same file after regenerating it
    if (file) onFile(file);
  });
  play.addEventListener('click', onPlay);
  pause.addEventListener('click', onPause);
  restart.addEventListener('click', onRestart);
  fpsSlider.addEventListener('input', () => {
    fpsValue.textContent = fpsSlider.value;
    onFps(Number(fpsSlider.value));
  });
  loopBox.addEventListener('change', () => onLoop(loopBox.checked));

  return {
    setLoaded(info) {
      upload.textContent = 'Replace Sprite Sheet';
      empty.hidden = true;
      status.classList.remove('error');
      status.textContent = `${info.name} · ${info.frameCount} frames · ${info.frameWidth}×${info.frameHeight}px`;
      for (const b of [play, pause, restart]) b.disabled = false;
    },
    setError(message) {
      status.classList.add('error');
      status.textContent = message;
    },
    setPlaying(playing) {
      play.classList.toggle('active', playing);
      pause.classList.toggle('active', !playing);
    },
  };
}
