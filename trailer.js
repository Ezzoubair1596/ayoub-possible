const watch = document.querySelector(".watch");
const video = document.querySelector("video");
const error = document.querySelector(".error");
const music = document.querySelector("audio");
const themeVolume = 0.35;
let fadeFrame;
let active = false;
let frame;

function playMusic() {
  cancelAnimationFrame(fadeFrame);
  music.volume = themeVolume;
  music.play().catch(() => {
    // The browser may require a user gesture before allowing audible playback.
  });
}

function fadeMusic() {
  cancelAnimationFrame(fadeFrame);
  if (music.paused) return;
  const startVolume = music.volume;
  const start = performance.now();
  function fade(now) {
    const progress = Math.min((now - start) / 650, 1);
    music.volume = startVolume * (1 - progress);
    if (progress < 1) fadeFrame = requestAnimationFrame(fade);
    else music.pause();
  }
  fadeFrame = requestAnimationFrame(fade);
}

function scene(name) {
  if (document.body.dataset.scene !== name) document.body.dataset.scene = name;
}

function update() {
  if (!active) return;
  const time = video.currentTime;
  if (time >= 4.42) scene("film");
  else if (time >= 4.02) scene("black");
  else if (time >= 2) scene("orientation");
  else scene("fade");
  frame = requestAnimationFrame(update);
}

function restore(failed = false) {
  if (!active) return;
  active = false;
  cancelAnimationFrame(frame);
  video.pause();
  scene("cover");
  watch.disabled = false;
  error.hidden = !failed;
  playMusic();
}

watch.addEventListener("click", async () => {
  if (active) return;
  active = true;
  watch.disabled = true;
  error.hidden = true;
  scene("loading");
    const page = document.documentElement;
  const requestFullscreen =
    page.requestFullscreen || page.webkitRequestFullscreen;

  if (requestFullscreen && !document.fullscreenElement) {
    try {
      Promise.resolve(requestFullscreen.call(page)).catch(() => {});
    } catch {
      // Continue playing if fullscreen is unavailable.
    }
  }
  fadeMusic();
  try {
    video.currentTime = 0;
    await video.play();
    if (active) update();
  } catch {
    restore(true);
  }
});

video.addEventListener("ended", () => {
  restore();

  if (document.fullscreenElement) {
    document.exitFullscreen().catch(() => {});
  } else if (document.webkitFullscreenElement) {
    document.webkitExitFullscreen?.();
  }
});
video.addEventListener("error", () => restore(true));
video.addEventListener("contextmenu", (event) => event.preventDefault());

const entry = document.querySelector(".entry");
const shelf = document.querySelector(".shelf");

entry.addEventListener("click", () => {
  playMusic();
  scene("cover");
  shelf.inert = false;
  entry.inert = true;
  watch.focus({ preventScroll: true });
}, { once: true });
