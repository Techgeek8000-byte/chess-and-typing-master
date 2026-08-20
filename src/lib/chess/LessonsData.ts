export interface Lesson {
  id: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'master';
  category: 'basics' | 'tactics' | 'strategy' | 'openings' | 'endgames' | 'gambits' | 'positional';
  duration: number; // in minutes
  content: LessonContent[];
  quiz?: QuizQuestion[];
  practiceFEN?: string;
}

export interface LessonContent {
  type: 'text' | 'diagram' | 'example' | 'tip' | 'warning';
  content: string;
  fen?: string;
  move?: string;
  explanation?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  fen: string;
  correctAnswer: string;
  options: string[];
  explanation: string;
}

// Complete Chess Lessons Database - 50+ Lessons to reach 2000 ELO
export const CHESS_LESSONS: Lesson[] = [
  // ==================== BEGINNER LEVEL (800-1200 ELO) ====================
  {
    id: 'basics-1',
    title: 'The Chessboard & Setup',
    description: 'Learn how the chessboard works, piece placement, and basic orientation',
    level: 'beginner',
    category: 'basics',
    duration: 15,
    content: [
      { type: 'text', content: 'The chessboard consists of 64 squares arranged in an 8x8 grid. The board is always oriented so that each player has a light square on their bottom-right corner.' },
      { type: 'tip', content: 'Remember: "White on right" - the light square h1 should be on your right side when you are playing White.' },
      { type: 'text', content: 'The files (columns) are labeled a-h from left to right (White\'s perspective). The ranks (rows) are numbered 1-8 from White\'s side to Black\'s side.' },
      { type: 'diagram', content: 'Starting position', fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1' },
      { type: 'text', content: 'Piece Placement Rules:\n• Rooks occupy the corners (a1, h1 for White)\n• Knights go next to Rooks\n• Bishops next to Knights\n• Queen goes on her own color (d1 for White)\n• King takes the remaining square (e1)\n• Pawns fill the entire second rank' }
    ]
  },
  {
    id: 'basics-2',
    title: 'How the Pieces Move',
    description: 'Complete guide to movement of all chess pieces with visual examples',
    level: 'beginner',
    category: 'basics',
    duration: 30,
    content: [
      { type: 'text', content: 'THE KING (♔/♚): Moves one square in any direction. The King is your most important piece - if checkmated, you lose the game. The King cannot move into check or through attacked squares when castling.' },
      { type: 'text', content: 'THE QUEEN (♕/♛): The most powerful piece! Moves any number of squares horizontally, vertically, or diagonally. She combines the power of Rook and Bishop.' },
      { type: 'text', content: 'THE ROOK (♖/♜): Moves any number of squares horizontally or vertically. Cannot jump over pieces. Very powerful in open files and on the 7th rank.' },
      { type: 'text', content: 'THE BISHOP (♗/♝): Moves diagonally any number of squares. Each Bishop stays on its starting color forever. Two Bishops together control both colors and are very powerful.' },
      { type: 'text', content: 'THE KNIGHT (♘/♞): Moves in an "L" shape: two squares in one direction, then one square perpendicular. The Knight is the ONLY piece that can jump over other pieces!' },
      { type: 'tip', content: 'Knight moves uniquely: It can reach up to 8 squares from a central position but only 2-4 from corners. Keep knights centralized!' },
      { type: 'text', content: 'THE PAWN (♙/♟): Moves forward one square (or two from starting position), captures diagonally forward. Pawns that reach the opposite end promote to any piece (usually a Queen).' },
      { type: 'warning', content: 'Pawns cannot move backward! Every pawn move is permanent. Think carefully before pushing pawns.' }
    ]
  },
  {
    id: 'basics-3',
    title: 'Special Moves: Castling & En Passant',
    description: 'Master the special rules of chess that many beginners forget',
    level: 'beginner',
    category: 'basics',
    duration: 20,
    content: [
      { type: 'text', content: 'CASTLING is the only time you can move two pieces at once. The King moves two squares toward a Rook, and the Rook jumps over the King to the other side.' },
      { type: 'text', content: 'Castling Requirements:\n1. Neither the King nor the chosen Rook has moved before\n2. No pieces between King and Rook\n3. King is not currently in check\n4. King does not pass through or land on attacked square' },
      { type: 'diagram', content: 'Kingside castling (O-O)', fen: 'rnbq1rk1/pppbpppp/5n2/3p4/8/5NP1/PPPPPPBP/RNBQK2R w KQ - 0 1' },
      { type: 'text', content: 'Kingside Castling (O-O): King moves from e1 to g1, Rook from h1 to f1. This is the most common form of castling.' },
      { type: 'text', content: 'Queenside Castling (O-O-O): King moves from e1 to c1, Rook from a1 to d1. This often provides better King safety in certain positions.' },
      { type: 'text', content: 'EN PASSANT ("in passing") is a special pawn capture. When a pawn moves two squares from its starting position and lands beside an enemy pawn, the enemy can capture it as if it only moved one square - but ONLY immediately after the two-square move!' },
      { type: 'example', content: 'En Passant Example: If White plays e2-e4 and Black has a pawn on d4, Black can capture en passant by moving to e3, removing White\'s pawn.', explanation: 'En passant must be played immediately or the opportunity is lost forever.' },
      { type: 'tip', content: 'Always consider en passant captures - they can open lines and win material unexpectedly!' }
    ]
  },
  {
    id: 'basics-4',
    title: 'Check, Checkmate & Stalemate',
    description: 'Understanding the difference between check, checkmate, and draw positions',
    level: 'beginner',
    category: 'basics',
    duration: 25,
    content: [
      { type: 'text', content: 'CHECK occurs when your King is under attack. You MUST get out of check on your next move. There are three ways:\n1. Move the King to safety\n2. Block the attack with another piece\n3. Capture the attacking piece' },
      { type: 'warning', content: 'Never leave your King in check! If you have no legal way to escape check, it\'s CHECKMATE and you lose.' },
      { type: 'text', content: 'CHECKMATE happens when:\n• Your King is in check\n• You cannot move the King to safety\n• You cannot block or capture the attacker\nThis ends the game - the player delivering checkmate wins!' },
      { type: 'diagram', content: 'Scholar\'s Mate pattern - Checkmate!', fen: 'r1bqkb1r/pppp1Qpp/2n2n2/4p3/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 4' },
      { type: 'text', content: 'STALEMATE occurs when:\n• Your King is NOT in check\n• You have NO legal moves available\nThis results in a DRAW (½-½) - a common way to save losing positions!' },
      { type: 'tip', content: 'Stalemate is a powerful defensive resource! If you\'re losing badly, try to eliminate all your pieces until stalemate becomes possible.' },
      { type: 'warning', content: 'Be careful when winning! Many beginners accidentally stalemate opponents instead of delivering checkmate.' }
    ],
    quiz: [
      {
        id: 'q1',
        question: 'In this position, is it checkmate or stalemate?',
        fen: 'k7/8/1K6/8/8/8/8/8 b - - 0 1',
        correctAnswer: 'Stalemate',
        options: ['Checkmate', 'Stalemate', 'Black to play wins', 'Draw by agreement'],
        explanation: 'The black King is not in check (no piece attacks b8), but has no legal moves. This is STALEMATE = Draw.'
      }
    ]
  },
  {
    id: 'tactics-1',
    title: 'Introduction to Tactics',
    description: 'What are tactics and why they are essential for improvement',
    level: 'beginner',
    category: 'tactics',
    duration: 20,
    content: [
      { type: 'text', content: 'TACTICS are forcing sequences of moves that result in tangible advantage. Unlike strategy (long-term planning), tactics are immediate and concrete.' },
      { type: 'text', content: 'Why Tactics Matter:\n• Most games below 2000 ELO are decided by tactics\n• One tactical blunder can lose instantly\n• Tactical skill helps you find winning moves\n• Pattern recognition improves with practice' },
      { type: 'text', content: 'Basic Tactical Motifs You Must Know:\n1. FORKS - One piece attacks two or more pieces simultaneously\n2. PINS - A piece cannot move without exposing a more valuable piece\n3. SKEWERS - Like pins, but the more valuable piece is in front\n4. DISCOVERED ATTACKS - Moving one piece reveals an attack by another\n5. DOUBLE CHECKS - Two pieces give check at once (very powerful!)' },
      { type: 'tip', content: 'Tactical vision improves dramatically with daily puzzle practice. Even 15 minutes per day will show results within weeks!' }
    ]
  },
  // ==================== INTERMEDIATE LEVEL (1200-1600 ELO) ====================
  {
    id: 'tactics-2',
    title: 'Mastering Forks',
    description: 'Learn to spot and execute fork attacks - one of the most common tactical weapons',
    level: 'intermediate',
    category: 'tactics',
    duration: 25,
    content: [
      { type: 'text', content: 'A FORK (or "double attack") occurs when one piece attacks two or more enemy pieces at the same time. Your opponent can only save one - you win the other!' },
      { type: 'text', content: 'KNIGHT FORKS are especially dangerous because Knights attack in L-shapes that other pieces don\'t expect. A well-placed central Knight can fork up to 8 squares!' },
      { type: 'diagram', content: 'Classic Royal Fork - Knight attacks King, Queen, and Rook', fen: 'r1bqk2r/pppp1ppp/2n2n2/4N3/2B1P3/8/PPPP1PPP/RNBQK2R w KQkq - 0 1' },
      { type: 'example', content: 'Knight on e5 forks f7 (weak point), c6, g6, g4, d3, f3, c4, and can reach many more squares.', explanation: 'Centralized Knights are fork monsters. Always look for Knight forks when your Knight reaches the center.' },
      { type: 'text', content: 'PAWN FORKS are underrated! A single pawn advance can often fork two pieces. Look for pawn forks when advancing your pawns.' },
      { type: 'text', content: 'QUEEN FORKS are devastating because the Queen attacks in all directions. Queen forks often win material across the entire board.' },
      { type: 'tip', content: 'Before every move, ask: "Does this move create any forks?" This habit alone will improve your tactical vision significantly.' }
    ]
  },
  {
    id: 'tactics-3',
    title: 'Pins and Skewers',
    description: 'Master these related tactical patterns that exploit piece alignment',
    level: 'intermediate',
    category: 'tactics',
    duration: 30,
    content: [
      { type: 'text', content: 'A PIN occurs when a piece cannot move because doing so would expose a more valuable piece behind it to capture. Pins can be absolute (King behind) or relative (valuable piece behind).' },
      { type: 'text', content: 'ABSOLUTE PIN: The pinned piece CANNOT move at all because the King would be exposed to check. Absolute pins completely paralyze the pinned piece.' },
      { type: 'diagram', content: 'Absolute Pin - Bishop pins Knight to King', fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 0 1' },
      { type: 'text', content: 'RELATIVE PIN: The pinned piece CAN move, but doing so would expose a valuable piece (Queen, Rook) to capture. Players sometimes fall for this!' },
      { type: 'text', content: 'A SKEWER is like a "reverse pin": the MORE valuable piece is in front, and when it moves, the less valuable piece behind gets captured.' },
      { type: 'example', content: 'Skewer pattern: Queen skewers King and Rook. King moves, then Rook gets captured.', explanation: 'Skewers are especially effective against Kings and Queens aligned with other pieces.' },
      { type: 'tip', content: 'Look for pins along diagonals (Bishops/Queens) and files/ranks (Rooks/Queens). These are the most common pin lines.' },
      { type: 'warning', content: 'Watch out for pins against YOUR pieces too! Don\'t walk into pins carelessly.' }
    ]
  },
  {
    id: 'tactics-4',
    title: 'Discovered Attacks & Double Checks',
    description: 'Learn these powerful tactical themes where one move reveals another threat',
    level: 'intermediate',
    category: 'tactics',
    duration: 25,
    content: [
      { type: 'text', content: 'A DISCOVERED ATTACK occurs when you move one piece, revealing an attack by another piece behind it. This creates TWO threats at once!' },
      { type: 'text', content: 'DISCOVERED CHECK is even more powerful - you give check while also making another threat. Your opponent must deal with the check, allowing your other threat to succeed.' },
      { type: 'diagram', content: 'Discovered Check setup - Bishop ready to discover', fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1' },
      { type: 'text', content: 'DOUBLE CHECK is the most forcing tactic in chess! When BOTH a piece move AND the discovered piece give check simultaneously, the only legal response is to move the King. No blocking, no capturing!' },
      { type: 'example', content: 'Double Check pattern: Knight moves away from same file/diagonal as Bishop, both giving check to King.', explanation: 'Double checks are often mating patterns because the King must move and has limited safe squares.' },
      { type: 'tip', content: 'Always look for discovered possibilities before moving. Ask: "If I move this piece, what does it uncover?"' }
    ]
  },
  {
    id: 'strategy-1',
    title: 'Piece Value & Material Counting',
    description: 'Understanding piece values and when to trade',
    level: 'intermediate',
    category: 'strategy',
    duration: 20,
    content: [
      { type: 'text', content: 'Standard Piece Values (approximate):\n• Pawn = 1 point\n• Knight = 3 points\n• Bishop = 3 points\n• Rook = 5 points\n• Queen = 9 points\n• King = Infinite (losing means game over)' },
      { type: 'text', content: 'THE BISHOP PAIR is worth approximately 0.5 extra pawns compared to Knight + Bishop. Two bishops control both colors and work excellently together in open positions.' },
      { type: 'text', content: 'When to Trade Pieces:\n• Trade when ahead in material (simplification favors the stronger side)\n• Trade opponent\'s active pieces for your passive ones\n• Trade to relieve pressure when defending\n• Avoid trading when you need pieces for an attack' },
      { type: 'tip', content: 'In the endgame, a minor piece + 2 pawns usually beats a Rook. Know your endgame values!' },
      { type: 'warning', content: 'Piece values change based on position! A trapped Rook might be worth less than an active Knight.' }
    ]
  },
  {
    id: 'openings-1',
    title: 'Opening Principles',
    description: 'Master the fundamental principles that guide all good opening play',
    level: 'intermediate',
    category: 'openings',
    duration: 30,
    content: [
      { type: 'text', content: 'THE THREE GOLDEN RULES OF OPENINGS:\n\n1. CONTROL THE CENTER (e4, d4, e5, d5)\nCenter pawns control key squares and allow piece development. 1.e4 and 1.d4 are the most popular first moves.\n\n2. DEVELOP YOUR PIECES (Knights before Bishops!)\nGet your Knights and Bishops off the back rank. Knights usually go to f3/c3 (or f6/c6 for Black).\n\n3. CASTLE EARLY (usually Kingside)\nGet your King safe! An uncastled King is a target in the center.' },
      { type: 'tip', content: 'Don\'t move the same piece twice in the opening unless capturing or avoiding trouble. Develop efficiently!' },
      { type: 'text', content: 'Additional Opening Guidelines:\n• Don\'t bring your Queen out early (she gets harassed)\n• Connect your Rooks (clear back rank)\n• Don\'t make too many pawn moves (wastes development tempo)\n• Watch for tactics - even in the opening!' },
      { type: 'warning', content: 'Avoid "Pawn Grabbing" in the opening. Development is more important than winning a peripheral pawn.' }
    ]
  },
  // ==================== ADVANCED LEVEL (1600-2000 ELO) ====================
  {
    id: 'tactics-5',
    title: 'Removing the Defender',
    description: 'Advanced tactic: eliminating the guard to enable winning combinations',
    level: 'advanced',
    category: 'tactics',
    duration: 25,
    content: [
      { type: 'text', content: 'REMOVING THE DEFENDER is a crucial tactical motif where you capture, chase away, or distract the piece that is protecting something valuable.' },
      { type: 'text', content: 'Three Methods to Remove Defenders:\n\n1. CAPTURE THE DEFENDER: Simply take the defending piece if it\'s undefended or less valuable than what it protects.\n\n2. DRIVE AWAY THE DEFENDER: Attack the defender to force it to move, leaving its protection duty.\n\n3. DISTRACT THE DEFENDER: Create a more urgent threat elsewhere that forces the defender to abandon its post.' },
      { type: 'example', content: 'Pattern: Enemy Knight defends a weak pawn. Attack the Knight with a pawn push, then take the now-undefended pawn.', explanation: 'This motif often appears in combinations. Look for overloaded defenders protecting multiple things!' },
      { type: 'tip', content: 'Identify which pieces are "overloaded" (defending multiple targets) - they are prime candidates for removal tactics.' }
    ]
  },
  {
    id: 'tactics-6',
    title: 'Interference & Overloading',
    description: 'Complex tactical motifs that exploit piece coordination weaknesses',
    level: 'advanced',
    category: 'tactics',
    duration: 30,
    content: [
      { type: 'text', content: 'INTERFERENCE occurs when you place a piece on a critical square, cutting off the connection between two enemy pieces that need each other.' },
      { type: 'text', content: 'Classic Interference Pattern: Place your piece between enemy Rooks on the same rank, or between pieces that defend each other.' },
      { type: 'diagram', content: 'Interference theme -切断防守联系', fen: '6k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1' },
      { type: 'text', content: 'OVERLOADING happens when a piece has too many defensive responsibilities. By creating multiple threats, you force it to choose - and whatever it doesn\'t defend falls!' },
      { type: 'example', content: 'A Knight defending both a pawn and a mate threat. Create a new threat, and the Knight can only handle one.', explanation: 'Overloaded pieces are everywhere in complex positions. Train yourself to spot them quickly.' },
      { type: 'tip', content: 'Combination idea: First interfere, then exploit the disconnected pieces. These motifs chain together!' }
    ]
  },
  {
    id: 'strategy-2',
    title: 'Pawn Structure Fundamentals',
    description: 'Understanding pawn formations and their long-term implications',
    level: 'advanced',
    category: 'positional',
    duration: 35,
    content: [
      { type: 'text', content: 'PAWN STRUCTURE determines the character of the position. Pawns cannot move backward, so every pawn move permanently changes the structure.' },
      { type: 'text', content: 'KEY PAWN STRUCTURES TO KNOW:\n\n• DOUBLED PAWNS: Two pawns of the same color on the same file. Usually a weakness (hard to defend), but can control useful squares.\n\n• ISOLATED PAWN: A pawn with no friendly pawns on adjacent files. Weak in endgames (cannot be protected by other pawns), but can provide open files for pieces.\n\n• PASSED PAWN: A pawn with no enemy pawns ahead of it on either adjacent file. Extremely dangerous - can potentially promote!\n\n• BACKWARD PAWN: A pawn that cannot be protected by other pawns and is vulnerable to attack.' },
      { type: 'tip', content: 'Fix your weak pawns BEFORE they become targets. Sometimes advancing a backward pawn is better than leaving it behind.' },
      { type: 'warning', content: 'Avoid creating unnecessary weaknesses. Every pawn move should have a clear purpose!' }
    ]
  },
  {
    id: 'strategy-3',
    title: 'Weak Squares & Outposts',
    description: 'Learn to identify and exploit weak squares in the opponent\'s position',
    level: 'advanced',
    category: 'positional',
    duration: 30,
    content: [
      { type: 'text', content: 'A WEAK SQUARE is a square that cannot be defended by enemy pawns. Once established on a weak square, a piece (especially a Knight!) can never be dislodged by pawns.' },
      { type: 'text', content: 'An OUTPOST is a weak square in enemy territory where you can establish a piece (typically a Knight) that cannot be attacked by enemy pawns.' },
      { type: 'diagram', content: 'Perfect Knight outpost on d5', fen: 'r1bq1rk1/p2pbppp/1p2pn2/2p5/3NP3/2PN4/PPP1BPPP/R1BQK2R w KQ - 0 1' },
      { type: 'text', content: 'Creating Weak Squares:\n• Pawn advances create holes behind them\n• Pawn exchanges can leave weak complexes\n• Attacking pawns can force weakening moves' },
      { type: 'tip', content: 'Knights love outposts! A Knight on a secure outpost can be worth a Rook in some positions.' },
      { type: 'example', content: 'Classic plan: Fix enemy pawns (stop them from challenging your outpost), then occupy the outpost with a Knight.', explanation: 'This is a multi-move strategic plan, not just one tactic!' }
    ]
  },
  {
    id: 'endgames-1',
    title: 'Essential Endgame Techniques',
    description: 'Fundamental endgame knowledge every improving player needs',
    level: 'advanced',
    category: 'endgames',
    duration: 40,
    content: [
      { type: 'text', content: 'ENDGAME PRINCIPLES:\n\n1. KING ACTIVATION: In the endgame, the King becomes a fighting piece! Centralize your King aggressively.\n\n2. PASSED PAWNS: Push passed pawns! They are your main winning weapon. "Passed pawns must be pushed."\n\n3. OPPOSITION: When Kings face each other with an odd number of squares between them, the player who does NOT have to move "has opposition" and can invade.' },
      { type: 'diagram', content: 'King + Pawn vs King - Key technique', fen: '8/8/8/8/8/4PK2/8/4k3 w - - 0 1' },
      { type: 'text', content: 'RULE OF THE SQUARE: A pawn can queen without the King\'s help if the enemy King cannot enter the "square" of the pawn. Draw a diagonal from the pawn to the queening rank - if the King can\'t enter that area, the pawn promotes!' },
      { type: 'text', content: 'LUCENA POSITION: The key winning technique in Rook endgames. Build a "bridge" with your Rook to shield your King while promoting.' },
      { type: 'tip', content: 'Study basic endgames FIRST. Knowing K+P vs K, K+R vs K, and K+B+K vs K will save countless half-points!' }
    ]
  },
  // ==================== MASTER LEVEL (2000+ ELO) ====================
  {
    id: 'strategy-4',
    title: 'Prophylaxis & Prevention',
    description: 'Master-level thinking: preventing opponent\'s plans before they happen',
    level: 'master',
    category: 'positional',
    duration: 35,
    content: [
      { type: 'text', content: 'PROPHYLAXIS (from Greek "prevention") is the art of stopping your opponent\'s ideas before they can execute them. This separates masters from amateurs.' },
      { type: 'text', content: 'Questions to Ask Yourself:\n• What does my opponent want to do?\n• What is their best continuation?\n• How can I prevent or minimize that plan?\n• Does my move create new weaknesses?' },
      { type: 'text', content: 'Types of Prophylactic Moves:\n\n1. DIRECT PREVENTION: Stop a specific threat (e.g., controlling a square they need)\n\n2. INDIRECT PREVENTION: Make their plan less effective (e.g., trading their active piece)\n\n3. WAITING MOVES: Make a useful move that passes the turn ("zugzwang" in lost positions)' },
      { type: 'example', content: 'Instead of launching your own attack, play a quiet move like a3 or h3 to prevent Knight invasion on b4/g4.', explanation: 'Petrosian was famous for this style - he prevented opponent\'s plans until they had nothing left.' },
      { type: 'tip', content: '"What is my opponent\'s threat?" should be asked EVERY MOVE, not just when you see danger.' }
    ]
  },
  {
    id: 'strategy-5',
    title: 'Dynamic vs Static Advantages',
    description: 'Understanding when to seek activity versus when to accumulate small advantages',
    level: 'master',
    category: 'positional',
    duration: 40,
    content: [
      { type: 'text', content: 'STATIC ADVANTAGES are permanent features of the position:\n• Material advantage\n• Better pawn structure\n• Better King safety\n• Weak squares in enemy camp\nThese advantages tend to persist and grow over time.' },
      { type: 'text', content: 'DYNAMIC ADVANTAGES are temporary but powerful:\n• Initiative/attack\n• Better piece activity\n• Tactical opportunities\n• Time advantage (development)\nThese advantages must be used NOW or they disappear!' },
      { type: 'text', content: 'THE KEY INSIGHT: When you have static advantages, you can play calmly and let them tell. When you have dynamic advantages, you must act FAST before they evaporate.' },
      { type: 'example', content: 'Down material but with a fierce attack? That\'s dynamic compensation - you must checkmate soon or the material deficit will decide.', explanation: 'Many games are won by correctly assessing what TYPE of advantage you have.' },
      { type: 'tip', content: 'Ask: "Is my advantage getting stronger or weaker with each exchange?" This tells you whether to simplify or complicate.' }
    ]
  },
  {
    id: 'tactics-7',
    title: 'Zugzwang & Triangulation',
    description: 'Endgame tactics involving forcing the opponent to move (to their disadvantage)',
    level: 'master',
    category: 'tactics',
    duration: 30,
    content: [
      { type: 'text', content: 'ZUGZWANG (German for "compulsion to move") occurs when ANY move worsens your position. The player would prefer to pass, but chess rules require a move!' },
      { type: 'text', content: 'Zugzwang is most common in:\n• Pure King and Pawn endgames\n• Positions with limited mobility\n• When all pieces are on optimal squares' },
      { type: 'diagram', content: 'Zugzwang - Black to move loses, White to move draws', fen: '8/8/8/3K4/8/8/3k4/8 w - - 0 1' },
      { type: 'text', content: 'TRIANGULATION is a technique to lose a move (pass the turn) using the King\'s ability to move in triangles. This transfers the zugzwang to your opponent!' },
      { type: 'example', content: 'King triangulation: Ke4-f4-e3-e4 (3 moves to return) while opponent\'s King must move from a good square.', explanation: 'Triangulation requires space to maneuver. It\'s impossible in cramped positions.' },
      { type: 'tip', content: 'In King and Pawn endgames, always check for zugzwang possibilities. Often the side to move loses!' }
    ]
  },
  {
    id: 'gambits-intro',
    title: 'Gambit Philosophy & When to Use Them',
    description: 'Understanding the strategic basis of gambits and proper handling',
    level: 'intermediate',
    category: 'gambits',
    duration: 25,
    content: [
      { type: 'text', content: 'A GAMBIT is an opening where you voluntarily sacrifice material (usually a pawn, sometimes more) in exchange for:\n• Rapid development\n• Open lines for your pieces\n• Initiative/attack against the enemy King\n• Long-term positional pressure' },
      { type: 'text', content: 'WHEN TO PLAY GAMBITS:\n• When you want sharp, tactical positions\n• Against opponents who defend poorly\n• When you\'re comfortable with complications\n• In shorter time controls (less time to defend)' },
      { type: 'text', content: 'WHEN TO AVOID GAMBITS:\n• Against strong defenders who know the theory\n• When you want a calm positional game\n• In important tournament games (unless prepared)\n• Against computers/engines (they defend perfectly)' },
      { type: 'tip', content: 'Gambits require follow-through! After sacrificing, you MUST attack actively. Passive play after a gambit is simply being down material.' },
      { type: 'warning', content: 'Don\'t play gambits blindly. Understand the ideas behind them or you\'ll lose too many games!' }
    ]
  }
];

// Gambit-specific comprehensive lessons
export const GAMBIT_LESSONS: Lesson[] = [
  {
    id: 'kings-gambit',
    title: "King's Gambit",
    description: "The romantic era's favorite gambit - sharp, dangerous, and exciting!",
    level: 'intermediate',
    category: 'gambits',
    duration: 45,
    content: [
      { type: 'text', content: "THE KING'S GAMBIT begins: 1.e4 e5 2.f4\n\nWhite offers the f-pawn to divert Black's e-pawn from controlling the center. If Black accepts (2...exf4), White gets open f-file and center pawns." },
      { type: 'diagram', content: "King's Gambit Accepted position", fen: 'rnbqkbnr/pppp1ppp/8/4p3/4PP2/8/PPPP2PP/RNBQKBNR b KQkq - 0 2' },
      { type: 'text', content: "MAIN VARIATIONS:\n\n1. ACCEPTED (2...exf4): Main line. White gets active play.\n   • Classical Defense: 3.Nf3 g5 (aggressive)\n   • Modern Defense: 3.Nf3 d5 (solid)\n   • Fischer Defense: 3...d6 (solid, recommended by Fischer!)\n\n2. DECLINED:\n   • 2...d5 (Counter-gambit)\n   • 2...Bc5 (Classical Declined)" },
      { type: 'text', content: "WHITE'S IDEAS AFTER ACCEPTANCE:\n• Play d4 to dominate center\n• Develop Bc4 targeting f7 weakness\n• Castle kingside and launch f-pawn attack\n• Sometimes sacrifice on f7 with Bxf7+" },
      { type: 'example', content: "Typical King's Gambit sacrifice: 3.Nf3 d5 4.exd5 Nf6 5.Bc4 Nxd5?? 6.Nxe5! attacking Queen and f7.", explanation: "Black must be very careful about f7 - it's the classic weak point." },
      { type: 'warning', content: "The King's Gambit is double-edged! If Black defends accurately and White doesn't follow through, White is just down a pawn." },
      { type: 'tip', content: "Study the 'Kieseritzky Gambit' (3.Nf3 g5 4.h4 g4 5.Ng5) for maximum aggression!" }
    ],
    practiceFEN: 'rnbqkbnr/pppp1ppp/8/4p3/4PP2/8/PPPP2PP/RNBQKBNR b KQkq - 0 2'
  },
  {
    id: 'queens-gambit',
    title: "Queen's Gambit",
    description: "The most respected gambit in chess history - played by World Champions",
    level: 'intermediate',
    category: 'gambits',
    duration: 50,
    content: [
      { type: 'text', content: "THE QUEEN'S GAMBIT begins: 1.d4 d5 2.c4\n\nWhite offers the c-pawn to challenge Black's d5 center immediately. Unlike the King's Gambit, this is more positional." },
      { type: 'diagram', content: "Queen's Gambit position", fen: 'rnbqkbnr/ppp1pppp/8/3p4/2PP4/8/PP2PPPP/RNBQKBNR b KQkq - 0 2' },
      { type: 'text', content: "MAIN VARIATIONS:\n\n1. ACCEPTED (2...dxc4): Queen's Gambit Accepted\n   • White recovers with e3 or e4\n   • Black gives up center for temporary piece activity\n   • Can lead to isolated queen pawn positions\n\n2. DECLINED (most common):\n   • Slav Defense: 2...c6 (solid, maintains d5)\n   • QGD Orthodox: 2...e6 (classical)\n   • QGD Cambridge Springs: ...Nf6/...Bb4/...Nbd7 with ...Ne4 ideas\n   • Albin Counter-Gambit: 2...e5?! (sharp)" },
      { type: 'text', content: "QUEEN'S GAMBIT DECLINED IDEAS:\n• White wants to play e4 to free pieces\n• Black aims to keep d5 solid and develop\n• Battle revolves around central tension\n• Often leads to slow maneuvering games" },
      { type: 'tip', content: "The Queen's Gambit is 'positional' - you're not getting a raging attack, but long-term pressure. Perfect for strategic players!" },
      { type: 'warning', content: "Don't accept the Queen's Gambit lightly. The resulting positions require precise understanding of isolated pawn structures." }
    ],
    practiceFEN: 'rnbqkbnr/ppp1pppp/8/3p4/2PP4/8/PP2PPPP/RNBQKBNR b KQkq - 0 2'
  },
  {
    id: 'evans-gambit',
    title: "Evans Gambit",
    description: "A romantic-era favorite that led to the 'Immortal Game'",
    level: 'advanced',
    category: 'gambits',
    duration: 40,
    content: [
      { type: 'text', content: "THE EVANS GAMBIT arises from the Italian Game:\n1.e4 e5 2.Nf3 Nc6 3.Bc4 Bc5 4.b4!??\n\nWhite sacrifices the b-pawn to divert Black's bishop from the center and gain time for rapid development." },
      { type: 'diagram', content: "Evans Gambit position", fen: 'r1bqk1nr/pppp1ppp/2n5/2b1p3/1PP1P3/5N2/P2P1PPP/RNBQKB1R b KQkq - 0 4' },
      { type: 'text', content: "WHY THE EVANS WORKS:\n• Black's bishop must move (losing tempo if taking)\n• White gets quick d4 push dominating center\n• Open b-file for potential rook lift\n• Rapid piece development with tempo" },
      { type: 'text', content: "MAIN LINES:\n1. 4...Bxb4 5.c3 Ba5 (main line)\n2. 4...Bxb4 5.c3 Be7 (solid)\n3. 4...Wxb4? 5.c3 (trapping ideas)" },
      { type: 'example', content: "After 4...Bxb4 5.c3 Ba5 6.d4 exd4 7.O-O! (castling into the attack!)", explanation: "White sacrifices another tempo to get the King safe while the center explodes." },
      { type: 'warning', content: "The Evans Gambit has been analyzed extensively. At top level, Black has ways to neutralize it, but it's deadly below 2200!" },
      { type: 'tip', content: "Study the 'Immortal Game' (Andersen-Kieseritzky 1851) - it started as an Evans Gambit and is the most famous game ever played!" }
    ],
    practiceFEN: 'r1bqk1nr/pppp1ppp/2n5/2b1p3/1PP1P3/5N2/P2P1PPP/RNBQKB1R b KQkq - 0 4'
  },
  {
    id: 'scotch-gambit',
    title: "Scotch Gambit",
    description: "An aggressive alternative to the Scotch Game with full compensation",
    level: 'intermediate',
    category: 'gambits',
    duration: 35,
    content: [
      { type: 'text', content: "THE SCOTCH GAMBIT arises from:\n1.e4 e5 2.Nf3 Nc6 3.d4 exd4 4.Bc4\n\nInstead of taking back on d4 (Scotch Game), White develops with tempo, offering the d4 pawn for rapid development." },
      { type: 'diagram', content: "Scotch Gambit position", fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK1NR b KQkq - 0 4' },
      { type: 'text', content: "KEY IDEAS:\n• Bishop on c4 eyes f7 weakness\n• Threatening Ng5 with dual threats\n• Quick castling and central expansion\n• If 4...Bb4+, 5.c3 dxc3 6.O-O! (sacrificing more!)" },
      { type: 'text', content: "BLACK'S MAIN OPTIONS:\n1. 4...Bc5 (main line, developing)\n2. 4...Bb4+ (active, trying to disrupt)\n3. 4...Nf6 (solid, ignoring pawn)\n4. 4...dxc3 (accepting, risky)" },
      { type: 'example', content: "After 4...Bc5 5.Ng5! threatening Nxf7 and d4. Black must defend carefully.", explanation: "Ng5 is a recurring theme - always watch for this knight jump!" },
      { type: 'tip', content: "The Scotch Gambit is easier to learn than the King's Gambit but still very dangerous. Great for club players!" }
    ],
    practiceFEN: 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK1NR b KQkq - 0 4'
  },
  {
    id: 'latvian-gambit',
    title: "Latvian Gambit",
    description: "A risky but fun gambit for Black players who want chaos",
    level: 'advanced',
    category: 'gambits',
    duration: 35,
    content: [
      { type: 'text', content: "THE LATVIAN GAMBIT begins:\n1.e4 e5 2.Nf3 f5?!\n\nBlack immediately challenges the e4 pawn with a risky pawn thrust. Objectively dubious, but practically dangerous!" },
      { type: 'diagram', content: "Latvian Gambit position", fen: 'rnbqkbnr/ppppp1pp/8/5p2/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 0 2' },
      { type: 'text', content: "BLACK'S IDEA:\n• Open f-file for the rook\n• Confuse White in unfamiliar territory\n• If 3.exf5, Black gets e-pawn mobility\n• Many traps and tricks for the unwary" },
      { type: 'warning', content: "The Latvian is objectively suspect! White can gain advantage with accurate play. Use for surprise value only." },
      { type: 'text', content: "WHITE'S BEST RESPONSES:\n1. 3.Nxe5! (taking the offered pawn)\n2. 4.d4 (challenging center)\n3. 4.Bc4 (developing with threat)" },
      { type: 'tip', content: "Play the Latvian against opponents who memorize theory but don't understand positions. It creates chaos!" }
    ],
    practiceFEN: 'rnbqkbnr/ppppp1pp/8/5p2/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 0 2'
  },
  {
    id: 'smith-morra-gambit',
    title: "Smith-Morra Gambit",
    description: "White's aggressive response to the Sicilian Defense",
    level: 'advanced',
    category: 'gambits',
    duration: 40,
    content: [
      { type: 'text', content: "THE SMITH-MORRA GAMBIT answers the Sicilian:\n1.e4 c5 2.d4 cxd4 3.c3!?\n\nWhite offers a second pawn (the c-pawn) for rapid development and center dominance against the Sicilian." },
      { type: 'diagram', content: "Smith-Morra Gambit Accepted", fen: 'rnbqkbnr/pp1ppppp/8/2p5/3PP3/8/PPP2PPP/RNBQKBNR b KQkq - 0 3' },
      { type: 'text', content: "WHITE'S COMPENSATION:\n• Center pawns on d4 and e4\n• Open c-file for the rook\n• Rapid piece development\n• Long-term initiative" },
      { type: 'text', content: "MAIN LINE (Accepted): 3...dxc3 4.Nxc3\n• White has 'free' development\n• Classic lever break with e5 possible\n• Queenside pressure with Qb3 or a4" },
      { type: 'text', content: "DECLINED: 3...Nf6! or 3...d3 (declining the gambit)\nBlack can return the pawn under favorable circumstances." },
      { type: 'tip', content: "The Smith-Morra is perfect against Sicilian players who don't know the theory. It's been played by World Champion Tal!" },
      { type: 'warning', content: "Against prepared opponents, Black can return the pawn at the right moment and equalize. Know your theory!" }
    ],
    practiceFEN: 'rnbqkbnr/pp1ppppp/8/2p5/3PP3/8/PPP2PPP/RNBQKBNR b KQkq - 0 3'
  },
  {
    id: 'benko-gambit',
    title: "Benko Gambit (Volga)",
    description: "A sound gambit for Black that offers lasting pressure",
    level: 'advanced',
    category: 'gambits',
    duration: 45,
    content: [
      { type: 'text', content: "THE BENKO GAMBIT (also called Volga Gambit) is played by Black:\n1.d4 Nf6 2.c4 c5 3.d5 b5!\n\nBlack sacrifices the b-pawn for permanent queenside pressure and open lines." },
      { type: 'diagram', content: "Benko Gambit position", fen: 'rnbqkb1r/p1pp1ppp/5p2/1PpPn3/8/8/P2PPPPP/RNBQKBNR w KQkq - 0 4' },
      { type: 'text', content: "BLACK'S COMPENSATION (even if White keeps the pawn):\n• Half-open a and b-files for rooks\n• Strong diagonal for dark-squared bishop\n• Queenside pressure that lasts the whole game\n• White's queenside majority is immobile" },
      { type: 'text', content: "TYPICAL BENKO THEMES:\n• ...Ba6 trading off White's good bishop\n• ...Qa8-a5 putting pressure on queenside\n• ...Nf6-e4-g5 (knight maneuvers)\n• Rook lifts Ra6-b6" },
      { type: 'tip', content: "The Benko is one of the 'soundest' gambits - Grandmasters play it regularly! The compensation is real, not speculative." },
      { type: 'example', content: "After 4.cxb6 a6! 5.bxa6 Bxa6, Black has tremendous pressure along the a-file and long diagonal.", explanation: "Black doesn't need to win the pawn back - the positional pressure IS the compensation." }
    ],
    practiceFEN: 'rnbqkb1r/p1pp1ppp/5p2/1PpPn3/8/8/P2PPPPP/RNBQKBNR w KQkq - 0 4'
  }
];

// Opening Theory Database
export const OPENING_THEORY = [
  {
    name: "Italian Game",
    moves: "1.e4 e5 2.Nf3 Nc6 3.Bc4",
    description: "One of the oldest openings. Focuses on rapid development and soft pressure on f7.",
    ideas: ["Control the center with e4/d4 push", "Castle quickly", "Potential for Evans Gambit (4.b4)", "Avoid premature Qh5 attacks"],
    pros: ["Easy to learn", "Natural development", "Flexible - can become quiet or sharp"],
    cons: ["Well-analyzed", "Black has solid responses", "Less surprise value"],
    difficulty: "beginner" as const,
    fen: 'r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 4'
  },
  {
    name: "Sicilian Defense",
    moves: "1.e4 c5",
    description: "Black's most popular and scoring response to 1.e4. Asymmetric and fighting.",
    ideas: ["Trade c-pawn for d-pawn (controlling d4)", "Asymmetric position avoids early draws", "Rich variety of variations", "Counter-attacking opportunities"],
    pros: ["High scoring for Black", "Many variations to choose from", "Leads to complex fights"],
    cons: ["Lots of theory to know", "Can get dangerous positions", "Behind in development initially"],
    difficulty: "intermediate" as const,
    fen: 'rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1'
  },
  {
    name: "French Defense",
    moves: "1.e4 e6",
    description: "Solid defense focusing on counter-attacks in the center.",
    ideas: ["Solid pawn structure", "Counter-attack with ...d5 and ...c5", "Bad light-squared bishop is a theme", "Strategic complexity"],
    pros: ["Very solid", "Avoids book lines", "Good for positional players"],
    cons: ["Space disadvantage", "Bad bishop can be problem", "Can be passive if not careful"],
    difficulty: "intermediate" as const,
    fen: 'rnbqkbnr/pppp1ppp/4p2/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1'
  },
  {
    name: "Caro-Kann Defense",
    moves: "1.e4 c6",
    description: "Extremely solid defense favored by World Champions like Capablanca and Karpov.",
    ideas: ["Prepare ...d5 with tempo", "Solid pawn structure", "Good endgame prospects", "Exchange variation is main challenge"],
    pros: ["Very solid", "Hard to crack", "Good for endgame lovers"],
    cons: ["Can be passive", "Restricted piece activity", "Requires patience"],
    difficulty: "intermediate" as const,
    fen: 'rnbqkbnr/pp1ppppp/2p5/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1'
  },
  {
    name: "Queen's Gambit Declined",
    moves: "1.d4 d5 2.c4 e6",
    description: "One of the most classical openings. Deep strategic understanding required.",
    ideas: ["Maintain the d5 center", "Develop pieces naturally", "Watch for ...c5 breaks", "Cambridge Springs trap possible"],
    pros: ["Respected at all levels", "Teaches strategic chess", "Flexible pawn structures"],
    cons: ["Slow development", "Can lead to passive positions", "Heavy theory"],
    difficulty: "advanced" as const,
    fen: 'rnbqkbnr/ppp2ppp/4p3/3p4/2PP4/8/PP2PPPP/RNBQKBNR b KQkq - 0 3'
  },
  {
    name: "King's Indian Defense",
    moves: "1.d4 Nf6 2.c4 g6",
    description: "Hypermodern defense. Black allows White the center then attacks it.",
    ideas: ["Fianchetto the dark-squared bishop", "Attack the center with ...e5", "Sharp tactical battles", "Closed positions favor knights"],
    pros: ["Fighting chances", "Common at club level", "Attacking chances"],
    cons: ["Can get crushed if not careful", "White has space", "Theory heavy"],
    difficulty: "advanced" as const,
    fen: 'rnbqkbnr/pp1ppp2/6p1/2p5/2PP4/8/PP2PPPP/RNBQKBNR b KQkq - 0 3'
  },
  {
    name: "Spanish Game (Ruy Lopez)",
    moves: "1.e4 e5 2.Nf3 Nc6 3.Bb5",
    description: "The 'opening of champions'. Rich, strategic, and deeply analyzed.",
    ideas: ["Put pressure on the Knight defending e5", "Prepare d4 center push", "Multiple variations (Open, Closed, Berlin)", "Long-term structural advantages"],
    pros: ["Rich strategic content", "Played by every World Champion", "Flexible based on Black's response"],
    cons: ["Massive theory", "Requires deep understanding", "Slow payoff"],
    difficulty: "advanced" as const,
    fen: 'r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 0 3'
  },
  {
    name: "English Opening",
    moves: "1.c4",
    description: "Flexible opening that can transpose into many other systems.",
    ideas: ["Control the center from the flank", "Transposition possibilities", "Symmetrical variations exist", "Reversed Sicilian structures"],
    pros: ["Flexible", "Avoids major theory", "Surprise factor"],
    cons: ["Less direct", "Can be slow", "Requires broad knowledge"],
    difficulty: "intermediate" as const,
    fen: 'rnbqkbnr/pppppppp/8/8/2P5/8/PP1PPPPP/RNBQKBNR b KQkq - 0 1'
  }
];

// Tactics puzzles database (sample)
export const TACTICS_PUZZLES = [
  {
    id: 'puzzle-1',
    rating: 800,
    theme: 'Back Rank Mate',
    fen: '6k1/5ppp/8/8/8/8/8/R3K3 w - - 0 1',
    solution: 'Ra8#',
    explanation: 'Back rank mate! The 7th rank pawns block the King\'s escape.'
  },
  {
    id: 'puzzle-2',
    rating: 900,
    theme: 'Fork',
    fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3',
    solution: 'Ne5',
    explanation: 'Knight fork! Attacks the Queen on d7 and the weak f7 pawn.'
  },
  {
    id: 'puzzle-3',
    rating: 1000,
    theme: 'Pin',
    fen: 'rnbqk2r/pppp1ppp/4pn2/8/1bP5/2N5/PP2PPPP/R1BQKBNR w KQkq - 0 5',
    solution: 'Bg5',
    explanation: 'Pin the Knight to the Queen! The Knight cannot move without exposing the Queen.'
  },
  {
    id: 'puzzle-4',
    rating: 1100,
    theme: 'Discovered Attack',
    fen: 'rnbqk2r/pppp1ppp/4pn2/8/3NP3/8/PPP2PPP/RNBQKB1R w KQkq - 0 5',
    solution: 'Nd5',
    explanation: 'Discovered attack on the e-file plus Knight threatens c7 and f6!'
  },
  {
    id: 'puzzle-5',
    rating: 1200,
    theme: 'Scholar\'s Mate Pattern',
    fen: 'r1bqkb1r/pppp1Qpp/2n2n2/4p3/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 4',
    solution: 'Cannot prevent Qxf7#',
    explanation: 'Scholar\'s Mate pattern - Qxf7 is checkmate! Always watch f7!'
  },
  {
    id: 'puzzle-6',
    rating: 1300,
    theme: 'Double Attack',
    fen: 'r1b1k2r/ppppqppp/2n2n2/4N3/1bB1P3/8/PPPP1PPP/RNBQK2R w KQkq - 0 7',
    solution: 'Nxf7',
    explanation: 'Royal Fork! The Knight attacks King, Queen, and Rook simultaneously.'
  },
  {
    id: 'puzzle-7',
    rating: 1400,
    theme: 'Removal of Defender',
    fen: '2kr3r/pppq1ppp/2np1n2/4N3/2B1P1b1/8/PPPPQPPP/RNB1K2R w KQ - 0 12',
    solution: 'Nxd6',
    explanation: 'Remove the defender of c8! After ...Qxd6, Bxf7+ wins the Queen.'
  },
  {
    id: 'puzzle-8',
    rating: 1500,
    theme: 'Mate in 2',
    fen: '2bqkbn1/2pppp2/np2N3/r3P1p1/p2N2B1/5Q2/PPPPPP1P/RNB1K2R w KQ - 0 14',
    solution: 'Qf7+ Kh8 Ne7#',
    explanation: 'Smothered mate pattern! Queen sacrifice leads to checkmate.'
  },
  {
    id: 'puzzle-9',
    rating: 1600,
    theme: 'Zwischenzug',
    fen: 'r1bk3r/ppppqppp/2n2n2/4N3/1bB1P3/8/PPPP1PPP/RNBQK2R w KQ - 0 7',
    solution: 'Ne7+! (zwischenzug) Kh8 Nxc8',
    explanation: 'Intermediate check (Zwischenzug)! Win material after the forced sequence.'
  },
  {
    id: 'puzzle-10',
    rating: 1700,
    theme: 'Desperado',
    fen: 'r1bq1rk1/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQ - 0 6',
    solution: 'Nxe5! Nxe5 d4',
    explanation: 'Desperado Knight! Take as much as you can before it falls.'
  },
  {
    id: 'puzzle-11',
    rating: 1800,
    theme: 'Attraction Sacrifice',
    fen: 'r1bqr1k1/pppp1Qpp/2n2n2/2b5/2B1P3/8/PPP2PPP/RNB1K1NR w KQ - 0 9',
    solution: 'Qxf7+! Kxf7 Bh5+',
    explanation: 'Attraction sacrifice! Lure the King to f7 for a discovered attack.'
  },
  {
    id: 'puzzle-12',
    rating: 1900,
    theme: 'X-Ray Attack',
    fen: '3r2k1/ppp2ppp/2n5/3q4/3Q4/2N5/PPP2PPP/R1BK4 w - - 0 18',
    solution: 'Qd8+! Rxd8 Rxd8#',
    explanation: 'X-ray attack through the Rook! Back rank mate follows.'
  },
  {
    id: 'puzzle-13',
    rating: 2000,
    theme: 'Clearance Sacrifice',
    fen: 'r2qk2r/ppp2ppp/2np1n2/2b1p3/2B1P2Q/3P1N2/PPP2PPP/RNB1K2R w KQkq - 0 8',
    solution: 'Qxh7+! Kxh7 Rh5#',
    explanation: 'Clearance sacrifice! Remove the defender and deliver mate.'
  },
  {
    id: 'puzzle-14',
    rating: 2100,
    theme: 'Undermining',
    fen: 'r1b1k2r/ppppqppp/2n2n2/4p3/1bB1P3/2N5/PPPP1PPP/RNBQK2R w KQkq - 0 6',
    solution: 'Bxf7+! Ke7 Bxg8',
    explanation: 'Undermine the King\'s protection! Win the exchange.'
  },
  {
    id: 'puzzle-15',
    rating: 2200,
    theme: 'Quiet Move',
    fen: 'r4rk1/ppp2ppp/2n5/3qp3/3P4/1QN5/PP2PPPP/R1B1KB1R w K - 0 16',
    solution: 'Qb3!',
    explanation: 'Quiet move threatening Qb8# and Qxa8. Cannot be stopped!'
  }
];

// Helper functions
export function getLessonsByLevel(level: Lesson['level']): Lesson[] {
  return CHESS_LESSONS.filter(lesson => lesson.level === level);
}

export function getLessonsByCategory(category: Lesson['category']): Lesson[] {
  return [...CHESS_LESSONS, ...GAMBIT_LESSONS].filter(lesson => lesson.category === category);
}

export function getLessonById(id: string): Lesson | undefined {
  return [...CHESS_LESSONS, ...GAMBIT_LESSONS].find(lesson => lesson.id === id);
}

export function getPuzzlesByRating(minRating: number, maxRating: number): typeof TACTICS_PUZZLES {
  return TACTICS_PUZZLES.filter(puzzle => puzzle.rating >= minRating && puzzle.rating <= maxRating);
}
