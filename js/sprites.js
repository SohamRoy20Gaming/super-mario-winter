/**
 * Super Mario Winter - Procedural Pixel-Art Sprite Engine
 * Generates crisp, authentic 8-bit winter-themed sprites on offscreen canvases
 */

class SpriteEngine {
  constructor() {
    this.cache = {};
    this.TILE_SIZE = 16;
    this.initPalette();
    this.generateAllSprites();
  }

  initPalette() {
    this.colors = {
      // Sky & Nature
      SKY_DAY_TOP: '#3a86ff',
      SKY_DAY_BOT: '#b5e2fa',
      SKY_NIGHT_TOP: '#050c1a',
      SKY_NIGHT_BOT: '#1b2a47',
      SKY_CAVE: '#080e1e',
      
      // Snow & Ice
      SNOW_WHITE: '#ffffff',
      SNOW_SHADOW: '#d0e1fd',
      ICE_LIGHT: '#a0e4f1',
      ICE_DEEP: '#48cae4',
      ICE_DARK: '#0077b6',
      
      // Winter Mario
      MARIO_RED: '#e63946',
      MARIO_DARK_RED: '#b71c1c',
      MARIO_BLUE: '#2a6f97',
      MARIO_DARK_BLUE: '#013a63',
      MARIO_SKIN: '#fed9b7',
      MARIO_SKIN_SHADOW: '#f4a261',
      MARIO_HAIR: '#4a2810',
      MARIO_BOOTS: '#3d2614',
      MARIO_WHITE_TRIM: '#f1faee',
      MARIO_GLOVES: '#5e412f',
      
      // Frost Mario
      FROST_CYAN: '#00f5d4',
      FROST_BLUE: '#00bbf9',
      FROST_WHITE: '#ffffff',
      
      // Enemies
      GOOMBA_BROWN: '#8d5b4c',
      GOOMBA_DARK: '#5c3a21',
      EARMUFF_PINK: '#ff70a6',
      EARMUFF_CYAN: '#48cae4',
      SCARF_RED: '#d90429',
      SCARF_GREEN: '#2b9348',
      
      KOOPA_GREEN: '#38b000',
      KOOPA_YELLOW: '#ffdd00',
      KOOPA_BLUE: '#0096c7',
      KOOPA_BEANIE: '#f72585',
      KOOPA_POMPOM: '#ffffff',
      
      PIRANHA_RED: '#e63946',
      PIRANHA_LIP: '#ffffff',
      PIRANHA_GREEN: '#2d6a4f',
      
      BOWSER_GREEN: '#2d6a4f',
      BOWSER_SHELL: '#1b4332',
      BOWSER_SPIKE: '#e0fbfc',
      BOWSER_SKIN: '#ffb703',
      BOWSER_HAIR: '#fb8500',
      
      // Blocks & Scenery
      GROUND_TOP: '#ffffff',
      GROUND_EARTH: '#6f4e37',
      GROUND_EARTH_DARK: '#4a2f1b',
      GROUND_ICE: '#22577a',
      GROUND_ICE_DARK: '#13315c',
      
      GIFT_GOLD: '#ffb703',
      GIFT_LIGHT: '#ffe49e',
      GIFT_DARK: '#d48b00',
      GIFT_RIBBON: '#d90429',
      
      BRICK_RED: '#9d0208',
      BRICK_DARK: '#6a040f',
      BRICK_MORTAR: '#e0fbfc',
      
      PIPE_GREEN: '#1b4332',
      PIPE_LIGHT_GREEN: '#40916c',
      PIPE_RIM_SNOW: '#ffffff',
      CANDY_RED: '#e63946',
      CANDY_WHITE: '#f8f9fa',
      
      // Collectibles
      COIN_GOLD: '#ffbe0b',
      COIN_LIGHT: '#fff3b0',
      COIN_DARK: '#d48b00',
      
      WOOD_LOG: '#583101',
      WOOD_DARK: '#3a1f04',
      WINDOW_GLOW: '#ffea00'
    };
  }

  createCanvas(w, h) {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    return { canvas: c, ctx: ctx };
  }

  generateAllSprites() {
    this.generateMarioSprites();
    this.generateEnemySprites();
    this.generateBlockSprites();
    this.generateItemSprites();
    this.generateScenerySprites();
  }

  // --- Helper: Draw pixel grid from ascii matrix ---
  drawMatrix(ctx, matrix, colorMap, offsetX = 0, offsetY = 0) {
    for (let r = 0; r < matrix.length; r++) {
      const row = matrix[r];
      for (let c = 0; c < row.length; c++) {
        const char = row[c];
        if (char !== '.' && char !== ' ' && colorMap[char]) {
          ctx.fillStyle = colorMap[char];
          ctx.fillRect(offsetX + c, offsetY + r, 1, 1);
        }
      }
    }
  }

  // --- Mario Sprites ---
  generateMarioSprites() {
    const C = this.colors;

    // Small Winter Mario (16x16)
    // Red coat, white fur trim, red pom-pom beanie with white puff, gloves, boots
    const smallPalette = {
      'R': C.MARIO_RED,
      'W': C.MARIO_WHITE_TRIM,
      'S': C.MARIO_SKIN,
      'H': C.MARIO_HAIR,
      'B': C.MARIO_BLUE,
      'G': C.MARIO_GLOVES,
      'F': C.MARIO_BOOTS
    };

    // Small Mario Idle
    const smallIdle = [
      ".....WWWW.......",
      "....WRRRRW......",
      "....WRRRRRW.....",
      "....HHHHSH......",
      "...HSHSSSH......",
      "...HSHHSSSH.....",
      "...HSSSSHH......",
      "....SSSSSS......",
      "...RRRWRRR......",
      "..RRRRWRRRR.....",
      "..RRRRRRRRR.....",
      "..WWWWWWWWW.....",
      "...BBBWBBB......",
      "..FFFB.BFFF.....",
      "..FFFF.FFFF.....",
      "................"
    ];

    // Small Mario Walk 1
    const smallWalk1 = [
      ".....WWWW.......",
      "....WRRRRW......",
      "....WRRRRRW.....",
      "....HHHHSH......",
      "...HSHSSSH......",
      "...HSHHSSSH.....",
      "...HSSSSHH......",
      "....SSSSSS......",
      "...RRRWRRR......",
      "..RRRRWRRRR.....",
      ".GRRRRRRRRRG....",
      "..WWWWWWWWW.....",
      "....BBBB........",
      "...FFFF.........",
      "...FFFFF........",
      "................"
    ];

    // Small Mario Walk 2
    const smallWalk2 = [
      ".....WWWW.......",
      "....WRRRRW......",
      "....WRRRRRW.....",
      "....HHHHSH......",
      "...HSHSSSH......",
      "...HSHHSSSH.....",
      "...HSSSSHH......",
      "....SSSSSS......",
      "...RRRWRRR......",
      "..RRRRWRRRR.....",
      ".GRRRRRRRRRG....",
      "..WWWWWWWWW.....",
      "...BB...BB......",
      "..FFFF...FFF....",
      "..FFFFF..FFFF...",
      "................"
    ];

    // Small Mario Jump
    const smallJump = [
      ".....WWWW.......",
      "....WRRRRW......",
      "....WRRRRRW.....",
      "....HHHHSH......",
      "...HSHSSSH......",
      "...HSHHSSSH.....",
      "...HSSSSHH......",
      "..G.SSSSSS......",
      ".GRRRRWRRR......",
      ".GRRRRWRRRR.....",
      "..RRRRRRRRRG....",
      "..WWWWWWWWW.....",
      "...BBBBBBB......",
      "..FFFF.FFFF.....",
      ".FFFF...FFFF....",
      "................"
    ];

    // Small Mario Skid
    const smallSkid = [
      ".....WWWW.......",
      "....WRRRRW......",
      "....WRRRRRW.....",
      "....HHHHSH......",
      "...HSHSSSH......",
      "...HSHHSSSH.....",
      "...HSSSSHH......",
      "....SSSSSS......",
      "...RRRWRRR.G....",
      "..RRRRWRRRRG....",
      ".GRRRRRRRRR.....",
      "..WWWWWWWWW.....",
      "...BBBB.B.......",
      "..FFFF.FFFF.....",
      "........FFF.....",
      "................"
    ];

    // Small Mario Die
    const smallDie = [
      ".....WWWW.......",
      "....WRRRRW......",
      "....WRRRRRW.....",
      "...HH.H.H.HH....",
      "...HSSSSSSSH....",
      "...H.S...S.H....",
      "....SSSSSSS.....",
      "...RRRWRRR......",
      "..RRRRWRRRR.....",
      ".GRRRRRRRRRG....",
      "..WWWWWWWWW.....",
      "...BBBWBBB......",
      "..FFFF.FFFF.....",
      "..FFFF.FFFF.....",
      "................",
      "................"
    ];

    const makeSmall = (matrix) => {
      const { canvas, ctx } = this.createCanvas(16, 16);
      this.drawMatrix(ctx, matrix, smallPalette);
      return canvas;
    };

    this.cache['mario_small_idle'] = makeSmall(smallIdle);
    this.cache['mario_small_walk1'] = makeSmall(smallWalk1);
    this.cache['mario_small_walk2'] = makeSmall(smallWalk2);
    this.cache['mario_small_jump'] = makeSmall(smallJump);
    this.cache['mario_small_skid'] = makeSmall(smallSkid);
    this.cache['mario_small_die'] = makeSmall(smallDie);

    // --- Super Winter Mario (16x32) ---
    const superPalette = {
      'R': C.MARIO_RED,
      'D': C.MARIO_DARK_RED,
      'W': C.MARIO_WHITE_TRIM,
      'S': C.MARIO_SKIN,
      'H': C.MARIO_HAIR,
      'B': C.MARIO_BLUE,
      'G': C.MARIO_GLOVES,
      'F': C.MARIO_BOOTS
    };

    const superIdle = [
      "......WWWW......",
      ".....WRRRRW.....",
      ".....WRRRRRW....",
      ".....WRRRRRRW...",
      ".....HHHHSH.....",
      "....HSHSSSH.....",
      "....HSHHSSSH....",
      "....HSSSSHH.....",
      ".....SSSSSS.....",
      "....WWWWWWWW....",
      "...WRRRRWRRRW...",
      "...WRRRRWRRRW...",
      "..GWRRRRWRRRWG..",
      "..G.RRRRRRRR.G..",
      "....RRRRRRRR....",
      "....RRRRRRRR....",
      "....RRRRRRRR....",
      "....WWWWWWWW....",
      "....BBBBBBBB....",
      "....BBBBBBBB....",
      "...BBBB..BBBB...",
      "...BBBB..BBBB...",
      "...BBBB..BBBB...",
      "..FFFFF..FFFFF..",
      "..FFFFF..FFFFF..",
      "..FFFFF..FFFFF..",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................"
    ];

    const superWalk1 = [
      "......WWWW......",
      ".....WRRRRW.....",
      ".....WRRRRRW....",
      ".....WRRRRRRW...",
      ".....HHHHSH.....",
      "....HSHSSSH.....",
      "....HSHHSSSH....",
      "....HSSSSHH.....",
      ".....SSSSSS.....",
      "....WWWWWWWW....",
      "...WRRRRWRRRW...",
      "..GWRRRRWRRRW...",
      "..G.RRRRRRRR....",
      "....RRRRRRRR.G..",
      "....RRRRRRRR.G..",
      "....RRRRRRRR....",
      "....WWWWWWWW....",
      "....BBBBBBBB....",
      "....BBBBBBBB....",
      "....BBBB........",
      "...BBBBB........",
      "..FFFFFF........",
      "..FFFFFF........",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................"
    ];

    const superWalk2 = [
      "......WWWW......",
      ".....WRRRRW.....",
      ".....WRRRRRW....",
      ".....WRRRRRRW...",
      ".....HHHHSH.....",
      "....HSHSSSH.....",
      "....HSHHSSSH....",
      "....HSSSSHH.....",
      ".....SSSSSS.....",
      "....WWWWWWWW....",
      "...WRRRRWRRRW...",
      "...WRRRRWRRRWG..",
      "....RRRRRRRR.G..",
      "..G.RRRRRRRR....",
      "..G.RRRRRRRR....",
      "....RRRRRRRR....",
      "....WWWWWWWW....",
      "....BBBBBBBB....",
      "...BBBB..BBBB...",
      "..BBBB....BBBB..",
      "..FFFF....FFFF..",
      ".FFFFF....FFFFF.",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................"
    ];

    const superJump = [
      "......WWWW......",
      ".....WRRRRW.....",
      ".....WRRRRRW....",
      ".....WRRRRRRW...",
      ".....HHHHSH.....",
      "....HSHSSSH.....",
      "....HSHHSSSH....",
      "....HSSSSHH.....",
      ".....SSSSSS.....",
      "....WWWWWWWW....",
      "..GWRRRRWRRRW...",
      "..GWRRRRWRRRW...",
      "...WRRRRWRRRW...",
      "....RRRRRRRR.G..",
      "....RRRRRRRR.G..",
      "....RRRRRRRR....",
      "....WWWWWWWW....",
      "...BBBBBBBB.....",
      "..BBBB..BBBB....",
      "..FFFF..FFFF....",
      ".FFFFF...FFFF...",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................"
    ];

    const superCrouch = [
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "......WWWW......",
      ".....WRRRRW.....",
      ".....WRRRRRW....",
      ".....HHHHSH.....",
      "....HSHSSSH.....",
      "....HSSSSHH.....",
      ".....SSSSSS.....",
      "....WWWWWWWW....",
      "...WRRRRWRRRW...",
      "..GWRRRRWRRRWG..",
      "..G.RRRRRRRR.G..",
      "....WWWWWWWW....",
      "....BBBBBBBB....",
      "..FFFFFFFFFFFF..",
      "..FFFFFFFFFFFF..",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................"
    ];

    const makeSuper = (matrix, customPalette = superPalette) => {
      const { canvas, ctx } = this.createCanvas(16, 32);
      this.drawMatrix(ctx, matrix, customPalette);
      return canvas;
    };

    this.cache['mario_super_idle'] = makeSuper(superIdle);
    this.cache['mario_super_walk1'] = makeSuper(superWalk1);
    this.cache['mario_super_walk2'] = makeSuper(superWalk2);
    this.cache['mario_super_jump'] = makeSuper(superJump);
    this.cache['mario_super_crouch'] = makeSuper(superCrouch);

    // --- Frost Mario (Cyan/Ice Coat + Snow White Parka) ---
    const frostPalette = {
      'R': C.FROST_CYAN,
      'D': C.ICE_DARK,
      'W': C.SNOW_WHITE,
      'S': C.MARIO_SKIN,
      'H': C.MARIO_HAIR,
      'B': C.ICE_DEEP,
      'G': C.ICE_LIGHT,
      'F': C.ICE_DARK
    };

    this.cache['mario_frost_idle'] = makeSuper(superIdle, frostPalette);
    this.cache['mario_frost_walk1'] = makeSuper(superWalk1, frostPalette);
    this.cache['mario_frost_walk2'] = makeSuper(superWalk2, frostPalette);
    this.cache['mario_frost_jump'] = makeSuper(superJump, frostPalette);
    this.cache['mario_frost_crouch'] = makeSuper(superCrouch, frostPalette);
  }

  // --- Enemy Sprites ---
  generateEnemySprites() {
    const C = this.colors;

    // 1. Snow Goomba (16x16) with cute earmuffs & mini scarf!
    const goombaPalette = {
      'B': C.GOOMBA_BROWN,
      'D': C.GOOMBA_DARK,
      'E': C.EARMUFF_PINK, // Pink earmuffs!
      'H': '#ffffff',      // Headband
      'S': C.SCARF_RED,    // Scarf
      'W': '#ffffff',      // Eyes/teeth
      'K': '#000000',      // Pupils
      'F': '#3a1f04'       // Feet
    };

    const goombaWalk1 = [
      "....EEEEEEEE....",
      "...E.HHHHHH.E...",
      "...EBBBBBBBBE...",
      "...EBBBBBBBBE...",
      "..EBBWKBWKBBE...",
      "..EBBWKBWKBBE...",
      "...EBBBBBBBBE...",
      "...SSSSSSSSSS...",
      "...SS.S.S..SS...",
      "....BBBBBBBB....",
      "...BBBBBBBBBB...",
      "..BBBBBBBBBBBB..",
      "..FFFFF..FFFFF..",
      "..FFFFF..FFFFF..",
      "...FFF....FFF...",
      "................"
    ];

    const goombaWalk2 = [
      "....EEEEEEEE....",
      "...E.HHHHHH.E...",
      "...EBBBBBBBBE...",
      "...EBBBBBBBBE...",
      "..EBBWKBWKBBE...",
      "..EBBWKBWKBBE...",
      "...EBBBBBBBBE...",
      "...SSSSSSSSSS...",
      "...SS.S.S..SS...",
      "....BBBBBBBB....",
      "...BBBBBBBBBB...",
      "..BBBBBBBBBBBB..",
      "....FFFFFF......",
      "...FFFFFFF......",
      "................",
      "................"
    ];

    const goombaFlat = [
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "....EEEEEEEE....",
      "...EBBWKBWKBBE..",
      "...SSSSSSSSSS...",
      "..EBBBBBBBBBBE..",
      "..FFFFFFFFFFFF..",
      "..FFFFFFFFFFFF..",
      "................",
      "................"
    ];

    const makeEnemy = (matrix, pal, w = 16, h = 16) => {
      const { canvas, ctx } = this.createCanvas(w, h);
      this.drawMatrix(ctx, matrix, pal);
      return canvas;
    };

    this.cache['goomba_walk1'] = makeEnemy(goombaWalk1, goombaPalette);
    this.cache['goomba_walk2'] = makeEnemy(goombaWalk2, goombaPalette);
    this.cache['goomba_flat'] = makeEnemy(goombaFlat, goombaPalette);

    // 2. Frost Koopa (16x24 or 16x32) with winter beanie & ice shell!
    const koopaPalette = {
      'S': C.KOOPA_BLUE,   // Ice Blue Shell
      'B': C.KOOPA_BEANIE, // Magenta/Pink Beanie
      'W': '#ffffff',      // Beanie pompom & trim & eyes
      'Y': C.KOOPA_YELLOW, // Yellow face/beak
      'K': '#000000',
      'G': C.SNOW_WHITE,   // Snow dusting on shell
      'F': '#e0fbfc'
    };

    const koopaWalk1 = [
      "......WWWW......",
      ".....WBBBBW.....",
      ".....WBBBBW.....",
      "....WWWWWWWW....",
      "....YYYYWKY.....",
      "...YYYYYWKY.....",
      "...YYYYYYYY.....",
      "....GSSSSG......",
      "...GSSSSSSG.....",
      "..GSSSSSSSSG....",
      "..GSSSSSSSSG....",
      "..GSSSSSSSSG....",
      "...GSSSSSSG.....",
      "....FFFFFFFF....",
      "...FFFF..FFFF...",
      "...FFFF..FFFF..."
    ];

    const koopaWalk2 = [
      "......WWWW......",
      ".....WBBBBW.....",
      ".....WBBBBW.....",
      "....WWWWWWWW....",
      "....YYYYWKY.....",
      "...YYYYYWKY.....",
      "...YYYYYYYY.....",
      "....GSSSSG......",
      "...GSSSSSSG.....",
      "..GSSSSSSSSG....",
      "..GSSSSSSSSG....",
      "..GSSSSSSSSG....",
      "...GSSSSSSG.....",
      ".....FFFFFF.....",
      "....FFFFFFFF....",
      "................"
    ];

    const koopaShell = [
      "................",
      "................",
      "................",
      "................",
      ".....GSSSSG.....",
      "...GSSSSSSSSG...",
      "..GSSSSSSSSSSG..",
      "..GSSWWWWWWSSG..",
      "..GSSWSSSSWSSG..",
      "..GSSWWWWWWSSG..",
      "..GSSSSSSSSSSG..",
      "...GSSSSSSSSG...",
      ".....GSSSSG.....",
      "................",
      "................",
      "................"
    ];

    this.cache['koopa_walk1'] = makeEnemy(koopaWalk1, koopaPalette);
    this.cache['koopa_walk2'] = makeEnemy(koopaWalk2, koopaPalette);
    this.cache['koopa_shell'] = makeEnemy(koopaShell, koopaPalette);

    // 3. Frost Piranha Plant (16x24)
    const piranhaPalette = {
      'R': C.ICE_DARK,
      'W': '#ffffff', // Icicle teeth
      'L': C.ICE_LIGHT,
      'S': C.PIPE_LIGHT_GREEN
    };

    const piranha1 = [
      "....RRRRRRRR....",
      "...RLLLRLLLRR...",
      "..RLLLLRLLLLRR..",
      "..RLWLLRLWLLRR..",
      "..RWWWWWWWWWWR..",
      "..RWWWWWWWWWWR..",
      "...RWWWWWWWWR...",
      "....RRRRRRRR....",
      ".......SS.......",
      ".......SS.......",
      ".......SS.......",
      ".......SS.......",
      ".......SS.......",
      ".......SS.......",
      ".......SS.......",
      ".......SS......."
    ];

    this.cache['piranha_open'] = makeEnemy(piranha1, piranhaPalette);

    // 4. Frost Bowser (32x32)
    const bowserPalette = {
      'G': C.BOWSER_GREEN,
      'S': C.ICE_LIGHT,   // Ice spikes
      'H': C.BOWSER_HAIR,
      'Y': C.BOWSER_SKIN,
      'W': '#ffffff',
      'K': '#000000',
      'R': C.MARIO_RED,
      'C': C.BOWSER_SHELL
    };

    const bowser = [
      "............HHHH................",
      "...........HHHHHH...............",
      "..........HHHHHHHH..............",
      ".........GGGGYYWWW..............",
      "........GGGGGGYYWK..............",
      ".......GGGGGGGYYYYY.............",
      ".......GGGGGGYYYYYY.............",
      "......CCCCCCCCYYYYYY............",
      ".....CSSCCSSCCYYYYYY............",
      "....CSSSSCSSSCYYYYYY............",
      "...CSSSSSCSSSSYYYYYY............",
      "...CSSSSSCSSSSYYRRYY............",
      "...CCCCCCCCCCCYYRRYY............",
      "..CCCCCCCCCCCCCYYYY.............",
      "..CCCCCCCCCCCCCYYYY.............",
      "..CCCCCCCCCCCCC.YY..............",
      ".CCCCCCCCCCCCCC.................",
      ".CCCCCCCCCCCCCC.................",
      ".CCCCCCCCCCCCCC.................",
      "..CCCCCCCCCCCC..................",
      "...CCCCCCCCCC...................",
      "....GGGGGGGG....................",
      "...GGGGGGGGGG...................",
      "..GGGG....GGGG..................",
      "..YYYY....YYYY..................",
      "..YYYY....YYYY..................",
      "..WWWW....WWWW..................",
      "................................",
      "................................",
      "................................",
      "................................",
      "................................"
    ];

    this.cache['frost_bowser'] = makeEnemy(bowser, bowserPalette, 32, 32);
  }

  // --- Blocks & Interactive Tiles ---
  generateBlockSprites() {
    const C = this.colors;
    const { TILE_SIZE } = this;

    // 1. Snow-covered Ground Tile (Overworld Surface)
    {
      const { canvas, ctx } = this.createCanvas(TILE_SIZE, TILE_SIZE);
      // Earth base
      ctx.fillStyle = C.GROUND_EARTH;
      ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);

      // Cobblestone / earth textures
      ctx.fillStyle = C.GROUND_EARTH_DARK;
      ctx.fillRect(2, 6, 4, 3);
      ctx.fillRect(10, 8, 5, 3);
      ctx.fillRect(4, 12, 6, 3);

      // Fluffy Snow Top
      ctx.fillStyle = C.SNOW_WHITE;
      ctx.fillRect(0, 0, TILE_SIZE, 4);
      // Fluffy scalloped overhangs
      ctx.fillRect(0, 4, 3, 2);
      ctx.fillRect(5, 4, 4, 2);
      ctx.fillRect(12, 4, 3, 2);

      // Snow shadow
      ctx.fillStyle = C.SNOW_SHADOW;
      ctx.fillRect(0, 3, TILE_SIZE, 1);

      this.cache['tile_ground'] = canvas;
    }

    // 1b. Deep Ground / Earth Tile (Sub-surface without snow top)
    {
      const { canvas, ctx } = this.createCanvas(TILE_SIZE, TILE_SIZE);
      ctx.fillStyle = C.GROUND_EARTH;
      ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);

      ctx.fillStyle = C.GROUND_EARTH_DARK;
      ctx.fillRect(2, 2, 5, 4);
      ctx.fillRect(9, 3, 5, 3);
      ctx.fillRect(1, 9, 6, 4);
      ctx.fillRect(10, 10, 4, 4);

      // Frost speckles
      ctx.fillStyle = C.ICE_LIGHT;
      ctx.fillRect(4, 4, 1, 1);
      ctx.fillRect(12, 12, 1, 1);
      ctx.fillRect(7, 10, 1, 1);

      this.cache['tile_ground_sub'] = canvas;
    }

    // 2. Underground / Ice Cave Ground Tile
    {
      const { canvas, ctx } = this.createCanvas(TILE_SIZE, TILE_SIZE);
      ctx.fillStyle = C.GROUND_ICE_DARK;
      ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);

      ctx.fillStyle = C.ICE_DARK;
      ctx.fillRect(1, 1, 14, 14);

      ctx.fillStyle = C.ICE_DEEP;
      ctx.fillRect(2, 2, 12, 2);
      ctx.fillRect(2, 2, 2, 12);

      ctx.fillStyle = C.ICE_LIGHT;
      ctx.fillRect(3, 3, 2, 2);
      ctx.fillRect(10, 10, 3, 3);

      this.cache['tile_ice_ground'] = canvas;
    }

    // 3. Question Block (Golden Gift Box with ribbon / snowflake '?')
    {
      const { canvas, ctx } = this.createCanvas(TILE_SIZE, TILE_SIZE);
      // Golden box
      ctx.fillStyle = C.GIFT_GOLD;
      ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);

      // Border highlight
      ctx.fillStyle = C.GIFT_LIGHT;
      ctx.fillRect(0, 0, TILE_SIZE, 2);
      ctx.fillRect(0, 0, 2, TILE_SIZE);

      // Shadow border
      ctx.fillStyle = C.GIFT_DARK;
      ctx.fillRect(0, TILE_SIZE - 2, TILE_SIZE, 2);
      ctx.fillRect(TILE_SIZE - 2, 0, 2, TILE_SIZE);

      // Festive ribbon & Question mark '?'
      ctx.fillStyle = C.GIFT_RIBBON;
      // '?' glyph
      const qmark = [
        "..RRRR..",
        ".RR..RR.",
        ".....RR.",
        "...RRR..",
        "...RR...",
        "........",
        "...RR...",
        "...RR..."
      ];
      for (let r = 0; r < qmark.length; r++) {
        for (let c = 0; c < qmark[r].length; c++) {
          if (qmark[r][c] === 'R') {
            ctx.fillRect(4 + c, 4 + r, 1, 1);
          }
        }
      }

      // Small hanging icicles
      ctx.fillStyle = C.SNOW_WHITE;
      ctx.fillRect(2, TILE_SIZE - 1, 2, 2);
      ctx.fillRect(8, TILE_SIZE - 1, 2, 3);
      ctx.fillRect(13, TILE_SIZE - 1, 2, 2);

      this.cache['block_question'] = canvas;
    }

    // 4. Empty / Hit Block
    {
      const { canvas, ctx } = this.createCanvas(TILE_SIZE, TILE_SIZE);
      ctx.fillStyle = '#64748b';
      ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);

      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(0, 0, TILE_SIZE, 1);
      ctx.fillRect(0, 0, 1, TILE_SIZE);

      ctx.fillStyle = '#334155';
      ctx.fillRect(0, TILE_SIZE - 1, TILE_SIZE, 1);
      ctx.fillRect(TILE_SIZE - 1, 0, 1, TILE_SIZE);

      // Frost rivets
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(2, 2, 2, 2);
      ctx.fillRect(12, 2, 2, 2);
      ctx.fillRect(2, 12, 2, 2);
      ctx.fillRect(12, 12, 2, 2);

      this.cache['block_empty'] = canvas;
    }

    // 5. Frost Brick Block (Crimson bricks dusted in snow & ice crystals)
    {
      const { canvas, ctx } = this.createCanvas(TILE_SIZE, TILE_SIZE);
      ctx.fillStyle = C.BRICK_RED;
      ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);

      // Mortar lines
      ctx.fillStyle = C.BRICK_MORTAR;
      ctx.fillRect(0, 7, TILE_SIZE, 1);
      ctx.fillRect(0, 15, TILE_SIZE, 1);
      ctx.fillRect(8, 0, 1, 7);
      ctx.fillRect(4, 8, 1, 7);
      ctx.fillRect(12, 8, 1, 7);

      // Snow cap on top
      ctx.fillStyle = C.SNOW_WHITE;
      ctx.fillRect(0, 0, TILE_SIZE, 2);
      ctx.fillRect(3, 2, 3, 1);
      ctx.fillRect(9, 2, 4, 1);

      this.cache['block_brick'] = canvas;
    }

    // 6. Brick shard particle (for breaking animation)
    {
      const { canvas, ctx } = this.createCanvas(8, 8);
      ctx.fillStyle = C.BRICK_RED;
      ctx.fillRect(1, 1, 6, 6);
      ctx.fillStyle = C.SNOW_WHITE;
      ctx.fillRect(1, 1, 6, 2);
      ctx.fillStyle = C.ICE_LIGHT;
      ctx.fillRect(5, 5, 2, 2);
      this.cache['brick_shard'] = canvas;
    }

    // 7. Hanging Icicle (Cavern hazard)
    {
      const { canvas, ctx } = this.createCanvas(TILE_SIZE, TILE_SIZE);
      ctx.fillStyle = C.ICE_LIGHT;
      ctx.beginPath();
      ctx.moveTo(3, 0);
      ctx.lineTo(13, 0);
      ctx.lineTo(8, 16);
      ctx.closePath();
      ctx.fill();

      // Shiny glare
      ctx.fillStyle = C.SNOW_WHITE;
      ctx.fillRect(6, 1, 2, 10);
      this.cache['hazard_icicle'] = canvas;
    }

    // 8. Candy Cane Pipe Components
    // Pipe Top (32 x 16)
    {
      const { canvas, ctx } = this.createCanvas(32, 16);
      // Red & white candy cane stripes
      for (let x = 0; x < 32; x += 8) {
        ctx.fillStyle = C.CANDY_RED;
        ctx.fillRect(x, 0, 4, 16);
        ctx.fillStyle = C.CANDY_WHITE;
        ctx.fillRect(x + 4, 0, 4, 16);
      }
      // Top snowy rim
      ctx.fillStyle = C.SNOW_WHITE;
      ctx.fillRect(0, 0, 32, 4);
      // Hanging snow drips
      ctx.fillRect(2, 4, 3, 3);
      ctx.fillRect(8, 4, 4, 4);
      ctx.fillRect(18, 4, 3, 3);
      ctx.fillRect(25, 4, 4, 5);

      // Subtle border
      ctx.fillStyle = '#1e293b';
      ctx.strokeRect(0, 0, 32, 16);
      this.cache['pipe_top'] = canvas;
    }

    // Pipe Body (32 x 16)
    {
      const { canvas, ctx } = this.createCanvas(32, 16);
      for (let x = 0; x < 32; x += 8) {
        ctx.fillStyle = C.CANDY_RED;
        ctx.fillRect(x, 0, 4, 16);
        ctx.fillStyle = C.CANDY_WHITE;
        ctx.fillRect(x + 4, 0, 4, 16);
      }
      ctx.fillStyle = '#1e293b';
      ctx.strokeRect(2, 0, 28, 16);
      this.cache['pipe_body'] = canvas;
    }
  }

  // --- Collectible Items ---
  generateItemSprites() {
    const C = this.colors;
    const { TILE_SIZE } = this;

    // 1. Snowflake Coin (4 rotating frames)
    for (let frame = 0; frame < 4; frame++) {
      const { canvas, ctx } = this.createCanvas(TILE_SIZE, TILE_SIZE);
      const widthMultiplier = [1, 0.7, 0.4, 0.7][frame];
      const w = Math.max(2, Math.round(12 * widthMultiplier));
      const startX = Math.round((TILE_SIZE - w) / 2);

      // Gold body
      ctx.fillStyle = C.COIN_GOLD;
      ctx.fillRect(startX, 2, w, 12);

      // Shiny core
      ctx.fillStyle = C.COIN_LIGHT;
      ctx.fillRect(startX + 1, 3, Math.max(1, w - 2), 10);

      // White snowflake glint
      ctx.fillStyle = C.SNOW_WHITE;
      ctx.fillRect(startX + Math.floor(w / 2), 6, 1, 4);
      ctx.fillRect(startX + Math.floor(w / 2) - 1, 7, 3, 1);

      this.cache[`coin_${frame}`] = canvas;
    }

    // 2. Frost Mushroom (Super Power-up)
    {
      const { canvas, ctx } = this.createCanvas(TILE_SIZE, TILE_SIZE);
      // Red cap with white snowflake spots
      ctx.fillStyle = C.MARIO_RED;
      ctx.beginPath();
      ctx.arc(8, 7, 7, Math.PI, 0, false);
      ctx.fill();

      // Snowflake dots
      ctx.fillStyle = C.SNOW_WHITE;
      ctx.fillRect(6, 2, 4, 3);
      ctx.fillRect(2, 5, 2, 2);
      ctx.fillRect(12, 5, 2, 2);

      // White fur trim base of cap
      ctx.fillRect(1, 7, 14, 2);

      // Cream stem
      ctx.fillStyle = C.MARIO_SKIN;
      ctx.fillRect(4, 9, 8, 7);

      // Eyes
      ctx.fillStyle = '#000000';
      ctx.fillRect(5, 10, 1, 3);
      ctx.fillRect(10, 10, 1, 3);

      this.cache['powerup_mushroom'] = canvas;
    }

    // 3. 1-Up Mushroom (Green winter cap)
    {
      const { canvas, ctx } = this.createCanvas(TILE_SIZE, TILE_SIZE);
      ctx.fillStyle = '#2b9348';
      ctx.beginPath();
      ctx.arc(8, 7, 7, Math.PI, 0, false);
      ctx.fill();

      ctx.fillStyle = C.SNOW_WHITE;
      ctx.fillRect(6, 2, 4, 3);
      ctx.fillRect(2, 5, 2, 2);
      ctx.fillRect(12, 5, 2, 2);
      ctx.fillRect(1, 7, 14, 2);

      ctx.fillStyle = C.MARIO_SKIN;
      ctx.fillRect(4, 9, 8, 7);
      ctx.fillStyle = '#000000';
      ctx.fillRect(5, 10, 1, 3);
      ctx.fillRect(10, 10, 1, 3);

      this.cache['powerup_1up'] = canvas;
    }

    // 4. Frost Flower (Shoots Snowballs!)
    {
      const { canvas, ctx } = this.createCanvas(TILE_SIZE, TILE_SIZE);
      // Outer ice petals
      ctx.fillStyle = C.FROST_CYAN;
      ctx.fillRect(3, 1, 10, 9);
      ctx.fillRect(1, 3, 14, 5);

      // White center
      ctx.fillStyle = C.SNOW_WHITE;
      ctx.fillRect(4, 3, 8, 5);

      // Eyes
      ctx.fillStyle = C.ICE_DARK;
      ctx.fillRect(6, 4, 1, 3);
      ctx.fillRect(9, 4, 1, 3);

      // Stem
      ctx.fillStyle = '#38b000';
      ctx.fillRect(7, 10, 2, 6);
      ctx.fillRect(4, 12, 3, 2);
      ctx.fillRect(9, 12, 3, 2);

      this.cache['powerup_flower'] = canvas;
    }

    // 5. Holiday Starman (Star Invincibility)
    {
      const { canvas, ctx } = this.createCanvas(TILE_SIZE, TILE_SIZE);
      ctx.fillStyle = C.GIFT_GOLD;
      // Draw star
      ctx.beginPath();
      ctx.moveTo(8, 1);
      ctx.lineTo(10, 6);
      ctx.lineTo(15, 6);
      ctx.lineTo(11, 10);
      ctx.lineTo(13, 15);
      ctx.lineTo(8, 12);
      ctx.lineTo(3, 15);
      ctx.lineTo(5, 10);
      ctx.lineTo(1, 6);
      ctx.lineTo(6, 6);
      ctx.closePath();
      ctx.fill();

      // Shiny eyes
      ctx.fillStyle = '#000000';
      ctx.fillRect(6, 6, 1, 3);
      ctx.fillRect(9, 6, 1, 3);

      this.cache['powerup_star'] = canvas;
    }

    // 6. Snowball Projectile
    {
      const { canvas, ctx } = this.createCanvas(8, 8);
      ctx.fillStyle = C.SNOW_WHITE;
      ctx.beginPath();
      ctx.arc(4, 4, 3.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = C.ICE_LIGHT;
      ctx.fillRect(4, 4, 2, 2);
      this.cache['proj_snowball'] = canvas;
    }

    // 7. Golden Axe (Castle Switch)
    {
      const { canvas, ctx } = this.createCanvas(16, 16);
      ctx.fillStyle = C.GIFT_GOLD;
      ctx.fillRect(2, 2, 6, 4);
      ctx.fillRect(3, 1, 4, 6);
      ctx.fillStyle = C.WOOD_LOG;
      ctx.fillRect(7, 4, 8, 2);
      this.cache['castle_axe'] = canvas;
    }
  }

  // --- Scenery & Landmarks ---
  generateScenerySprites() {
    const C = this.colors;

    // 1. Snowy Pine Tree (32x48)
    {
      const { canvas, ctx } = this.createCanvas(32, 48);
      // Trunk
      ctx.fillStyle = C.WOOD_LOG;
      ctx.fillRect(13, 38, 6, 10);

      // Layer 3 (bottom)
      ctx.fillStyle = '#1b4332';
      ctx.beginPath();
      ctx.moveTo(16, 18);
      ctx.lineTo(30, 38);
      ctx.lineTo(2, 38);
      ctx.closePath();
      ctx.fill();

      // Snow on layer 3
      ctx.fillStyle = C.SNOW_WHITE;
      ctx.fillRect(4, 35, 24, 3);

      // Layer 2 (middle)
      ctx.fillStyle = '#2d6a4f';
      ctx.beginPath();
      ctx.moveTo(16, 10);
      ctx.lineTo(26, 26);
      ctx.lineTo(6, 26);
      ctx.closePath();
      ctx.fill();

      // Snow on layer 2
      ctx.fillStyle = C.SNOW_WHITE;
      ctx.fillRect(7, 23, 18, 3);

      // Layer 1 (top)
      ctx.fillStyle = '#40916c';
      ctx.beginPath();
      ctx.moveTo(16, 2);
      ctx.lineTo(22, 14);
      ctx.lineTo(10, 14);
      ctx.closePath();
      ctx.fill();

      // Snow tip
      ctx.fillStyle = C.SNOW_WHITE;
      ctx.fillRect(13, 2, 6, 4);
      ctx.fillRect(11, 12, 10, 2);

      this.cache['scenery_pine_tree'] = canvas;
    }

    // 2. Snowman (24x32)
    {
      const { canvas, ctx } = this.createCanvas(24, 32);
      // Bottom snowball
      ctx.fillStyle = C.SNOW_WHITE;
      ctx.beginPath();
      ctx.arc(12, 23, 8, 0, Math.PI * 2);
      ctx.fill();

      // Top snowball
      ctx.beginPath();
      ctx.arc(12, 11, 6, 0, Math.PI * 2);
      ctx.fill();

      // Coal eyes
      ctx.fillStyle = '#000000';
      ctx.fillRect(10, 9, 2, 2);
      ctx.fillRect(14, 9, 2, 2);

      // Carrot nose
      ctx.fillStyle = '#fb8500';
      ctx.fillRect(12, 12, 4, 2);

      // Red Scarf
      ctx.fillStyle = C.MARIO_RED;
      ctx.fillRect(7, 16, 10, 3);
      ctx.fillRect(14, 18, 3, 6);

      // Top Hat
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(8, 1, 8, 5);
      ctx.fillRect(5, 5, 14, 2);
      // Red hat band
      ctx.fillStyle = C.MARIO_RED;
      ctx.fillRect(8, 4, 8, 1);

      this.cache['scenery_snowman'] = canvas;
    }

    // 3. Cozy Log Cabin Fortress (64x64) - End of Level Castle
    {
      const { canvas, ctx } = this.createCanvas(64, 64);
      // Walls (log cabin style)
      ctx.fillStyle = C.WOOD_LOG;
      ctx.fillRect(8, 24, 48, 40);

      // Wood log lines
      ctx.fillStyle = C.WOOD_DARK;
      for (let y = 28; y < 64; y += 6) {
        ctx.fillRect(8, y, 48, 1);
      }

      // Cozy door
      ctx.fillStyle = '#2b1704';
      ctx.fillRect(26, 44, 12, 20);
      ctx.fillStyle = C.GIFT_GOLD;
      ctx.fillRect(35, 54, 2, 2); // Brass knob

      // Glowing warm windows
      ctx.fillStyle = C.WINDOW_GLOW;
      ctx.fillRect(12, 34, 10, 10);
      ctx.fillRect(42, 34, 10, 10);
      ctx.fillStyle = C.WOOD_DARK;
      ctx.fillRect(16, 34, 2, 10);
      ctx.fillRect(12, 38, 10, 2);
      ctx.fillRect(46, 34, 2, 10);
      ctx.fillRect(42, 38, 10, 2);

      // Snowy peaked roof
      ctx.fillStyle = C.SNOW_WHITE;
      ctx.beginPath();
      ctx.moveTo(32, 4);
      ctx.lineTo(62, 26);
      ctx.lineTo(2, 26);
      ctx.closePath();
      ctx.fill();

      // Stone chimney
      ctx.fillStyle = '#475569';
      ctx.fillRect(44, 4, 8, 14);
      ctx.fillStyle = C.SNOW_WHITE;
      ctx.fillRect(42, 2, 12, 3); // Snow on chimney

      this.cache['scenery_cabin'] = canvas;
    }

    // 4. Festive Flagpole & Star
    {
      // Star finial
      const { canvas, ctx } = this.createCanvas(16, 16);
      ctx.fillStyle = C.GIFT_GOLD;
      ctx.beginPath();
      ctx.arc(8, 8, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = C.SNOW_WHITE;
      ctx.fillRect(6, 6, 2, 2);
      this.cache['flagpole_star'] = canvas;
    }
  }

  get(name) {
    return this.cache[name] || null;
  }
}

// Global sprite factory instance
let Sprites = null;
function initSprites() {
  if (!Sprites) {
    Sprites = new SpriteEngine();
  }
  return Sprites;
}
// Initialize immediately on script parse
Sprites = initSprites();

