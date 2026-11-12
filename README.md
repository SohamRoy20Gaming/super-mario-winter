# ❄️ Super Mario Winter - The Holiday Adventure 🎅

A classic 8-bit Mario platformer reimagined in a magical winter setting. Built with vanilla HTML5 Canvas, modern JavaScript, and the Web Audio API with zero external dependencies.

![Super Mario Winter](https://img.shields.io/badge/Theme-Winter%20%26%20Holiday-blue?style=for-the-badge&logo=snowflake)
![Platform](https://img.shields.io/badge/Platform-Web%20%2F%20HTML5%20Canvas-green?style=for-the-badge)
![Audio](https://img.shields.io/badge/Audio-Procedural%20Web%20Audio-orange?style=for-the-badge)

---

## 🎮 How to Play

Open `index.html` directly in any modern browser (Chrome, Edge, Firefox, Safari). No web server, node build, or installation required!

### 🕹️ Controls

| Action | Keyboard | Touch / Gamepad |
| :--- | :--- | :--- |
| **Walk Left / Right** | `◀` `▶` or `A` / `D` | Left / Right D-Pad |
| **Jump (Variable height)** | `Space`, `W`, `Up Arrow`, or `Z` | `A` Button |
| **Run / Dash** | Hold `Shift`, `X`, `F`, or `C` | `B` Button |
| **Throw Snowball (Frost Mario)** | Tap `Shift`, `X`, `F`, or `C` | `B` Button |
| **Crouch / Enter Pipes** | `▼` or `S` | Down D-Pad |
| **Pause / Resume Game** | `P` or `Escape` | `⏸️` On-Screen Button / `PAUSE` Touch Button / Tap Canvas |
| **Mute / Unmute Sound** | `M` | `🔊 SOUND` Button |
| **Toggle CRT Scanlines** | Header `📺 CRT` Button | Header Button |
| **Restart Current Stage** | `R` | - |

---

## 🌨️ Winter Theme Features

### 1. 🧣 Cozy Mario
- **Small Mario**: Dressed in a cozy red parka with white fur trim, matching winter pom-pom beanie, brown boots, and warm gloves.
- **Super Mario**: Grown tall with a warm fleece-lined winter parka.
- **Frost Mario (Power-up)**: Glowing icy cyan and white jacket. Capable of throwing bouncing snowballs that freeze and defeat enemies!

### 2. 🐧 Winterized Enemies
- **Snow Goombas**: Waddling little creatures sporting cute pink earmuffs and striped holiday scarves!
- **Frost Koopas**: Wearing knit beanies with tassels. Stomping them tucks them into an icy blue shell that can be kicked at high speeds to knock out rows of enemies.
- **Frost Piranha Plants**: Popping in and out of snowy candy-cane peppermint pipes with sharp icicle teeth.
- **Frost Bowser**: The final fortress boss in World 1-4, breathing frosty fireballs and hopping along the ice bridge!

### 3. 🎁 Winter Blocks & Power-ups
- **Gift '?' Blocks**: Wrapped golden gift boxes tied with festive ribbons and hanging icicles.
- **Frost Bricks**: Crimson bricks dusted with snow that shatter into four spinning ice-brick chunks when struck by Super Mario.
- **Peppermint Pipes**: Candy-cane striped pipes. Pressing Down on certain pipes leads to secret underground vaults!
- **Snowflake Coins**: Glowing 6-point golden snowflakes that spin and chime when collected.
- **Frost Flower**: Ice-blue flower with crystalline petals that grants snowball-throwing powers.
- **Holiday Star**: Golden five-pointed Christmas star granting temporary invincibility, speed boost, and rainbow sparkling trails!

### 4. 🏰 End of Stage Celebrations
- **Festive Flagpole**: Peppermint-striped flagpole with a golden star on top.
- **Cozy Log Cabin**: When Mario slides down the flagpole, he strolls into the warm log cabin while colorful fireworks light up the winter sky!

---

## 🗺️ World Tour (4 Stages)

1. **World 1-1: Frosted Foothills**  
   Classic overworld platforming through pine tree groves, snowmen, candy-cane pipes, and a secret underground coin vault!
2. **World 1-2: Crystal Cavern**  
   Underground ice cave with deep crystal blues, hanging icicles, slippery ice patches, and elevator platforms.
3. **World 1-3: Alpine Treetops**  
   High altitude athletic challenge with floating snow platforms, large gaps, and airborne Koopas.
4. **World 1-4: Bowser's Frost Keep**  
   The frozen castle gauntlet! Avoid the freezing liquid abyss, dodge frost flames, and grab the Golden Axe to send Frost Bowser tumbling!

---

## 🔔 Procedural 8-Bit Audio Engine

The game features an authentic, 100% self-contained procedural synthesizer using the **Web Audio API**:
- **Winter Mario Overworld Theme**: Iconic bouncy Mario melody reimagined with retro pulse waves, triangle bass, and real metallic **jingle sleigh bells**!
- **Underground Theme**: Crystalline, mysterious, echoing ice cave tones.
- **Castle Theme**: Fast, driving, tense bassline for the fortress showdown.
- **Star Theme**: Upbeat, high-speed holiday jingle bells fanfare.
- Authentic retro sound effects: upward pitch sweeps for jumps, dual-tone crystal coin chimes, crunchy brick shatters, and celebratory victory fireworks.

---

## 📁 Project Structure

```
super-mario-winter/
│
├── index.html           # Main game markup, CRT filter overlay, touch D-pad
├── css/
│   └── style.css        # Arcade cabinet bezel styling, scanlines, responsive UI
├── js/
│   ├── audio.js         # Web Audio procedural music & sound effect synthesizer
│   ├── sprites.js       # Procedural pixel-art generator (Mario, enemies, tiles, items)
│   ├── physics.js       # Precise AABB collision, momentum, friction & variable jumps
│   ├── entities.js      # Player, Goomba, Koopa, Bowser, Items, Snow Particles
│   ├── levels.js        # Handcrafted tilemaps for Worlds 1-1 through 1-4
│   └── game.js          # Core loop, camera tracking, HUD, input, state machine
└── README.md            # Documentation and game guide
```

---

❄️ *Enjoy your journey through the Super Mario Winter Kingdom!*
