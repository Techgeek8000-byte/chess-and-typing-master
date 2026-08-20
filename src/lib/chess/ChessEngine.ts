import { Chess, Move } from 'chess.js';

export type Difficulty = 
  | 'beginner'      // 800-1000 ELO
  | 'easy'          // 1000-1200 ELO
  | 'intermediate'  // 1200-1400 ELO
  | 'advanced'      // 1400-1600 ELO
  | 'expert'        // 1600-1800 ELO
  | 'master'        // 1800-2000 ELO
  | 'grandmaster'   // 2000-2200 ELO
  | 'elite';        // 2200-2500+ ELO

export interface EngineConfig {
  difficulty: Difficulty;
  depth?: number;
  randomness?: number;
  blunderRate?: number;
}

interface MoveEvaluation {
  move: string;
  score: number;
  mate?: number;
}

// Piece values for evaluation
const PIECE_VALUES: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000
};

// Piece-square tables for positional evaluation
const PST: Record<string, number[]> = {
  p: [
    0,  0,  0,  0,  0,  0,  0,  0,
    50, 50, 50, 50, 50, 50, 50, 50,
    10, 10, 20, 30, 30, 20, 10, 10,
    5,  5, 10, 25, 25, 10,  5,  5,
    0,  0,  0, 20, 20,  0,  0,  0,
    5, -5,-10,  0,  0,-10, -5,  5,
    5, 10, 10,-20,-20, 10, 10,  5,
    0,  0,  0,  0,  0,  0,  0,  0
  ],
  n: [
    -50,-40,-30,-30,-30,-30,-40,-50,
    -40,-20,  0,  0,  0,  0,-20,-40,
    -30,  0, 10, 15, 15, 10,  0,-30,
    -30,  5, 15, 20, 20, 15,  5,-30,
    -30,  0, 15, 20, 20, 15,  0,-30,
    -30,  5, 10, 15, 15, 10,  5,-30,
    -40,-20,  0,  5,  5,  0,-20,-40,
    -50,-40,-30,-30,-30,-30,-40,-50
  ],
  b: [
    -20,-10,-10,-10,-10,-10,-10,-20,
    -10,  0,  0,  0,  0,  0,  0,-10,
    -10,  0,  5, 10, 10,  5,  0,-10,
    -10,  5,  5, 10, 10,  5,  5,-10,
    -10,  0, 10, 10, 10, 10,  0,-10,
    -10, 10, 10, 10, 10, 10, 10,-10,
    -10,  5,  0,  0,  0,  0,  5,-10,
    -20,-10,-10,-10,-10,-10,-10,-20
  ],
  r: [
    0,  0,  0,  0,  0,  0,  0,  0,
    5, 10, 10, 10, 10, 10, 10,  5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    0,  0,  0,  5,  5,  0,  0,  0
  ],
  q: [
    -20,-10,-10, -5, -5,-10,-10,-20,
    -10,  0,  0,  0,  0,  0,  0,-10,
    -10,  0,  5,  5,  5,  5,  0,-10,
    -5,  0,  5,  5,  5,  5,  0, -5,
    0,  0,  5,  5,  5,  5,  0, -5,
    -10,  5,  5,  5,  5,  5,  0,-10,
    -10,  0,  5,  0,  0,  0,  0,-10,
    -20,-10,-10, -5, -5,-10,-10,-20
  ],
  k: [
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -20,-30,-30,-40,-40,-30,-30,-20,
    -10,-20,-20,-20,-20,-20,-20,-10,
    20, 20,  0,  0,  0,  0, 20, 20,
    20, 30, 10,  0,  0, 10, 30, 20
  ]
};

// Difficulty configurations
const DIFFICULTY_CONFIGS: Record<Difficulty, { depth: number; randomness: number; blunderRate: number }> = {
  beginner:       { depth: 1, randomness: 0.4, blunderRate: 0.3 },
  easy:           { depth: 2, randomness: 0.3, blunderRate: 0.2 },
  intermediate:   { depth: 2, randomness: 0.2, blunderRate: 0.1 },
  advanced:       { depth: 3, randomness: 0.1, blunderRate: 0.05 },
  expert:         { depth: 3, randomness: 0.05, blunderRate: 0.02 },
  master:         { depth: 4, randomness: 0.02, blunderRate: 0.01 },
  grandmaster:    { depth: 5, randomness: 0.01, blunderRate: 0.005 },
  elite:          { depth: 6, randomness: 0, blunderRate: 0 }
};

export class ChessEngine {
  private config: EngineConfig;
  private nodesSearched: number = 0;
  
  constructor(config: EngineConfig) {
    this.config = {
      ...config,
      ...DIFFICULTY_CONFIGS[config.difficulty]
    };
  }

  getBestMove(game: Chess): string | null {
    const moves = game.moves({ verbose: true });
    
    if (moves.length === 0) return null;

    // For beginner level, sometimes make random moves
    if (Math.random() < this.config.randomness) {
      const randomMove = moves[Math.floor(Math.random() * moves.length)];
      return randomMove.from + randomMove.to;
    }

    // Search for best move
    const result = this.minimax(
      game, 
      this.config.depth, 
      -Infinity, 
      Infinity, 
      true
    );

    if (!result) {
      // Fallback to random legal move
      const fallbackMove = moves[Math.floor(Math.random() * moves.length)];
      return fallbackMove.from + fallbackMove.to;
    }

    // Occasionally make a blunder based on difficulty
    if (Math.random() < this.config.blunderRate) {
      const weakerMoves = moves.filter(m => m.from + m.to !== result);
      if (weakerMoves.length > 0) {
        const blunder = weakerMoves[Math.floor(Math.random() * weakerMoves.length)];
        return blunder.from + blunder.to;
      }
    }

    return result;
  }

  private minimax(
    game: Chess, 
    depth: number, 
    alpha: number, 
    beta: number, 
    isMaximizing: boolean
  ): string | null {
    this.nodesSearched++;

    if (depth === 0 || game.isGameOver()) {
      return null; // Return evaluation instead of move at leaf nodes
    }

    const moves = game.moves({ verbose: true });
    
    if (moves.length === 0) return null;

    let bestMove: string | null = null;

    if (isMaximizing) {
      let maxEval = -Infinity;
      
      for (const move of moves) {
        const gameCopy = new Chess(game.fen());
        try {
          gameCopy.move(move);
          
          const evalScore = this.evaluatePosition(gameCopy);
          
          if (depth > 1) {
            const result = this.minimax(gameCopy, depth - 1, alpha, beta, false);
            // Continue search for deeper evaluation
          }
          
          if (evalScore > maxEval) {
            maxEval = evalScore;
            bestMove = move.from + move.to;
          }
          
          alpha = Math.max(alpha, evalScore);
          if (beta <= alpha) break; // Beta cutoff
        } catch {
          // Invalid move, skip
        }
      }
    } else {
      let minEval = Infinity;
      
      for (const move of moves) {
        const gameCopy = new Chess(game.fen());
        try {
          gameCopy.move(move);
          
          const evalScore = this.evaluatePosition(gameCopy);
          
          if (depth > 1) {
            const result = this.minimax(gameCopy, depth - 1, alpha, beta, true);
          }
          
          if (evalScore < minEval) {
            minEval = evalScore;
            bestMove = move.from + move.to;
          }
          
          beta = Math.min(beta, evalScore);
          if (beta <= alpha) break; // Alpha cutoff
        } catch {
          // Invalid move, skip
        }
      }
    }

    return bestMove;
  }

  evaluatePosition(game: Chess): number {
    if (game.isCheckmate()) {
      return game.turn() === 'w' ? -100000 : 100000;
    }
    
    if (game.isDraw() || game.isStalemate()) {
      return 0;
    }

    let score = 0;
    
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const square = String.fromCharCode(97 + j) + (8 - i);
        const piece = game.get(square);
        
        if (piece) {
          const pieceValue = PIECE_VALUES[piece.type] || 0;
          const pstValue = this.getPSTValue(piece.type, piece.color === 'w' ? i : 7 - i, j);
          
          if (piece.color === 'w') {
            score += pieceValue + pstValue;
          } else {
            score -= pieceValue + pstValue;
          }
        }
      }
    }

    return score;
  }

  private getPSTValue(pieceType: string, row: number, col: number): number {
    const table = PST[pieceType];
    if (!table) return 0;
    return table[row * 8 + col];
  }

  evaluateGame(game: Chess): number {
    return this.evaluatePosition(game) / 100; // Convert to centipawns
  }

  getAnalysis(game: Chess): { bestMove: string; evaluation: string; depth: number } {
    const bestMove = this.getBestMove(game);
    const evaluation = this.evaluatePosition(game);
    
    return {
      bestMove: bestMove || '',
      evaluation: evaluation > 0 ? `+${(evaluation / 100).toFixed(2)}` : `${(evaluation / 100).toFixed(2)}`,
      depth: this.config.depth
    };
  }

  getNodesSearched(): number {
    return this.nodesSearched;
  }

  resetNodes(): void {
    this.nodesSearched = 0;
  }
}

// Factory function for creating engines
export function createEngine(difficulty: Difficulty): ChessEngine {
  return new ChessEngine({ difficulty });
}

// Get ELO range for difficulty
export function getEloRange(difficulty: Difficulty): { min: number; max: number } {
  const ranges: Record<Difficulty, { min: number; max: number }> = {
    beginner:     { min: 800,  max: 1000 },
    easy:         { min: 1000, max: 1200 },
    intermediate: { min: 1200, max: 1400 },
    advanced:     { min: 1400, max: 1600 },
    expert:       { min: 1600, max: 1800 },
    master:       { min: 1800, max: 2000 },
    grandmaster:  { min: 2000, max: 2200 },
    elite:        { min: 2200, max: 2600 }
  };
  return ranges[difficulty];
}
