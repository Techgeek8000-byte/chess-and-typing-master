'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Chess, Move } from 'chess.js';

export type Square = string;
export type PieceSymbol = 'p' | 'n' | 'b' | 'r' | 'q' | 'k' | 'P' | 'N' | 'B' | 'R' | 'Q' | 'K';
export type PieceColor = 'w' | 'b';

export interface BoardState {
  position: string;
  turn: PieceColor;
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  isDraw: boolean;
  moveHistory: Move[];
  capturedPieces: { white: PieceSymbol[]; black: PieceSymbol[] };
  lastMove?: { from: string; to: string };
}

interface ChessBoardProps {
  game: Chess;
  onMove?: (move: Move) => void;
  orientation?: 'white' | 'black';
  showCoordinates?: boolean;
  highlightLastMove?: boolean;
  highlightLegalMoves?: boolean;
  selectedSquare?: Square | null;
  onSquareClick?: (square: Square) => void;
  isPlayable?: boolean;
  showEvaluation?: boolean;
  evaluation?: number;
}

const PIECE_SYMBOLS: Record<PieceSymbol, string> = {
  'p': '♟', 'n': '♞', 'b': '♝', 'r': '♜', 'q': '♛', 'k': '♚',
  'P': '♙', 'N': '♘', 'B': '♗', 'R': '♖', 'Q': '♕', 'K': '♔'
};

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

function getPieceColor(piece: PieceSymbol): PieceColor {
  return piece === piece.toUpperCase() ? 'w' : 'b';
}

function isLightSquare(square: Square): boolean {
  const file = square.charCodeAt(0) - 97;
  const rank = parseInt(square[1]) - 1;
  return (file + rank) % 2 === 0;
}

export function getSquareColor(fileIdx: number, rankIdx: number): 'light' | 'dark' {
  return (fileIdx + rankIdx) % 2 === 0 ? 'light' : 'dark';
}

export default function ChessBoard({
  game,
  onMove,
  orientation = 'white',
  showCoordinates = true,
  highlightLastMove = true,
  highlightLegalMoves = true,
  selectedSquare,
  onSquareClick,
  isPlayable = true,
  evaluation
}: ChessBoardProps) {
  const [hoveredSquare, setHoveredSquare] = useState<Square | null>(null);

  const legalMoves = useMemo(() => {
    if (!selectedSquare || !isPlayable) return [];
    try {
      return game.moves({ 
        square: selectedSquare, 
        verbose: true 
      }).map(m => m.to);
    } catch {
      return [];
    }
  }, [selectedSquare, game, isPlayable]);

  const handleSquareClick = useCallback((square: Square) => {
    if (!isPlayable || !onSquareClick) return;
    
    const piece = game.get(square);
    
    if (selectedSquare) {
      if (legalMoves.includes(square)) {
        try {
          const move = game.move({
            from: selectedSquare,
            to: square,
            promotion: 'q'
          });
          if (move && onMove) {
            onMove(move);
          }
        } catch (e) {
          // Invalid move
        }
        onSquareClick(null);
      } else if (piece && piece.color === game.turn()) {
        onSquareClick(square);
      } else {
        onSquareClick(null);
      }
    } else if (piece && piece.color === game.turn()) {
      onSquareClick(square);
    }
  }, [selectedSquare, legalMoves, game, onMove, onSquareClick, isPlayable]);

  const board = useMemo(() => {
    const squares: { square: Square; piece: PieceSymbol | null }[] = [];
    for (let r = 0; r < 8; r++) {
      for (let f = 0; f < 8; f++) {
        const file = FILES[f];
        const rank = RANKS[r];
        const square = `${file}${rank}` as Square;
        const pieceInfo = game.get(square);
        const piece = pieceInfo?.type 
          ? ((pieceInfo.color === 'w' ? pieceInfo.type.toUpperCase() : pieceInfo.type.toLowerCase()) as PieceSymbol)
          : null;
        squares.push({ square, piece });
      }
    }
    return squares;
  }, [game]);

  const history = game.history({ verbose: true });
  const lastMove = history.length > 0 
    ? { from: history[history.length - 1].from, to: history[history.length - 1].to }
    : undefined;

  const renderBoard = () => {
    const displayRanks = orientation === 'white' ? [...RANKS].reverse() : RANKS;
    const displayFiles = orientation === 'white' ? FILES : [...FILES].reverse();

    return (
      <div className="relative inline-block">
        <div className="grid grid-cols-8 border-4 border-amber-900 rounded-lg overflow-hidden shadow-2xl">
          {displayRanks.map((rank, rankIdx) =>
            displayFiles.map((file, fileIdx) => {
              const square = `${file}${rank}` as Square;
              const actualRankIdx = orientation === 'white' ? 7 - rankIdx : rankIdx;
              const actualFileIdx = orientation === 'white' ? fileIdx : 7 - fileIdx;
              const squareData = board.find(s => s.square === square);
              const piece = squareData?.piece || null;
              const isLight = getSquareColor(actualFileIdx, actualRankIdx) === 'light';
              
              const isSelected = selectedSquare === square;
              const isLastMoveFrom = lastMove?.from === square;
              const isLastMoveTo = lastMove?.to === square;
              const isLegalMove = hoveredSquare === selectedSquare || selectedSquare === square
                ? legalMoves.includes(square)
                : false;
              const isHovered = hoveredSquare === square;
              const isInCheck = game.isCheck() && 
                ((game.turn() === 'w' && piece === 'K') || (game.turn() === 'b' && piece === 'k'));

              let bgColor = isLight ? 'bg-amber-100' : 'bg-amber-700';
              
              if (isSelected) {
                bgColor = 'bg-yellow-400';
              } else if (isLastMoveFrom || isLastMoveTo) {
                bgColor = isLight ? 'bg-yellow-200' : 'bg-yellow-500';
              } else if (isInCheck) {
                bgColor = 'bg-red-500';
              }

              return (
                <div
                  key={square}
                  className={`relative w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 flex items-center justify-center cursor-pointer transition-colors duration-150 ${bgColor} ${
                    isHovered && isPlayable ? 'opacity-80' : ''
                  }`}
                  onClick={() => handleSquareClick(square)}
                  onMouseEnter={() => setHoveredSquare(square)}
                  onMouseLeave={() => setHoveredSquare(null)}
                >
                  {/* Legal move indicator */}
                  {isLegalMove && piece && (
                    <div className="absolute inset-0 border-4 border-yellow-300 rounded-sm opacity-70" />
                  )}
                  {isLegalMove && !piece && (
                    <div className="absolute w-3 h-3 sm:w-4 sm:h-4 bg-black/20 rounded-full" />
                  )}
                  
                  {/* Selected indicator */}
                  {isSelected && !piece && (
                    <div className="absolute w-6 h-6 sm:w-8 sm:h-8 border-4 border-yellow-600 rounded-sm opacity-50" />
                  )}

                  {/* Piece */}
                  {piece && (
                    <span
                      className={`text-3xl sm:text-4xl md:text-5xl select-none transition-transform hover:scale-110 ${
                        getPieceColor(piece) === 'w' ? 'text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]' : 'text-gray-900 drop-shadow-[0_1px_1px_rgba(255,255,255,0.3)]'
                      } ${isSelected ? 'scale-110' : ''}`}
                    >
                      {PIECE_SYMBOLS[piece]}
                    </span>
                  )}

                  {/* Coordinates */}
                  {showCoordinates && (
                    <>
                      {fileIdx === 0 && (
                        <span className={`absolute top-0.5 left-0.5 text-xs font-bold ${
                          isLight ? 'text-amber-800' : 'text-amber-200'
                        }`}>
                          {rank}
                        </span>
                      )}
                      {rankIdx === displayRanks.length - 1 && (
                        <span className={`absolute bottom-0 right-1 text-xs font-bold ${
                          isLight ? 'text-amber-800' : 'text-amber-200'
                        }`}>
                          {file}
                        </span>
                      )}
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Evaluation bar */}
        {evaluation !== undefined && showEvaluation && (
          <div className="absolute -left-6 top-0 bottom-0 w-3 bg-gray-200 rounded-l-full overflow-hidden">
            <div 
              className="absolute bottom-0 w-full bg-green-500 transition-all duration-300"
              style={{ height: `${50 + evaluation * 5}%` }}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="inline-block">
      {renderBoard()}
    </div>
  );
}

// Utility functions
export function createNewGame(): Chess {
  return new Chess();
}

export function loadGameFromFEN(fen: string): Chess {
  return new Chess(fen);
}

export function getBoardState(game: Chess): BoardState {
  const history = game.history({ verbose: true });
  const capturedPieces: { white: PieceSymbol[]; black: PieceSymbol[] } = { white: [], black: [] };
  
  history.forEach(move => {
    if (move.captured) {
      const capturedPiece = move.color === 'w' 
        ? move.captured.toLowerCase() as PieceSymbol
        : move.captured.toUpperCase() as PieceSymbol;
      
      if (move.color === 'w') {
        capturedPieces.black.push(capturedPiece);
      } else {
        capturedPieces.white.push(capturedPiece);
      }
    }
  });

  const lastMove = history.length > 0 
    ? { from: history[history.length - 1].from, to: history[history.length - 1].to }
    : undefined;

  return {
    position: game.fen(),
    turn: game.turn(),
    isCheck: game.isCheck(),
    isCheckmate: game.isCheckmate(),
    isStalemate: game.isStalemate(),
    isDraw: game.isDraw(),
    moveHistory: history,
    capturedPieces,
    lastMove
  };
}
