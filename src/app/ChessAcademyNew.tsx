'use client';

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { Chess, Move } from 'chess.js';

// ==================== TYPES ====================
type TabType = 'play' | 'lessons' | 'gambits' | 'tactics' | 'progress';
type Difficulty = 'beginner' | 'easy' | 'intermediate' | 'hard' | 'expert' | 'master';
type PieceSymbol = 'K' | 'Q' | 'R' | 'B' | 'N' | 'P' | 'k' | 'q' | 'r' | 'b' | 'n' | 'p';
type Square = string;

interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  gamesDrawn: number;
  currentElo: number;
  puzzlesSolved: number;
  lessonsCompleted: number;
  winStreak: number;
  bestWinStreak: number;
}

interface InteractiveLesson {
  id: string;
  title: string;
  description: string;
  level: Difficulty;
  category: string;
  duration: number;
  steps: LessonStep[];
  quiz?: QuizQuestion[];
}

interface LessonStep {
  type: 'text' | 'move' | 'question' | 'highlight' | 'explanation';
  content: string;
  fen?: string;
  from?: Square;
  to?: Square;
  highlights?: Square[];
  explanation?: string;
}

interface QuizQuestion {
  id: string;
  question: string;
  fen: string;
  correctAnswer: string;
  options: string[];
  explanation: string;
}

interface GambitLesson {
  id: string;
  name: string;
  description: string;
  level: Difficulty;
  moves: GambitMove[];
  counterGambits?: CounterGambit[];
  plans: string[];
  traps: TrapMove[];
}

interface GambitMove {
  move: string;
  explanation: string;
  fen?: string;
  alternativeMoves?: { move: string; response: string; evaluation: string }[];
}

interface CounterGambit {
  name: string;
  moves: GambitMove[];
  reason: string;
  risk: 'low' | 'medium' | 'high';
}

interface TrapMove {
  move: string;
  trapName: string;
  expectedWrongReply: string;
  punishment: string;
  fen: string;
}

// ==================== INTERACTIVE LESSONS DATA ====================
const INTERACTIVE_LESSONS: InteractiveLesson[] = [
  // ==================== BEGINNER ====================
  {
    id: 'basics-1',
    title: '🎯 The Board & Pieces',
    description: 'Learn the chessboard setup with interactive demonstrations',
    level: 'beginner',
    category: 'Fundamentals',
    duration: 15,
    steps: [
      {
        type: 'text',
        content: 'Welcome to Chess Master Academy! Let\'s start by understanding the battlefield - the chessboard.'
      },
      {
        type: 'move',
        content: 'The board has 64 squares in an 8×8 grid. Notice how White always has a light square on their bottom-right (h1). This is the starting position:',
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
      },
      {
        type: 'highlight',
        content: 'The corners (a1, h1, a8, h8) belong to ROOKS (♖/♜) - your heavy artillery for open files.',
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        highlights: ['a1', 'h1', 'a8', 'h8']
      },
      {
        type: 'highlight',
        content: 'KNIGHTS (♘/♞) sit next to Rooks. Knights are unique - they jump in L-shapes and are the ONLY pieces that can leap over others!',
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        highlights: ['b1', 'g1', 'b8', 'g8']
      },
      {
        type: 'highlight',
        content: 'BISHOPS (♗/♝) flank the Knights. Each Bishop stays on its color FOREVER! Having both ("the bishop pair") is powerful.',
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        highlights: ['c1', 'f1', 'c8', 'f8']
      },
      {
        type: 'highlight',
        content: 'The QUEEN (♕/♛) goes on her OWN COLOR. She\'s your most powerful piece - combining Rook + Bishop movement!',
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        highlights: ['d1', 'd8']
      },
      {
        type: 'highlight',
        content: 'The KING (♔/♚) takes the last center square. Protect him at all costs - if he\'s checkmated, you LOSE!',
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        highlights: ['e1', 'e8']
      },
      {
        type: 'text',
        content: '💡 TIP: Remember "White on Right" - the light corner square (h1) should be on your right when playing White!'
      }
    ],
    quiz: [{
      id: 'q1',
      question: 'Where does the Queen go at the start of the game?',
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      correctAnswer: 'd1',
      options: ['d1', 'e1', 'c1', 'f1'],
      explanation: 'The Queen always starts on her own color. For White, that\'s d1 (a light square). For Black, it\'s d8 (a dark square).'
    }]
  },
  {
    id: 'basics-2',
    title: '♚ How Pieces Move',
    description: 'Interactive demonstration of all piece movements',
    level: 'beginner',
    category: 'Fundamentals',
    duration: 30,
    steps: [
      {
        type: 'text',
        content: 'Each piece moves differently. Let\'s see them in action on a real board!'
      },
      {
        type: 'move',
        content: 'The KING moves ONE square in any direction. Watch as the King demonstrates his limited but crucial range:',
        fen: '8/8/8/8/8/8/8/4K2k w - - 0 1',
        from: 'e1',
        to: 'e2'
      },
      {
        type: 'move',
        content: 'The King can also move diagonally, horizontally, or backward - but only one square at a time:',
        fen: '8/8/8/8/8/8/8/4K2k w - - 0 1',
        from: 'e1',
        to: 'd2'
      },
      {
        type: 'move',
        content: 'The QUEEN is your most powerful piece! She can move any number of squares in ANY direction (horizontal, vertical, diagonal):',
        fen: '4k3/8/8/8/8/8/8/4Q2K w - - 0 1',
        from: 'e1',
        to: 'e8'
      },
      {
        type: 'move',
        content: 'Watch the Queen slide diagonally too - she combines Rook and Bishop powers:',
        fen: '4k3/8/8/8/8/8/8/4Q2K w - - 0 1',
        from: 'e1',
        to: 'h5'
      },
      {
        type: 'move',
        content: 'ROOKS move horizontally or vertically any distance. Great for controlling open files and ranks:',
        fen: '4k3/8/8/8/8/8/8/R3K3 w - - 0 1',
        from: 'a1',
        to: 'a8'
      },
      {
        type: 'move',
        content: 'BISHOPS move only on DIAGONALS. Each Bishop is stuck on its starting color forever:',
        fen: '4k3/8/8/8/8/8/8/B2QK3 w - - 0 1',
        from: 'a1',
        to: 'h8'
      },
      {
        type: 'move',
        content: 'The KNIGHT moves in an L-shape: 2 squares in one direction, then 1 square perpendicular. The KNIGHT IS THE ONLY PIECE THAT CAN JUMP OVER OTHERS!',
        fen: '4k3/8/8/8/8/8/8/1N2K3 w - - 0 1',
        from: 'b1',
        to: 'c3'
      },
      {
        type: 'move',
        content: 'Knights can reach up to 8 different squares from a central position. Watch another L-shaped jump:',
        fen: '4k3/8/8/8/8/8/8/1N2K3 w - - 0 1',
        from: 'b1',
        to: 'a3'
      },
      {
        type: 'move',
        content: 'PAWNS move FORWARD one square (or two from their starting position), but capture DIAGONALLY forward:',
        fen: '4k3/8/8/8/8/8/4P3/4K3 w - - 0 1',
        from: 'e2',
        to: 'e4'
      },
      {
        type: 'text',
        content: '⚠️ IMPORTANT: Pawns can NEVER move backward or sideways (only when capturing)! Every pawn push is permanent.'
      }
    ]
  },
  // ==================== INTERMEDIATE ====================
  {
    id: 'tactics-1',
    title: '⚔️ Fork Attacks',
    description: 'Learn to spot and execute devastating fork attacks',
    level: 'intermediate',
    category: 'Tactics',
    duration: 25,
    steps: [
      {
        type: 'text',
        content: 'A FORK (or "double attack") occurs when ONE piece attacks TWO or more enemy pieces simultaneously. Your opponent can only save one - you capture the other!'
      },
      {
        type: 'move',
        content: 'KNIGHT FORKS are especially dangerous because of the Knight\'s unique L-shaped movement. Here, White plays Nf7+ forking King & Queen:',
        fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 0 1',
        from: 'h5',
        to: 'f7'
      },
      {
        type: 'explanation',
        content: 'The Knight on f7 attacks the King (forcing it to move) AND threatens the Queen on d8. After King moves, Nxd8 wins the Queen!',
        fen: 'r1bqkb1r/pppp1Qpp/2n2n2/4p3/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 1'
      },
      {
        type: 'move',
        content: 'PAWN FORKS are underrated! A single pawn can fork two pieces by advancing. Watch this pawn fork the Rook and Knight:',
        fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2P1P3/5N2/PP1P1PPP/RNBQKB1R b KQkq - 0 1',
        from: 'd4',
        to: 'd5'
      },
      {
        type: 'explanation',
        content: 'The pawn on d5 now attacks the Knight on c6 and potentially creates threats against other pieces. Pawn forks often go unnoticed until it\'s too late!',
        fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1P3/2P1P3/5N2/PP3PPP/RNBQKB1R b KQkq - 0 1'
      },
      {
        type: 'move',
        content: 'QUEEN FORKS are devastating because the Queen controls all directions. Here, Qb8+ forks King and Rook:',
        fen: '2kr4/ppp2ppp/2n5/3q4/8/2N5/PPPQPPPP/R1BK3R w - - 0 1',
        from: 'd2',
        to: 'b8'
      },
      {
        type: 'text',
        content: '💡 PATTERN RECOGNITION: Before every move, ask yourself: "Does this move create any forks?" This habit alone will dramatically improve your tactical vision!'
      }
    ]
  },
  {
    id: 'tactics-2',
    title: '📌 Pins & Skewers',
    description: 'Master these related tactical patterns exploiting piece alignment',
    level: 'intermediate',
    category: 'Tactics',
    duration: 30,
    steps: [
      {
        type: 'text',
        content: 'A PIN occurs when a piece cannot move because doing so would expose a MORE VALUABLE piece behind it to capture.'
      },
      {
        type: 'move',
        content: 'ABSOLUTE PIN: The pinned piece CANNOT move because the King would be exposed to check. The Bishop pins the Knight to the King:',
        fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 0 1',
        from: 'c4',
        to: 'b5'
      },
      {
        type: 'explanation',
        content: 'The Knight on f6 is ABSOLUTELY PINNED - if it moves, the King would be in check from the Bishop. The Knight is essentially paralyzed!',
        fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/1BB1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 0 1'
      },
      {
        type: 'text',
        content: 'RELATIVE PIN: The pinned piece CAN move, but would expose a valuable piece (Queen/Rook) to capture. Players sometimes fall for these!'
      },
      {
        type: 'move',
        content: 'A SKEWER is like a "reverse pin" - the MORE valuable piece is in front. When it moves, the less valuable piece behind gets captured:',
        fen: 'r3k2r/pppq1ppp/2np1n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/RNBQK2R w KQkq - 0 1',
        from: 'a1',
        to: 'a8'
      },
      {
        type: 'explanation',
        content: 'The Rook skewers the King and Queen! When the King moves away, Rxa8 wins the Queen. Skewers are especially effective along files and ranks.',
        fen: '4k2r/pppq1ppp/2np1n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/RNBQK2R b kq - 0 1'
      },
      {
        type: 'text',
        content: '⚠️ WARNING: Always check for pins against YOUR pieces too! Don\'t carelessly walk into pins - they can lose material instantly.'
      }
    ]
  },
  // ==================== ADVANCED ====================
  {
    id: 'strategy-1',
    title: '🎯 Positional Play Fundamentals',
    description: 'Understanding long-term strategic principles beyond tactics',
    level: 'hard',
    category: 'Strategy',
    duration: 35,
    steps: [
      {
        type: 'text',
        content: 'While tactics decide individual battles, STRATEGY wins wars. Let\'s master positional concepts that separate masters from amateurs.'
      },
      {
        type: 'move',
        content: 'PAWN STRUCTURE: Your pawns form the "skeleton" of your position. Doubled pawns (two pawns on same file) are usually weak:',
        fen: 'r1bqk2r/pppbpppp/2n2n2/4p3/2BP4/5N2/PP2PPPP/RNBQK2R w KQkq - 0 1',
        from: 'c4',
        to: 'd5'
      },
      {
        type: 'explanation',
        content: 'After cxd5, Black has doubled d-pawns. These pawns cannot defend each other and block each other\'s movement. Avoid creating doubled pawns unless getting something concrete in return!',
        fen: 'r1bqk2r/pppbpppp/2n2n2/3Pp3/8/5N2/PP2PPPP/RNBQK2R b KQkq - 0 1'
      },
      {
        type: 'text',
        content: 'GOOD vs BAD BISHOP: A "good" bishop has its path clear of pawns. A "bad" bishop is blocked by its own pawns and severely limited.'
      },
      {
        type: 'move',
        content: 'SPACE ADVANTAGE: Controlling more squares gives you more room to maneuver. Pawns help claim space - here e4-e5 grabs space:',
        fen: 'r1bqk2r/ppp2ppp/2np1n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1',
        from: 'e4',
        to: 'e5'
      },
      {
        type: 'explanation',
        content: 'The e5 pawn gains space on the kingside and kicks the Knight from f6. More space = more options = better position!',
        fen: 'r1bqk2r/ppp2ppp/2np1n2/2b1P3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 0 1'
      },
      {
        type: 'text',
        content: 'WEAK SQUARES: Squares that cannot be defended by pawns are permanent weaknesses. Opposing pieces can occupy them forever!'
      }
    ]
  }
];

// ==================== GAMBIT DATA WITH COUNTER-GAMBITS ====================
const GAMBIT_DATA: GambitLesson[] = [
  {
    id: 'kings-gambit',
    name: "King's Gambit",
    description: 'A romantic era favorite - sacrifice a pawn for rapid development and attack',
    level: 'intermediate',
    moves: [
      { move: '1.e4 e5 2.f4', explanation: 'White offers the f-pawn to divert Black\'s e-pawn and open the f-file for attack.' },
      { move: '2...exf4 (Accepted)', explanation: 'Black accepts the pawn. Now White gets free development and an open f-file.' },
      { move: '3.Nf3 g5 4.Bc4', explanation: 'White develops rapidly, targeting the weak f7 square. The classic "Muzio" style!' },
      { move: '4...g4 5.O-O!', explanation: 'Castling BY GIVING UP A PIECE! White sacrifices the Knight for lightning development.' },
      { move: '5...gxf3 6.Qxf3', explanation: 'Queen enters with tremendous threats. Black must defend precisely or get mated!' }
    ],
    counterGambits: [
      {
        name: 'Falkbeer Counter-Gambit',
        reason: 'Instead of accepting, Black counter-sacrifices to challenge White\'s center immediately.',
        risk: 'medium',
        moves: [
          { move: '1.e4 e5 2.f4 d5!', explanation: 'Black strikes at e4 immediately! If 3.exd5, Black gets the initiative.' },
          { move: '3.exd5 e4!', explanation: 'The e-pawn becomes a threat! White must deal with this annoying pawn.' },
          { move: '4.d3 Nf6 5.Nc3 Bb4', explanation: 'Black develops with tempo, targeting d4. Counter-attack success!' }
        ]
      },
      {
        name: 'Classical Decline (Solid)',
        reason: 'Decline the gambit entirely and focus on solid development.',
        risk: 'low',
        moves: [
          { move: '1.e4 e5 2.f4 Bc5!', explanation: 'Developing while ignoring the gambit. The "Classical Defense."' },
          { move: '3.Nf3 d6 4.Bc4 Nf6', explanation: 'Solid development. Black doesn\'t take the pawn but gets a good position.' },
          { move: '5.d3 O-O 6.Nc3 Nc6', explanation: 'Black has completed development with a safe King. Practical and strong!' }
        ]
      }
    ],
    plans: ['Open the f-file for attacks', 'Target weak f7 square', 'Rapid piece development', 'Keep opponent off-balance'],
    traps: [
      {
        move: '3...Qh4+??',
        trapName: 'Busted Queen Trip',
        expectedWrongReply: '4.g3??',
        punishment: '4...Qxg3+! 5.hxg3 fxg3+ and Black wins massive material',
        fen: 'rnbqkbnr/pppp1ppp/8/4p1P1/8/8/PPPP2P1/RNBQKBNR b KQkq - 0 1'
      }
    ]
  },
  {
    id: 'evans-gambit',
    name: "Evans Gambit",
    description: 'An aggressive Italian Game sacrifice that dominated 19th century play',
    level: 'hard',
    moves: [
      { move: '1.e4 e5 2.Nf3 Nc6 3.Bc4 Bc5 4.b4!?', explanation: 'The Evans Gambit! White sacrifices a pawn to gain time for development and the center.' },
      { move: '4...Bxb4 5.c3 Ba5 (or Bc5)', explanation: 'After winning the pawn, Black must retreat. White gains tempi for development.' },
      { move: '6.d4 exd4 7.O-O!', explanation: 'Castling despite being down material! Development > material in gambits.' },
      { move: '7...dxc3 8.Nxc3 Nf6 9.e5', explanation: 'White has a massive lead in development and space. The attack plays itself!' },
      { move: '9...Ne4 10.Bd5', explanation: 'White dominates the center. Black\'s extra pawn is irrelevant under this onslaught.' }
    ],
    counterGambits: [
      {
        name: 'Accept with ...d5! (Main Line)',
        reason: 'Counter in the center instead of holding the pawn.',
        risk: 'medium',
        moves: [
          { move: '4.b4 Bxb4 5.c3 Be7!', explanation: 'Returning the pawn to challenge the center. Solid and respected.' },
          { move: '6.d4 Na5 7.Bd3 d5!', explanation: 'Black strikes in the center. The position becomes sharp but roughly equal.' },
          { move: '8.exd5 Nxd5 9.O-O O-O', explanation: 'Black has weathered the storm and stands well. Good practical choice!' }
        ]
      },
      {
        name: 'Decline with ...Bb6',
        reason: 'Decline the pawn, keep the Bishop active.',
        risk: 'low',
        moves: [
          { move: '4.b4 Bb6', explanation: 'The Bishop retreats to an active diagonal. No pawn greed!' },
          { move: '5.a4 a6 6.Nc3 Nf6', explanation: 'Both sides develop normally. The b4 pawn is now just weak.' },
          { move: '7.d3 d6 8.Bd2 O-O', explanation: 'Equal position. White\'s gambit achieved nothing concrete.' }
        ]
      }
    ],
    plans: ['Dominate the center with d4', 'Rapid castling and development', 'Attack on the kingside', 'Use the open b-file if possible'],
    traps: [
      {
        move: '4...Bxb4? 5.c3 Ba5? 6.d4 exd4? 7.Qb5!!',
        trapName: 'Evans Trap',
        expectedWrongReply: '7...Nf6?',
        punishment: '8.dxa7! winning the exchange - the Knight on b8 is trapped!',
        fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/1BP1P3/P4N2/1P3PPP/RN1QKB1R b KQkq - 0 1'
      }
    ]
  },
  {
    id: 'scandinavian',
    name: 'Scandinavian Defense (Mieses-Kotrč)',
    description: 'An immediate counterattacking defense that avoids main-line theory',
    level: 'easy',
    moves: [
      { move: '1.e4 d5', explanation: 'Black immediately challenges the center. Direct and challenging!' },
      { move: '2.exd5 Qxd5 3.Nc3', explanation: 'White develops with tempo, attacking the Queen. Main line continuation.' },
      { move: '3...Qa5 4.d4 Nf6 5.Bd2 c6', explanation: 'Black retreats the Queen and prepares ...e5 to challenge the center.' },
      { move: '6.Bc4 Bf5 7.Nf3 Nc6', explanation: 'Both sides develop naturally. The position is approximately equal but unbalanced.' },
      { move: '8.Ne5 e6 9.g4!? Bg6 10.h4', explanation: 'Sharp attacking attempt by White. The Scandinavian can lead to exciting games!' }
    ],
    counterGambits: [
      {
        name: 'Icelandic Gambit (Pawn Sacrifice)',
        reason: 'Sacrifice a pawn for rapid development and open lines.',
        risk: 'high',
        moves: [
          { move: '1.e4 d5 2.exd5 Nf6 3.c4 e6 4.dxe6 Bc5!', explanation: 'The Icelandic Gambit! Black sacrifices a pawn for lightning development.' },
          { move: '5.exf7+ Ke7 6.Nf3 Nxe4', explanation: 'Black has two pieces eyeing the kingside. The King is safe on e7 (for now).' },
          { move: '7.d4 Bxf7 8.Be2 Nd7 9.O-O h6!', explanation: 'Black will castle artificially. Compensation is clear - active pieces!' }
        ]
      },
      {
        name: 'Panov Attack (for White)',
        reason: 'White can steer into favorable structures.',
        risk: 'low',
        moves: [
          { move: '1.e4 d5 2.exd5 Nf6 3.c4', explanation: 'The Panov-Botvinnik Attack structure. White aims for a space advantage.' },
          { move: '3...c6 4.d4 cxd5 5.Nc3', explanation: 'White has a strong center. Black must be careful about space disadvantage.' }
        ]
      }
    ],
    plans: ['Challenge White\'s center early', 'Active piece placement', 'Avoid closed positions', 'Counterattack in the center'],
    traps: []
  },
  {
    id: 'sicilian-najdorf',
    name: 'Sicilian Najdorf',
    description: "The 'Cadillac of Openings' - Fischer's favorite and the sharpest Sicilian variation",
    level: 'master',
    moves: [
      { move: '1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 a6', explanation: 'The Najdorf! Black plans ...e5 with flexible piece placement. The most popular Sicilian!' },
      { move: '6.Be2 e5 7.Nb3 Be7 8.O-O O-O', explanation: 'Main line positional approach. Both sides complete development.' },
      { move: '9.Be1 Nbd7 10.a4 b6 11.f4', explanation: 'The English Attack setup. White prepares f4-f5 to attack on the kingside.' },
      { move: '11...Bb7 12.f5 Ne8 13.g4', explanation: 'Extremely sharp! Both sides launch opposite-wing attacks. Pure chaos!' },
      { move: '13...Nd7 14.g5 Nc5 15.g6 hxg6 16.fxg6 fxg6', explanation: 'The position explodes tactically. One mistake can be lethal!' }
    ],
    counterGambits: [],
    plans: ['Control the center with ...e5', 'Flexible piece deployment', 'Counterattack on the queenside', 'Allow sharp tactical play'],
    traps: [
      {
        move: '6.Bg5 e6 7.f4 Be7 8.Qf3 Qc7 9.O-O-O Nbd7??',
        trapName: 'Poisoned Pawn Pitfall',
        expectedWrongReply: '10.e5??',
        punishment: '10...dxe5 11.fxe5 Nxe5! 12.Nxe5 Qxg5 and Black is better',
        fen: 'rnbqkb1r/4pnpp/p1n5/1pp4P/3NP1Q1/8/PPP2PP1/R1B1KB1R b KQkq - 0 1'
      }
    ]
  }
];

// ==================== SIMPLE CHESS ENGINE ====================
class SimpleChessEngine {
  private difficulty: Difficulty;
  
  constructor(difficulty: Difficulty = 'intermediate') {
    this.difficulty = difficulty;
  }
  
  getBestMove(game: Chess): string | null {
    const moves = game.moves();
    if (moves.length === 0) return null;
    
    const depthMap: Record<Difficulty, number> = {
      'beginner': 1,
      'easy': 2,
      'intermediate': 3,
      'hard': 4,
      'expert': 5,
      'master': 6
    };
    
    const depth = depthMap[this.difficulty] || 3;
    
    // Simple minimax with basic evaluation
    let bestMove = moves[0];
    let bestScore = -Infinity;
    
    for (const move of moves) {
      const newGame = new Chess(game.fen());
      newGame.move(move);
      
      const score = this.minimax(newGame, depth - 1, -Infinity, Infinity, false);
      
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }
    
    return bestMove;
  }
  
  private minimax(game: Chess, depth: number, alpha: number, beta: number, isMaximizing: boolean): number {
    if (depth === 0 || game.isGameOver()) {
      return this.evaluatePosition(game);
    }
    
    const moves = game.moves();
    
    if (isMaximizing) {
      let maxEval = -Infinity;
      for (const move of moves) {
        const newGame = new Chess(game.fen());
        try {
          newGame.move(move);
          const eval_ = this.minimax(newGame, depth - 1, alpha, beta, false);
          maxEval = Math.max(maxEval, eval_);
          alpha = Math.max(alpha, eval_);
          if (beta <= alpha) break;
        } catch {}
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const move of moves) {
        const newGame = new Chess(game.fen());
        try {
          newGame.move(move);
          const eval_ = this.minimax(newGame, depth - 1, alpha, beta, true);
          minEval = Math.min(minEval, eval_);
          beta = Math.min(beta, eval_);
          if (beta <= alpha) break;
        } catch {}
      }
      return minEval;
    }
  }
  
  private evaluatePosition(game: Chess): number {
    if (game.isCheckmate()) {
      return game.turn() === 'w' ? -10000 : 10000;
    }
    if (game.isDraw()) return 0;
    
    const pieceValues: Record<string, number> = {
      'p': 100, 'n': 320, 'b': 330, 'r': 500, 'q': 900, 'k': 20000,
      'P': 100, 'N': 320, 'B': 330, 'R': 500, 'Q': 900, 'K': 20000
    };
    
    let score = 0;
    const board = game.board();
    
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece) {
          const value = pieceValues[piece.type] || 0;
          score += piece.color === 'w' ? value : -value;
          
          // Bonus for center control
          if ((c >= 2 && c <= 5) && (r >= 2 && r <= 5)) {
            score += piece.color === 'w' ? 10 : -10;
          }
        }
      }
    }
    
    return game.turn() === 'w' ? score : -score;
  }
}

// ==================== MAIN COMPONENT ====================
export default function ChessMasterAcademyNew() {
  const [game, setGame] = useState<Chess>(() => new Chess());
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Square[]>([]);
  const [difficulty, setDifficulty] = useState<Difficulty>('intermediate');
  const [gameStatus, setGameStatus] = useState<string>('Your turn (White)');
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('play');
  const [orientation, setOrientation] = useState<'white' | 'black'>('white');
  
  // Lesson state
  const [currentLesson, setCurrentLesson] = useState<InteractiveLesson | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [lessonGame, setLessonGame] = useState<Chess | null>(null);
  const [isPlayingMove, setIsPlayingMove] = useState(false);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [quizAnswer, setQuizAnswer] = useState<string>('');
  const [quizResult, setQuizResult] = useState<'correct' | 'incorrect' | null>(null);
  
  // Gambit state
  const [currentGambit, setCurrentGambit] = useState<GambitLesson | null>(null);
  const [gambitMoveIndex, setGambitMoveIndex] = useState(0);
  const [showingCounterGambit, setShowingCounterGambit] = useState(false);
  const [currentCounterGambit, setCurrentCounterGambit] = useState<CounterGambit | null>(null);
  
  // Stats state
  const [stats, setStats] = useState<GameStats>({
    gamesPlayed: 0,
    gamesWon: 0,
    gamesLost: 0,
    gamesDrawn: 0,
    currentElo: 1200,
    puzzlesSolved: 0,
    lessonsCompleted: 0,
    winStreak: 0,
    bestWinStreak: 0
  });
  
  const engineRef = useRef<SimpleChessEngine>();
  
  useEffect(() => {
    engineRef.current = new SimpleChessEngine(difficulty);
  }, [difficulty]);
  
  // Calculate REAL ELO change based on game result
  const calculateEloChange = useCallback((result: 'win' | 'loss' | 'draw'): number => {
    const K = 32; // K-factor for ELO calculation
    const opponentRating = 1200 + (Object.keys(difficultyMap).indexOf(difficulty) * 200); // Approximate AI rating
    const expectedScore = 1 / (1 + Math.pow(10, (opponentRating - stats.currentElo) / 400));
    
    const actualScore = result === 'win' ? 1 : result === 'draw' ? 0.5 : 0;
    const eloChange = Math.round(K * (actualScore - expectedScore));
    
    return eloChange;
  }, [stats.currentElo, difficulty]);

  const difficultyMap: Record<Difficulty, string> = {
    'beginner': 'Beginner (800)',
    'easy': 'Easy (1000)',
    'intermediate': 'Intermediate (1400)',
    'hard': 'Hard (1700)',
    'expert': 'Expert (2000)',
    'master': 'Master (2300)'
  };

  const handleSquareClick = useCallback((square: Square) => {
    if (!game || activeTab !== 'play') return;
    
    // If clicking on a legal move destination
    if (selectedSquare && legalMoves.includes(square)) {
      try {
        const moveObj = {
          from: selectedSquare,
          to: square,
          promotion: 'q' // Always promote to queen for simplicity
        };
        
        const newGame = new Chess(game.fen());
        const result = newGame.move(moveObj);
        
        if (result) {
          setGame(newGame);
          setSelectedSquare(null);
          setLegalMoves([]);
          setMoveHistory(prev => [...prev, result.san]);
          
          // Check game outcome
          if (newGame.isCheckmate()) {
            setGameStatus('🎉 CHECKMATE! You Win!');
            updateGameStats('win');
            return;
          }
          
          if (newGame.isStalemate() || newGame.isDraw()) {
            setGameStatus('🤝 Draw!');
            updateGameStats('draw');
            return;
          }
          
          if (newGame.isCheck()) {
            setGameStatus('⚠️ Check! AI thinking...');
          } else {
            setGameStatus('🤔 AI thinking...');
          }
          
          // AI makes a move after delay
          setTimeout(() => makeAIMove(newGame), 500);
        }
      } catch (e) {
        console.error('Invalid move:', e);
      }
      return;
    }
    
    // Select a piece (only own pieces)
    const piece = game.get(square);
    if (piece && piece.color === (game.turn() === 'w' ? 'w' : 'b')) {
      setSelectedSquare(square);
      // Get legal moves for this piece
      const moves = game.moves({ 
        square: square as any,
        verbose: true 
      }).map(m => m.to);
      setLegalMoves(moves);
    } else {
      setSelectedSquare(null);
      setLegalMoves([]);
    }
  }, [game, selectedSquare, legalMoves, activeTab]);

  const makeAIMove = useCallback((currentGame: Chess) => {
    if (!engineRef.current || currentGame.isGameOver()) return;
    
    const bestMoveStr = engineRef.current.getBestMove(currentGame);
    
    if (bestMoveStr && bestMoveStr.length >= 4) {
      try {
        const aiMove = currentGame.move({
          from: bestMoveStr.slice(0, 2),
          to: bestMoveStr.slice(2, 4),
          promotion: 'q'
        });
        
        if (aiMove) {
          setGame(new Chess(currentGame.fen()));
          setMoveHistory(prev => [...prev, aiMove.san]);
          
          if (currentGame.isCheckmate()) {
            setGameStatus('💀 Checkmate! AI Wins!');
            updateGameStats('loss');
          } else if (currentGame.isCheck()) {
            setGameStatus('⚠️ Check! Your turn');
          } else {
            setGameStatus('Your turn');
          }
        }
      } catch (e) {
        console.error('AI move error:', e);
        setGameStatus('Your turn');
      }
    } else {
      setGameStatus('Your turn');
    }
  }, []);

  const updateGameStats = useCallback((result: 'win' | 'loss' | 'draw') => {
    const eloChange = calculateEloChange(result);
    
    setStats(prev => {
      const newStreak = result === 'win' ? prev.winStreak + 1 : 0;
      return {
        ...prev,
        gamesPlayed: prev.gamesPlayed + 1,
        gamesWon: prev.gamesWon + (result === 'win' ? 1 : 0),
        gamesLost: prev.gamesLost + (result === 'loss' ? 1 : 0),
        gamesDrawn: prev.gamesDrawn + (result === 'draw' ? 1 : 0),
        currentElo: Math.max(100, Math.min(3000, prev.currentElo + eloChange)),
        winStreak: newStreak,
        bestWinStreak: Math.max(prev.bestWinStreak, newStreak)
      };
    });
  }, [calculateEloChange]);

  const startNewGame = () => {
    setGame(new Chess());
    setSelectedSquare(null);
    setLegalMoves([]);
    setMoveHistory([]);
    setGameStatus('Your turn (White)');
  };

  // Lesson functions
  const startLesson = (lesson: InteractiveLesson) => {
    setCurrentLesson(lesson);
    setCurrentStepIndex(0);
    setQuizAnswer('');
    setQuizResult(null);
    
    // Initialize lesson game if first step has FEN
    if (lesson.steps[0]?.fen) {
      try {
        setLessonGame(new Chess(lesson.steps[0].fen));
      } catch {
        setLessonGame(new Chess());
      }
    } else {
      setLessonGame(new Chess());
    }
  };

  const nextStep = () => {
    if (!currentLesson) return;
    
    const step = currentLesson.steps[currentStepIndex];
    
    // If this step has a move to play, animate it
    if (step.from && step.to && lessonGame) {
      animateLessonMove(step.from, step.to);
      return;
    }
    
    // Move to next step or finish lesson
    if (currentStepIndex < currentLesson.steps.length - 1) {
      const nextStepData = currentLesson.steps[currentStepIndex + 1];
      setCurrentStepIndex(currentStepIndex + 1);
      
      // Update FEN if provided
      if (nextStepData.fen) {
        try {
          setLessonGame(new Chess(nextStepData.fen));
        } catch {}
      }
    } else {
      // Lesson completed!
      if (!completedLessons.includes(currentLesson.id)) {
        setCompletedLessons([...completedLessons, currentLesson.id]);
        setStats(prev => ({
          ...prev,
          lessonsCompleted: prev.lessonsCompleted + 1,
          currentElo: prev.currentElo + 5 // Small ELO boost for completing lesson
        }));
      }
    }
  };

  const animateLessonMove = (from: Square, to: Square) => {
    if (!lessonGame) return;
    setIsPlayingMove(true);
    
    setTimeout(() => {
      try {
        const newGame = new Chess(lessonGame.fen());
        const result = newGame.move({ from, to, promotion: 'q' });
        
        if (result) {
          setLessonGame(newGame);
        }
      } catch (e) {
        console.error('Lesson move error:', e);
      }
      
      setIsPlayingMove(false);
      
      // Auto advance after animation
      setTimeout(() => {
        if (currentLesson && currentStepIndex < currentLesson.steps.length - 1) {
          const nextStepData = currentLesson.steps[currentStepIndex + 1];
          setCurrentStepIndex(currentStepIndex + 1);
          
          if (nextStepData.fen) {
            try {
              setLessonGame(new Chess(nextStepData.fen));
            } catch {}
          }
        }
      }, 800);
    }, 500);
  };

  const submitQuizAnswer = () => {
    if (!currentLesson?.quiz) return;
    
    const quiz = currentLesson.quiz[0];
    if (quizAnswer === quiz.correctAnswer) {
      setQuizResult('correct');
      setStats(prev => ({
        ...prev,
        puzzlesSolved: prev.puzzlesSolved + 1,
        currentElo: prev.currentElo + 10 // Quiz ELO bonus
      }));
    } else {
      setQuizResult('incorrect');
    }
  };

  // Gambit functions
  const startGambit = (gambit: GambitLesson) => {
    setCurrentGambit(gambit);
    setGambitMoveIndex(0);
    setShowingCounterGambit(false);
    setCurrentCounterGambit(null);
    setLessonGame(new Chess()); // Reset to empty board, we'll show FEN
  };

  const showCounterGambit = (counter: CounterGambit) => {
    setShowingCounterGambit(true);
    setCurrentCounterGambit(counter);
    setGambitMoveIndex(0);
  };

  // Render chess board
  const renderBoard = (boardGame: Chess | null, highlightSquares?: Square[], showCoordinates: boolean = true) => {
    if (!boardGame) return null;
    
    const board = boardGame.board();
    const isFlipped = orientation === 'black';
    
    return (
      <div className="inline-block">
        <div className="grid grid-cols-8 border-4 border-amber-900 rounded shadow-2xl">
          {Array.from({ length: 64 }).map((_, index) => {
            const row = Math.floor(index / 8);
            const col = index % 8;
            const displayRow = isFlipped ? 7 - row : row;
            const displayCol = isFlipped ? 7 - col : col;
            
            const square = String.fromCharCode(97 + displayCol) + (8 - displayRow) as Square;
            const piece = board[displayRow][displayCol];
            
            const isLight = (row + col) % 2 === 0;
            const isSelected = square === selectedSquare;
            const isLegalMove = legalMoves.includes(square);
            const isHighlighted = highlightSquares?.includes(square);
            
            let bgColor = isLight ? '#f0d9b5' : '#b58863';
            
            if (isSelected) bgColor = '#7fc97f';
            if (isLegalMove) bgColor = '#66bb6a';
            if (isHighlighted) bgColor = '#ffeb3b';
            
            return (
              <div
                key={square}
                className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center cursor-pointer relative transition-colors ${activeTab === 'play' ? 'hover:bg-yellow-300' : ''}`}
                style={{ backgroundColor: bgColor }}
                onClick={() => activeTab === 'play' && handleSquareClick(square)}
              >
                {/* Coordinates */}
                {showCoordinates && col === 0 && (
                  <span className="absolute top-0 left-1 text-xs font-bold text-gray-600">
                    {8 - displayRow}
                  </span>
                )}
                {showCoordinates && row === 7 && (
                  <span className="absolute bottom-0 right-1 text-xs font-bold text-gray-600">
                    {String.fromCharCode(97 + displayCol)}
                  </span>
                )}
                
                {/* Piece */}
                {piece && (
                  <span className="text-3xl sm:text-4xl select-none drop-shadow-md">
                    {getPieceSymbol(piece)}
                  </span>
                )}
                
                {/* Legal move indicator */}
                {isLegalMove && !piece && (
                  <div className="w-3 h-3 bg-black/30 rounded-full absolute" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const getPieceSymbol = (piece: { type: string; color: string }): string => {
    const symbols: Record<string, Record<string, string>> = {
      'k': { w: '♔', b: '♚' },
      'q': { w: '♕', b: '♛' },
      'r': { w: '♖', b: '♜' },
      'b': { w: '♗', b: '♝' },
      'n': { w: '♘', b: '♞' },
      'p': { w: '♙', b: '♟' }
    };
    return symbols[piece.type]?.[piece.color] || '';
  };

  // Filter lessons by level
  const filteredLessons = INTERACTIVE_LESSONS.filter(l => l.level === difficulty || l.level === 'beginner');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            ♔ Chess Master Academy ♚
          </h1>
          <p className="text-gray-400 mt-2">Interactive Lessons • Real ELO System • Advanced Gambits</p>
        </div>

        {/* Stats Bar */}
        <div className="bg-gray-800/50 backdrop-blur rounded-xl p-4 mb-6 flex flex-wrap justify-center gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{stats.currentElo}</div>
            <div className="text-xs text-gray-400">Your ELO</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold">{stats.gamesWon}W - {stats.gamesLost}L - {stats.gamesDrawn}D</div>
            <div className="text-xs text-gray-400">Record</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-orange-400">{stats.winStreak}🔥</div>
            <div className="text-xs text-gray-400">Win Streak</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold">{stats.lessonsCompleted}📚</div>
            <div className="text-xs text-gray-400">Lessons</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {[
            { id: 'play', label: '🎮 Play', icon: '♟️' },
            { id: 'lessons', label: '📚 Lessons', icon: '📖' },
            { id: 'gambits', label: '⚔️ Gambits', icon: '🎯' },
            { id: 'tactics', label: '🧩 Tactics', icon: '💡' },
            { id: 'progress', label: '📊 Progress', icon: '📈' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* PLAY TAB */}
        {activeTab === 'play' && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Chess Board */}
            <div className="lg:col-span-2 flex justify-center">
              <div>
                {renderBoard(game)}
                
                {/* Controls */}
                <div className="mt-4 flex flex-wrap justify-center gap-4">
                  <button
                    onClick={startNewGame}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold"
                  >
                    🔄 New Game
                  </button>
                  
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                    className="px-4 py-2 bg-gray-700 rounded-lg"
                  >
                    {Object.entries(difficultyMap).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                  
                  <button
                    onClick={() => setOrientation(o => o === 'white' ? 'black' : 'white')}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
                  >
                    🔄 Flip Board
                  </button>
                </div>
              </div>
            </div>
            
            {/* Game Info Panel */}
            <div className="space-y-4">
              <div className="bg-gray-800 rounded-xl p-4">
                <h3 className="font-bold text-lg mb-2 text-amber-400">Game Status</h3>
                <p className="text-lg">{gameStatus}</p>
              </div>
              
              <div className="bg-gray-800 rounded-xl p-4 max-h-60 overflow-y-auto">
                <h3 className="font-bold text-lg mb-2 text-amber-400">Move History</h3>
                <div className="font-mono text-sm space-y-1">
                  {moveHistory.map((move, i) => (
                    <span key={i} className="mr-2">
                      {Math.floor(i / 2) + 1}{i % 2 === 0 ? '.' : '...'} {move}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-amber-900/30 to-orange-900/30 rounded-xl p-4 border border-amber-500/30">
                <h3 className="font-bold mb-2">💡 Tip</h3>
                <p className="text-sm text-gray-300">
                  {stats.currentElo < 1200 
                    ? 'Focus on controlling the center with your pawns and pieces. Avoid moving the same piece twice in the opening!'
                    : stats.currentElo < 1600
                    ? 'Look for tactical patterns like forks, pins, and skewers before every move. Tactics win games below 1800 ELO!'
                    : 'Focus on long-term positional planning. Pawn structure, piece activity, and king safety determine the outcome.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* LESSONS TAB */}
        {activeTab === 'lessons' && (
          <div className="grid lg:grid-cols-3 gap-6">
            {!currentLesson ? (
              /* Lesson List */
              <div className="lg:col-span-3 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {INTERACTIVE_LESSONS.map(lesson => (
                  <button
                    key={lesson.id}
                    onClick={() => startLesson(lesson)}
                    className={`p-4 rounded-xl text-left transition-all ${
                      completedLessons.includes(lesson.id)
                        ? 'bg-green-900/30 border-2 border-green-500'
                        : 'bg-gray-800 hover:bg-gray-700 border-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-lg">{lesson.title}</h3>
                      {completedLessons.includes(lesson.id) && <span>✅</span>}
                    </div>
                    <p className="text-sm text-gray-400 mb-2">{lesson.description}</p>
                    <div className="flex gap-2 text-xs">
                      <span className="px-2 py-1 bg-amber-500/20 text-amber-300 rounded">
                        {lesson.level}
                      </span>
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded">
                        {lesson.duration}min
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              /* Active Lesson */
              <>
                <div className="lg:col-span-2 space-y-4">
                  {/* Lesson Header */}
                  <div className="bg-gray-800 rounded-xl p-4">
                    <h2 className="text-2xl font-bold text-amber-400">{currentLesson.title}</h2>
                    <p className="text-gray-400">{currentLesson.description}</p>
                    <div className="mt-2 text-sm text-gray-500">
                      Step {currentStepIndex + 1} of {currentLesson.steps.length}
                    </div>
                    
                    {/* Progress bar */}
                    <div className="mt-2 h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all"
                        style={{ width: `${((currentStepIndex + 1) / currentLesson.steps.length) * 100}%` }}
                      />
                    </div>
                  </div>
                  
                  {/* Current Step Content */}
                  <div className="bg-gray-800/80 rounded-xl p-6 min-h-[150px]">
                    {(() => {
                      const step = currentLesson.steps[currentStepIndex];
                      if (!step) return null;
                      
                      switch (step.type) {
                        case 'text':
                          return <p className="text-lg leading-relaxed">{step.content}</p>;
                        case 'move':
                          return (
                            <div>
                              <p className="text-lg leading-relaxed mb-2">{step.content}</p>
                              {step.from && step.to && (
                                <p className="text-amber-400 font-mono">
                                  Move: {step.from} → {step.to}
                                </p>
                              )}
                            </div>
                          );
                        case 'highlight':
                          return (
                            <div>
                              <p className="text-lg leading-relaxed">{step.content}</p>
                              <p className="text-yellow-400 mt-2">
                                ⭐ Highlighted: {step.highlights?.join(', ')}
                              </p>
                            </div>
                          );
                        case 'explanation':
                          return (
                            <div className="border-l-4 border-amber-500 pl-4">
                              <p className="text-lg text-amber-200">{step.content}</p>
                            </div>
                          );
                        default:
                          return <p>{step.content}</p>;
                      }
                    })()}
                  </div>
                  
                  {/* Navigation */}
                  <div className="flex justify-between">
                    <button
                      onClick={() => {
                        setCurrentLesson(null);
                        setLessonGame(null);
                      }}
                      className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg"
                    >
                      ← Back to Lessons
                    </button>
                    
                    <div className="flex gap-2">
                      {currentStepIndex > 0 && (
                        <button
                          onClick={() => setCurrentStepIndex(i => i - 1)}
                          className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg"
                        >
                          ← Previous
                        </button>
                      )}
                      
                      {currentStepIndex < currentLesson.steps.length - 1 ? (
                        <button
                          onClick={nextStep}
                          disabled={isPlayingMove}
                          className="px-6 py-2 bg-amber-600 hover:bg-amber-500 disabled:bg-gray-600 rounded-lg font-semibold"
                        >
                          {isPlayingMove ? '▶️ Playing...' : 'Next Step →'}
                        </button>
                      ) : (
                        <div className="text-green-400 font-bold px-4 py-2">
                          ✅ Lesson Complete! (+5 ELO)
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Quiz Section (if available and lesson complete) */}
                  {currentStepIndex >= currentLesson.steps.length - 1 && currentLesson.quiz && (
                    <div className="bg-purple-900/30 rounded-xl p-6 border border-purple-500/30">
                      <h3 className="font-bold text-lg text-purple-300 mb-4">🧠 Quick Quiz</h3>
                      <p className="mb-4">{currentLesson.quiz[0].question}</p>
                      
                      {!quizResult ? (
                        <div className="space-y-2">
                          {currentLesson.quiz[0].options.map(option => (
                            <button
                              key={option}
                              onClick={() => setQuizAnswer(option)}
                              className={`w-full p-3 rounded-lg text-left transition-all ${
                                quizAnswer === option
                                  ? 'bg-purple-600 border-2 border-purple-400'
                                  : 'bg-gray-700 hover:bg-gray-600 border-2 border-transparent'
                              }`}
                            >
                              {option}
                            </button>
                          ))}
                          <button
                            onClick={submitQuizAnswer}
                            disabled={!quizAnswer}
                            className="w-full mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 rounded-lg font-semibold"
                          >
                            Submit Answer
                          </button>
                        </div>
                      ) : (
                        <div className={`p-4 rounded-lg ${quizResult === 'correct' ? 'bg-green-900/50' : 'bg-red-900/50'}`}>
                          <p className="font-bold">{quizResult === 'correct' ? '✅ Correct! (+10 ELO)' : '❌ Incorrect'}</p>
                          <p className="mt-2 text-sm">{currentLesson.quiz[0].explanation}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Lesson Board */}
                <div className="flex flex-col items-center">
                  <h3 className="font-bold text-lg mb-4 text-amber-400">Demo Board</h3>
                  {renderBoard(
                    lessonGame,
                    currentLesson.steps[currentStepIndex]?.highlights
                  )}
                  
                  {/* FEN Display */}
                  {lessonGame && (
                    <div className="mt-4 p-3 bg-gray-900 rounded-lg text-xs font-mono text-gray-400 max-w-full overflow-x-auto">
                      FEN: {lessonGame.fen()}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* GAMBITS TAB */}
        {activeTab === 'gambits' && (
          <div className="grid lg:grid-cols-3 gap-6">
            {!currentGambit ? (
              /* Gambit List */
              <div className="lg:col-span-3 grid md:grid-cols-2 gap-4">
                {GAMBIT_DATA.map(gambit => (
                  <button
                    key={gambit.id}
                    onClick={() => startGambit(gambit)}
                    className="p-6 rounded-xl text-left bg-gray-800 hover:bg-gray-700 transition-all border-2 border-transparent hover:border-red-500/50"
                  >
                    <h3 className="text-xl font-bold text-red-400 mb-2">{gambit.name}</h3>
                    <p className="text-sm text-gray-400 mb-3">{gambit.description}</p>
                    <div className="flex gap-2 text-xs mb-3">
                      <span className="px-2 py-1 bg-red-500/20 text-red-300 rounded">
                        {gambit.level}
                      </span>
                      {gambit.counterGambits && gambit.counterGambits.length > 0 && (
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded">
                          {gambit.counterGambits.length} Counter-Gambits
                        </span>
                      )}
                    </div>
                    {gambit.traps && gambit.traps.length > 0 && (
                      <p className="text-xs text-orange-400">⚠️ Includes {gambit.traps.length} trap(s)</p>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              /* Active Gambit View */
              <>
                <div className="lg:col-span-2 space-y-4">
                  {/* Gambit Header */}
                  <div className="bg-gray-800 rounded-xl p-4">
                    <h2 className="text-2xl font-bold text-red-400">{currentGambit.name}</h2>
                    <p className="text-gray-400">{currentGambit.description}</p>
                  </div>
                  
                  {/* Moves */}
                  <div className="bg-gray-800/80 rounded-xl p-4">
                    <h3 className="font-bold text-lg mb-3 text-amber-400">Main Line Moves</h3>
                    <div className="space-y-3">
                      {currentGambit.moves.map((moveData, idx) => (
                        <div 
                          key={idx}
                          className={`p-3 rounded-lg cursor-pointer transition-all ${
                            gambitMoveIndex === idx 
                              ? 'bg-amber-600/30 border-l-4 border-amber-500' 
                              : 'bg-gray-700 hover:bg-gray-600'
                          }`}
                          onClick={() => setGambitMoveIndex(idx)}
                        >
                          <div className="font-mono font-bold text-amber-300">
                            {moveData.move}
                          </div>
                          <div className="text-sm text-gray-300 mt-1">
                            {moveData.explanation}
                          </div>
                          
                          {/* Show alternative moves */}
                          {moveData.alternativeMoves && (
                            <div className="mt-2 pl-4 border-l-2 border-gray-600">
                              <p className="text-xs text-gray-400 mb-1">Alternatives:</p>
                              {moveData.alternativeMoves.map((alt, altIdx) => (
                                <div key={altIdx} className="text-xs text-gray-400">
                                  {alt.move} → {alt.response} ({alt.evaluation})
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Counter-Gambits */}
                  {currentGambit.counterGambits && currentGambit.counterGambits.length > 0 && (
                    <div className="bg-blue-900/20 rounded-xl p-4 border border-blue-500/30">
                      <h3 className="font-bold text-lg mb-3 text-blue-400">
                        🛡️ Counter-Gambits for Black
                      </h3>
                      <div className="space-y-2">
                        {currentGambit.counterGambits.map((counter, idx) => (
                          <button
                            key={idx}
                            onClick={() => showCounterGambit(counter)}
                            className={`w-full p-3 rounded-lg text-left transition-all ${
                              showingCounterGambit && currentCounterGambit?.name === counter.name
                                ? 'bg-blue-600/40 border-2 border-blue-400'
                                : 'bg-gray-700 hover:bg-gray-600 border-2 border-transparent'
                            }`}
                          >
                            <div className="font-bold text-blue-300">{counter.name}</div>
                            <div className="text-xs text-gray-400 mt-1">{counter.reason}</div>
                            <div className="flex gap-2 mt-2">
                              <span className={`px-2 py-0.5 text-xs rounded ${
                                counter.risk === 'low' ? 'bg-green-500/20 text-green-300' :
                                counter.risk === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                                'bg-red-500/20 text-red-300'
                              }`}>
                                Risk: {counter.risk}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                      
                      {/* Showing specific counter-gambit */}
                      {showingCounterGambit && currentCounterGambit && (
                        <div className="mt-4 p-4 bg-gray-800 rounded-lg">
                          <h4 className="font-bold text-blue-300 mb-2">
                            {currentCounterGambit.name} - Moves
                          </h4>
                          <div className="space-y-2">
                            {currentCounterGambit.moves.map((move, idx) => (
                              <div key={idx} className="pl-4 border-l-2 border-blue-500">
                                <div className="font-mono text-sm text-blue-200">{move.move}</div>
                                <div className="text-xs text-gray-400">{move.explanation}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Plans & Ideas */}
                  <div className="bg-green-900/20 rounded-xl p-4 border border-green-500/30">
                    <h3 className="font-bold text-lg mb-3 text-green-400">📋 Strategic Plans</h3>
                    <ul className="space-y-1">
                      {currentGambit.plans.map((plan, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <span className="text-green-400">•</span>
                          <span>{plan}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Traps */}
                  {currentGambit.traps && currentGambit.traps.length > 0 && (
                    <div className="bg-orange-900/20 rounded-xl p-4 border border-orange-500/30">
                      <h3 className="font-bold text-lg mb-3 text-orange-400">⚠️ Traps to Know</h3>
                      {currentGambit.traps.map((trap, idx) => (
                        <div key={idx} className="p-3 bg-gray-800 rounded-lg mb-2">
                          <div className="font-bold text-orange-300">{trap.trapName}</div>
                          <div className="text-sm mt-1">
                            <p><strong>If they play:</strong> {trap.expectedWrongReply}</p>
                            <p className="text-red-400"><strong>Punish with:</strong> {trap.punishment}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Back button */}
                  <button
                    onClick={() => {
                      setCurrentGambit(null);
                      setShowingCounterGambit(false);
                    }}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg"
                  >
                    ← Back to Gambits
                  </button>
                </div>
                
                {/* Gambit Info Sidebar */}
                <div className="space-y-4">
                  <div className="bg-gray-800 rounded-xl p-4">
                    <h3 className="font-bold text-lg mb-3 text-amber-400">Quick Info</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Difficulty:</span>
                        <span className="capitalize">{currentGambit.level}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Moves in Main Line:</span>
                        <span>{currentGambit.moves.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Counter-Gambits:</span>
                        <span>{currentGambit.counterGambits?.length || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Traps:</span>
                        <span>{currentGambit.traps?.length || 0}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Selected move details */}
                  <div className="bg-gray-800 rounded-xl p-4">
                    <h3 className="font-bold mb-2">Selected Move</h3>
                    {currentGambit.moves[gambitMoveIndex] ? (
                      <div>
                        <div className="font-mono text-xl text-amber-400 mb-2">
                          {currentGambit.moves[gambitMoveIndex].move}
                        </div>
                        <p className="text-sm text-gray-300">
                          {currentGambit.moves[gambitMoveIndex].explanation}
                        </p>
                      </div>
                    ) : (
                      <p className="text-gray-500">Select a move to see details</p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* TACTICS TAB */}
        {activeTab === 'tactics' && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🧩</div>
            <h2 className="text-2xl font-bold mb-4">Tactics Trainer Coming Soon!</h2>
            <p className="text-gray-400 max-w-md mx-auto">
              We're building a comprehensive tactics trainer with thousands of puzzles rated by difficulty.
              Practice forks, pins, skewers, and more!
            </p>
            <div className="mt-6 inline-flex gap-2">
              {['Forks', 'Pins', 'Skewers', 'Discovered Attacks', 'Back Rank', 'Zwischenzug'].map(tactic => (
                <span key={tactic} className="px-3 py-1 bg-gray-700 rounded-full text-sm">
                  {tactic}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* PROGRESS TAB */}
        {activeTab === 'progress' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* ELO Chart Placeholder */}
            <div className="bg-gray-800 rounded-xl p-6 lg:col-span-2">
              <h3 className="font-bold text-xl mb-4 text-amber-400">📈 ELO Progression</h3>
              <div className="h-64 flex items-end justify-around gap-2">
                {[1200, stats.currentElo].map((elo, i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <div 
                      className="w-20 bg-gradient-to-t from-amber-600 to-orange-400 rounded-t-lg transition-all duration-500"
                      style={{ height: `${Math.max(20, (elo / 2500) * 200)}px` }}
                    />
                    <span className="text-sm font-bold">{elo}</span>
                    <span className="text-xs text-gray-400">{i === 0 ? 'Start' : 'Current'}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Statistics */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="font-bold text-xl mb-4 text-amber-400">📊 Statistics</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Win Rate</span>
                    <span className="text-green-400">
                      {stats.gamesPlayed > 0 
                        ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) 
                        : 0}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500"
                      style={{ width: `${stats.gamesPlayed > 0 ? (stats.gamesWon / stats.gamesPlayed) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-gray-700 rounded-lg p-3">
                    <div className="text-2xl font-bold text-green-400">{stats.gamesWon}</div>
                    <div className="text-xs text-gray-400">Wins</div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-3">
                    <div className="text-2xl font-bold text-red-400">{stats.gamesLost}</div>
                    <div className="text-xs text-gray-400">Losses</div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-3">
                    <div className="text-2xl font-bold text-gray-400">{stats.gamesDrawn}</div>
                    <div className="text-xs text-gray-400">Draws</div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-3">
                    <div className="text-2xl font-bold text-orange-400">{stats.bestWinStreak}</div>
                    <div className="text-xs text-gray-400">Best Streak</div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-700">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Lessons Completed</span>
                    <span>{completedLessons.length}/{INTERACTIVE_LESSONS.length}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-gray-400">Puzzles Solved</span>
                    <span>{stats.puzzlesSolved}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Achievements */}
            <div className="bg-gray-800 rounded-xl p-6 lg:col-span-3">
              <h3 className="font-bold text-xl mb-4 text-amber-400">🏆 Achievements</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { name: 'First Win', desc: 'Win your first game', unlocked: stats.gamesWon > 0 },
                  { name: 'Century', desc: 'Reach 1300 ELO', unlocked: stats.currentElo >= 1300 },
                  { name: 'Scholar', desc: 'Complete 3 lessons', unlocked: stats.lessonsCompleted >= 3 },
                  { name: 'Hot Streak', desc: '3-win streak', unlocked: stats.bestWinStreak >= 3 },
                  { name: 'Tactician', desc: 'Solve 10 puzzles', unlocked: stats.puzzlesSolved >= 10 },
                  { name: 'Veteran', desc: 'Play 20 games', unlocked: stats.gamesPlayed >= 20 },
                  { name: 'Expert', desc: 'Reach 1600 ELO', unlocked: stats.currentElo >= 1600 },
                  { name: 'Master', desc: 'Reach 2000 ELO', unlocked: stats.currentElo >= 2000 }
                ].map((achievement, idx) => (
                  <div 
                    key={idx}
                    className={`p-4 rounded-lg text-center ${
                      achievement.unlocked 
                        ? 'bg-gradient-to-br from-amber-600/30 to-orange-600/30 border border-amber-500/50' 
                        : 'bg-gray-700 opacity-50'
                    }`}
                  >
                    <div className="text-3xl mb-2">{achievement.unlocked ? '🏅' : '🔒'}</div>
                    <div className="font-bold text-sm">{achievement.name}</div>
                    <div className="text-xs text-gray-400">{achievement.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
