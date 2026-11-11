/**
 * Super Mario Winter - Entities Module
 * Player, Enemies, Items, Bosses, and Particle Systems
 */

// ==========================================
// 1. PARTICLES & VISUAL EFFECTS
// ==========================================

class ParticleSystem {
  constructor() {
    this.particles = [];
    this.snowflakes = [];
    this.initSnowflakes(80);
  }

  initSnowflakes(count) {
    this.snowflakes = [];
    for (let i = 0; i < count; i++) {
      this.snowflakes.push({
        x: Math.random() * 500,
        y: Math.random() * 300,
        vx: (Math.random() - 0.5) * 0.4 + 0.3,
        vy: Math.random() * 0.8 + 0.5,
        size: Math.random() * 2 + 1,
        swaySpeed: Math.random() * 0.05 + 0.02,
        swayAmp: Math.random() * 1.5 + 0.5,
        angle: Math.random() * Math.PI * 2,
        alpha: Math.random() * 0.5 + 0.5
      });
    }
  }

  updateSnow(cameraX, viewportWidth, viewportHeight) {
    for (const s of this.snowflakes) {
      s.angle += s.swaySpeed;
      s.x += s.vx + Math.sin(s.angle) * s.swayAmp * 0.2;
      s.y += s.vy;

      // Wrap around viewport
      if (s.y > viewportHeight) {
        s.y = -5;
        s.x = cameraX + Math.random() * viewportWidth;
      }
      if (s.x < cameraX - 20) {
        s.x = cameraX + viewportWidth + 20;
      } else if (s.x > cameraX + viewportWidth + 20) {
        s.x = cameraX - 20;
      }
    }
  }

  renderSnow(ctx, cameraX) {
    ctx.save();
    for (const s of this.snowflakes) {
      ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha})`;
      ctx.fillRect(Math.floor(s.x - cameraX), Math.floor(s.y), s.size, s.size);
    }
    ctx.restore();
  }

  addSnowPuff(x, y, count = 3) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        type: 'snow_puff',
        x: x + (Math.random() - 0.5) * 6,
        y: y + (Math.random() - 0.5) * 4,
        vx: (Math.random() - 0.5) * 1.2,
        vy: -Math.random() * 1.2 - 0.3,
        size: Math.random() * 2 + 1.5,
        life: 1.0,
        decay: 0.05
      });
    }
  }

  addBrickShards(x, y) {
    const velocities = [
      { vx: -1.6, vy: -4.5 },
      { vx: 1.6, vy: -4.5 },
      { vx: -2.2, vy: -2.8 },
      { vx: 2.2, vy: -2.8 }
    ];
    for (const v of velocities) {
      this.particles.push({
        type: 'brick_shard',
        x: x + 4,
        y: y + 4,
        vx: v.vx,
        vy: v.vy,
        angle: 0,
        vAngle: (Math.random() - 0.5) * 0.4,
        life: 1.0,
        decay: 0.02
      });
    }
  }

  addScoreText(x, y, text) {
    this.particles.push({
      type: 'score_text',
      x: x,
      y: y,
      text: text,
      vy: -1.0,
      life: 1.0,
      decay: 0.025
    });
  }

  addFirework(x, y) {
    const colors = ['#ffbe0b', '#fb5607', '#ff006e', '#8338ec', '#3a86ff', '#ffffff'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    for (let i = 0; i < 24; i++) {
      const angle = (Math.PI * 2 / 24) * i;
      const speed = Math.random() * 2.5 + 1.2;
      this.particles.push({
        type: 'spark',
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: color,
        life: 1.0,
        decay: 0.02 + Math.random() * 0.02
      });
    }
  }

  update() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx || 0;
      p.y += p.vy || 0;
      if (p.type === 'brick_shard' || p.type === 'spark') {
        p.vy += 0.15; // Gravity
        if (p.angle !== undefined) p.angle += p.vAngle;
      }
      p.life -= p.decay;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  render(ctx, cameraX) {
    for (const p of this.particles) {
      const screenX = Math.floor(p.x - cameraX);
      const screenY = Math.floor(p.y);

      if (p.type === 'snow_puff') {
        ctx.fillStyle = `rgba(240, 248, 255, ${p.life})`;
        ctx.fillRect(screenX, screenY, p.size, p.size);
      } else if (p.type === 'brick_shard') {
        const sprite = Sprites.get('brick_shard');
        if (sprite) {
          ctx.save();
          ctx.translate(screenX + 4, screenY + 4);
          ctx.rotate(p.angle);
          ctx.drawImage(sprite, -4, -4);
          ctx.restore();
        }
      } else if (p.type === 'spark') {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.fillRect(screenX, screenY, 2, 2);
        ctx.globalAlpha = 1.0;
      } else if (p.type === 'score_text') {
        ctx.save();
        ctx.font = '8px "Press Start 2P", monospace';
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 2;
        ctx.globalAlpha = p.life;
        ctx.fillText(p.text, screenX, screenY);
        ctx.restore();
      }
    }
  }
}

// ==========================================
// 2. PLAYER ENTITY (MARIO)
// ==========================================

class Mario {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.w = 14;
    this.h = 16;
    this.vx = 0;
    this.vy = 0;
    this.facing = 1; // 1 = right, -1 = left

    // States: 'small', 'super', 'frost'
    this.state = 'small';
    this.isDead = false;
    this.deathTimer = 0;
    this.grounded = false;
    this.isCrouching = false;
    this.isSkidding = false;

    // Timers & Power status
    this.invulnerableTimer = 0; // Grace period after damage
    this.starTimer = 0;         // Starman invincibility
    this.starFlash = 0;

    // Animation helpers
    this.animTimer = 0;
    this.walkFrame = 0;

    // Special Cutscene States
    this.isEnteringPipe = false;
    this.pipeDirection = null; // 'down', 'right'
    this.pipeTimer = 0;
    this.onPole = false;
    this.reachCabin = false;
  }

  get isSuper() {
    return this.state === 'super' || this.state === 'frost';
  }

  powerUp(type) {
    if (type === 'mushroom') {
      if (this.state === 'small') {
        this.state = 'super';
        this.y -= 16;
        this.h = 32;
        Sound.playPowerupCollect();
      }
    } else if (type === 'flower') {
      if (this.state === 'small') {
        this.y -= 16;
        this.h = 32;
      }
      this.state = 'frost';
      Sound.playPowerupCollect();
    } else if (type === 'star') {
      this.starTimer = 600; // ~10 seconds at 60fps
      Sound.startMusic('star');
    }
  }

  takeDamage() {
    if (this.invulnerableTimer > 0 || this.isDead || this.starTimer > 0) return;

    if (this.isSuper) {
      this.state = 'small';
      this.h = 16;
      this.invulnerableTimer = 120; // 2 seconds flashing grace
      Sound.playBlockBump();
    } else {
      this.die();
    }
  }

  die() {
    if (this.isDead) return;
    this.isDead = true;
    this.deathTimer = 180;
    this.vx = 0;
    this.vy = -7.5;
    Sound.playDie();
  }

  update(input, level, particles, sound) {
    if (this.isDead) {
      this.vy += Physics.GRAVITY;
      this.y += this.vy;
      this.deathTimer--;
      return;
    }

    // Flagpole cutscene animation
    if (this.onPole) {
      this.y += 2.0;
      if (this.y >= level.flagBaseY - this.h) {
        this.y = level.flagBaseY - this.h;
        this.onPole = false;
        this.reachCabin = true;
      }
      return;
    }

    // Walking to cozy cabin after flag
    if (this.reachCabin) {
      this.vx = 1.2;
      this.facing = 1;
      this.x += this.vx;
      this.animTimer++;
      if (this.animTimer % 8 === 0) {
        this.walkFrame = (this.walkFrame + 1) % 3;
      }
      return;
    }

    // Pipe descent animation
    if (this.isEnteringPipe) {
      this.pipeTimer--;
      if (this.pipeDirection === 'down') {
        this.y += 0.8;
      }
      if (this.pipeTimer <= 0) {
        this.isEnteringPipe = false;
        level.executePipeWarp(this);
      }
      return;
    }

    // Decrement timers
    if (this.invulnerableTimer > 0) this.invulnerableTimer--;
    if (this.starTimer > 0) {
      this.starTimer--;
      this.starFlash++;
      if (this.starTimer === 0) {
        sound.startMusic(level.musicTrack || 'overworld');
      }
    }

    // Crouch handling
    this.isCrouching = this.isSuper && input.down && this.grounded;

    // Horizontal Movement
    const maxSpeed = input.run ? Physics.RUN_SPEED : Physics.WALK_SPEED;
    const accel = input.run ? Physics.RUN_ACCEL : Physics.WALK_ACCEL;

    if (!this.isCrouching) {
      if (input.right) {
        this.facing = 1;
        if (this.vx < 0) {
          // Skidding turnaround
          this.isSkidding = true;
          this.vx += Physics.SKID_DECEL;
          if (this.grounded && Math.random() < 0.35) {
            particles.addSnowPuff(this.x + 4, this.y + this.h, 1);
          }
        } else {
          this.isSkidding = false;
          this.vx = Math.min(maxSpeed, this.vx + accel);
        }
      } else if (input.left) {
        this.facing = -1;
        if (this.vx > 0) {
          // Skidding turnaround
          this.isSkidding = true;
          this.vx -= Physics.SKID_DECEL;
          if (this.grounded && Math.random() < 0.35) {
            particles.addSnowPuff(this.x + 10, this.y + this.h, 1);
          }
        } else {
          this.isSkidding = false;
          this.vx = Math.max(-maxSpeed, this.vx - accel);
        }
      } else {
        this.isSkidding = false;
        // Friction on ground
        if (this.grounded) {
          const friction = level.isIceLevel ? Physics.ICE_FRICTION : Physics.FRICTION;
          this.vx *= friction;
          if (Math.abs(this.vx) < 0.05) this.vx = 0;
        }
      }
    } else {
      this.vx *= 0.85;
      if (Math.abs(this.vx) < 0.05) this.vx = 0;
    }

    // Jumping
    if (input.jump && this.grounded && !this.isCrouching) {
      const jumpImpulse = this.isSuper ? Physics.SUPER_JUMP_FORCE : Physics.JUMP_FORCE;
      this.vy = jumpImpulse;
      this.grounded = false;
      sound.playJump(this.isSuper);
      particles.addSnowPuff(this.x + 7, this.y + this.h, 4);
    }

    // Variable jump height: low gravity when rising and jump button held
    if (this.vy < 0 && input.jump) {
      this.vy += Physics.LOW_GRAVITY;
    } else {
      this.vy += Physics.GRAVITY;
    }

    // Terminal velocity
    if (this.vy > Physics.MAX_FALL_SPEED) {
      this.vy = Physics.MAX_FALL_SPEED;
    }

    // Apply movement with tile collisions
    Physics.moveHorizontal(this, level);
    Physics.moveVertical(this, level);

    // Fall in pit death
    if (this.y > level.heightInTiles * 16 + 40) {
      this.die();
    }

    // Animation frame cycling
    if (this.grounded) {
      if (Math.abs(this.vx) > 0.2) {
        this.animTimer += Math.abs(this.vx);
        if (this.animTimer > 8) {
          this.walkFrame = (this.walkFrame + 1) % 3;
          this.animTimer = 0;
        }
      } else {
        this.walkFrame = 0;
      }
    }

    // Enter pipe check (Pressing Down on candy pipe)
    if (input.down && this.grounded) {
      level.checkPipeEntrance(this);
    }
  }

  onCeilingHit(collision) {
    // Bump block from below
    collision.tile.onBump?.(this);
  }

  render(ctx, cameraX) {
    if (this.invulnerableTimer > 0 && Math.floor(this.invulnerableTimer / 4) % 2 === 0) {
      // Invisible frame for damage flicker
      return;
    }

    const screenX = Math.floor(this.x - cameraX);
    const screenY = Math.floor(this.y);

    ctx.save();

    // Star rainbow flashing
    if (this.starTimer > 0) {
      const hues = [0, 60, 120, 180, 240, 300];
      const hue = hues[this.starFlash % hues.length];
      ctx.filter = `hue-rotate(${hue}deg) brightness(1.2)`;
    }

    // Flip sprite horizontally if facing left
    if (this.facing === -1) {
      ctx.translate(screenX + this.w, screenY);
      ctx.scale(-1, 1);
    } else {
      ctx.translate(screenX, screenY);
    }

    // Determine current sprite key
    let spriteName = 'mario_small_idle';

    if (this.isDead) {
      spriteName = 'mario_small_die';
    } else if (this.state === 'small') {
      if (!this.grounded) {
        spriteName = 'mario_small_jump';
      } else if (this.isSkidding) {
        spriteName = 'mario_small_skid';
      } else if (Math.abs(this.vx) > 0.1) {
        spriteName = this.walkFrame === 1 ? 'mario_small_walk1' : 'mario_small_walk2';
      } else {
        spriteName = 'mario_small_idle';
      }
    } else {
      // Super or Frost
      const prefix = this.state === 'frost' ? 'mario_frost_' : 'mario_super_';
      if (this.isCrouching) {
        spriteName = prefix + 'crouch';
      } else if (!this.grounded) {
        spriteName = prefix + 'jump';
      } else if (this.isSkidding) {
        spriteName = prefix + 'walk2';
      } else if (Math.abs(this.vx) > 0.1) {
        spriteName = this.walkFrame === 1 ? prefix + 'walk1' : prefix + 'walk2';
      } else {
        spriteName = prefix + 'idle';
      }
    }

    const sprite = Sprites.get(spriteName);
    if (sprite) {
      ctx.drawImage(sprite, 0, 0);
    }

    ctx.restore();
  }
}

// ==========================================
// 3. ENEMY ENTITIES
// ==========================================

class Goomba {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.w = 16;
    this.h = 16;
    this.vx = -0.65;
    this.vy = 0;
    this.grounded = false;
    this.isDead = false;
    this.flatTimer = 0;
    this.walkAnim = 0;
    this.type = 'goomba';
  }

  stomp() {
    this.isDead = true;
    this.flatTimer = 30; // Half second squished display
    this.vx = 0;
    Sound.playStomp();
  }

  flipDefeat() {
    this.isDead = true;
    this.flatTimer = 0;
    this.vy = -4.5;
    this.vx = 1.0;
    Sound.playKick();
  }

  update(level, player, particles) {
    if (this.isDead) {
      if (this.flatTimer > 0) {
        this.flatTimer--;
      } else {
        // Falling off-screen if flipped
        this.vy += Physics.GRAVITY;
        this.y += this.vy;
        this.x += this.vx;
      }
      return;
    }

    // Walking AI
    this.vy += Physics.GRAVITY;
    if (this.vy > Physics.MAX_FALL_SPEED) this.vy = Physics.MAX_FALL_SPEED;

    Physics.moveHorizontal(this, level);
    Physics.moveVertical(this, level);

    this.walkAnim += 0.08;
  }

  onWallHit(dir) {
    this.vx = -this.vx;
  }

  render(ctx, cameraX) {
    const screenX = Math.floor(this.x - cameraX);
    const screenY = Math.floor(this.y);

    let spriteName = 'goomba_walk1';
    if (this.isDead && this.flatTimer > 0) {
      spriteName = 'goomba_flat';
    } else if (Math.floor(this.walkAnim) % 2 === 1) {
      spriteName = 'goomba_walk2';
    }

    const sprite = Sprites.get(spriteName);
    if (sprite) {
      ctx.drawImage(sprite, screenX, screenY);
    }
  }
}

class Koopa {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.w = 16;
    this.h = 24;
    this.vx = -0.7;
    this.vy = 0;
    this.grounded = false;
    this.isShell = false;
    this.isMovingShell = false;
    this.isDead = false;
    this.walkAnim = 0;
    this.type = 'koopa';
  }

  stomp() {
    if (!this.isShell) {
      this.isShell = true;
      this.h = 16;
      this.y += 8;
      this.vx = 0;
      Sound.playStomp();
    } else {
      if (this.isMovingShell) {
        // Stop the shell
        this.isMovingShell = false;
        this.vx = 0;
        Sound.playStomp();
      } else {
        // Kick shell right
        this.kick(1);
      }
    }
  }

  kick(dir) {
    this.isMovingShell = true;
    this.vx = dir * 5.2;
    Sound.playKick();
  }

  flipDefeat() {
    this.isDead = true;
    this.vy = -4.5;
    this.vx = 1.0;
    Sound.playKick();
  }

  update(level, player, particles, enemies) {
    if (this.isDead) {
      this.vy += Physics.GRAVITY;
      this.y += this.vy;
      this.x += this.vx;
      return;
    }

    this.vy += Physics.GRAVITY;
    if (this.vy > Physics.MAX_FALL_SPEED) this.vy = Physics.MAX_FALL_SPEED;

    Physics.moveHorizontal(this, level);
    Physics.moveVertical(this, level);

    if (!this.isShell) {
      this.walkAnim += 0.08;
    }

    // If shell is sliding at high speed, destroy any enemy in its path!
    if (this.isMovingShell) {
      for (const enemy of enemies) {
        if (enemy !== this && !enemy.isDead && Physics.rectsIntersect(this, enemy)) {
          enemy.flipDefeat();
          particles.addScoreText(enemy.x, enemy.y, '100');
        }
      }
    }
  }

  onWallHit(dir) {
    this.vx = -this.vx;
    if (this.isMovingShell) {
      Sound.playBlockBump();
    }
  }

  render(ctx, cameraX) {
    const screenX = Math.floor(this.x - cameraX);
    const screenY = Math.floor(this.y);

    let spriteName = 'koopa_walk1';
    if (this.isShell) {
      spriteName = 'koopa_shell';
    } else if (Math.floor(this.walkAnim) % 2 === 1) {
      spriteName = 'koopa_walk2';
    }

    const sprite = Sprites.get(spriteName);
    if (sprite) {
      ctx.drawImage(sprite, screenX, screenY);
    }
  }
}

class PiranhaPlant {
  constructor(pipeX, pipeY) {
    this.x = pipeX + 8;
    this.pipeY = pipeY;
    this.y = pipeY;
    this.w = 16;
    this.h = 24;
    this.state = 'rising'; // 'rising', 'waiting', 'sinking', 'hidden'
    this.timer = 0;
    this.type = 'piranha';
    this.isDead = false;
  }

  update(level, player) {
    if (this.isDead) return;

    // Do not emerge if player is too close to pipe
    const distToPlayer = Math.abs((player.x + player.w / 2) - (this.x + 8));

    if (this.state === 'hidden') {
      this.timer++;
      if (this.timer > 80 && distToPlayer > 30) {
        this.state = 'rising';
        this.timer = 0;
      }
    } else if (this.state === 'rising') {
      this.y -= 0.6;
      if (this.y <= this.pipeY - 24) {
        this.y = this.pipeY - 24;
        this.state = 'waiting';
        this.timer = 0;
      }
    } else if (this.state === 'waiting') {
      this.timer++;
      if (this.timer > 90) {
        this.state = 'sinking';
      }
    } else if (this.state === 'sinking') {
      this.y += 0.6;
      if (this.y >= this.pipeY) {
        this.y = this.pipeY;
        this.state = 'hidden';
        this.timer = 0;
      }
    }
  }

  render(ctx, cameraX) {
    if (this.isDead || this.state === 'hidden') return;
    const screenX = Math.floor(this.x - cameraX);
    const screenY = Math.floor(this.y);

    const sprite = Sprites.get('piranha_open');
    if (sprite) {
      ctx.drawImage(sprite, screenX, screenY);
    }
  }
}

// ==========================================
// 4. FROST BOWSER (WORLD 1-4 BOSS)
// ==========================================

class FrostBowser {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.w = 32;
    this.h = 32;
    this.vx = -0.5;
    this.vy = 0;
    this.hp = 5;
    this.grounded = false;
    this.isDead = false;
    this.attackTimer = 0;
    this.jumpTimer = 0;
    this.type = 'bowser';
  }

  takeDamage() {
    this.hp--;
    Sound.playStomp();
    if (this.hp <= 0) {
      this.defeat();
    }
  }

  defeat() {
    this.isDead = true;
    this.vy = -4.0;
    this.vx = 0.5;
    Sound.playDie();
  }

  update(level, player, projectiles) {
    if (this.isDead) {
      this.vy += Physics.GRAVITY;
      this.y += this.vy;
      this.x += this.vx;
      return;
    }

    this.vy += Physics.GRAVITY;
    Physics.moveHorizontal(this, level);
    Physics.moveVertical(this, level);

    // Periodic breath attack: shoots Frost Fireball
    this.attackTimer++;
    if (this.attackTimer > 150) {
      this.attackTimer = 0;
      projectiles.push(new FrostFireball(this.x - 6, this.y + 10, -1));
      Sound.playSnowball();
    }

    // Periodic hops
    this.jumpTimer++;
    if (this.jumpTimer > 120 && this.grounded) {
      this.jumpTimer = 0;
      this.vy = -4.5;
      this.vx = -this.vx;
    }
  }

  onWallHit() {
    this.vx = -this.vx;
  }

  render(ctx, cameraX) {
    const screenX = Math.floor(this.x - cameraX);
    const screenY = Math.floor(this.y);

    const sprite = Sprites.get('frost_bowser');
    if (sprite) {
      ctx.drawImage(sprite, screenX, screenY);
    }
  }
}

// ==========================================
// 5. PROJECTILES & COLLECTIBLE ITEMS
// ==========================================

class Snowball {
  constructor(x, y, dir) {
    this.x = x;
    this.y = y;
    this.w = 8;
    this.h = 8;
    this.vx = dir * 4.6;
    this.vy = 2.0;
    this.isDead = false;
  }

  update(level, enemies, particles) {
    this.vy += Physics.GRAVITY * 1.2;
    this.x += this.vx;
    this.y += this.vy;

    // Bounce on ground
    const collisions = Physics.checkTileCollision(this, level);
    for (const c of collisions) {
      if (this.vy > 0) {
        this.y = c.y - this.h;
        this.vy = -3.8; // Bounce
      } else {
        this.isDead = true;
        Sound.playFreeze();
        particles.addSnowPuff(this.x, this.y, 4);
        return;
      }
    }

    // Check hit with enemies
    for (const e of enemies) {
      if (!e.isDead && Physics.rectsIntersect(this, e)) {
        this.isDead = true;
        if (e.takeDamage) {
          e.takeDamage();
        } else {
          e.flipDefeat();
        }
        Sound.playFreeze();
        particles.addSnowPuff(e.x + 8, e.y + 8, 8);
        particles.addScoreText(e.x, e.y, '100');
        break;
      }
    }
  }

  render(ctx, cameraX) {
    const sprite = Sprites.get('proj_snowball');
    if (sprite) {
      ctx.drawImage(sprite, Math.floor(this.x - cameraX), Math.floor(this.y));
    }
  }
}

class FrostFireball {
  constructor(x, y, dir) {
    this.x = x;
    this.y = y;
    this.w = 12;
    this.h = 10;
    this.vx = dir * 2.5;
    this.baseY = y;
    this.time = 0;
    this.isDead = false;
  }

  update(player) {
    this.time += 0.1;
    this.x += this.vx;
    this.y = this.baseY + Math.sin(this.time) * 12;

    if (Physics.rectsIntersect(this, player)) {
      player.takeDamage();
    }
  }

  render(ctx, cameraX) {
    ctx.save();
    ctx.fillStyle = '#48cae4';
    ctx.beginPath();
    ctx.arc(Math.floor(this.x - cameraX + 6), Math.floor(this.y + 5), 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(Math.floor(this.x - cameraX + 4), Math.floor(this.y + 3), 4, 4);
    ctx.restore();
  }
}

class Item {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.w = 16;
    this.h = 16;
    this.type = type; // 'mushroom', 'flower', 'star', '1up'
    this.vx = type === 'star' ? 1.6 : 1.2;
    this.vy = -3.0; // Emergence pop
    this.grounded = false;
    this.isCollected = false;
  }

  update(level, player, particles) {
    if (this.isCollected) return;

    if (this.type === 'flower') {
      // Flowers stay in place
      this.vy = 0;
    } else {
      this.vy += Physics.GRAVITY;
      if (this.type === 'star' && this.grounded) {
        this.vy = -4.5; // High star bounce!
      }
      Physics.moveHorizontal(this, level);
      Physics.moveVertical(this, level);
    }

    // Collect by player
    if (Physics.rectsIntersect(this, player)) {
      this.isCollected = true;
      if (this.type === '1up') {
        Sound.play1Up();
        particles.addScoreText(this.x, this.y, '1UP');
      } else {
        player.powerUp(this.type);
        particles.addScoreText(this.x, this.y, '1000');
      }
    }
  }

  onWallHit() {
    this.vx = -this.vx;
  }

  render(ctx, cameraX) {
    if (this.isCollected) return;
    const screenX = Math.floor(this.x - cameraX);
    const screenY = Math.floor(this.y);

    let spriteName = 'powerup_mushroom';
    if (this.type === 'flower') spriteName = 'powerup_flower';
    if (this.type === 'star') spriteName = 'powerup_star';
    if (this.type === '1up') spriteName = 'powerup_1up';

    const sprite = Sprites.get(spriteName);
    if (sprite) {
      ctx.drawImage(sprite, screenX, screenY);
    }
  }
}

// Bouncing Coin popped from Question Block
class BlockCoin {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vy = -5.0;
    this.startY = y;
    this.frame = 0;
    this.isDone = false;
    Sound.playCoin();
  }

  update(particles) {
    this.y += this.vy;
    this.vy += 0.35;
    this.frame = (this.frame + 1) % 4;

    if (this.vy > 0 && this.y >= this.startY - 4) {
      this.isDone = true;
      particles.addScoreText(this.x, this.y - 8, '200');
    }
  }

  render(ctx, cameraX) {
    if (this.isDone) return;
    const sprite = Sprites.get(`coin_${this.frame}`);
    if (sprite) {
      ctx.drawImage(sprite, Math.floor(this.x - cameraX), Math.floor(this.y));
    }
  }
}
