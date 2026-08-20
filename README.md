# 🎮 Game Bundle: Chess Master Academy + Typing Zombie Master

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/chess-typing-games)

## 📸 Live Demo

👉 **[Play Chess Academy Here](https://your-project.vercel.app)**  
👉 **[Play Typing Zombies Here](https://your-project.vercel.app)**

---

## 🎯 Games Included

### ♟️ Chess Master Academy
A complete chess learning platform to help you reach 2000 ELO!

- **7 Interactive Tabs**: Play, Lessons, Gambits, Tactics, Openings, Endgame, Progress
- **AI Opponent**: 8 difficulty levels (Beginner → Elite) with custom minimax engine
- **19+ Lessons**: Comprehensive chess curriculum
- **Gambit Training**: King's Gambit, Queen's Gambit, Evans Gambit, Scotch Gambit & more
- **Tactics Trainer**: 15+ tactical puzzles
- **Opening Theory**: 8 popular openings explained
- **Endgame Training**: 9 critical endgame positions
- **ELO Tracking**: Start at 1000 ELO, goal is 2000!

### 🧟 Typing Zombie Master
An action-packed typing game with smooth animations!

- **Smooth Canvas Animations**: 60 FPS gameplay
- **Particle Effects**: Explosions, blood splatter, screen shake
- **Wave System**: Progressive difficulty with boss zombies
- **3 Zombie Types**: Normal (green), Fast (red), Boss (purple)
- **Upgrade Shop**: Damage, Ammo, Health, Multi-shot
- **Leaderboard**: Track your high scores
- **Combo System**: Chain kills for bonus points

---

## 🚀 Quick Start

### Option 1: Play Online (Recommended)
Just visit the live URL - no installation needed!

### Option 2: Run Locally

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/chess-typing-games.git

# Navigate to project
cd chess-typing-games

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🛠️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| **Next.js 16** | React framework |
| **TypeScript** | Type safety |
| **Tailwind CSS** | Styling |
| **shadcn/ui** | UI components |
| **chess.js** | Chess logic engine |
| **Canvas API** | Typing game graphics |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx              # Main app with game launcher
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── components/ui/            # shadcn/ui components
└── lib/
    ├── chess/                # ♟️ Chess Game
    │   ├── ChessBoard.tsx    # Interactive board
    │   ├── ChessEngine.ts    # AI engine (8 levels)
    │   └── LessonsData.ts    # All lessons/gambits/puzzles
    └── games/
        └── typing-zombie/    # 🧟 Typing Game
            ├── ZombieTypingMaster.tsx  # Main game component
            └── types.ts      # Game types
```

---

## 🎮 How to Play

### Chess Academy
1. Click **"Play Chess"** tab
2. Select difficulty level
3. Click pieces to select, click destination to move
4. Learn from lessons and practice tactics!

### Typing Zombies
1. Click **"Typing Zombies"** in launcher
2. Type words displayed on zombies before they reach you!
3. Buy upgrades between waves
4. Survive as long as possible!

---

## 🌐 Deploy Your Own Copy

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new?clone=https://github.com/YOUR_USERNAME/chess-typing-games)

### Manual Deploy

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

---

## 📊 Features Comparison

| Feature | Chess Academy | Typing Zombies |
|---------|--------------|----------------|
| AI Opponent | ✅ 8 levels | N/A |
| Educational Content | ✅ 50+ lessons | N/A |
| Progress Tracking | ✅ ELO system | ✅ High scores |
| Smooth Animations | ✅ | ✅ 60 FPS |
| Sound Effects | ❌ (coming soon) | ❌ (coming soon) |
| Mobile Support | ✅ | ⚠️ (desktop recommended) |
| Difficulty Scaling | ✅ | ✅ Wave system |

---

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Add new chess lessons or zombie types

---

## 📄 License

This project is open source and available for educational purposes.

---

## 👨‍💻 Author

Built with ❤️ by Super Z AI

---

## ⭐ Star This Project!

If you enjoy these games, please give it a star on GitHub! ⭐

---

**🎮 Happy Gaming!**
