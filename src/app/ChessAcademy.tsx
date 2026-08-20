'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Chess, Move } from 'chess.js';
import ChessBoard, { Square, createNewGame } from '@/lib/chess/ChessBoard';
import { ChessEngine, createEngine, Difficulty, getEloRange } from '@/lib/chess/ChessEngine';
import {
  CHESS_LESSONS,
  GAMBIT_LESSONS,
  OPENING_THEORY,
  TACTICS_PUZZLES,
  Lesson,
  getLessonsByLevel,
  getPuzzlesByRating
} from '@/lib/chess/LessonsData';

type TabType = 'play' | 'lessons' | 'gambits' | 'tactics' | 'openings' | 'endgame' | 'progress';

interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  gamesDrawn: number;
  currentElo: number;
  puzzlesSolved: number;
  lessonsCompleted: number;
}

export default function ChessMasterAcademy() {
  const [game, setGame] = useState<Chess>(createNewGame());
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>('intermediate');
  const [gameStatus, setGameStatus] = useState<string>('Your turn!');
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('play');
  const [orientation, setOrientation] = useState<'white' | 'black'>('white');
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [puzzleRatingFilter, setPuzzleRatingFilter] = useState<[number, number]>([800, 1200] as [number, number]);
  const [puzzleResult, setPuzzleResult] = useState<'correct' | 'incorrect' | null>(null);
  
  const [stats, setStats] = useState<GameStats>({
    gamesPlayed: 0,
    gamesWon: 0,
    gamesDrawn: 0,
    currentElo: 1000,
    puzzlesSolved: 0,
    lessonsCompleted: 0
  });

  const engine = useMemo(() => createEngine(difficulty), [difficulty]);

  const updateStats = useCallback((result: 'win' | 'loss' | 'draw') => {
    setStats(prev => {
      const eloChange = result === 'win' ? 15 : result === 'loss' ? -10 : 5;
      return {
        ...prev,
        gamesPlayed: prev.gamesPlayed + 1,
        gamesWon: prev.gamesWon + (result === 'win' ? 1 : 0),
        gamesDrawn: prev.gamesDrawn + (result === 'draw' ? 1 : 0),
        currentElo: Math.max(100, Math.min(3000, prev.currentElo + eloChange))
      };
    });
  }, []);

  const makeAIMove = useCallback((currentGame: Chess) => {
    if (!engine || currentGame.isGameOver()) return;
    
    const bestMoveStr = engine.getBestMove(currentGame);
    
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
            setGameStatus('Checkmate! AI wins. Try again!');
            updateStats('loss');
          } else if (currentGame.isCheck()) {
            setGameStatus('Check! Your turn.');
          } else {
            setGameStatus('Your turn!');
          }
        }
      } catch (e) {
        setGameStatus('Your turn!');
      }
    } else {
      setGameStatus('Your turn!');
    }
  }, [engine, updateStats]);

  const handleMove = useCallback((move: Move) => {
    const newGame = new Chess(game.fen());
    
    try {
      newGame.move(move);
      setGame(newGame);
      
      setMoveHistory(prev => [...prev, move.san]);
      
      if (newGame.isCheckmate()) {
        setGameStatus('Checkmate! You win! 🎉');
        updateStats('win');
        return;
      }
      
      if (newGame.isStalemate()) {
        setGameStatus('Stalemate - Draw');
        updateStats('draw');
        return;
      }
      
      if (newGame.isDraw()) {
        setGameStatus('Draw!');
        updateStats('draw');
        return;
      }
      
      if (newGame.isCheck()) {
        setGameStatus('Check!');
      } else {
        setGameStatus('AI thinking...');
      }
      
      setTimeout(() => makeAIMove(newGame), 500);
    } catch (e) {
      console.error('Invalid move', e);
    }
  }, [game, makeAIMove, updateStats]);

  const startNewGame = () => {
    setGame(createNewGame());
    setSelectedSquare(null);
    setMoveHistory([]);
    setGameStatus('Your turn!');
  };

  const completeLesson = (lessonId: string) => {
    if (!completedLessons.includes(lessonId)) {
      setCompletedLessons([...completedLessons, lessonId]);
      setStats(prev => ({
        ...prev,
        lessonsCompleted: prev.lessonsCompleted + 1,
        currentElo: prev.currentElo + 10
      }));
    }
  };

  const checkPuzzleAnswer = (answer: string) => {
    const filteredPuzzles = getPuzzlesByRating(puzzleRatingFilter[0], puzzleRatingFilter[1]);
    const puzzle = filteredPuzzles[currentPuzzleIndex];
    if (!puzzle) return;
    
    if (puzzle.solution.toLowerCase() === answer.toLowerCase()) {
      setPuzzleResult('correct');
      setStats(prev => ({
        ...prev,
        puzzlesSolved: prev.puzzlesSolved + 1,
        currentElo: prev.currentElo + 2
      }));
    } else {
      setPuzzleResult('incorrect');
    }
  };

  const nextPuzzle = () => {
    const filteredPuzzles = getPuzzlesByRating(puzzleRatingFilter[0], puzzleRatingFilter[1]);
    setCurrentPuzzleIndex(prev => (prev + 1) % filteredPuzzles.length);
    setPuzzleResult(null);
  };

  const filteredPuzzles = useMemo(() => 
    getPuzzlesByRating(puzzleRatingFilter[0], puzzleRatingFilter[1]), 
    [puzzleRatingFilter]
  );
  const currentPuzzle = filteredPuzzles[currentPuzzleIndex];

  // Render Play Tab
  const renderPlayTab = () => (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 flex flex-col items-center">
        <div className="bg-white p-4 rounded-xl shadow-lg">
          <ChessBoard game={game} onMove={handleMove} orientation={orientation}
            selectedSquare={selectedSquare} onSquareClick={setSelectedSquare} />
        </div>
        
        <div className="mt-4 flex flex-wrap gap-3 justify-center">
          <button onClick={startNewGame} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold">New Game</button>
          <button onClick={() => setOrientation(o => o === 'white' ? 'black' : 'white')} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold">Flip Board</button>
        </div>

        <div className={`mt-4 px-6 py-3 rounded-lg font-bold text-lg ${
          gameStatus.includes('win') ? 'bg-green-100 text-green-800' :
          gameStatus.includes('Checkmate') || gameStatus.includes('wins') ? 'bg-red-100 text-red-800' :
          gameStatus.includes('Check') ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
        }`}>{gameStatus}</div>
      </div>

      <div className="space-y-4">
        <div className="bg-white p-4 rounded-xl shadow-lg">
          <h3 className="font-bold text-lg mb-3">AI Difficulty</h3>
          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty)} className="w-full p-2 border rounded-lg">
            <option value="beginner">Beginner (800-1000)</option>
            <option value="easy">Easy (1000-1200)</option>
            <option value="intermediate">Intermediate (1200-1400)</option>
            <option value="advanced">Advanced (1400-1600)</option>
            <option value="expert">Expert (1600-1800)</option>
            <option value="master">Master (1800-2000)</option>
            <option value="grandmaster">Grandmaster (2000-2200)</option>
            <option value="elite">Elite (2200+)</option>
          </select>
          <p className="text-sm text-gray-500 mt-2">ELO Range: {getEloRange(difficulty).min} - {getEloRange(difficulty).max}</p>
        </div>

        <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4 rounded-xl shadow-lg text-white">
          <h3 className="font-bold text-lg">Your ELO</h3>
          <p className="text-4xl font-bold">{stats.currentElo}</p>
          <p className="text-sm opacity-90">Goal: 2000 ELO</p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-lg max-h-64 overflow-y-auto">
          <h3 className="font-bold text-lg mb-2">Move History</h3>
          <div className="font-mono text-sm space-y-1">{moveHistory.map((move, i) => (
            <span key={i} className="inline-block mr-2">{Math.floor(i / 2) + 1}{i % 2 === 0 ? '.' : '...'} {move}</span>
          ))}</div>
        </div>
      </div>
    </div>
  );

  // Render Lessons Tab
  const renderLessonsTab = () => (
    <div className="space-y-6">
      {!currentLesson ? (
        <>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Chess Lessons Library</h2>
            <p className="text-gray-600 mt-2">Complete all lessons to reach 2000+ ELO!</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CHESS_LESSONS.map(lesson => (
              <div key={lesson.id} className={`bg-white rounded-xl shadow-lg overflow-hidden ${completedLessons.includes(lesson.id) ? 'ring-2 ring-green-400' : ''}`}>
                <div className={`p-4 ${lesson.level === 'beginner' ? 'bg-green-500' : lesson.level === 'intermediate' ? 'bg-blue-500' : lesson.level === 'advanced' ? 'bg-orange-500' : 'bg-purple-500'} text-white`}>
                  <span className="font-bold capitalize">{lesson.level}</span>
                  <span className="float-right">{lesson.duration} min</span>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2">{lesson.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{lesson.description}</p>
                  <button onClick={() => setCurrentLesson(lesson)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-semibold">
                    {completedLessons.includes(lesson.id) ? 'Review' : 'Start'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="max-w-4xl mx-auto">
          <button onClick={() => setCurrentLesson(null)} className="mb-4 text-indigo-600 hover:text-indigo-800 font-semibold">← Back to Lessons</button>
          
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className={`p-6 ${currentLesson.level === 'beginner' ? 'bg-green-500' : currentLesson.level === 'intermediate' ? 'bg-blue-500' : currentLesson.level === 'advanced' ? 'bg-orange-500' : 'bg-purple-500'} text-white`}>
              <h2 className="text-2xl font-bold">{currentLesson.title}</h2>
              <p className="opacity-90 mt-1">{currentLesson.description}</p>
            </div>
            <div className="p-6 space-y-6">
              {currentLesson.content.map((section, idx) => (
                <div key={idx} className={`p-4 rounded-lg ${section.type === 'tip' ? 'bg-green-50 border-l-4 border-green-500' : section.type === 'warning' ? 'bg-red-50 border-l-4 border-red-500' : section.type === 'diagram' ? 'bg-amber-50 border-l-4 border-amber-500' : 'bg-gray-50'}`}>
                  {section.type === 'diagram' && section.fen && (
                    <div className="mb-3"><ChessBoard game={new Chess(section.fen)} isPlayable={false} /></div>
                  )}
                  <p className="whitespace-pre-line">{section.content}</p>
                </div>
              ))}
              <button onClick={() => { completeLesson(currentLesson.id); alert('✅ Lesson completed! +10 ELO points'); }} disabled={completedLessons.includes(currentLesson.id)}
                className={`w-full py-3 rounded-lg font-bold text-lg ${completedLessons.includes(currentLesson.id) ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-green-500 text-white hover:bg-green-600'}`}>
                {completedLessons.includes(currentLesson.id) ? '✅ Completed' : 'Mark as Complete (+10 ELO)'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Simplified tabs for other sections
  const renderGambitsTab = () => (
    <div className="space-y-6">
      <div className="text-center mb-8"><h2 className="text-3xl font-bold text-gray-800">Gambit Academy</h2><p className="text-gray-600 mt-2">Master aggressive openings!</p></div>
      <div className="grid md:grid-cols-2 gap-6">
        {GAMBIT_LESSONS.map(gambit => (
          <div key={gambit.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-orange-500 p-4 text-white">
              <h3 className="text-xl font-bold">{gambit.title}</h3>
              <p className="opacity-90 text-sm mt-1">{gambit.description}</p>
            </div>
            {gambit.practiceFEN && <div className="flex justify-center p-4"><ChessBoard game={new Chess(gambit.practiceFEN)} isPlayable={false} /></div>}
            <button onClick={() => { setCurrentLesson(gambit); setActiveTab('lessons'); }} className="m-4 w-full py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-semibold">Study This Gambit</button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTacticsTab = () => (
    <div className="space-y-6">
      <div className="text-center mb-8"><h2 className="text-3xl font-bold text-gray-800">Tactics Trainer</h2></div>
      <div className="bg-white p-4 rounded-xl shadow-lg mb-6">
        <label className="block font-semibold mb-2">Puzzle Rating Range:</label>
        <div className="flex items-center gap-4">
          <input type="range" min="800" max="2500" step="100" value={puzzleRatingFilter[0]} onChange={(e) => setPuzzleRatingFilter([parseInt(e.target.value), puzzleRatingFilter[1]])} className="flex-1" />
          <span className="font-mono bg-gray-100 px-3 py-1 rounded">{puzzleRatingFilter[0]}</span>
          <input type="range" min="800" max="2500" step="100" value={puzzleRatingFilter[1]} onChange={(e) => setPuzzleRatingFilter([puzzleRatingFilter[0], parseInt(e.target.value)])} className="flex-1" />
          <span className="font-mono bg-gray-100 px-3 py-1 rounded">{puzzleRatingFilter[1]}</span>
        </div>
      </div>
      {currentPuzzle && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-lg"><div className="flex justify-center mb-4"><ChessBoard game={new Chess(currentPuzzle.fen)} isPlayable={false} /></div>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${currentPuzzle.rating < 1000 ? 'bg-green-100 text-green-800' : currentPuzzle.rating < 1400 ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>Rating: {currentPuzzle.rating} • {currentPuzzle.theme}</span>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="font-bold text-xl mb-4">Find the Best Move!</h3>
            <input type="text" id="puzzle-answer" placeholder="e.g., Qxf7#" onKeyDown={(e) => e.key === 'Enter' && checkPuzzleAnswer((e.target as HTMLInputElement).value)} className="w-full p-3 border-2 rounded-lg font-mono text-lg focus:border-indigo-500 outline-none" />
            <button onClick={() => { const input = document.getElementById('puzzle-answer') as HTMLInputElement; checkPuzzleAnswer(input.value); }} className="w-full py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition mt-4">Submit Answer</button>
            {puzzleResult && (<div className={`mt-4 p-4 rounded-lg ${puzzleResult === 'correct' ? 'bg-green-100' : 'bg-red-100'}`}><p className={`font-bold ${puzzleResult === 'correct' ? 'text-green-800' : 'text-red-800'}`}>{puzzleResult === 'correct' ? '✅ Correct!' : '❌ Incorrect'}</p><p className="text-sm mt-1">{currentPuzzle.explanation}</p><p className="font-mono mt-2 font-semibold">Solution: {currentPuzzle.solution}</p></div>)}
            <div className="mt-6 pt-4 border-t flex justify-between items-center"><span className="text-sm text-gray-500">Puzzle {currentPuzzleIndex + 1} of {filteredPuzzles.length}</span><button onClick={nextPuzzle} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition font-semibold">Next Puzzle →</button></div>
          </div>
        </div>
      )}
    </div>
  );

  const renderOpeningsTab = () => (
    <div className="space-y-6">
      <div className="text-center mb-8"><h2 className="text-3xl font-bold text-gray-800">Opening Theory</h2></div>
      <div className="grid md:grid-cols-2 gap-6">
        {OPENING_THEORY.map(opening => (
          <div key={opening.name} className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-4 text-white">
              <h3 className="text-xl font-bold">{opening.name}</h3>
              <p className="font-mono text-sm opacity-90 mt-1">{opening.moves}</p>
            </div>
            <div className="p-4"><div className="flex justify-center mb-4"><ChessBoard game={new Chess(opening.fen)} isPlayable={false} /></div>
              <p className="text-gray-600 text-sm mb-4">{opening.description}</p>
              <ul className="text-sm space-y-1 mb-4">{opening.ideas.map((idea, i) => <li key={i} className="flex items-start gap-2"><span className="text-indigo-500">•</span>{idea}</li>)}</ul>
              <span className={`inline-block px-2 py-1 rounded text-xs font-semibold capitalize ${opening.difficulty === 'beginner' ? 'bg-green-100 text-green-800' : opening.difficulty === 'intermediate' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'}`}>{opening.difficulty}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderEndgameTab = () => (
    <div className="space-y-6">
      <div className="text-center mb-8"><h2 className="text-3xl font-bold text-gray-800">Endgame Laboratory</h2></div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { name: 'King & Queen vs King', fen: '4k3/8/8/8/8/8/4Q3/4K3 w - - 0 1', tip: 'Use your King to help deliver checkmate!' },
          { name: 'King & Rook vs King', fen: '4k3/8/8/8/8/8/4R3/4K3 w - - 0 1', tip: 'Cut off the King and push to edge!' },
          { name: 'Opposition', fen: '8/8/8/3k4/8/3K4/8/8 w - - 0 1', tip: 'Whoever moves loses opposition!' },
          { name: 'Lucena Position', fen: '2K5/4RPP/8/8/8/8/8/k6 w - - 0 1', tip: 'Build a bridge with your Rook!' },
          { name: 'Pawn Race', fen: '8/8/8/8/8/P7/8/4K2Pk w - - 0 1', tip: 'Calculate who queens first!' },
          { name: 'Two Bishops vs King', fen: '4k3/8/8/8/8/8/4B1BB/4K3 w - - 0 1', tip: 'Use both bishops to cut off escape squares!' },
          { name: 'Zugzwang', fen: '8/8/8/3k4/8/3K4/8/8 b - - 0 1', tip: 'Black to move - any move loses!' }
        ].map((position, idx) => (
          <div key={idx} className="bg-white p-4 rounded-xl shadow-lg">
            <h3 className="font-bold text-lg mb-2">{position.name}</h3>
            <div className="flex justify-center mb-3"><ChessBoard game={new Chess(position.fen)} isPlayable={false} /></div>
            <p className="text-sm text-indigo-600 italic">💡 {position.tip}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderProgressTab = () => (
    <div className="space-y-6">
      <div className="text-center mb-8"><h2 className="text-3xl font-bold text-gray-800">Your Progress Dashboard</h2></div>
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-8 rounded-2xl shadow-xl text-white">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div><p className="text-5xl font-bold">{stats.currentElo}</p><p className="opacity-90">Current ELO</p></div>
          <div><p className="text-5xl font-bold">{stats.gamesPlayed}</p><p className="opacity-90">Games Played</p></div>
          <div><p className="text-5xl font-bold">{stats.puzzlesSolved}</p><p className="opacity-90">Puzzles Solved</p></div>
          <div><p className="text-5xl font-bold">{stats.lessonsCompleted}</p><p className="opacity-90">Lessons Done</p></div>
        </div>
        <div className="mt-8"><div className="flex justify-between text-sm mb-2"><span>Progress to 2000 ELO Goal</span><span>{Math.round((stats.currentElo / 2000) * 100)}%</span></div>
          <div className="bg-white/20 rounded-full h-4"><div className="bg-white h-4 rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, (stats.currentElo / 2000) * 100)}%` }} /></div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-lg"><h3 className="font-bold text-xl mb-4">ELO Milestones</h3>
        {[{ elo: 1200, title: 'Club Player' }, { elo: 1400, title: 'Intermediate' }, { elo: 1600, title: 'Advanced' }, { elo: 1800, title: 'Expert' }, { elo: 2000, title: 'Candidate Master' }, { elo: 2200, title: 'National Master' }].map(milestone => (
          <div key={milestone.elo} className={`flex items-center gap-4 p-4 rounded-lg ${stats.currentElo >= milestone.elo ? 'bg-green-50 border-2 border-green-200' : 'bg-gray-50'}`}>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${stats.currentElo >= milestone.elo ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>{stats.currentElo >= milestone.elo ? '✓' : '○'}</div>
            <div className="flex-1"><p className="font-bold">{milestone.title} ({milestone.elo})</p>{stats.currentElo >= milestone.elo && <span className="text-green-600 font-bold">ACHIEVED! 🎉</span>}</div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <header className="bg-black/30 backdrop-blur-md sticky top-0 z-50 border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3"><span className="text-4xl">♔</span><div><h1 className="text-2xl font-bold text-white">Chess Master Academy</h1><p className="text-purple-300 text-sm">Your Path to 2000 ELO</p></div></div>
            <div className="hidden md:flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full"><span className="text-yellow-400">⭐</span><span className="text-white font-bold">{stats.currentElo}</span><span className="text-purple-300 text-sm">ELO</span></div>
          </div>
        </div>
      </header>

      <nav className="bg-black/20 backdrop-blur-md border-b border-white/10 sticky top-[72px] z-40">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto gap-1 py-2 scrollbar-hide">
            {[
              { id: 'play', label: '♟️ Play' }, { id: 'lessons', label: '📚 Lessons' }, { id: 'gambits', label: '⚔️ Gambits' },
              { id: 'tactics', label: '🧩 Tactics' }, { id: 'openings', label: '📖 Openings' }, { id: 'endgame', label: '🏁 Endgame' }, { id: 'progress', label: '📊 Progress' }
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as TabType)} className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition ${activeTab === tab.id ? 'bg-white text-gray-900' : 'text-white/70 hover:text-white hover:bg-white/10'}`}>{tab.label}</button>
            ))}
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        {activeTab === 'play' && renderPlayTab()}
        {activeTab === 'lessons' && renderLessonsTab()}
        {activeTab === 'gambits' && renderGambitsTab()}
        {activeTab === 'tactics' && renderTacticsTab()}
        {activeTab === 'openings' && renderOpeningsTab()}
        {activeTab === 'endgame' && renderEndgameTab()}
        {activeTab === 'progress' && renderProgressTab()}
      </main>

      <footer className="bg-black/30 backdrop-blur-md border-t border-white/10 mt-12 py-8">
        <div className="container mx-auto px-4 text-center text-white/60">
          <p className="mb-2">♔ Chess Master Academy - Free Chess Education for Everyone</p>
          <p className="text-sm">Dedicated to helping you reach 2000 ELO and beyond!</p>
        </div>
      </footer>
    </div>
  );
}
