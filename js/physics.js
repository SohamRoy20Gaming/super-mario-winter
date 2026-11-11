/**
 * Super Mario Winter - Physics Engine & Collision Detection
 */

const Physics = {
  // Movement & Gravity Constants
  GRAVITY: 0.38,
  LOW_GRAVITY: 0.18,       // Applied when Mario holds jump key while rising
  MAX_FALL_SPEED: 7.0,
  
  WALK_ACCEL: 0.14,
  WALK_SPEED: 2.2,
  RUN_ACCEL: 0.22,
  RUN_SPEED: 3.6,
  
  SKID_DECEL: 0.25,
  FRICTION: 0.86,
  ICE_FRICTION: 0.95,      // Slippery ice physics!
  
  JUMP_FORCE: -7.5,
  SUPER_JUMP_FORCE: -8.0,
  ENEMY_BOUNCE_FORCE: -5.6,
  SPRING_BOUNCE_FORCE: -10.0,

  // AABB Collision Detection
  rectsIntersect(r1, r2) {
    return (
      r1.x < r2.x + r2.w &&
      r1.x + r1.w > r2.x &&
      r1.y < r2.y + r2.h &&
      r1.y + r1.h > r2.y
    );
  },

  // Check tile collision for entity bounding box
  checkTileCollision(entity, level) {
    const tileSize = 16;
    const startCol = Math.floor(entity.x / tileSize);
    const endCol = Math.floor((entity.x + entity.w - 0.01) / tileSize);
    const startRow = Math.floor(entity.y / tileSize);
    const endRow = Math.floor((entity.y + entity.h - 0.01) / tileSize);

    const collisions = [];

    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        const tile = level.getTile(c, r);
        if (tile && tile.solid) {
          collisions.push({
            col: c,
            row: r,
            x: c * tileSize,
            y: r * tileSize,
            w: tileSize,
            h: tileSize,
            tile: tile
          });
        }
      }
    }
    return collisions;
  },

  // Resolve entity horizontal movement with level tiles
  moveHorizontal(entity, level) {
    entity.x += entity.vx;
    const collisions = this.checkTileCollision(entity, level);

    for (const c of collisions) {
      if (entity.vx > 0) {
        // Moving right, hit left side of solid
        entity.x = c.x - entity.w;
        entity.vx = 0;
        entity.onWallHit?.(1);
        break;
      } else if (entity.vx < 0) {
        // Moving left, hit right side of solid
        entity.x = c.x + c.w;
        entity.vx = 0;
        entity.onWallHit?.(-1);
        break;
      }
    }
  },

  // Resolve entity vertical movement with level tiles
  moveVertical(entity, level) {
    entity.y += entity.vy;
    entity.grounded = false;

    const collisions = this.checkTileCollision(entity, level);

    for (const c of collisions) {
      if (entity.vy > 0) {
        // Falling down, landed on top of solid
        entity.y = c.y - entity.h;
        entity.vy = 0;
        entity.grounded = true;
        entity.onLand?.(c);
        break;
      } else if (entity.vy < 0) {
        // Moving up, hit head on bottom of solid
        entity.y = c.y + c.h;
        entity.vy = 0;

        // Prioritize block closest to entity's horizontal center
        let bestTile = c;
        const centerX = entity.x + entity.w / 2;
        let bestDist = Math.abs((c.x + 8) - centerX);
        for (const other of collisions) {
          const dist = Math.abs((other.x + 8) - centerX);
          if (dist < bestDist) {
            bestDist = dist;
            bestTile = other;
          }
        }

        entity.onCeilingHit?.(bestTile);
        break;
      }
    }
  }
};
