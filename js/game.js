/**
 * Super Mario Winter - Core Game Engine & Main Loop
 */

class Engine {
  constructor() {
    Engine.instance = this;
    window.Engine = Engine;
    window.GameEngine = this;

    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;

    // Fixed virtual retro resolution
    this.VIEW_WIDTH = 320;
    this.VIEW_HEIGHT = 240;

    this.canvas.width = this.VIEW_WIDTH;
    this.canvas.height = this.VIEW_HEIGHT;

    // Game State
    this.state = 'TITLE'; // 'TITLE', 'INTRO', 'PLAYING', 'FLAG', 'CLEAR', 'GAMEOVER', 'VICTORY', 'PAUSED'
    this.stateTimer = 0;
    this.currentWorldId = '1-1';

    // Player & Level
    this.player = null;
    this.level = null;
    this.cameraX = 0;

    // HUD Stats
    this.score = 0;
    this.coins = 0;
    this.lives = 3;
    this.timeLeft = 400;
    this.timeCounter = 0;
    this.highScore = parseInt(localStorage.getItem('mario_winter_hi') || '0', 10);

    // Entities & Effects
    this.enemies = [];
    this.items = [];
    this.blockCoins = [];
    this.projectiles = [];
    this.particles = new ParticleSystem();

    // Input States
    this.input = {
      left: false,
      right: false,
      up: false,
      down: false,
      jump: false,
      run: false,
      shootPressed: false
    };

    // Cutscene helpers
    this.flagFireworksCount = 0;
    this.fireworkTimer = 0;

    this.setupInputs();
    this.lastTime = performance.now();
  }

  start() {
    initSprites();
    requestAnimationFrame((t) => this.loop(t));
  }

  // --- Input Management ---
  setupInputs() {
    const keyMap = {
      'ArrowLeft': 'left',
      'KeyA': 'left',
      'ArrowRight': 'right',
      'KeyD': 'right',
      'ArrowUp': 'up',
      'KeyW': 'up',
      'ArrowDown': 'down',
      'KeyS': 'down',
      'Space': 'jump',
      'KeyZ': 'jump',
      'ShiftLeft': 'run',
      'ShiftRight': 'run',
      'KeyX': 'run',
      'KeyF': 'run',
      'KeyC': 'run'
    };

    window.addEventListener('keydown', (e) => {
      Sound.ensureContext();

      if (e.code === 'KeyP' || e.code === 'Escape') {
        this.togglePause();
        return;
      }

      if (e.code === 'KeyM') {
        const isMuted = Sound.toggleMute();
        const muteBtn = document.getElementById('btn-mute');
        if (muteBtn) muteBtn.textContent = isMuted ? '🔇 SOUND OFF' : '🔊 SOUND ON';
        return;
      }

      if (e.code === 'KeyR') {
        if (this.state === 'PLAYING' || this.state === 'GAMEOVER') {
          this.loadLevel(this.currentWorldId);
          this.state = 'INTRO';
          this.stateTimer = 60;
        }
        return;
      }

      if (this.state === 'TITLE') {
        if (e.code === 'Space' || e.code === 'Enter') {
          this.startNewGame();
        }
        return;
      }

      if (this.state === 'GAMEOVER' || this.state === 'VICTORY') {
        if (e.code === 'Space' || e.code === 'Enter') {
          this.state = 'TITLE';
        }
        return;
      }

      const action = keyMap[e.code];
      if (action) {
        if (action === 'run' && !this.input.run) {
          this.input.shootPressed = true;
        }
        this.input[action] = true;
      }
    });

    window.addEventListener('keyup', (e) => {
      const action = keyMap[e.code];
      if (action) {
        this.input[action] = false;
      }
    });

    // Canvas click to start or unpause
    this.canvas.addEventListener('click', () => {
      Sound.ensureContext();
      if (this.state === 'PAUSED') {
        this.togglePause();
      } else if (this.state === 'TITLE') {
        this.startNewGame();
      } else if (this.state === 'GAMEOVER' || this.state === 'VICTORY') {
        this.state = 'TITLE';
      }
    });

    // Pause button handlers (mobile on-screen, mobile touch-bar, and marquee)
    const triggerPause = (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.togglePause();
    };

    const btnScreenPause = document.getElementById('btn-screen-pause');
    if (btnScreenPause) {
      btnScreenPause.addEventListener('click', triggerPause);
      btnScreenPause.addEventListener('touchstart', triggerPause, { passive: false });
    }

    const btnTouchPause = document.getElementById('btn-touch-pause');
    if (btnTouchPause) {
      btnTouchPause.addEventListener('click', triggerPause);
      btnTouchPause.addEventListener('touchstart', triggerPause, { passive: false });
    }

    const btnHeaderPause = document.getElementById('btn-pause');
    if (btnHeaderPause) {
      btnHeaderPause.addEventListener('click', triggerPause);
    }

    // Mute button click
    const muteBtn = document.getElementById('btn-mute');
    if (muteBtn) {
      muteBtn.addEventListener('click', () => {
        Sound.ensureContext();
        const isMuted = Sound.toggleMute();
        muteBtn.textContent = isMuted ? '🔇 SOUND OFF' : '🔊 SOUND ON';
      });
    }

    // Touch controls setup
    const bindTouch = (id, action) => {
      const el = document.getElementById(id);
      if (!el) return;

      const triggerStart = (e) => {
        e.preventDefault();
        Sound.ensureContext();
        if (this.state === 'TITLE') {
          this.startNewGame();
          return;
        }
        if (action === 'run') this.input.shootPressed = true;
        this.input[action] = true;
        el.classList.add('active');
      };

      const triggerEnd = (e) => {
        e.preventDefault();
        this.input[action] = false;
        el.classList.remove('active');
      };

      el.addEventListener('touchstart', triggerStart, { passive: false });
      el.addEventListener('touchend', triggerEnd, { passive: false });
      el.addEventListener('mousedown', triggerStart);
      el.addEventListener('mouseup', triggerEnd);
      el.addEventListener('mouseleave', triggerEnd);
    };

    bindTouch('btn-left', 'left');
    bindTouch('btn-right', 'right');
    bindTouch('btn-up', 'up');
    bindTouch('btn-down', 'down');
    bindTouch('btn-jump', 'jump');
    bindTouch('btn-action', 'run');
  }

  togglePause() {
    Sound.ensureContext();
    if (this.state === 'PLAYING') {
      this.state = 'PAUSED';
      this.updatePauseUI(true);
    } else if (this.state === 'PAUSED') {
      this.state = 'PLAYING';
      this.updatePauseUI(false);
    }
  }

  updatePauseUI(isPaused) {
    const screenPauseBtn = document.getElementById('btn-screen-pause');
    if (screenPauseBtn) {
      screenPauseBtn.textContent = isPaused ? '▶️' : '⏸️';
      screenPauseBtn.title = isPaused ? 'Resume Game (P)' : 'Pause Game (P)';
      screenPauseBtn.classList.toggle('active', isPaused);
    }

    const touchPauseBtn = document.getElementById('btn-touch-pause');
    if (touchPauseBtn) {
      const icon = touchPauseBtn.querySelector('.pause-icon');
      const text = touchPauseBtn.querySelector('.pause-text');
      if (icon) icon.textContent = isPaused ? '▶️' : '⏸️';
      if (text) text.textContent = isPaused ? 'RESUME' : 'PAUSE';
      touchPauseBtn.classList.toggle('active', isPaused);
    }

    const headerPauseBtn = document.getElementById('btn-pause');
    if (headerPauseBtn) {
      headerPauseBtn.textContent = isPaused ? '▶️ RESUME' : '⏸️ PAUSE';
    }
  }

  // --- Game Flow Methods ---
  startNewGame() {
    this.score = 0;
    this.coins = 0;
    this.lives = 3;
    this.currentWorldId = '1-1';
    this.loadLevel(this.currentWorldId);
    this.state = 'INTRO';
    this.stateTimer = 110;
  }

  loadLevel(worldId) {
    const data = LEVEL_DATA[worldId];
    if (!data) return;

    this.level = new Level(data);
    this.player = new Mario(40, 180);
    this.cameraX = 0;
    this.timeLeft = data.timeLimit || 400;
    this.timeCounter = 0;
    this.updatePauseUI(false);

    // Reset entities
    this.items = [];
    this.blockCoins = [];
    this.projectiles = [];
    this.enemies = [];

    // Spawn level enemies
    for (const e of data.enemies) {
      if (e.type === 'goomba') {
        this.enemies.push(new Goomba(e.x, e.y));
      } else if (e.type === 'koopa') {
        this.enemies.push(new Koopa(e.x, e.y));
      } else if (e.type === 'bowser') {
        this.enemies.push(new FrostBowser(e.x, e.y));
      }
    }

    Sound.startMusic(this.level.musicTrack);
  }

  warpTo(targetWorldId) {
    if (targetWorldId === '1-1-return') {
      this.loadLevel('1-1');
      this.player.x = 64 * 16;
      this.player.y = 10 * 16;
      this.cameraX = 55 * 16;
    } else {
      this.loadLevel(targetWorldId);
    }
  }

  addScore(pts) {
    this.score += pts;
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('mario_winter_hi', this.highScore.toString());
    }
  }

  addCoin() {
    this.coins++;
    if (this.coins >= 100) {
      this.coins -= 100;
      this.lives++;
      Sound.play1Up();
    }
  }

  addBlockCoin(x, y) {
    this.blockCoins.push(new BlockCoin(x, y));
  }

  addItem(x, y, type) {
    this.items.push(new Item(x, y, type));
  }

  shootSnowball() {
    if (this.player.state !== 'frost') return;
    if (this.projectiles.length >= 2) return; // Limit 2

    const dir = this.player.facing;
    const startX = dir === 1 ? this.player.x + this.player.w + 2 : this.player.x - 10;
    const startY = this.player.y + 10;

    this.projectiles.push(new Snowball(startX, startY, dir));
    Sound.playSnowball();
    this.particles.addSnowPuff(startX, startY, 3);
  }

  // --- Main Update Loop ---
  update() {
    if (this.state === 'INTRO') {
      this.stateTimer--;
      if (this.stateTimer <= 0) {
        this.state = 'PLAYING';
      }
      return;
    }

    if (this.state === 'PAUSED' || this.state === 'TITLE' || this.state === 'GAMEOVER' || this.state === 'VICTORY') {
      return;
    }

    // Timer countdown
    this.timeCounter++;
    if (this.timeCounter >= 60) {
      this.timeCounter = 0;
      if (this.timeLeft > 0) this.timeLeft--;
      if (this.timeLeft === 0 && !this.player.isDead) {
        this.player.die();
      }
    }

    // Check shoot snowball
    if (this.input.shootPressed) {
      this.input.shootPressed = false;
      this.shootSnowball();
    }

    // Update Player
    this.player.update(this.input, this.level, this.particles, Sound);

    // Death handling
    if (this.player.isDead && this.player.deathTimer <= 0) {
      this.lives--;
      if (this.lives <= 0) {
        this.state = 'GAMEOVER';
        Sound.playGameOver();
      } else {
        this.loadLevel(this.currentWorldId);
        this.state = 'INTRO';
        this.stateTimer = 90;
      }
      return;
    }

    // Camera following Mario smoothly (both left and right)
    const rightThreshold = this.VIEW_WIDTH * 0.50;
    const leftThreshold = this.VIEW_WIDTH * 0.30;

    if (this.player.x - this.cameraX > rightThreshold) {
      this.cameraX = this.player.x - rightThreshold;
    } else if (this.player.x - this.cameraX < leftThreshold) {
      this.cameraX = this.player.x - leftThreshold;
    }

    // Clamp camera within level bounds
    if (this.cameraX < 0) this.cameraX = 0;
    const maxCameraX = Math.max(0, this.level.pixelWidth - this.VIEW_WIDTH);
    if (this.cameraX > maxCameraX) this.cameraX = maxCameraX;

    // Check Flagpole Collision (Level Win)
    if (this.level.flagpole && !this.player.onPole && !this.player.reachCabin) {
      if (
        this.player.x + this.player.w >= this.level.flagpole.x &&
        this.player.x <= this.level.flagpole.x + 10 &&
        this.player.y + this.player.h >= this.level.flagpole.topY
      ) {
        this.triggerFlagWin();
      }
    }

    // Check Castle Axe Collision (Bowser defeat)
    if (this.level.axe && Physics.rectsIntersect(this.player, this.level.axe)) {
      this.triggerCastleWin();
    }

    // Flagpole sequence progression
    if (this.state === 'FLAG') {
      if (this.level.cabin && this.player.reachCabin && this.player.x >= this.level.cabin.x + 28) {
        // Disappear inside cozy cabin
        this.player.vx = 0;
        this.state = 'CLEAR';
        this.stateTimer = 180;
        this.flagFireworksCount = 5;
      }
    }

    if (this.state === 'CLEAR') {
      this.fireworkTimer++;
      if (this.fireworkTimer % 30 === 0 && this.flagFireworksCount > 0 && this.level.cabin) {
        this.flagFireworksCount--;
        const fx = this.level.cabin.x - 20 + Math.random() * 80;
        const fy = 50 + Math.random() * 60;
        this.particles.addFirework(fx, fy);
        Sound.playFirework();
        this.addScore(500);
      }

      this.stateTimer--;
      if (this.stateTimer <= 0) {
        this.advanceToNextLevel();
      }
    }

    // Update Level interactive blocks
    this.level.update();

    // Check loose coins pickup in tilemap
    const pCol = Math.floor((this.player.x + this.player.w / 2) / 16);
    const pRow = Math.floor((this.player.y + this.player.h / 2) / 16);
    const centerTile = this.level.getTile(pCol, pRow);
    if (centerTile && centerTile.renderType === 'loose_coin') {
      centerTile.renderType = null;
      Sound.playCoin();
      this.addCoin();
      this.addScore(100);
      this.particles.addScoreText(pCol * 16, pRow * 16, '100');
    }

    // Update Enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      e.update(this.level, this.player, this.particles, this.enemies);

      // Player collision with enemy
      if (!e.isDead && !this.player.isDead && Physics.rectsIntersect(this.player, e)) {
        if (this.player.starTimer > 0) {
          // Invincible star kill!
          if (e.defeat) e.defeat(); else e.flipDefeat();
          this.addScore(200);
          this.particles.addScoreText(e.x, e.y, '200');
        } else if (
          this.player.vy > 0 &&
          this.player.y + this.player.h - this.player.vy <= e.y + 8 &&
          e.type !== 'bowser'
        ) {
          // Stomp on enemy head!
          e.stomp();
          this.player.vy = Physics.ENEMY_BOUNCE_FORCE;
          this.addScore(100);
          this.particles.addScoreText(e.x, e.y, '100');
        } else if (e.isShell && !e.isMovingShell) {
          // Kick dormant shell
          const kickDir = this.player.x < e.x ? 1 : -1;
          e.kick(kickDir);
        } else {
          // Mario takes damage
          this.player.takeDamage();
        }
      }

      // Remove offscreen dead enemies
      if (e.isDead && e.y > this.level.pixelHeight + 40) {
        this.enemies.splice(i, 1);
      }
    }

    // Update Items
    for (let i = this.items.length - 1; i >= 0; i--) {
      const item = this.items[i];
      item.update(this.level, this.player, this.particles);
      if (item.isCollected || item.y > this.level.pixelHeight + 40) {
        this.items.splice(i, 1);
      }
    }

    // Update Block Coins
    for (let i = this.blockCoins.length - 1; i >= 0; i--) {
      const bc = this.blockCoins[i];
      bc.update(this.particles);
      if (bc.isDone) this.blockCoins.splice(i, 1);
    }

    // Update Projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      proj.update(this.level, this.enemies, this.particles);
      if (proj.isDead || proj.y > this.level.pixelHeight + 40) {
        this.projectiles.splice(i, 1);
      }
    }

    // Update Particles & Snowflakes
    this.particles.update();
    this.particles.updateSnow(this.cameraX, this.VIEW_WIDTH, this.VIEW_HEIGHT);
  }

  triggerFlagWin() {
    this.state = 'FLAG';
    this.player.onPole = true;
    this.player.vx = 0;
    this.player.vy = 0;
    Sound.playFlagpole();
    setTimeout(() => {
      Sound.playVictoryFanfare();
      if (!this.level.cabin) {
        setTimeout(() => {
          this.advanceToNextLevel();
        }, 2200);
      }
    }, 800);
  }

  triggerCastleWin() {
    this.state = 'VICTORY';
    for (const e of this.enemies) {
      if (e.type === 'bowser') {
        e.defeat();
      }
    }
    Sound.playVictoryFanfare();
  }

  advanceToNextLevel() {
    const sequence = ['1-1', '1-2', '1-3', '1-4'];
    const curIdx = sequence.indexOf(this.currentWorldId);
    if (curIdx >= 0 && curIdx < sequence.length - 1) {
      this.currentWorldId = sequence[curIdx + 1];
      this.loadLevel(this.currentWorldId);
      this.state = 'INTRO';
      this.stateTimer = 100;
    } else {
      this.state = 'VICTORY';
      Sound.playVictoryFanfare();
    }
  }

  // --- Render System ---
  render() {
    this.ctx.clearRect(0, 0, this.VIEW_WIDTH, this.VIEW_HEIGHT);

    if (this.state === 'TITLE') {
      this.renderTitleScreen();
      return;
    }

    if (this.state === 'INTRO') {
      this.renderIntroScreen();
      return;
    }

    // 1. Draw Sky Gradient & Distant Mountain Silhouettes
    this.renderBackground();

    // 2. Draw Level Tiles & Scenery
    if (this.level) {
      this.level.render(this.ctx, this.cameraX, this.VIEW_WIDTH, this.VIEW_HEIGHT);
    }

    // 3. Draw Items
    for (const item of this.items) {
      item.render(this.ctx, this.cameraX);
    }

    // 4. Draw Block Coins
    for (const bc of this.blockCoins) {
      bc.render(this.ctx, this.cameraX);
    }

    // 5. Draw Projectiles
    for (const proj of this.projectiles) {
      proj.render(this.ctx, this.cameraX);
    }

    // 6. Draw Enemies
    for (const enemy of this.enemies) {
      enemy.render(this.ctx, this.cameraX);
    }

    // 7. Draw Player
    if (this.player && !(this.state === 'CLEAR' && this.player.reachCabin)) {
      this.player.render(this.ctx, this.cameraX);
    }

    // 8. Draw Particles & Falling Snowflakes
    this.particles.render(this.ctx, this.cameraX);
    this.particles.renderSnow(this.ctx, this.cameraX);

    // 9. Draw Retro HUD Overlay
    this.renderHUD();

    // 10. Pause / Win / Over Screen Overlays
    if (this.state === 'PAUSED') {
      this.renderPauseOverlay();
    } else if (this.state === 'GAMEOVER') {
      this.renderGameOverScreen();
    } else if (this.state === 'VICTORY') {
      this.renderVictoryScreen();
    }
  }

  renderBackground() {
    // Sky gradient
    const grad = this.ctx.createLinearGradient(0, 0, 0, this.VIEW_HEIGHT);
    grad.addColorStop(0, this.level.skyTop);
    grad.addColorStop(1, this.level.skyBot);
    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, 0, this.VIEW_WIDTH, this.VIEW_HEIGHT);

    // Parallax Snowy Mountain Peaks
    if (this.level.theme === 'overworld') {
      this.ctx.save();
      const mountainOffset = -((this.cameraX * 0.2) % 140);
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';

      for (let i = 0; i < 4; i++) {
        const mx = mountainOffset + i * 140;
        this.ctx.beginPath();
        this.ctx.moveTo(mx, 200);
        this.ctx.lineTo(mx + 70, 90);
        this.ctx.lineTo(mx + 140, 200);
        this.ctx.closePath();
        this.ctx.fill();

        // Snow Cap on Mountain
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        this.ctx.beginPath();
        this.ctx.moveTo(mx + 50, 120);
        this.ctx.lineTo(mx + 70, 90);
        this.ctx.lineTo(mx + 90, 120);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      }
      this.ctx.restore();
    }
  }

  renderHUD() {
    this.ctx.save();
    this.ctx.font = '8px "Press Start 2P", monospace';
    this.ctx.fillStyle = '#ffffff';
    this.ctx.shadowColor = '#000000';
    this.ctx.shadowBlur = 2;

    // Line 1: Labels
    this.ctx.fillText('MARIO', 24, 16);
    this.ctx.fillText('WORLD', 140, 16);
    this.ctx.fillText('TIME', 256, 16);

    // Line 2: Values
    const scoreStr = this.score.toString().padStart(6, '0');
    this.ctx.fillText(scoreStr, 24, 28);

    // Coins with spinning coin icon
    const frame = Math.floor(Date.now() / 150) % 4;
    const coinSprite = Sprites.get(`coin_${frame}`);
    if (coinSprite) {
      this.ctx.drawImage(coinSprite, 84, 19, 10, 10);
    }
    const coinStr = 'x' + this.coins.toString().padStart(2, '0');
    this.ctx.fillText(coinStr, 98, 28);

    // World & Time
    this.ctx.fillText(this.currentWorldId, 148, 28);
    const timeStr = this.timeLeft.toString().padStart(3, '0');
    this.ctx.fillText(timeStr, 264, 28);

    this.ctx.restore();
  }

  renderTitleScreen() {
    // Title background: cozy snowy night
    const grad = this.ctx.createLinearGradient(0, 0, 0, this.VIEW_HEIGHT);
    grad.addColorStop(0, '#0a1128');
    grad.addColorStop(1, '#1c2541');
    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, 0, this.VIEW_WIDTH, this.VIEW_HEIGHT);

    // Drifting snow
    this.particles.updateSnow(0, this.VIEW_WIDTH, this.VIEW_HEIGHT);
    this.particles.renderSnow(this.ctx, 0);

    // Ground snow bank
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 200, this.VIEW_WIDTH, 40);

    // Decorative Snowman & Pine Tree
    const treeSprite = Sprites.get('scenery_pine_tree');
    if (treeSprite) this.ctx.drawImage(treeSprite, 20, 152);
    const snowmanSprite = Sprites.get('scenery_snowman');
    if (snowmanSprite) this.ctx.drawImage(snowmanSprite, 260, 168);

    // Small Mario standing cheerfully
    const marioSprite = Sprites.get('mario_small_idle');
    if (marioSprite) this.ctx.drawImage(marioSprite, 150, 184);

    this.ctx.save();
    this.ctx.font = '16px "Press Start 2P", monospace';
    this.ctx.fillStyle = '#e63946';
    this.ctx.textAlign = 'center';
    this.ctx.shadowColor = '#0077b6';
    this.ctx.shadowBlur = 8;
    this.ctx.fillText('SUPER MARIO', 160, 60);

    this.ctx.font = '20px "Press Start 2P", monospace';
    this.ctx.fillStyle = '#a0e4f1';
    this.ctx.fillText('WINTER', 160, 88);

    this.ctx.font = '7px "Press Start 2P", monospace';
    this.ctx.fillStyle = '#ffffff';
    this.ctx.shadowBlur = 2;
    this.ctx.fillText('❄ THE HOLIDAY ADVENTURE ❄', 160, 108);

    // Blinking prompt
    if (Math.floor(Date.now() / 450) % 2 === 0) {
      this.ctx.fillStyle = '#ffbe0b';
      this.ctx.fillText('PRESS SPACE OR ENTER TO START', 160, 145);
    }

    this.ctx.fillStyle = '#94a3b8';
    this.ctx.font = '7px "Press Start 2P", monospace';
    this.ctx.fillText(`TOP SCORE: ${this.highScore.toString().padStart(6, '0')}`, 160, 165);

    this.ctx.restore();
  }

  renderIntroScreen() {
    this.ctx.fillStyle = '#050c1a';
    this.ctx.fillRect(0, 0, this.VIEW_WIDTH, this.VIEW_HEIGHT);

    this.ctx.save();
    this.ctx.font = '11px "Press Start 2P", monospace';
    this.ctx.fillStyle = '#ffffff';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`WORLD ${this.currentWorldId}`, 160, 100);

    const marioSprite = Sprites.get('mario_small_idle');
    if (marioSprite) {
      this.ctx.drawImage(marioSprite, 130, 120);
    }

    this.ctx.fillText(`x  ${this.lives}`, 175, 133);
    this.ctx.restore();
  }

  renderPauseOverlay() {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    this.ctx.fillRect(0, 0, this.VIEW_WIDTH, this.VIEW_HEIGHT);

    this.ctx.save();
    this.ctx.font = '14px "Press Start 2P", monospace';
    this.ctx.fillStyle = '#ffffff';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('PAUSED', 160, 115);
    this.ctx.font = '7px "Press Start 2P", monospace';
    this.ctx.fillStyle = '#a0e4f1';
    this.ctx.fillText('PRESS P, ESC OR TAP TO RESUME', 160, 138);
    this.ctx.restore();
  }

  renderGameOverScreen() {
    this.ctx.fillStyle = 'rgba(5, 12, 26, 0.9)';
    this.ctx.fillRect(0, 0, this.VIEW_WIDTH, this.VIEW_HEIGHT);

    this.ctx.save();
    this.ctx.font = '16px "Press Start 2P", monospace';
    this.ctx.fillStyle = '#e63946';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('GAME OVER', 160, 100);

    this.ctx.font = '8px "Press Start 2P", monospace';
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillText(`SCORE: ${this.score}`, 160, 130);

    if (Math.floor(Date.now() / 450) % 2 === 0) {
      this.ctx.fillStyle = '#ffbe0b';
      this.ctx.fillText('PRESS SPACE TO RETRY', 160, 160);
    }
    this.ctx.restore();
  }

  renderVictoryScreen() {
    this.ctx.fillStyle = 'rgba(10, 17, 40, 0.92)';
    this.ctx.fillRect(0, 0, this.VIEW_WIDTH, this.VIEW_HEIGHT);

    this.particles.updateSnow(0, this.VIEW_WIDTH, this.VIEW_HEIGHT);
    this.particles.renderSnow(this.ctx, 0);

    this.ctx.save();
    this.ctx.font = '14px "Press Start 2P", monospace';
    this.ctx.fillStyle = '#ffbe0b';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('CONGRATULATIONS!', 160, 60);

    this.ctx.font = '8px "Press Start 2P", monospace';
    this.ctx.fillStyle = '#a0e4f1';
    this.ctx.fillText('YOU SAVED THE WINTER KINGDOM!', 160, 85);

    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillText(`FINAL SCORE: ${this.score}`, 160, 115);
    this.ctx.fillText(`COINS COLLECTED: ${this.coins}`, 160, 135);

    if (Math.floor(Date.now() / 450) % 2 === 0) {
      this.ctx.fillStyle = '#e63946';
      this.ctx.fillText('PRESS SPACE FOR TITLE', 160, 170);
    }
    this.ctx.restore();
  }

  // --- Main Animation Frame Loop ---
  loop(currentTime) {
    requestAnimationFrame((t) => this.loop(t));

    // Cap delta time to prevent physics tunneling
    const dt = Math.min(currentTime - this.lastTime, 50);
    this.lastTime = currentTime;

    this.update();
    this.render();
  }
}

// Global Game Engine instance
let GameEngine = null;
window.addEventListener('DOMContentLoaded', () => {
  GameEngine = new Engine();
  GameEngine.start();
});
