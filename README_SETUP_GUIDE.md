# 🎮 Complete Game Bundle - Chess Master Academy + Typing Zombie Master

## 📦 What's Included

| Game | Description | Files |
|------|-------------|-------|
| **♟️ Chess Master Academy** | Complete chess learning platform with AI opponent, lessons, gambits, tactics, openings, endgames | `src/app/page.tsx`, `src/lib/chess/` |
| **🧟 Typing Zombie Master** | Action typing game with smooth animations, particle effects, waves, upgrades | `src/lib/games/typing-zombie/` |

---

## 🚀 Quick Start (3 Methods)

### Method 1: Standard (If you have good internet)

```bash
# Extract the zip
unzip CompleteGameBundle_Chess+Typing.zip -d my-games
cd my-games

# Install dependencies
npm install

# Run!
npm run dev
```

Then open: **http://localhost:3000**

---

### Method 2: If npm install FAILS (Network Error Fix) 🔧

Your error `ECONNRESET` means **network connection was reset**. Try these:

#### Option A: Use a VPN or Different Network
```bash
# Turn on VPN, then try again
npm install
```

#### Option B: Clear npm Cache & Retry
```bash
npm cache clean --force
npm install --prefer-offline
```

#### Option C: Use yarn Instead of npm
```bash
# Install yarn first (if you don't have it)
npm install -g yarn

# Then use yarn to install
yarn install
yarn dev
```

#### Option D: Use pnpm (Fastest)
```bash
# Install pnpm
npm install -g pnpm

# Install with pnpm
pnpm install
pnpm dev
```

#### Option E: Increase Network Timeout
```bash
npm install --fetch-timeout=120000
```

#### Option F: Use Chinese Mirror (If you're in China)
```bash
npm install --registry=https://registry.npmmirror.com
```

---

### Method 3: Offline Mode (No Internet Needed After Setup)

**Ask someone with good internet to do this for you:**

1. They run `npm install` on their machine
2. They zip the ENTIRE folder INCLUDING `node_modules`
3. You extract and just run `npm run dev`

---

## 📁 Project Structure

```
my-games/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Main app with game launcher
│   │   ├── layout.tsx            # Root layout
│   │   └── globals.css           # Global styles
│   ├── components/ui/            # shadcn/ui components
│   └── lib/
│       ├── chess/                # ♟️ Chess Game
│       │   ├── ChessBoard.tsx    # Interactive board
│       │   ├── ChessEngine.ts    # AI engine (8 levels)
│       │   └── LessonsData.ts    # All lessons/gambits/puzzles
│       └── games/
│           └── typing-zombie/    # 🧟 Typing Game
│               ├── ZombieTypingMaster.tsx  # Main game component
│               └── types.ts      # Game types
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## 🎮 How to Play

### Chess Academy
1. Open http://localhost:3000
2. Click **"Play Chess"** tab
3. Select difficulty (Beginner → Elite)
4. Click pieces to move, learn from lessons!

### Typing Zombies
1. Click **"Typing Zombies"** in the launcher
2. Type words on zombies before they reach you!
3. Buy upgrades between waves
4. Survive as long as possible!

---

## ⚠️ Common Issues & Fixes

| Error | Solution |
|-------|----------|
| `ECONNRESET` | Use VPN, or try yarn/pnpm instead |
| `EPERM` | Run Git Bash as Administrator |
| `ENOMEM` | Close other apps, free RAM |
| Port 3000 in use | `npm run dev -- -p 3001` |
| TypeScript errors | Delete `.next` folder, restart |

---

## 🔧 System Requirements

- **Node.js**: v18+ (recommended v20)
- **RAM**: 4GB minimum, 8GB recommended
- **Disk**: 2GB free (for node_modules)
- **OS**: Windows 10/11, macOS, Linux

---

## 💡 Pro Tips

1. **First time setup takes 5-10 minutes** (downloading all packages)
2. **Don't move the project folder** after installing (breaks paths)
3. **Keep the terminal open** while playing (dev server runs there)
4. **Ctrl+C** in terminal stops the server

---

## 📞 Still Having Trouble?

**Try this step-by-step:**

```bash
# 1. Check Node version (must be 18+)
node --version

# 2. If old, reinstall from nodejs.org

# 3. Delete everything and start fresh
rm -rf node_modules .next
rm package-lock.json

# 4. Try installing one more time
npm install

# 5. If still fails, use yarn
npm install -g yarn
yarn install
yarn dev
```

---

**Made with ❤️ by Super Z AI**
