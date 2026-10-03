/* Cover, transition, and precisely timed song-scene orchestration. */
const cover = document.querySelector('.cover');
const letter = document.querySelector('.letter');
const transition = document.querySelector('.transition');
const readyButton = document.querySelector('.ready-button');
const cleanPause = document.querySelector('.clean-pause');
const songScene = document.querySelector('.song-scene');
const songAudio = document.querySelector('#song-audio');
const universeCanvas = document.querySelector('.universe-canvas');
const lyricPrevious = document.querySelector('.lyric--previous');
const lyricCurrent = document.querySelector('.lyric--current');
const lyricNext = document.querySelector('.lyric--next');
const leftPhoto = document.querySelector('#left-photo');
const rightPhoto = document.querySelector('#right-photo');
const photoCluster = document.querySelector('#photo-cluster');
const photoRanges = [[3,8,1,2],[10,14,3,4],[14,18,5,6],[19,22,7,28],[22,25,29,30],[25,28,31,32],[28,32,33,40],[33,37,41,42],[37,41,43,44],[41,44,45,46],[44,46,47,48],[47,50,49,50],[50,53,51,52],[53,56,53,54],[56,60,55,56],[60,62,57,58],[62,65,59,60],[65,72,61,62],[72,75,63,64],[75,82,65,66],[82,85,67,68],[87,91,69,70],[92,95,71,72],[96,100,73,74],[100,102,75,76],[102,105,77,78],[105,109,79,80],[109,112,81,82],[112,114,83,84],[115,118,85,86],[118,121,87,88],[121,124,89,90],[124,131,91,92],[131,134,93,94],[134,141,95,96],[141,144,97,98],[145,152,99,100],[147,152,101,102],[152,156,103,104],[154,156,105,106],[156,159,107,108],[160,162,109,110],[162,166,111,112],[166,168,113,114],[168,171,115,116],[171,175,117,118],[175,177,119,120],[177,180,121,122],[181,188,123,124],[188,190,125,126],[190,197,127,128],[197,201,129,130],[202,206,131,132],[206,211,133,134]];
const photoExt = new Set([5,6,29,43,44,46,52,82,99,100,106,111,122,134]);
const photoPath = (id) => encodeURI(`images/memories/foto ${id}${id === 109 ? ' ' : ''}.${id === 121 ? 'JPG' : id === 133 ? 'PNG' : photoExt.has(id) ? 'jpg' : 'JPEG'}`);
const photoItems = Array.from({ length: 22 }, () => { const item = document.createElement('figure'); item.className = 'photo-cluster__item'; const image = document.createElement('img'); image.alt = ''; image.decoding = 'async'; item.append(image); photoCluster.append(item); return item; });
const fixedImages = [leftPhoto, rightPhoto].map((slot) => { const image = document.createElement('img'); image.alt = ''; image.decoding = 'async'; slot.prepend(image); return image; });
const photoLoadCache = new Map();
let photoSignature = '';
let photoTargetSignature = '';
let photoPreloadFrame = 0;

function listRangeIds(first, last) {
  const ids = [];
  for (let id = first; id <= last; id += 1) {
    if (!ids.includes(id)) ids.push(id);
  }
  return ids;
}

function isPriorityPhotoRange(start) {
  return (start >= 19 && start < 23) || (start >= 28 && start < 33);
}

function getPhotoPreloadPlan(currentTime) {
  const priorityRanges = photoRanges
    .map(([start, end, first, last]) => ({
      start,
      end,
      ids: listRangeIds(first, last),
      priority: Math.max(0, start - currentTime) + (isPriorityPhotoRange(start) ? -0.75 : 0)
    }))
    .filter(({ end }) => end > currentTime - 2 && end <= currentTime + 25)
    .sort((a, b) => a.priority - b.priority || b.ids.length - a.ids.length);

  const ids = [];
  const seen = new Set();
  for (const { ids: rangeIds } of priorityRanges) {
    for (const id of rangeIds) {
      if (seen.has(id)) continue;
      seen.add(id);
      ids.push(id);
      if (ids.length >= 24) break;
    }
    if (ids.length >= 24) break;
  }
  return ids;
}

function loadPhotoAsset(id) {
  if (!Number.isInteger(id)) return Promise.resolve(null);
  if (photoLoadCache.has(id)) return photoLoadCache.get(id);

  const loader = new Promise((resolve) => {
    const image = new Image();
    image.decoding = 'async';
    image.loading = 'eager';
    image.onload = () => {
      if (typeof image.decode === 'function') {
        image.decode().then(() => resolve(image)).catch(() => resolve(image));
      } else {
        resolve(image);
      }
    };
    image.onerror = () => resolve(null);
    image.src = photoPath(id);
  });

  photoLoadCache.set(id, loader);
  return loader;
}

function schedulePhotoPreload(currentTime = Number.isFinite(songAudio?.currentTime) ? songAudio.currentTime : 0) {
  if (photoPreloadFrame) return;
  photoPreloadFrame = requestAnimationFrame(() => {
    photoPreloadFrame = 0;
    const safeTime = Number.isFinite(songAudio?.currentTime) ? songAudio.currentTime : currentTime;
    const nextPhotos = getPhotoPreloadPlan(safeTime);
    nextPhotos.slice(0, 18).forEach((id) => {
      if (!photoLoadCache.has(id)) loadPhotoAsset(id);
    });
  });
}

function photoDirector(time) {
  const ids = []; photoRanges.forEach(([start,end,first,last]) => { if (time >= start && time < end) for (let id=first; id<=last; id += 1) if (!ids.includes(id)) ids.push(id); });
  const signature = ids.join(',');
  if (signature === photoTargetSignature) return;
  photoTargetSignature = signature;
  const pair = ids.length === 2;
  [leftPhoto,rightPhoto].forEach((slot) => slot.classList.toggle('is-hidden', !pair));
  photoCluster.classList.toggle('is-visible', ids.length > 2);
  if (!ids.length) return;

  if (pair) {
    Promise.all(ids.map((id) => loadPhotoAsset(id))).then(() => {
      if (photoTargetSignature !== signature) return;
      fixedImages.forEach((image, index) => {
        const id = ids[index];
        if (!id) return;
        const nextSource = photoPath(id);
        const slot = image.parentElement;
        if (image.dataset.photoId === String(id) && image.currentSrc === nextSource) {
          slot.classList.add('is-ready');
          return;
        }
        image.src = nextSource;
        image.dataset.photoId = String(id);
        slot.classList.add('is-ready');
      });
      photoSignature = signature;
    });
    return;
  }

  Promise.all(ids.map((id) => loadPhotoAsset(id))).then(() => {
    if (photoTargetSignature !== signature) return;
    photoItems.forEach((item, index) => {
      const id = ids[index];
      const image = item.querySelector('img');
      if (!id) {
        item.classList.remove('is-active', 'is-ready');
        image.removeAttribute('src');
        image.dataset.photoId = '';
        return;
      }
      const nextSource = photoPath(id);
      if (image.dataset.photoId === String(id) && image.currentSrc === nextSource) {
        item.classList.add('is-active', 'is-ready');
        return;
      }
      image.src = nextSource;
      image.dataset.photoId = String(id);
      item.classList.add('is-active', 'is-ready');
    });
    photoSignature = signature;
  });
}

/*
 * Author-approved lyric cues. Times are in seconds and intentionally match
 * the supplied timeline exactly; do not recalculate or alter them.
 */
const lyricTimeline = [
  [3, 8, 'Make You Stay', 'title', 'relaxed'],
  [10, 14, "I'd sing a cappella in the rain"], [14, 18, "Let the whole world think I've gone insane"],
  [19, 22, 'Give you all my money and my name'], [22, 25, "Nothing I wouldn't do"], [25, 28, "Nothing I wouldn't do"],
  [28, 32, "When I'm crazy and I don't know why"], [33, 37, 'Would you calm me down and read my mind?'],
  [37, 41, 'Would you still send shivers up my spine?'], [41, 44, "Nothing I wouldn't do"], [44, 46, "Nothing I wouldn't do"],
  [47, 50, 'We could be-', 'intense', 'intense'], [50, 53, 'We could be anything tonight', 'intense', 'intense'],
  [53, 56, 'Just tell me everything you like', 'intense', 'intense'], [56, 60, "Can't you see?", 'intense', 'intense'],
  [60, 62, 'We could be something if we tried', 'intense', 'intense'], [62, 65, 'Just tell me how to make you mine', 'unique', 'intense'],
  [65, 72, 'What have I gotta do to make you-', 'stack', 'intense'], [68, 72, 'What have I gotta do to make you-', 'stack', 'intense'], [70, 72, 'What have I gotta do to make you', 'stack', 'intense'],
  [72, 75, 'Stay? Yeah, yeah, yeah, yeah, yeah', 'intense', 'intense'],
  [75, 82, 'What have I gotta do to make you-', 'stack', 'intense'], [77, 82, 'What have I gotta do to make you-', 'stack', 'intense'], [79, 82, 'What have I gotta do to make you', 'stack', 'intense'],
  [82, 85, 'Stay? Yeah, yeah, yeah, yeah, yeah', 'intense', 'intense'],
  [87, 91, 'I would break the laws of gravity', 'normal', 'relaxed'], [92, 95, 'Killing for you in the first degree'],
  [96, 100, 'Shut the world out when you need to breathe'], [100, 102, "Nothing I wouldn't do"], [102, 105, "Nothing I wouldn't do"],
  [105, 109, 'We could be-', 'intense', 'intense'], [109, 112, 'We could be anything tonight', 'intense', 'intense'],
  [112, 114, 'Just tell me everything you like', 'intense', 'intense'], [115, 118, "Can't you see?", 'intense', 'intense'],
  [118, 121, 'We could be something if we tried', 'intense', 'intense'], [121, 124, 'Just tell me how to make you mine', 'unique', 'intense'],
  [124, 131, 'What have I gotta do to make you-', 'stack', 'intense'], [127, 131, 'What have I gotta do to make you-', 'stack', 'intense'], [129, 131, 'What have I gotta do to make you', 'stack', 'intense'],
  [131, 134, 'Stay? Yeah, yeah, yeah, yeah, yeah', 'intense', 'intense'],
  [134, 141, 'What have I gotta do to make you-', 'stack', 'intense'], [136, 141, 'What have I gotta do to make you-', 'stack', 'intense'], [138, 141, 'What have I gotta do to make you', 'stack', 'intense'],
  [141, 144, 'Stay? Yeah, yeah, yeah, yeah, yeah', 'intense', 'intense'],
  [145, 152, 'Stay, yeah, yeah, yeah, yeah', 'normal', 'relaxed'], [147, 152, 'Yeah-ah-ah-ah-ay', 'stack', 'relaxed'], [150, 152, 'Yeah-ah-ah-ah-ay', 'stack', 'relaxed'],
  [152, 156, "'Cause I've never known love like this"], [154, 156, 'Never known love like this', 'stack', 'relaxed'],
  [156, 159, 'Yeah-ah-ah-ah-ay', 'normal', 'relaxed'], [158, 159, 'Yeah-ah-ah-ah-ay', 'stack', 'relaxed'], [160, 162, 'Stay, yeah, yeah, yeah, yeah', 'normal', 'relaxed'],
  [162, 166, 'We could be-', 'intense', 'intense'], [166, 168, 'We could be anything tonight', 'intense', 'intense'],
  [168, 171, 'Just tell me everything you like', 'intense', 'intense'], [171, 175, "Can't you see?", 'intense', 'intense'],
  [175, 177, 'We could be something if we tried', 'intense', 'intense'], [177, 180, 'Just tell me how to make you mine', 'unique', 'intense'],
  [181, 188, 'What have I gotta do to make you-', 'stack', 'intense'], [183, 188, 'What have I gotta do to make you-', 'stack', 'intense'], [185, 188, 'What have I gotta do to make you', 'stack', 'intense'],
  [188, 190, 'Stay? Yeah, yeah, yeah, yeah, yeah', 'intense', 'intense'],
  [190, 197, 'What have I gotta do to make you-', 'stack', 'intense'], [193, 197, 'What have I gotta do to make you-', 'stack', 'intense'], [195, 197, 'What have I gotta do to make you', 'stack', 'intense'],
  [197, 201, 'Stay? Yeah, yeah, yeah, yeah, yeah', 'intense', 'intense'], [202, 206, 'Stay, yeah, yeah, yeah, yeah, yeah', 'normal', 'relaxed'],
  [206, 211, 'Stay, yeah, yeah, yeah, yeah', 'final', 'final']
].map(([start, end, text, style = 'normal', mood = 'relaxed']) => ({ start, end, text, style, mood }));

let visibleSignature = '';
let lyricFrame;
let beatContext;
let beatAnalyser;
let beatData;
let beatFrame;

class MemoryUniverse {
  constructor(canvas) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
    this.stars = Array.from({ length: 440 }, () => this.createStar(true));
    this.running = false;
    this.lastFrame = 0;
    this.cameraTime = 0;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  createStar(randomDepth = false) {
    return {
      x: (Math.random() - .5) * 54,
      y: (Math.random() - .5) * 34,
      z: randomDepth ? 3 + Math.random() * 76 : 78,
      size: .25 + Math.random() * 1.5,
      tone: Math.random() > .76 ? 'gold' : 'blue'
    };
  }

  resize() {
    const isMobile = window.matchMedia('(max-width: 768px)').matches || navigator.maxTouchPoints > 1;
    const scale = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2);
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.scale = scale;
    this.canvas.width = Math.round(this.width * scale);
    this.canvas.height = Math.round(this.height * scale);
    this.context.setTransform(scale, 0, 0, scale, 0, 0);
  }

  mood() {
    return songScene.dataset.mood || 'relaxed';
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.lastFrame = performance.now();
    requestAnimationFrame((time) => this.frame(time));
  }

  stop() { this.running = false; }

  frame(time) {
    if (!this.running) return;
    const delta = Math.min((time - this.lastFrame) / 1000, .05);
    this.lastFrame = time;
    this.cameraTime += delta;
    this.render(delta);
    requestAnimationFrame((nextTime) => this.frame(nextTime));
  }

  render(delta) {
    const context = this.context;
    const mood = this.mood();
    const intense = mood === 'intense';
    const final = mood === 'final';
    const speed = intense ? 13.5 : final ? 2.1 : 4.3;
    const drift = intense ? 1.45 : .48;
    const pulse = Number.parseFloat(getComputedStyle(songScene).getPropertyValue('--music-pulse')) || 0;
    const centerX = this.width / 2 + Math.sin(this.cameraTime * .19) * this.width * .024 * drift;
    const centerY = this.height / 2 + Math.cos(this.cameraTime * .14) * this.height * .018 * drift;
    const roll = Math.sin(this.cameraTime * .11) * (intense ? .065 : .018);
    const unit = Math.min(this.width, this.height) * .82;

    context.clearRect(0, 0, this.width, this.height);
    this.drawNebula(context, centerX, centerY, intense, final, pulse);

    context.save();
    context.translate(centerX, centerY);
    context.rotate(roll);
    context.translate(-centerX, -centerY);
    context.lineCap = 'round';

    for (const star of this.stars) {
      const oldZ = star.z;
      star.z -= speed * delta * (star.tone === 'gold' ? 1.05 : 1);
      if (star.z < 1.15) Object.assign(star, this.createStar(false));

      const projection = unit / star.z;
      const oldProjection = unit / oldZ;
      const x = centerX + star.x * projection;
      const y = centerY + star.y * projection;
      const oldX = centerX + star.x * oldProjection;
      const oldY = centerY + star.y * oldProjection;
      if (x < -20 || x > this.width + 20 || y < -20 || y > this.height + 20) continue;

      const brightness = Math.min(.85, .17 + (1 - star.z / 80) * .72);
      context.strokeStyle = star.tone === 'gold'
        ? `rgba(255,236,162,${brightness})`
        : `rgba(223,241,255,${brightness * .86})`;
      context.lineWidth = Math.max(.4, star.size * (intense ? 1.35 : 1));
      context.beginPath();
      context.moveTo(oldX, oldY);
      context.lineTo(x, y);
      context.stroke();
    }
    context.restore();

    if (intense) this.drawPortals(context, centerX, centerY, pulse);
    if (final) this.drawFinalHalo(context, centerX, centerY);
  }

  drawNebula(context, x, y, intense, final, pulse) {
    const radius = Math.max(this.width, this.height) * (intense ? .72 : .52);
    const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
    if (intense) {
      gradient.addColorStop(0, `rgba(255,236,157,${.14 + pulse * .22})`);
      gradient.addColorStop(.28, 'rgba(122,180,255,.12)');
      gradient.addColorStop(.66, 'rgba(70,111,181,.06)');
    } else if (final) {
      gradient.addColorStop(0, 'rgba(255,249,204,.19)');
      gradient.addColorStop(.54, 'rgba(190,224,255,.08)');
    } else {
      gradient.addColorStop(0, 'rgba(235,247,255,.075)');
      gradient.addColorStop(.6, 'rgba(153,198,247,.045)');
    }
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, this.width, this.height);
  }

  drawPortals(context, x, y, pulse) {
    const cycle = (songAudio.currentTime * .17) % 1;
    const base = Math.min(this.width, this.height);
    context.save();
    context.translate(x, y);
    context.rotate(Math.sin(this.cameraTime * .18) * .12);
    for (let index = 0; index < 3; index += 1) {
      const progress = (cycle + index / 3) % 1;
      const width = base * (.22 + progress * 1.35);
      const height = width * (.42 + Math.sin(this.cameraTime + index) * .035);
      context.globalAlpha = (1 - progress) * (.16 + pulse * .24);
      context.strokeStyle = index === 1 ? 'rgba(255,235,152,1)' : 'rgba(196,225,255,1)';
      context.lineWidth = Math.max(1, 3.1 * (1 - progress));
      context.beginPath();
      context.ellipse(0, 0, width, height, index * .41, 0, Math.PI * 2);
      context.stroke();
    }
    context.restore();
    context.globalAlpha = 1;
  }

  drawFinalHalo(context, x, y) {
    context.save();
    context.globalAlpha = .26 + Math.sin(this.cameraTime * .9) * .06;
    context.strokeStyle = 'rgba(255,249,205,1)';
    context.lineWidth = 1;
    context.beginPath();
    context.ellipse(x, y, Math.min(this.width, this.height) * .35, Math.min(this.width, this.height) * .15, .1, 0, Math.PI * 2);
    context.stroke();
    context.restore();
  }
}

const memoryUniverse = new MemoryUniverse(universeCanvas);

function renderLyrics() {
  const time = songAudio.currentTime;
  const active = lyricTimeline.filter((cue) => time >= cue.start && time < cue.end);
  const previous = lyricTimeline.filter((cue) => cue.end <= time).slice(-2);
  const next = lyricTimeline.find((cue) => cue.start > time);
  const signature = active.map((cue) => `${cue.start}-${cue.end}`).join('|');

  lyricPrevious.textContent = previous.map((cue) => cue.text).join(' · ');
  lyricNext.textContent = next ? next.text : '';

  if (signature !== visibleSignature) {
    lyricCurrent.replaceChildren();
    active.forEach((cue) => {
      const line = document.createElement('span');
      line.className = `lyric-line lyric-line--${cue.style}`;
      line.textContent = cue.text;
      lyricCurrent.append(line);
    });
    visibleSignature = signature;
  }

  const moodCue = active[active.length - 1];
  songScene.dataset.mood = moodCue?.mood || 'relaxed';
}

function runLyricClock() {
  renderLyrics();
  photoDirector(songAudio.currentTime);
  schedulePhotoPreload(songAudio.currentTime);
  if (!songAudio.paused && !songAudio.ended) lyricFrame = requestAnimationFrame(runLyricClock);
}

function startBeatReactivity() {
  /* Observe a copy of native playback; never route or alter the audible output. */
  if (beatContext || !songAudio.captureStream) return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    beatContext = new AudioContext();
    beatAnalyser = beatContext.createAnalyser();
    beatAnalyser.fftSize = 128;
    beatData = new Uint8Array(beatAnalyser.frequencyBinCount);
    const silentOutput = beatContext.createGain();
    silentOutput.gain.value = 0;
    beatContext.createMediaStreamSource(songAudio.captureStream()).connect(beatAnalyser);
    beatAnalyser.connect(silentOutput);
    silentOutput.connect(beatContext.destination);
    beatContext.resume();
    const readPulse = () => {
      if (!beatAnalyser || songAudio.paused || songAudio.ended) return;
      beatAnalyser.getByteFrequencyData(beatData);
      const bass = beatData.slice(0, 12).reduce((sum, value) => sum + value, 0) / (12 * 255);
      songScene.style.setProperty('--music-pulse', bass.toFixed(3));
      songScene.style.setProperty('--pulse-core', (.38 + bass * .34).toFixed(3));
      songScene.style.setProperty('--pulse-ring', (.29 + bass * .45).toFixed(3));
      songScene.style.setProperty('--pulse-wave', (.21 + bass * .4).toFixed(3));
      songScene.style.setProperty('--pulse-aurora', (.72 + bass * .28).toFixed(3));
      songScene.style.setProperty('--pulse-scale', (1 + bass * .22).toFixed(3));
      songScene.style.setProperty('--pulse-aurora-scale', (.98 + bass * .18).toFixed(3));
      songScene.style.setProperty('--pulse-shadow', `${Math.round(22 + bass * 65)}px`);
      beatFrame = requestAnimationFrame(readPulse);
    };
    readPulse();
  } catch (error) {
    console.info('[visuals] Native beat reactivity is unavailable; cinematic CSS motion remains active.');
  }
}

function startSongFromUserGesture() {
  /* Playback must begin in this click handler to satisfy modern autoplay policies. */
  songAudio.muted = false;
  songAudio.volume = 1;
  songAudio.currentTime = 0;
  songAudio.play().then(() => {
    schedulePhotoPreload(songAudio.currentTime);
    runLyricClock();
    startBeatReactivity();
    memoryUniverse.start();
  }).catch((error) => console.warn('[audio] Playback failed:', error.name));
}

function beginSongScene() {
  renderLyrics();
  photoDirector(songAudio.currentTime);
  songScene.classList.add('is-visible');
  songScene.setAttribute('aria-hidden', 'false');
}

window.addEventListener('load', () => {
  setTimeout(() => cover.classList.add('is-ready'), 120);
  schedulePhotoPreload(0);
});

document.querySelectorAll('.polaroid img').forEach((image) => {
  image.addEventListener('error', () => image.closest('.polaroid').classList.add('is-placeholder'));
  if (image.complete && !image.naturalWidth) image.closest('.polaroid').classList.add('is-placeholder');
});

letter.addEventListener('click', () => {
  document.body.classList.add('entering-transition');
  window.setTimeout(() => {
    transition.classList.add('is-visible');
    transition.setAttribute('aria-hidden', 'false');
  }, 700);
});

readyButton.addEventListener('click', () => {
  readyButton.disabled = true;
  startSongFromUserGesture();
  transition.classList.add('is-leaving');
  window.setTimeout(() => cleanPause.classList.add('is-visible'), 520);
  window.setTimeout(() => {
    beginSongScene();
    cleanPause.classList.remove('is-visible');
  }, 1320);
});

songAudio.addEventListener('pause', () => { cancelAnimationFrame(lyricFrame); cancelAnimationFrame(beatFrame); memoryUniverse.stop(); });
songAudio.addEventListener('ended', () => { cancelAnimationFrame(lyricFrame); cancelAnimationFrame(beatFrame); memoryUniverse.stop(); });
songAudio.addEventListener('error', () => console.error('[audio] File error:', songAudio.error?.message || 'audio unavailable'));
