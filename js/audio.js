/**
 * Super Mario Winter - Procedural Web Audio Engine
 * Self-contained 8-bit sound synthesis with festive winter jingle bells!
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.volume = 0.6;
    this.masterGain = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.currentTrack = null;
    this.pausedTrack = null;
    this.pausedStep = 0;
    this.isPlayingMusic = false;
    this.musicVolume = 0.35;
    this.musicStep = 0;
    this.musicTimer = null;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.initialized = true;
    } catch (e) {
      console.warn("Web Audio API not supported", e);
    }
  }

  ensureContext() {
    if (!this.initialized) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  // --- Sound Effects Synthesizers ---

  playJump(isSuper = false) {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    if (isSuper) {
      osc.frequency.setValueAtTime(150, t);
      osc.frequency.exponentialRampToValueAtTime(600, t + 0.22);
      gain.gain.setValueAtTime(0.35, t);
      gain.gain.linearRampToValueAtTime(0, t + 0.22);
      osc.start(t);
      osc.stop(t + 0.22);
    } else {
      osc.frequency.setValueAtTime(140, t);
      osc.frequency.exponentialRampToValueAtTime(440, t + 0.16);
      gain.gain.setValueAtTime(0.3, t);
      gain.gain.linearRampToValueAtTime(0, t + 0.16);
      osc.start(t);
      osc.stop(t + 0.16);
    }

    osc.connect(gain);
    gain.connect(this.sfxGain);
  }

  playCoin() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    // Classic B5 (987.77) to E6 (1318.51)
    osc.frequency.setValueAtTime(988, t);
    osc.frequency.setValueAtTime(1319, t + 0.08);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.setValueAtTime(0.35, t + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.35);

    // Winter sparkle chime harmonic
    const chime = this.ctx.createOscillator();
    const chimeGain = this.ctx.createGain();
    chime.type = 'triangle';
    chime.frequency.setValueAtTime(2637, t + 0.08);
    chimeGain.gain.setValueAtTime(0.12, t + 0.08);
    chimeGain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    chime.connect(chimeGain);
    chimeGain.connect(this.sfxGain);
    chime.start(t + 0.08);
    chime.stop(t + 0.4);
  }

  playStomp() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.12);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.12);
  }

  playKick() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(280, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.15);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.linearRampToValueAtTime(0.01, t + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.15);
  }

  playBlockBump() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.1);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.linearRampToValueAtTime(0.01, t + 0.1);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.1);
  }

  playBlockBreak() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    // Winter ice shatter effect: noise + high bell ringing
    const t = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1200, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    noise.start(t);

    // Chime ping
    const chime = this.ctx.createOscillator();
    const chimeGain = this.ctx.createGain();
    chime.type = 'sine';
    chime.frequency.setValueAtTime(1800, t);
    chime.frequency.exponentialRampToValueAtTime(800, t + 0.18);
    chimeGain.gain.setValueAtTime(0.2, t);
    chimeGain.gain.exponentialRampToValueAtTime(0.01, t + 0.18);
    chime.connect(chimeGain);
    chimeGain.connect(this.sfxGain);
    chime.start(t);
    chime.stop(t + 0.18);
  }

  playPowerupAppear() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const notes = [330, 392, 659, 523, 587, 784];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = this.ctx.currentTime + idx * 0.05;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.25, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.08);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(startTime);
      osc.stop(startTime + 0.08);
    });
  }

  playPowerupCollect() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    // Rich arpeggio
    const notes = [330, 392, 659, 523, 587, 784, 988, 1046, 1318];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = this.ctx.currentTime + idx * 0.045;

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.09);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(startTime);
      osc.stop(startTime + 0.09);
    });
  }

  play1Up() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const notes = [330, 392, 659, 523, 587, 784];
    const delays = [0, 0.08, 0.16, 0.24, 0.32, 0.40];
    delays.forEach((delay, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = this.ctx.currentTime + delay;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(notes[idx] * 2, startTime);

      gain.gain.setValueAtTime(0.3, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(startTime);
      osc.stop(startTime + 0.15);
    });
  }

  playSnowball() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(1400, t + 0.08);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.linearRampToValueAtTime(0.01, t + 0.08);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.08);
  }

  playFreeze() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    // Glassy freeze sound
    const t = this.ctx.currentTime;
    [1200, 1600, 2400].forEach((freq) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, t + 0.2);

      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.25);
    });
  }

  playPipe() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const freqs = [300, 260, 220, 180, 140, 100];
    freqs.forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = t + i * 0.06;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, startTime);

      gain.gain.setValueAtTime(0.3, startTime);
      gain.gain.linearRampToValueAtTime(0.01, startTime + 0.05);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(startTime);
      osc.stop(startTime + 0.05);
    });
  }

  playFlagpole() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(700, t);
    osc.frequency.linearRampToValueAtTime(150, t + 1.2);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.linearRampToValueAtTime(0.01, t + 1.2);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 1.2);
  }

  playFirework() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Boom noise
    const bufferSize = this.ctx.sampleRate * 0.35;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    noise.start(t);
  }

  playDie() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    this.stopMusic();
    const t = this.ctx.currentTime;
    const notes = [
      { f: 500, d: 0.12 },
      { f: 400, d: 0.12 },
      { f: 300, d: 0.15 },
      { f: 200, d: 0.25 },
      { f: 150, d: 0.4 }
    ];
    let cur = t;
    notes.forEach((n) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.f, cur);
      gain.gain.setValueAtTime(0.35, cur);
      gain.gain.exponentialRampToValueAtTime(0.01, cur + n.d);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(cur);
      osc.stop(cur + n.d);
      cur += n.d;
    });
  }

  // --- Festive Jingle Bells Sound Synthesizer ---
  playJingleBell(time, volume = 0.15) {
    if (!this.ctx || this.isMuted) return;
    // Bell cluster: inharmonic frequencies characteristic of sleigh bells
    const freqs = [2093, 2349, 2793, 3135];
    freqs.forEach((f) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, time);

      gain.gain.setValueAtTime(volume * 0.25, time);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.12);

      osc.connect(gain);
      gain.connect(this.musicGain);
      osc.start(time);
      osc.stop(time + 0.12);
    });
  }

  // --- Background Music System ---

  startMusic(trackName) {
    if (this.currentTrack === trackName && this.isPlayingMusic) return;
    this.stopMusic();
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
    }
    this.currentTrack = trackName;
    this.isPlayingMusic = true;
    this.musicStep = 0;
    this.scheduleNextBeat();
  }

  stopMusic() {
    this.isPlayingMusic = false;
    this.currentTrack = null;
    this.pausedTrack = null;
    this.pausedStep = 0;
    if (this.musicTimer) {
      clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setValueAtTime(0, this.ctx.currentTime);
    }
  }

  pauseMusic() {
    if (!this.isPlayingMusic) return;
    this.pausedTrack = this.currentTrack;
    this.pausedStep = this.musicStep;
    this.isPlayingMusic = false;
    this.currentTrack = null;
    if (this.musicTimer) {
      clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setValueAtTime(0, this.ctx.currentTime);
    }
  }

  resumeMusic() {
    if (this.isPlayingMusic || !this.pausedTrack) return;
    this.currentTrack = this.pausedTrack;
    this.musicStep = this.pausedStep || 0;
    this.pausedTrack = null;
    this.pausedStep = 0;
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
    }
    this.isPlayingMusic = true;
    this.scheduleNextBeat();
  }

  playPause() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const notes = [1318, 1046, 1318, 1046];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = this.ctx.currentTime + idx * 0.045;
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.04);
    });
  }

  scheduleNextBeat() {
    if (!this.isPlayingMusic) return;
    this.ensureContext();
    if (!this.ctx) return;

    let tempo = 125; // BPM
    if (this.currentTrack === 'star') tempo = 165;
    if (this.currentTrack === 'castle') tempo = 140;
    if (this.currentTrack === 'underground') tempo = 100;

    const stepDuration = 60 / tempo / 4; // 16th note in seconds

    // Play current notes based on track
    this.playTrackStep(this.currentTrack, this.musicStep);

    this.musicStep++;
    this.musicTimer = setTimeout(() => {
      this.scheduleNextBeat();
    }, stepDuration * 1000);
  }

  playTone(freq, duration, type = 'square', vol = 0.2, detune = 0) {
    if (!this.ctx || this.isMuted || freq === 0) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (detune !== 0) osc.detune.setValueAtTime(detune, t);

    // Warm soft attack and release to sound like 8-bit NES chiptune
    gain.gain.setValueAtTime(vol, t);
    gain.gain.setValueAtTime(vol * 0.8, t + duration * 0.7);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc.connect(gain);
    gain.connect(this.musicGain);
    osc.start(t);
    osc.stop(t + duration);
  }

  playBass(freq, duration) {
    if (!this.ctx || this.isMuted || freq === 0) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, t);

    gain.gain.setValueAtTime(0.28, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc.connect(gain);
    gain.connect(this.musicGain);
    osc.start(t);
    osc.stop(t + duration);
  }

  playTrackStep(track, step) {
    const t = this.ctx.currentTime;

    if (track === 'overworld') {
      // Winter Mario Overworld Theme (incorporates classic motif + festive rhythm + jingle bells!)
      const patternLength = 64;
      const curStep = step % patternLength;

      // Festive Jingle Bells on every 8th note, double tap on off-beats!
      if (curStep % 4 === 0 || curStep % 4 === 2) {
        this.playJingleBell(t, 0.16);
      }
      if (curStep % 4 === 1) {
        this.playJingleBell(t, 0.08);
      }

      // Melody notes (Classic Mario motif winterized with glockenspiel-bright pulse wave)
      // Frequencies: E5=659, C5=523, G5=784, G4=392, D5=587, A5=880, B5=988
      const melody = [
        // 0-15: Intro motif
        659, 659, 0, 659,   0, 523, 659, 0,   784, 0, 0, 0,     392, 0, 0, 0,
        // 16-31: Section A
        523, 0, 0, 392,     0, 0, 330, 0,     0, 440, 0, 494,   466, 0, 440, 0,
        // 32-47: Section B (Winter variation with high bells)
        392, 659, 784, 880, 0, 698, 784, 0,   659, 0, 523, 587, 494, 0, 0, 0,
        // 48-63: Bouncy festive cadence
        784, 740, 698, 622, 659, 0, 415, 440, 523, 0, 440, 523, 587, 0, 0, 0
      ];

      // Bass notes
      const bass = [
        330, 0, 330, 0,     330, 0, 330, 0,   392, 0, 392, 0,   196, 0, 196, 0,
        261, 0, 196, 0,     165, 0, 165, 0,   220, 0, 247, 0,   233, 0, 220, 0,
        196, 0, 261, 0,     349, 0, 349, 0,   330, 0, 261, 0,   196, 0, 247, 0,
        261, 0, 261, 0,     330, 0, 330, 0,   261, 0, 220, 0,   196, 0, 261, 0
      ];

      const mNote = melody[curStep];
      if (mNote) {
        this.playTone(mNote, 0.12, 'square', 0.18);
        // Soft holiday shimmer harmonic
        this.playTone(mNote * 2, 0.08, 'sine', 0.06);
      }

      const bNote = bass[curStep];
      if (bNote) {
        this.playBass(bNote, 0.14);
      }
    } 
    else if (track === 'underground') {
      // Ice Cavern Theme: crystalline, ambient, mysterious
      const patternLength = 32;
      const curStep = step % patternLength;

      const cavernNotes = [
        261, 523, 494, 988, 466, 932, 0, 0,
        261, 523, 494, 988, 466, 932, 0, 0,
        220, 440, 415, 830, 392, 784, 0, 0,
        196, 392, 185, 370, 175, 349, 0, 0
      ];

      const note = cavernNotes[curStep];
      if (note) {
        this.playTone(note, 0.18, 'sine', 0.16);
        // Crystal echo
        setTimeout(() => {
          if (!this.isPlayingMusic) return;
          this.playTone(note * 1.5, 0.12, 'sine', 0.05);
        }, 120);
      }

      if (curStep % 8 === 0) {
        this.playBass(130, 0.4);
      }
    } 
    else if (track === 'castle') {
      // Frost Bowser Fortress: driving, dramatic, intense
      const patternLength = 32;
      const curStep = step % patternLength;

      const castleMelody = [
        164, 164, 0, 164,   174, 0, 164, 0,   155, 0, 155, 0,   164, 0, 0, 0,
        220, 220, 0, 220,   233, 0, 220, 0,   207, 0, 207, 0,   220, 0, 0, 0
      ];

      const cNote = castleMelody[curStep];
      if (cNote) {
        this.playTone(cNote * 2, 0.1, 'sawtooth', 0.18);
        this.playBass(cNote, 0.12);
      }

      if (curStep % 4 === 0) {
        // Heavy drum thump
        this.playBlockBump();
      }
    } 
    else if (track === 'star') {
      // Starman Theme: hyper holiday speed!
      const patternLength = 16;
      const curStep = step % patternLength;

      // Jingle bells everywhere
      this.playJingleBell(t, 0.14);

      const starMelody = [
        784, 784, 784, 659, 784, 0, 880, 0,
        784, 0, 659, 0, 523, 0, 587, 0
      ];

      const sNote = starMelody[curStep];
      if (sNote) {
        this.playTone(sNote, 0.08, 'square', 0.22);
        this.playBass(sNote / 2, 0.08);
      }
    }
  }

  playVictoryFanfare() {
    this.stopMusic();
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const fanfare = [
      { f: 523, d: 0.12, delay: 0 },
      { f: 659, d: 0.12, delay: 0.12 },
      { f: 784, d: 0.12, delay: 0.24 },
      { f: 1046, d: 0.35, delay: 0.36 },
      { f: 880, d: 0.15, delay: 0.75 },
      { f: 1046, d: 0.6, delay: 0.92 }
    ];

    fanfare.forEach((n) => {
      setTimeout(() => {
        this.playTone(n.f, n.d, 'square', 0.28);
        this.playTone(n.f * 1.5, n.d, 'sine', 0.12);
        this.playJingleBell(this.ctx.currentTime, 0.2);
      }, n.delay * 1000);
    });
  }

  playGameOver() {
    this.stopMusic();
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const notes = [
      { f: 523, d: 0.18, delay: 0 },
      { f: 392, d: 0.18, delay: 0.2 },
      { f: 330, d: 0.25, delay: 0.4 },
      { f: 440, d: 0.18, delay: 0.7 },
      { f: 494, d: 0.18, delay: 0.9 },
      { f: 440, d: 0.18, delay: 1.1 },
      { f: 415, d: 0.25, delay: 1.3 },
      { f: 466, d: 0.25, delay: 1.6 },
      { f: 392, d: 0.5, delay: 1.9 }
    ];

    notes.forEach((n) => {
      setTimeout(() => {
        this.playTone(n.f, n.d, 'triangle', 0.25);
      }, n.delay * 1000);
    });
  }
}

// Global audio singleton
const Sound = new SoundEngine();
