"use client";

import type React from "react";

import { useState, useEffect, useCallback, useRef } from "react";
import styled from "styled-components";
import {
  RefreshCw,
  Info,
  Trophy,
  Volume2,
  VolumeX,
  Play,
  Pause,
  FastForward,
  SkipForward,
  Undo2,
  Redo2,
} from "lucide-react";
import Tower from "./tower";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";
import { isMobile } from "@/hooks/use-mobile";
import CustomModal from "./custom-modal";
import HowToPlay from "./how-to-play";
import Fireworks from "./fireworks";
import { Button } from "@/components/ui/button";
import { useSounds } from "@/hooks/use-sounds";
import { Slider } from "@/components/ui/slider";
import { ThemeToggle } from "./theme-toggle";

// Game container
const GameContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 800px;
  gap: 2rem;
  position: relative;
`;

// Towers container
const TowersContainer = styled.div`
  display: flex;
  justify-content: space-around;
  width: 100%;
  gap: 1rem;

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: center;
  }
`;

// Game title
const GameTitle = styled.h1`
  font-size: 2.5rem;
  color: hsl(var(--game-title));
  margin-bottom: 1rem;
  text-align: center;
`;

// Controls container
const ControlsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 400px;
`;

// Header controls container
const HeaderControls = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  gap: 0.5rem;
`;

// Game panel
const GamePanel = styled.div`
  background-color: hsl(var(--game-panel-bg));
  border-radius: 0.5rem;
  padding: 1.5rem;
  width: 100%;
  box-shadow: 0 4px 6px -1px hsl(var(--game-panel-shadow)),
    0 2px 4px -1px hsl(var(--game-panel-shadow));
`;

// Stats container
const StatsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

// Stat text
const StatText = styled.div`
  font-size: 1.125rem;
  font-weight: 600;
  color: hsl(var(--foreground));
`;

// Slider container
const SliderContainer = styled.div`
  width: 100%;
  margin-bottom: 0.5rem;
`;

// Slider label
const SliderLabel = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: hsl(var(--foreground));
`;

// Custom range slider
const CustomSlider = styled.input`
  width: 100%;
  height: 8px;
  background: hsl(var(--muted));
  border-radius: 4px;
  outline: none;
  -webkit-appearance: none;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 20px;
    height: 20px;
    background: hsl(var(--primary));
    border-radius: 50%;
    cursor: pointer;
  }

  &::-moz-range-thumb {
    width: 20px;
    height: 20px;
    background: hsl(var(--primary));
    border-radius: 50%;
    cursor: pointer;
    border: none;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Success notification
const SuccessNotification = styled.div`
  position: fixed;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  background-color: hsl(var(--success-bg));
  color: hsl(var(--success-text));
  padding: 1rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  z-index: 50;
  max-width: 90%;
`;

// Auto-solver controls
const AutoSolverControls = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  padding: 1rem;
  background-color: hsl(var(--auto-solver-bg));
  border-radius: 0.5rem;
  border: 1px solid hsl(var(--auto-solver-border));
`;

// Auto-solver buttons
const AutoSolverButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: space-between;
`;

// Auto-solver speed control
const SpeedControl = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

// Speed label
const SpeedLabel = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

// Game controls
const GameControls = styled.div`
  display: flex;
  gap: 0.5rem;
  width: 100%;
`;

// Move type for the solver
interface Move {
  from: number;
  to: number;
}

// History state type
interface GameState {
  towers: number[][];
  moves: number;
}

export default function TowerOfHanoi() {
  // Number of disks (3-7)
  const [diskCount, setDiskCount] = useState(3);
  // Towers state (array of arrays, each containing disk sizes)
  const [towers, setTowers] = useState<number[][]>([]);
  // Move counter
  const [moves, setMoves] = useState(0);
  // Timer
  const [time, setTime] = useState(0);
  // Game active state
  const [isActive, setIsActive] = useState(false);
  // Success message
  const [showSuccess, setShowSuccess] = useState(false);
  // How to play dialog
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  // Show fireworks
  const [showFireworks, setShowFireworks] = useState(false);
  // Sound state
  const [isMuted, setIsMuted] = useState(false);
  // Auto-solver state
  const [isSolving, setIsSolving] = useState(false);
  // Auto-solver speed (moves per second)
  const [solverSpeed, setSolverSpeed] = useState(2);
  // Solution moves
  const [solutionMoves, setSolutionMoves] = useState<Move[]>([]);
  // Current move index in solution
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  // History of game states
  const [history, setHistory] = useState<GameState[]>([]);
  // Current position in history
  const [historyIndex, setHistoryIndex] = useState(-1);
  // Auto-solver interval ref
  const solverIntervalRef = useRef<NodeJS.Timeout | null>(null);
  // Check if mobile
  const mobile = isMobile();
  // Sound effects
  const { playSound } = useSounds();

  // Play sound with mute check
  const playSoundIfEnabled = useCallback(
    (soundType: "move" | "error" | "victory") => {
      if (!isMuted) {
        playSound(soundType);
      }
    },
    [isMuted, playSound]
  );

  // Initialize the game
  useEffect(() => {
    resetGame();
  }, [diskCount]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive]);

  // Check win condition
  useEffect(() => {
    if (towers.length === 0) return;

    // Win condition: all disks are in the last tower
    if (
      towers[2].length === diskCount &&
      towers[0].length === 0 &&
      towers[1].length === 0
    ) {
      setIsActive(false);
      setShowSuccess(true);
      setShowFireworks(true);
      stopAutoSolver();

      // Play victory sound if not muted
      playSoundIfEnabled("victory");

      // Hide success message after 6 seconds
      const successTimer = setTimeout(() => {
        setShowSuccess(false);
      }, 6000);

      // Hide fireworks after 8 seconds
      const fireworksTimer = setTimeout(() => {
        setShowFireworks(false);
      }, 8000);

      return () => {
        clearTimeout(successTimer);
        clearTimeout(fireworksTimer);
      };
    }
  }, [towers, diskCount, playSoundIfEnabled]);

  // Auto-solver effect
  useEffect(() => {
    if (
      isSolving &&
      solutionMoves.length > 0 &&
      currentMoveIndex < solutionMoves.length
    ) {
      // Calculate delay based on speed (moves per second)
      const delay = 1000 / solverSpeed;

      // Set up interval for auto-solving
      solverIntervalRef.current = setInterval(() => {
        if (currentMoveIndex < solutionMoves.length) {
          const move = solutionMoves[currentMoveIndex];
          executeMove(move.from, move.to);
          setCurrentMoveIndex((prev) => prev + 1);
        } else {
          stopAutoSolver();
        }
      }, delay);
    }

    return () => {
      if (solverIntervalRef.current) {
        clearInterval(solverIntervalRef.current);
        solverIntervalRef.current = null;
      }
    };
  }, [isSolving, solutionMoves, currentMoveIndex, solverSpeed]);

  // Reset the game
  const resetGame = () => {
    // Create initial tower state with all disks on the first tower
    const initialTowers: number[][] = [
      // First tower has all disks in descending order (largest at bottom)
      Array.from({ length: diskCount }, (_, i) => diskCount - i),
      // Other towers are empty
      [],
      [],
    ];

    setTowers(initialTowers);
    setMoves(0);
    setTime(0);
    setIsActive(false);
    setShowSuccess(false);
    setShowFireworks(false);
    stopAutoSolver();
    setSolutionMoves([]);
    setCurrentMoveIndex(0);

    // Reset history
    const initialState: GameState = { towers: initialTowers, moves: 0 };
    setHistory([initialState]);
    setHistoryIndex(0);
  };

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Add current state to history
  const addToHistory = (newTowers: number[][], newMoves: number) => {
    // If we're not at the end of history, truncate the future history
    const newHistory = history.slice(0, historyIndex + 1);

    // Add the new state
    newHistory.push({ towers: newTowers, moves: newMoves });

    // Update history and history index
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Execute a move
  const executeMove = (fromTower: number, toTower: number) => {
    // Start the game on first move if not already active
    if (!isActive && moves === 0) {
      setIsActive(true);
    }

    // Try to move disk from source tower to target tower
    const sourceDisks = [...towers[fromTower]];
    const targetDisks = [...towers[toTower]];

    // Check if source tower has disks
    if (sourceDisks.length === 0) return false;

    // Get the top disk from the source tower
    const diskToMove = sourceDisks[sourceDisks.length - 1];

    // Check if move is valid (can only place smaller disk on larger disk)
    const isValidMove =
      targetDisks.length === 0 ||
      diskToMove < targetDisks[targetDisks.length - 1];

    if (isValidMove) {
      // Remove disk from source tower
      sourceDisks.pop();
      // Add disk to target tower
      targetDisks.push(diskToMove);

      // Create new towers state
      const newTowers = [...towers];
      newTowers[fromTower] = sourceDisks;
      newTowers[toTower] = targetDisks;

      // Update towers state and move counter
      const newMoves = moves + 1;
      setTowers(newTowers);
      setMoves(newMoves);

      // Add to history (unless we're auto-solving)
      if (!isSolving) {
        addToHistory(newTowers, newMoves);
      }

      // Play move sound if not muted
      playSoundIfEnabled("move");

      return true;
    }

    return false;
  };

  // Handle disk move (for user interaction)
  const handleDiskMove = (fromTower: number, toTower: number) => {
    // Prevent user moves during auto-solving
    if (isSolving) return false;

    // Execute the move
    const result = executeMove(fromTower, toTower);

    // Play error sound if move is invalid
    if (!result) {
      playSoundIfEnabled("error");
    }

    return result;
  };

  // Handle disk count change
  const handleDiskCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDiskCount(Number(e.target.value));
  };

  // Toggle mute/unmute
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  // Generate solution moves using recursive Tower of Hanoi algorithm
  const generateSolution = () => {
    const moves: Move[] = [];

    // Recursive function to solve Tower of Hanoi
    const solveTowerOfHanoi = (
      n: number,
      source: number,
      auxiliary: number,
      target: number
    ) => {
      if (n === 1) {
        // Move disk 1 from source to target
        moves.push({ from: source, to: target });
        return;
      }

      // Move n-1 disks from source to auxiliary using target as auxiliary
      solveTowerOfHanoi(n - 1, source, target, auxiliary);

      // Move nth disk from source to target
      moves.push({ from: source, to: target });

      // Move n-1 disks from auxiliary to target using source as auxiliary
      solveTowerOfHanoi(n - 1, auxiliary, source, target);
    };

    // Start solving from the current state
    // If the game is in progress, we need to solve from the current state
    // For simplicity, we'll just solve from the beginning
    solveTowerOfHanoi(diskCount, 0, 1, 2);

    return moves;
  };

  // Start auto-solver
  const startAutoSolver = () => {
    // Generate solution if not already generated
    if (
      solutionMoves.length === 0 ||
      currentMoveIndex >= solutionMoves.length
    ) {
      // Reset the game first to ensure we start from a clean state
      resetGame();

      // Generate solution
      const solution = generateSolution();
      setSolutionMoves(solution);
      setCurrentMoveIndex(0);
    }

    // Start solving
    setIsSolving(true);
    setIsActive(true);
  };

  // Pause auto-solver
  const pauseAutoSolver = () => {
    setIsSolving(false);
  };

  // Resume auto-solver
  const resumeAutoSolver = () => {
    setIsSolving(true);
  };

  // Stop auto-solver
  const stopAutoSolver = () => {
    setIsSolving(false);
    if (solverIntervalRef.current) {
      clearInterval(solverIntervalRef.current);
      solverIntervalRef.current = null;
    }
  };

  // Skip to end of solution
  const skipToEnd = () => {
    // Stop the auto-solver
    stopAutoSolver();

    // If we have a solution, execute all remaining moves at once
    if (solutionMoves.length > 0 && currentMoveIndex < solutionMoves.length) {
      // Create a new towers state by applying all remaining moves
      const newTowers = [...towers];
      let newMoves = moves;

      for (let i = currentMoveIndex; i < solutionMoves.length; i++) {
        const move = solutionMoves[i];
        const sourceDisks = [...newTowers[move.from]];
        const targetDisks = [...newTowers[move.to]];

        if (sourceDisks.length > 0) {
          const diskToMove = sourceDisks[sourceDisks.length - 1];
          sourceDisks.pop();
          targetDisks.push(diskToMove);

          newTowers[move.from] = sourceDisks;
          newTowers[move.to] = targetDisks;
          newMoves++;
        }
      }

      // Update towers state and move counter
      setTowers(newTowers);
      setMoves(newMoves);
      setCurrentMoveIndex(solutionMoves.length);

      // Add final state to history
      addToHistory(newTowers, newMoves);
    }
  };

  // Handle solver speed change
  const handleSpeedChange = (value: number[]) => {
    setSolverSpeed(value[0]);
  };

  // Undo move
  const undoMove = () => {
    // Can't undo if at the beginning of history or during auto-solving
    if (historyIndex <= 0 || isSolving) return;

    // Go back one step in history
    const prevState = history[historyIndex - 1];
    setTowers(prevState.towers);
    setMoves(prevState.moves);
    setHistoryIndex(historyIndex - 1);

    // Play sound
    playSoundIfEnabled("move");
  };

  // Redo move
  const redoMove = () => {
    // Can't redo if at the end of history or during auto-solving
    if (historyIndex >= history.length - 1 || isSolving) return;

    // Go forward one step in history
    const nextState = history[historyIndex + 1];
    setTowers(nextState.towers);
    setMoves(nextState.moves);
    setHistoryIndex(historyIndex + 1);

    // Play sound
    playSoundIfEnabled("move");
  };

  return (
    <DndProvider backend={mobile ? TouchBackend : HTML5Backend}>
      <GameContainer>
        <GameTitle>Tower of Hanoi</GameTitle>

        <HeaderControls>
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? (
              <VolumeX className="h-5 w-5" />
            ) : (
              <Volume2 className="h-5 w-5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowHowToPlay(true)}
            aria-label="How to play"
          >
            <Info className="h-5 w-5" />
          </Button>
        </HeaderControls>

        <GamePanel>
          <StatsContainer>
            <StatText>Moves: {moves}</StatText>
            <StatText>Time: {formatTime(time)}</StatText>
          </StatsContainer>

          <TowersContainer>
            {towers.map((disks, index) => (
              <Tower
                key={index}
                index={index}
                disks={disks}
                maxDiskSize={diskCount}
                onDiskMove={handleDiskMove}
              />
            ))}
          </TowersContainer>

          <GameControls className="mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={undoMove}
              disabled={historyIndex <= 0 || isSolving}
              className="flex-1"
            >
              <Undo2 className="mr-1 h-4 w-4" /> Undo
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={redoMove}
              disabled={historyIndex >= history.length - 1 || isSolving}
              className="flex-1"
            >
              <Redo2 className="mr-1 h-4 w-4" /> Redo
            </Button>
          </GameControls>
        </GamePanel>

        <ControlsContainer>
          <SliderContainer>
            <SliderLabel htmlFor="disk-count-slider">
              Number of Disks: {diskCount}
            </SliderLabel>
            <CustomSlider
              id="disk-count-slider"
              type="range"
              min={3}
              max={7}
              step={1}
              value={diskCount}
              onChange={handleDiskCountChange}
              disabled={isActive || moves > 0 || isSolving}
            />
          </SliderContainer>

          <Button
            variant="default"
            onClick={resetGame}
            className="w-full"
            disabled={isSolving}
          >
            <RefreshCw className="mr-2 h-4 w-4" /> Reset Game
          </Button>

          <div className="text-sm text-center mt-2 text-gray-600 dark:text-gray-400">
            Minimum moves required: {Math.pow(2, diskCount) - 1}
          </div>

          <AutoSolverControls>
            <h3 className="text-lg font-semibold mb-2">Auto Solver</h3>

            <SpeedControl>
              <SpeedLabel>
                <span>Speed: {solverSpeed}x</span>
              </SpeedLabel>
              <Slider
                value={[solverSpeed]}
                min={1}
                max={10}
                step={1}
                onValueChange={handleSpeedChange}
                disabled={isSolving}
              />
            </SpeedControl>

            <AutoSolverButtons>
              {!isSolving ? (
                <Button
                  variant="outline"
                  onClick={startAutoSolver}
                  className="flex-1"
                  disabled={isSolving}
                >
                  <Play className="mr-2 h-4 w-4" /> Solve
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={pauseAutoSolver}
                  className="flex-1"
                >
                  <Pause className="mr-2 h-4 w-4" /> Pause
                </Button>
              )}

              {!isSolving &&
                currentMoveIndex > 0 &&
                currentMoveIndex < solutionMoves.length && (
                  <Button
                    variant="outline"
                    onClick={resumeAutoSolver}
                    className="flex-1"
                  >
                    <FastForward className="mr-2 h-4 w-4" /> Resume
                  </Button>
                )}

              <Button
                variant="outline"
                onClick={skipToEnd}
                className="flex-1"
                disabled={
                  !solutionMoves.length ||
                  currentMoveIndex >= solutionMoves.length
                }
              >
                <SkipForward className="mr-2 h-4 w-4" /> Skip to End
              </Button>
            </AutoSolverButtons>

            {isSolving && solutionMoves.length > 0 && (
              <div className="text-sm text-center mt-2">
                Solving: Move {currentMoveIndex + 1} of {solutionMoves.length}
              </div>
            )}
          </AutoSolverControls>
        </ControlsContainer>
      </GameContainer>

      {showSuccess && (
        <SuccessNotification>
          <Trophy className="h-5 w-5" />
          <span>
            Congratulations! You solved it in {moves} moves and{" "}
            {formatTime(time)}
          </span>
        </SuccessNotification>
      )}

      <CustomModal
        isOpen={showHowToPlay}
        onClose={() => setShowHowToPlay(false)}
        title="How to Play"
      >
        <HowToPlay />
      </CustomModal>

      {showFireworks && <Fireworks />}
    </DndProvider>
  );
}
