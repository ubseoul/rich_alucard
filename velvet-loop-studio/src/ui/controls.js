// UI controls: wires the control bar to callbacks. No knowledge of canvas or sprites.

export function bindControls({ onFile, onPlay, onPause, onRestart, onFps, onLoop, onStyle, onDownload }, { fps, loop }) {
  const $ = (id) => document.getElementById(id);
  const upload = $('upload');
  const picker = $('file-input');
  const play = $('play');
  const pause = $('pause');
  const restart = $('restart');
  const fpsSlider = $('fps');
  const fpsValue = $('fps-value');
  const loopBox = $('loop');
  const richify = $('richify');
  const colors = $('colors');
  const level = $('level');
  const download = $('download');
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
  const styleChanged = () => {
    colors.disabled = level.disabled = download.disabled = !richify.checked;
    onStyle({ richify: richify.checked, level: level.value, colors: Number(colors.value) || null });
  };
  richify.addEventListener('change', styleChanged);
  level.addEventListener('change', styleChanged);
  colors.addEventListener('change', styleChanged);
  download.addEventListener('click', onDownload);

  return {
    setFps(value) {
      fpsSlider.value = value;
      fpsValue.textContent = value;
    },
    setBusy(message) {
      status.classList.remove('error');
      status.textContent = message;
    },
    setLoaded(info) {
      upload.textContent = 'Replace Sprite Sheet';
      empty.hidden = true;
      status.classList.remove('error');
      status.textContent = `${info.name} · ${info.frameCount} frames · ${info.frameWidth}×${info.frameHeight}px${info.note ? ' · ' + info.note : ''}`;
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
