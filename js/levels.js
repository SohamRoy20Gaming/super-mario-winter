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
        this.scenery.push({ type: 'tree', x: x, y: y - 32 });
        return baseTile;
      case 'N': // Snowman landmark
        this.scenery.push({ type: 'snowman', x: x, y: y - 16 });
        return baseTile;
      case 'H': // End of level cozy cabin
        this.cabin = { x: x, y: y - 48, w: 64, h: 64 };
        return baseTile;
      case 'F': // Flagpole
        this.flagpole = { x: x + 6, topY: y, botY: y + 144 };
        this.flagBaseY = y + 144;
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

  render(ctx, cameraX, viewportW, viewportH) {
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
          const frame = Math.floor(Date.now() / 150) % 4;
          const sprite = Sprites.get(`coin_${frame}`);
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

const LEVEL_DATA = {
  // ----------------------------------------
  // WORLD 1-1: FROSTED FOOTHILLS
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
      { x: 58 * 16, y: 11 * 16, canEnter: true, target: '1-1-sub' }
    ],
    enemies: [
      { type: 'goomba', x: 22 * 16, y: 12 * 16 },
      { type: 'goomba', x: 40 * 16, y: 12 * 16 },
      { type: 'koopa',  x: 48 * 16, y: 11 * 16 },
      { type: 'goomba', x: 80 * 16, y: 12 * 16 },
      { type: 'goomba', x: 83 * 16, y: 12 * 16 },
      { type: 'koopa',  x: 98 * 16, y: 11 * 16 },
      { type: 'goomba', x: 115 * 16, y: 12 * 16 }
    ],
    // 15 rows tall, 180 cols wide
    map: [
      "....................................................................................................................................................................................",
      "....................................................................................................................................................................................",
      "....................................................................................................................................................................................",
      "....................................................................................................................................................................................",
      "....................................................................................................................................................................................",
      "....................................................................................................................................................................................",
      "....................................................................................................................................................................................",
      "....................................................................................................................................................................................",
      "..................................................................BB.BB.BB..................................................................................F.......................",
      "...................B?M?B....................??...................BBBBBBBBBB.............B?B.................................................................F.......................",
      "..................................................................................................................G.........................................F.......................",
      "......T........[].T............[]..N........[]............[]......................[]...............GG...........GGG..................[].....................F.........H.............",
      "...............<>.T............<>...........<>............<>......................<>..............GGG..........GGGG..................<>.....................F.......................",
      "GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG...GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG...GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG",
      "GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG...GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG...GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG"
    ]
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
    map: [
      "IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII",
      "IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII",
      "I......................................I",
      "I......................................I",
      "I.....CCCCCCCCCCCCCCCCCCCC.............I",
      "I.....CCCCCCCCCCCCCCCCCCCC.............I",
      "I.....IIIIIIIIIIIIIIIIIIII.............I",
      "I......................................I",
      "I......................................I",
      "I......................................I",
      "I......................................I",
      "I.............................[].......I",
      "I.............................<>.......I",
      "IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII",
      "IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII"
    ]
  },

  // ----------------------------------------
  // WORLD 1-2: CRYSTAL CAVERN
  // ----------------------------------------
  '1-2': {
    name: 'Crystal Cavern',
    world: '1-2',
    theme: 'underground',
    musicTrack: 'underground',
    skyTop: '#03071e',
    skyBot: '#1b263b',
    isIceLevel: true,
    timeLimit: 350,
    pipes: [
      { x: 120 * 16, y: 11 * 16, canEnter: true, target: '1-3' }
    ],
    enemies: [
      { type: 'goomba', x: 20 * 16, y: 12 * 16 },
      { type: 'goomba', x: 32 * 16, y: 12 * 16 },
      { type: 'koopa',  x: 55 * 16, y: 12 * 16 },
      { type: 'goomba', x: 74 * 16, y: 12 * 16 },
      { type: 'koopa',  x: 90 * 16, y: 12 * 16 }
    ],
    map: [
      "IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII",
      "IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII",
      "I..................................................................................................................................I",
      "I..................................................................................................................................I",
      "I...............CCCCCCCC.....................CCCCCCCCCCCC..........................CCCCCCCCCC.....................................I",
      "I..............IIIIIIIIII...................IIIIIIIIIIIIII.........................IIIIIIIIIII....................................I",
      "I..................................................................................................................................I",
      "I..................................................................................................................................I",
      "I.......?M?......................B?B........................????...........................................................F.......I",
      "I..........................................................................................................................F.......I",
      "I..................................................................IIII....................................................F.......I",
      "I................[]...........[]................[].................IIII............[]................[]....................F.......I",
      "I................<>...........<>................<>.................IIII............<>................<>....................F.......I",
      "IIIIIIIIIIIIIIIIIIIIIIII...IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII",
      "IIIIIIIIIIIIIIIIIIIIIIII...IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII"
    ]
  },

  // ----------------------------------------
  // WORLD 1-3: ALPINE TREETOPS
  // ----------------------------------------
  '1-3': {
    name: 'Alpine Treetops',
    world: '1-3',
    theme: 'overworld',
    musicTrack: 'overworld',
    skyTop: '#023e8a',
    skyBot: '#90e0ef',
    timeLimit: 300,
    pipes: [],
    enemies: [
      { type: 'koopa',  x: 28 * 16, y: 7 * 16 },
      { type: 'goomba', x: 48 * 16, y: 8 * 16 },
      { type: 'koopa',  x: 72 * 16, y: 6 * 16 },
      { type: 'goomba', x: 96 * 16, y: 7 * 16 }
    ],
    map: [
      "........................................................................................................................................",
      "........................................................................................................................................",
      "........................................................................................................................................",
      "........................................................................................................................................",
      "........................................................................................................................................",
      "............................................CCCC....................CCCC................................................................",
      "...................GGGGG..................GGGGGGGG................GGGGGGGG..............................................................",
      "..........GGGG.....GGGGG..................GGGGGGGG................GGGGGGGG........B?S?B..................................................",
      "...............................................................................................................................F........",
      "....GGGG.....................GGGGGG.....................GGGGG.........................................GGGGG...................F........",
      "...............................................................................................................................F........",
      "G..............................................................................................................................F......H.",
      "G..............................................................................................................................F........",
      "GGGGGG...................................................................................................................GGGGGGGGGGGGGG",
      "GGGGGG...................................................................................................................GGGGGGGGGGGGGG"
    ]
  },

  // ----------------------------------------
  // WORLD 1-4: BOWSER'S FROST KEEP
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
      { type: 'bowser', x: 88 * 16, y: 9 * 16 }
    ],
    map: [
      "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW",
      "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW",
      "W......................................................................................................W",
      "W......................................................................................................W",
      "W......................................................................................................W",
      "W...............BBBB...................BBBBBB..........................................................W",
      "W......................................................................................................W",
      "W......................................................................................................W",
      "W........B?B...............B?B......................................................................X..W",
      "W...................................................................................................X..W",
      "W...................................................................................................W..W",
      "W...................................................................................................W..W",
      "WWWWWWWWWWWW............WWWWWWWW............WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW",
      "LLLLLLLLLLLL............LLLLLLLL............LLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLL",
      "LLLLLLLLLLLL............LLLLLLLL............LLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLL"
    ]
  }
};
