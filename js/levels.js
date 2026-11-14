/**
 * Super Mario Winter - Level Maps & World Generator
 * 4 Full Handcrafted Stages:
 * - World 1-1: Frosted Foothills (Classic Overworld)
 * - World 1-2: Crystal Cavern (Underground Ice Cave)
 * - World 1-3: Alpine Treetops (High Altitude Athletic Platforms)
 * - World 1-4: Bowser's Frost Keep (Castle Showdown)
 */

class Level {
  constructor(data) {
    this.name = data.name;
    this.world = data.world;
    this.theme = data.theme; // 'overworld', 'underground', 'castle'
    this.musicTrack = data.musicTrack;
    this.isIceLevel = data.isIceLevel || false;
    this.timeLimit = data.timeLimit || 400;

    this.widthInTiles = data.map[0].length;
    this.heightInTiles = data.map.length;
    this.pixelWidth = this.widthInTiles * 16;
    this.pixelHeight = this.heightInTiles * 16;

    this.skyTop = data.skyTop || '#3a86ff';
    this.skyBot = data.skyBot || '#b5e2fa';

    this.tiles = [];
    this.scenery = [];
    this.pipes = data.pipes || [];
    this.flagpole = null;
    this.flagBaseY = 208;
    this.axe = null;
    this.cabin = null;

    this.initialEnemies = data.enemies || [];
    this.loadMap(data.map);
  }

  loadMap(mapData) {
    for (let r = 0; r < this.heightInTiles; r++) {
      this.tiles[r] = [];
      for (let c = 0; c < this.widthInTiles; c++) {
        const char = mapData[r][c] || '.';
        this.tiles[r][c] = this.createTile(char, c, r);
      }
    }
    this.snapLandmarksToGround();
  }

  snapLandmarksToGround() {
    const findGroundY = (col, startRow) => {
      for (let r = startRow; r < this.heightInTiles; r++) {
        if (this.tiles[r][col]?.solid) {
          return r * 16;
        }
      }
      return null;
    };

    for (const s of this.scenery) {
      const groundY = findGroundY(s.col, s.row);
      if (groundY !== null) {
        if (s.type === 'tree') {
          s.y = groundY - 48; // scenery_pine_tree is 48px tall
        } else if (s.type === 'snowman') {
          s.y = groundY - 31; // bottom snowball rests at pixel y=31
        }
      }
    }

    if (this.cabin) {
      const groundY = findGroundY(this.cabin.col, this.cabin.row);
      if (groundY !== null) {
        this.cabin.y = groundY - 64; // scenery_cabin is 64px tall
      }
    }
  }

  createTile(char, col, row) {
    const x = col * 16;
    const y = row * 16;

    const baseTile = {
      char: char,
      col: col,
      row: row,
      solid: false,
      bumpOffset: 0,
      isHit: false,
      renderType: null
    };

    switch (char) {
      case 'G': // Snow ground
        return { ...baseTile, solid: true, renderType: 'ground' };
      case 'I': // Ice Cave ground
        return { ...baseTile, solid: true, renderType: 'ice_ground' };
      case 'W': // Castle Wall
        return { ...baseTile, solid: true, renderType: 'castle_wall' };
      case 'E': // Frosted Stone / Pyramid Step Block
        return { ...baseTile, solid: true, renderType: 'step' };
      case 'U': // Hidden 1-UP Block (Invisible until bumped)
        return {
          ...baseTile,
          solid: false,
          isHidden: true,
          renderType: null,
          hasItem: '1up',
          onBump: (player) => this.hitQuestion(col, row, player)
        };
      case 'Q': // Multi-Coin Brick
        return {
          ...baseTile,
          solid: true,
          renderType: 'brick',
          coinCount: 10,
          onBump: (player) => this.hitMultiCoin(col, row, player)
        };
      case 'B': // Brick block
        return {
          ...baseTile,
          solid: true,
          renderType: 'brick',
          onBump: (player) => this.hitBrick(col, row, player)
        };
      case '?': // Question Block - Coin
        return {
          ...baseTile,
          solid: true,
          renderType: 'question',
          hasItem: 'coin',
          onBump: (player) => this.hitQuestion(col, row, player)
        };
      case 'M': // Question Block - Mushroom / Flower
        return {
          ...baseTile,
          solid: true,
          renderType: 'question',
          hasItem: 'powerup',
          onBump: (player) => this.hitQuestion(col, row, player)
        };
      case 'S': // Question Block - Starman
        return {
          ...baseTile,
          solid: true,
          renderType: 'question',
          hasItem: 'star',
          onBump: (player) => this.hitQuestion(col, row, player)
        };
      case '1': // Question Block - 1UP
        return {
          ...baseTile,
          solid: true,
          renderType: 'question',
          hasItem: '1up',
          onBump: (player) => this.hitQuestion(col, row, player)
        };
      case 'C': // Loose floating coin
        return { ...baseTile, solid: false, renderType: 'loose_coin' };
      case '[': // Pipe top left
      case ']': // Pipe top right
      case '<': // Pipe body left
      case '>': // Pipe body right
        return { ...baseTile, solid: true, renderType: 'pipe', pipePart: char };
      case 'T': // Pine Tree landmark
        this.scenery.push({ type: 'tree', x: x, y: y - 32, col, row });
        return baseTile;
      case 'N': // Snowman landmark
        this.scenery.push({ type: 'snowman', x: x, y: y - 15, col, row });
        return baseTile;
      case 'H': // End of level cozy cabin
        this.cabin = { x: x, y: y - 48, w: 64, h: 64, col, row };
        return baseTile;
      case 'F': // Flagpole
        if (!this.flagpole) {
          this.flagpole = { x: x + 6, topY: y, botY: y + 16 };
        }
        this.flagpole.botY = y + 16;
        this.flagBaseY = y + 16;
        return baseTile;
      case 'X': // Golden Axe (Castle)
        this.axe = { x: x, y: y, w: 16, h: 16 };
        return baseTile;
      case 'L': // Freezing abyss / liquid nitrogen
        return { ...baseTile, solid: false, isLethal: true, renderType: 'hazard_water' };
      default:
        return baseTile;
    }
  }

  getTile(col, row) {
    if (row < 0 || row >= this.heightInTiles || col < 0 || col >= this.widthInTiles) {
      return null;
    }
    return this.tiles[row][col];
  }

  getEngine() {
    return window.Engine?.instance || window.GameEngine?.instance || window.GameEngine;
  }

  hitQuestion(col, row, player) {
    const tile = this.getTile(col, row);
    if (!tile || tile.isHit) return;

    tile.isHit = true;
    tile.renderType = 'empty';
    tile.bumpOffset = -6; // Visual spring bounce

    const engine = this.getEngine();
    if (!engine) return;

    if (tile.hasItem === 'coin') {
      engine.addBlockCoin(col * 16, row * 16 - 12);
      engine.addScore(200);
      engine.addCoin();
    } else if (tile.hasItem === 'powerup') {
      const type = player.state === 'small' ? 'mushroom' : 'flower';
      engine.addItem(col * 16, row * 16 - 16, type);
      Sound.playPowerupAppear();
    } else if (tile.hasItem === 'star') {
      engine.addItem(col * 16, row * 16 - 16, 'star');
      Sound.playPowerupAppear();
    } else if (tile.hasItem === '1up') {
      engine.addItem(col * 16, row * 16 - 16, '1up');
      Sound.playPowerupAppear();
    }
  }

  hitBrick(col, row, player) {
    const tile = this.getTile(col, row);
    if (!tile) return;

    const engine = this.getEngine();

    if (player.isSuper) {
      // Super Mario breaks the brick into 4 shattering shards!
      this.tiles[row][col] = { solid: false, renderType: null };
      if (engine) {
        engine.particles.addBrickShards(col * 16, row * 16);
        engine.addScore(50);
      }
      Sound.playBlockBreak();
    } else {
      // Small Mario bumps it
      tile.bumpOffset = -5;
      Sound.playBlockBump();
    }
  }

  hitMultiCoin(col, row, player) {
    const tile = this.getTile(col, row);
    if (!tile || tile.coinCount <= 0) return;

    tile.coinCount--;
    tile.bumpOffset = -5;
    const engine = this.getEngine();
    if (engine) {
      engine.addBlockCoin(col * 16, row * 16 - 12);
      engine.addScore(200);
      engine.addCoin();
    }
    if (tile.coinCount <= 0) {
      tile.renderType = 'empty';
      tile.isHit = true;
    }
  }

  checkPipeEntrance(player) {
    for (const p of this.pipes) {
      if (
        p.canEnter &&
        player.x + player.w > p.x &&
        player.x < p.x + 32 &&
        Math.abs(player.y + player.h - p.y) < 8
      ) {
        player.isEnteringPipe = true;
        player.pipeDirection = 'down';
        player.pipeTimer = 35;
        player.targetWarp = p.target;
        Sound.playPipe();
        break;
      }
    }
  }

  executePipeWarp(player) {
    if (player.targetWarp) {
      const engine = this.getEngine();
      if (engine) engine.warpTo(player.targetWarp);
      player.targetWarp = null;
    }
  }

  update() {
    // Easing bump offsets back to zero
    for (let r = 0; r < this.heightInTiles; r++) {
      for (let c = 0; c < this.widthInTiles; c++) {
        const tile = this.tiles[r][c];
        if (tile && tile.bumpOffset < 0) {
          tile.bumpOffset += 0.8;
          if (tile.bumpOffset > 0) tile.bumpOffset = 0;
        }
      }
    }
  }

  render(ctx, cameraX, viewportW, viewportH, coinFrame = 0) {
    // Draw Scenery (Pine trees & Snowmen behind tiles)
    for (const s of this.scenery) {
      const screenX = Math.floor(s.x - cameraX);
      if (screenX >= -48 && screenX <= viewportW + 48) {
        if (s.type === 'tree') {
          const sprite = Sprites.get('scenery_pine_tree');
          if (sprite) ctx.drawImage(sprite, screenX, s.y);
        } else if (s.type === 'snowman') {
          const sprite = Sprites.get('scenery_snowman');
          if (sprite) ctx.drawImage(sprite, screenX, s.y);
        }
      }
    }

    // Draw End Cabin
    if (this.cabin) {
      const screenX = Math.floor(this.cabin.x - cameraX);
      if (screenX >= -70 && screenX <= viewportW + 70) {
        const sprite = Sprites.get('scenery_cabin');
        if (sprite) ctx.drawImage(sprite, screenX, this.cabin.y);
      }
    }

    // Draw Flagpole
    if (this.flagpole) {
      const screenX = Math.floor(this.flagpole.x - cameraX);
      if (screenX >= -20 && screenX <= viewportW + 20) {
        // Striped pole
        for (let y = this.flagpole.topY; y < this.flagpole.botY; y += 8) {
          ctx.fillStyle = (y / 8) % 2 === 0 ? '#e63946' : '#ffffff';
          ctx.fillRect(screenX, y, 4, 8);
        }
        // Gold Star on top
        const starSprite = Sprites.get('flagpole_star');
        if (starSprite) {
          ctx.drawImage(starSprite, screenX - 6, this.flagpole.topY - 14);
        }
      }
    }

    // Draw Golden Axe
    if (this.axe) {
      const screenX = Math.floor(this.axe.x - cameraX);
      const sprite = Sprites.get('castle_axe');
      if (sprite) ctx.drawImage(sprite, screenX, this.axe.y);
    }

    // Render Visible Tiles
    const startCol = Math.max(0, Math.floor(cameraX / 16));
    const endCol = Math.min(this.widthInTiles - 1, Math.ceil((cameraX + viewportW) / 16));

    for (let r = 0; r < this.heightInTiles; r++) {
      for (let c = startCol; c <= endCol; c++) {
        const tile = this.tiles[r][c];
        if (!tile || !tile.renderType) continue;

        const screenX = c * 16 - Math.floor(cameraX);
        const screenY = r * 16 + Math.round(tile.bumpOffset || 0);

        if (tile.renderType === 'ground') {
          const isSurface = r === 0 || !this.tiles[r - 1][c]?.solid;
          const sprite = Sprites.get(isSurface ? 'tile_ground' : 'tile_ground_sub');
          if (sprite) ctx.drawImage(sprite, screenX, screenY);
        } else if (tile.renderType === 'ice_ground' || tile.renderType === 'castle_wall') {
          const sprite = Sprites.get('tile_ice_ground');
          if (sprite) ctx.drawImage(sprite, screenX, screenY);
        } else if (tile.renderType === 'step') {
          const sprite = Sprites.get('block_step');
          if (sprite) ctx.drawImage(sprite, screenX, screenY);
        } else if (tile.renderType === 'question') {
          const sprite = Sprites.get('block_question');
          if (sprite) ctx.drawImage(sprite, screenX, screenY);
        } else if (tile.renderType === 'empty') {
          const sprite = Sprites.get('block_empty');
          if (sprite) ctx.drawImage(sprite, screenX, screenY);
        } else if (tile.renderType === 'brick') {
          const sprite = Sprites.get('block_brick');
          if (sprite) ctx.drawImage(sprite, screenX, screenY);
        } else if (tile.renderType === 'loose_coin') {
          const sprite = Sprites.get(`coin_${coinFrame}`);
          if (sprite) ctx.drawImage(sprite, screenX, screenY);
        } else if (tile.renderType === 'pipe') {
          if (tile.pipePart === '[') {
            const sprite = Sprites.get('pipe_top');
            if (sprite) ctx.drawImage(sprite, screenX, screenY);
          } else if (tile.pipePart === '<') {
            const sprite = Sprites.get('pipe_body');
            if (sprite) ctx.drawImage(sprite, screenX, screenY);
          }
        }
      }
    }
  }
}

// ==========================================
// LEVEL BLUEPRINTS & HANDCRAFTED LAYOUTS
// ==========================================

// Helper to construct exact-width retro tilemap rows
function createMapRows(width, height, rowDefs) {
  const rows = [];
  for (let r = 0; r < height; r++) {
    const arr = new Array(width).fill('.');
    const def = rowDefs[r];
    if (def) {
      for (const [colStr, str] of Object.entries(def)) {
        const col = parseInt(colStr, 10);
        for (let i = 0; i < str.length; i++) {
          if (col + i < width) arr[col + i] = str[i];
        }
      }
    }
    rows.push(arr.join(''));
  }
  return rows;
}

const LEVEL_DATA = {
  // ----------------------------------------
  // WORLD 1-1: FROSTED FOOTHILLS (Authentic NES Walkthrough Layout)
  // ----------------------------------------
  '1-1': {
    name: 'Frosted Foothills',
    world: '1-1',
    theme: 'overworld',
    musicTrack: 'overworld',
    skyTop: '#1d3557',
    skyBot: '#a8dadc',
    timeLimit: 400,
    pipes: [
      { x: 57 * 16, y: 9 * 16, canEnter: true, target: '1-1-sub' }
    ],
    enemies: [
      { type: 'goomba',  x: 22 * 16, y: 12 * 16 },
      { type: 'goomba',  x: 40 * 16, y: 12 * 16 },
      { type: 'piranha', x: 46 * 16, y: 9 * 16 },
      { type: 'goomba',  x: 51 * 16, y: 12 * 16 },
      { type: 'goomba',  x: 53 * 16, y: 12 * 16 },
      { type: 'piranha', x: 57 * 16, y: 9 * 16 },
      { type: 'koopa',   x: 78 * 16, y: 11 * 16 },
      { type: 'goomba',  x: 80 * 16, y: 12 * 16 },
      { type: 'goomba',  x: 82 * 16, y: 12 * 16 },
      { type: 'piranha', x: 98 * 16, y: 10 * 16 },
      { type: 'koopa',   x: 107 * 16, y: 11 * 16 },
      { type: 'goomba',  x: 114 * 16, y: 12 * 16 },
      { type: 'goomba',  x: 116 * 16, y: 12 * 16 },
      { type: 'goomba',  x: 124 * 16, y: 12 * 16 },
      { type: 'goomba',  x: 126 * 16, y: 12 * 16 },
      { type: 'koopa',   x: 170 * 16, y: 11 * 16 }
    ],
    // 15 rows tall, 212 cols wide
    map: createMapRows(212, 15, {
      3: { 198: 'F' },
      4: { 198: 'F' },
      5: { 188: 'EE', 198: 'F' },
      6: { 22: '?', 80: 'BBBSBB', 94: '?', 109: 'BBBBBB', 128: 'BBB', 187: 'EEE', 198: 'F' },
      7: { 186: 'EEEE', 198: 'F' },
      8: { 185: 'EEEEE', 198: 'F' },
      9: { 16: '?', 20: 'BMB?B', 46: '[]', 57: '[]', 64: 'U', 77: 'BMB', 91: 'B?BB', 105: 'BQB', 118: 'B?B', 137: 'EE', 151: 'EE', 155: 'E', 168: 'B?BB', 184: 'EEEEEE', 198: 'F' },
      10: { 38: '[]', 46: '<>', 57: '<>', 98: '[]', 136: 'EEEE', 150: 'EEE', 155: 'EE', 183: 'EEEEEEE', 198: 'F' },
      11: { 28: '[]', 38: '<>', 46: '<>', 57: '<>', 98: '<>', 135: 'EEEEEE', 149: 'EEEE', 155: 'EEE', 163: '[]', 182: 'EEEEEEEE', 198: 'F' },
      12: { 4: 'T', 10: 'N', 28: '<>', 33: 'T', 38: '<>', 46: '<>', 50: 'N', 57: '<>', 98: '<>', 122: 'T', 134: 'EEEEEEEE', 145: 'N', 148: 'EEEEE', 155: 'EEEE', 163: '<>', 174: 'T', 178: 'N', 181: 'EEEEEEEEE', 198: 'F', 205: 'H' },
      13: { 0: 'G'.repeat(69), 71: 'G'.repeat(15), 89: 'G'.repeat(64), 155: 'G'.repeat(57) },
      14: { 0: 'G'.repeat(69), 71: 'G'.repeat(15), 89: 'G'.repeat(64), 155: 'G'.repeat(57) }
    })
  },

  // ----------------------------------------
  // WORLD 1-1 UNDERGROUND SECRET BONUS ROOM
  // ----------------------------------------
  '1-1-sub': {
    name: 'Secret Ice Vault',
    world: '1-1-sub',
    theme: 'underground',
    musicTrack: 'underground',
    skyTop: '#050c1a',
    skyBot: '#101d36',
    isIceLevel: true,
    timeLimit: 300,
    pipes: [
      { x: 30 * 16, y: 11 * 16, canEnter: true, target: '1-1-return' }
    ],
    enemies: [],
    map: createMapRows(40, 15, {
      0: { 0: 'I'.repeat(40) },
      1: { 0: 'I'.repeat(40) },
      2: { 0: 'I', 39: 'I' },
      3: { 0: 'I', 3: '[]', 39: 'I' },
      4: { 0: 'I', 3: '<>', 39: 'I' },
      5: { 0: 'I', 39: 'I' },
      6: { 0: 'I', 6: 'C'.repeat(20), 39: 'I' },
      7: { 0: 'I', 6: 'I'.repeat(20), 39: 'I' },
      8: { 0: 'I', 39: 'I' },
      9: { 0: 'I', 39: 'I' },
      10: { 0: 'I', 39: 'I' },
      11: { 0: 'I', 30: '[]', 39: 'I' },
      12: { 0: 'I', 30: '<>', 39: 'I' },
      13: { 0: 'I'.repeat(40) },
      14: { 0: 'I'.repeat(40) }
    })
  },

  // ----------------------------------------
  // WORLD 1-2: CRYSTAL CAVERN (Underground with Warp Zone!)
  // ----------------------------------------
  '1-2': {
    name: 'Crystal Cavern',
    world: '1-2',
    theme: 'underground',
    musicTrack: 'underground',
    skyTop: '#03071e',
    skyBot: '#1b263b',
    isIceLevel: true,
    timeLimit: 400,
    pipes: [
      { x: 142 * 16, y: 9 * 16, canEnter: true, target: '1-3' },
      { x: 152 * 16, y: 10 * 16, canEnter: true, target: '1-3' },
      { x: 160 * 16, y: 10 * 16, canEnter: true, target: '1-4' },
      { x: 168 * 16, y: 10 * 16, canEnter: true, target: '1-1-sub' }
    ],
    enemies: [
      { type: 'goomba',  x: 16 * 16, y: 12 * 16 },
      { type: 'goomba',  x: 26 * 16, y: 12 * 16 },
      { type: 'koopa',   x: 30 * 16, y: 12 * 16 },
      { type: 'goomba',  x: 36 * 16, y: 12 * 16 },
      { type: 'piranha', x: 66 * 16, y: 11 * 16 },
      { type: 'piranha', x: 76 * 16, y: 10 * 16 },
      { type: 'piranha', x: 86 * 16, y: 9 * 16 },
      { type: 'goomba',  x: 95 * 16, y: 12 * 16 },
      { type: 'koopa',   x: 100 * 16, y: 12 * 16 },
      { type: 'goomba',  x: 105 * 16, y: 12 * 16 }
    ],
    // 15 rows tall, 175 cols wide
    map: createMapRows(175, 15, {
      0: { 0: 'I'.repeat(175) },
      1: { 0: 'I', 174: 'I' },
      2: { 0: 'I'.repeat(120), 126: 'I'.repeat(19), 174: 'I' },
      3: { 0: 'I', 3: '[]', 145: 'I', 174: 'I' },
      4: { 0: 'I', 3: '<>', 145: 'I', 174: 'I' },
      5: { 0: 'I', 68: 'CCCCCCC', 78: 'CCCCCCC', 145: 'I', 151: 'CCCC', 159: 'CCCC', 167: 'CCCC', 174: 'I' },
      6: { 0: 'I', 145: 'I', 174: 'I' },
      7: { 0: 'I', 145: 'I', 174: 'I' },
      8: { 0: 'I', 138: 'EEE', 145: 'I', 174: 'I' },
      9: { 0: 'I', 10: 'BMB?B', 22: '?BB?B', 34: 'BBBB', 86: '[]', 108: 'BBBBB', 136: 'EEEEE', 142: '[]', 145: 'I', 174: 'I' },
      10: { 0: 'I', 53: 'E', 76: '[]', 86: '<>', 134: 'EEEEEEE', 142: '<>', 145: 'I', 152: '[]', 160: '[]', 168: '[]', 174: 'I' },
      11: { 0: 'I', 49: 'E', 53: 'E', 57: 'E', 66: '[]', 76: '<>', 86: '<>', 132: 'EEEEEEEEE', 142: '<>', 145: 'I', 152: '<>', 160: '<>', 168: '<>', 174: 'I' },
      12: { 0: 'I', 49: 'E', 53: 'E', 57: 'E', 66: '<>', 76: '<>', 86: '<>', 130: 'EEEEEEEEEEE', 142: '<>', 145: 'I', 152: '<>', 160: '<>', 168: '<>', 174: 'I' },
      13: { 0: 'I'.repeat(46), 61: 'I'.repeat(114) },
      14: { 0: 'I'.repeat(46), 61: 'I'.repeat(114) }
    })
  },

  // ----------------------------------------
  // WORLD 1-3: ALPINE TREETOPS (Athletic Sky Mushroom Stages)
  // ----------------------------------------
  '1-3': {
    name: 'Alpine Treetops',
    world: '1-3',
    theme: 'overworld',
    musicTrack: 'overworld',
    skyTop: '#023e8a',
    skyBot: '#90e0ef',
    timeLimit: 350,
    pipes: [],
    enemies: [
      { type: 'koopa',   x: 16 * 16, y: 9 * 16 },
      { type: 'koopa',   x: 55 * 16, y: 7 * 16 },
      { type: 'goomba',  x: 97 * 16, y: 5 * 16 },
      { type: 'goomba',  x: 100 * 16, y: 5 * 16 },
      { type: 'koopa',   x: 110 * 16, y: 7 * 16 }
    ],
    // 15 rows tall, 160 cols wide
    map: createMapRows(160, 15, {
      3: { 148: 'F' },
      4: { 77: 'S', 148: 'F' },
      5: { 43: 'CCCC', 148: 'F' },
      6: { 24: 'CCCC', 35: '?', 42: 'GGGGGG', 95: 'GGGGGGGGG', 148: 'F' },
      7: { 23: 'GGGGGG', 73: 'GGGGGGGGGG', 134: 'E', 148: 'F' },
      8: { 51: 'GGGGGGGGGG', 107: 'GGGGGGGG', 137: 'EE', 148: 'F' },
      9: { 32: 'GGGGGGG', 86: 'GGGGGG', 131: 'E', 148: 'F' },
      10: { 14: 'GGGGGG', 118: 'GGGGGGG', 148: 'F' },
      11: { 64: 'GGGGGG', 128: 'E', 148: 'F' },
      12: { 148: 'F', 155: 'H' },
      13: { 0: 'G'.repeat(11), 140: 'G'.repeat(20) },
      14: { 0: 'G'.repeat(11), 140: 'G'.repeat(20) }
    })
  },

  // ----------------------------------------
  // WORLD 1-4: BOWSER'S FROST KEEP (Castle Showdown with Frostbars & Bridge Collapse)
  // ----------------------------------------
  '1-4': {
    name: "Bowser's Frost Keep",
    world: '1-4',
    theme: 'castle',
    musicTrack: 'castle',
    skyTop: '#03045e',
    skyBot: '#0077b6',
    timeLimit: 300,
    pipes: [],
    enemies: [
      { type: 'frostbar', x: 25 * 16, y: 10 * 16, length: 4, speed: 0.035 },
      { type: 'frostbar', x: 46 * 16, y: 8 * 16, length: 4, speed: -0.04 },
      { type: 'bowser',   x: 96 * 16, y: 8 * 16 }
    ],
    // 15 rows tall, 135 cols wide
    map: createMapRows(135, 15, {
      0: { 0: 'W'.repeat(135) },
      1: { 0: 'W'.repeat(135) },
      2: { 0: 'W', 134: 'W' },
      3: { 0: 'W', 134: 'W' },
      4: { 0: 'W', 134: 'W' },
      5: { 0: 'W', 134: 'W' },
      6: { 0: 'W', 37: 'W'.repeat(19), 134: 'W' },
      7: { 0: 'W', 134: 'W' },
      8: { 0: 'W', 134: 'W' },
      9: { 0: 'W', 66: 'EEEE', 134: 'W' },
      10: { 0: 'W', 19: 'W'.repeat(14), 37: 'W'.repeat(19), 64: 'EEEEEE', 107: 'X', 134: 'W' },
      11: { 0: 'W', 63: 'EEEEEEEE', 78: 'B'.repeat(28), 107: 'W', 134: 'W' },
      12: { 0: 'W'.repeat(15), 63: 'EEEEEEEE', 107: 'W'.repeat(28) },
      13: { 0: 'W'.repeat(15), 15: 'L'.repeat(95), 110: 'W'.repeat(25) },
      14: { 0: 'W'.repeat(15), 15: 'L'.repeat(95), 110: 'W'.repeat(25) }
    })
  }
};
