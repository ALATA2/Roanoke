# Roanoke: The 101

**Roanoke: The 101** is a dark, atmospheric, mobile-first survival RTS game built entirely with vanilla web technologies. Manage exactly 101 settlers on the mysterious island of Roanoke, balance resource production, and protect them from the horrors that lurk in the dark fog at night.

## 🎮 Playable Concept & Mechanics

The game is optimized for touch devices and small viewports (with a 100dvh layout). The screen is split into:
1. **Top Bar HUD (8% height)**: Tracks current Day, total surviving Population, Food, and Wood reserves.
2. **Game Map Canvas (52% height)**: Renders a top-down view of Roanoke Island in real-time, including:
   - **The Fort (Center)**: The safe zone illuminated by a warm, pulsing campfire.
   - **The Forest (Top-Left)**: The woodcutting zone where settlers chop pine trees.
   - **The Coast (Bottom-Right)**: The fishing zone where fishers gather food.
3. **Control Panel (40% height)**: Tactile assignment buttons, a real-time event log, and the emergency recall button.

### 👥 Swarm Flocking AI
Colonists do not use simple linear lines or grid pathfinding; instead, they move using a custom steering behavior:
- **Attraction**: They accelerate towards their assigned zone's center with a customized, randomized circular offset. This spreads them out naturally across the destination.
- **Separation**: To prevent overlapping into a single point, they maintain a local separation distance, sliding around each other when crowded.
- **Brownian Drift**: Once working, colonists wobble and wander slightly to simulate active chopping or fishing.
- **Visual Feedback**: Colonists are color-coded based on their current task (Idle = Parchment White, Woodcutters = Golden Brown, Fishers = Water Blue). At night, colonists who are outside the safe zone flash with a red warning halo.

### ⏱️ Day/Night Cycle & The Threat
- **☀️ Day (30 seconds)**:
  - Woodcutters harvest wood (+0.25/s per worker).
  - Fishers gather food (+0.45/s per worker).
  - Idle colonists rest in the Fort and consume food (-0.18/s per idle colonist). Active workers do not consume rations while harvesting.
- **🌙 Night (15 seconds)**:
  - The canvas is swallowed by a creeping radial dark fog centered around the Fort.
  - An emergency warning horn blows, reminding you to recall your workforce.
  - **The Threat**: Any colonist remaining outside the Fort's palisades is vulnerable. Each second, they run a risk of disappearing permanently into the fog.
  - **The Recall**: Clicking the **RECALL ALL TO FORT** button immediately sets all workers to Idle, causing them to rush back to the safety of the Fort. Since they travel in real-time, you must recall them *before* nightfall so they have time to walk back!

### 💀 Game Over
- **CROATAN**: If Food reserves reach 0 (famine) or Population falls to 0 (all taken), the colony is lost. The game over screen appears showing your survival stats and a restart option.

## 🛠️ Technical Stack
- **Structure**: Semantic HTML5.
- **Styling**: Vanilla CSS, Flexbox, CSS variables, glassmorphic modals (`backdrop-filter`), CSS animations, and responsiveness optimized for mobile viewports (`dvh`).
- **Logic**: Vanilla ES6 JavaScript Classes.
- **Rendering**: Hardware-accelerated HTML5 `<canvas>` scaled for High-DPI screens.
- **Sound**: Real-time synthesized soundscapes using the browser's native **Web Audio API** (wind drone, wood chopping, water splashes, alarm horns, daybreak swells, and eerie bass sweeps for vanishings). No external assets are loaded.

## 🚀 Getting Started
Simply open `index.html` in any modern desktop or mobile browser.
