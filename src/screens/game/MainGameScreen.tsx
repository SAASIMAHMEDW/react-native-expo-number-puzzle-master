import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { RootStackParamList } from "@shared/types";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  GameBackground,
  GameStars,
  GameCard,
  GameGrid,
  GameAddButton,
  GameGoBack,
  GameEnd,
} from "./components";
import GameLevelTransition from "./components/GameLevelTransition";
import Toast, { ToastMessageType } from "@shared/components/Toast";
import {
  GameState,
  GameEvent,
  LevelConfig,
  CellData,
  Position,
} from "./engine";
import { SHOULD_SHOW_TOAST } from "./constants";
import { impactAsync, ImpactFeedbackStyle } from "expo-haptics";
type Props = NativeStackScreenProps<RootStackParamList, "Game">;

const { height, width } = Dimensions.get("window");
const PADDING_HORIZONTAL = width * 0.03;
const TOP_BAR_HEIGHT = height * 0.2;

const MainGameScreen = ({ navigation }: Props) => {
  const { height, width } = useWindowDimensions();

  const gameStateRef = useRef<GameState | null>(null);
  // ref for ScrollView
  const scrollViewRef = useRef<ScrollView>(null);
  const [grid, setGrid] = useState<CellData[][]>([]);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(0);
  const [addRowUses, setAddRowUses] = useState(0);
  const [selectedCell, setSelectedCell] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [currentLevel, setCurrentLevel] = useState<LevelConfig | null>(null);

  const [showLevelTransition, setShowLevelTransition] = useState(true);
  const [isLevelComplete, setIsLevelComplete] = useState(false);
  const [stage, setStage] = useState(1);
  const [targetScore, setTargetScore] = useState(0);
  // State for shake animation
  const [invalidCells, setInvalidCells] = useState<Position[]>([]);

  const [toasts, setToasts] = useState<ToastMessageType[]>([]);
  const toastIdRef = useRef(0);

  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = useCallback(
    (message: string, type: ToastMessageType["type"] = "info") => {
      if (!SHOULD_SHOW_TOAST) return;
      const id = toastIdRef.current++;
      setToasts((prev) => [...prev, { id, message, type }]);
    },
    []
  );

  const hideToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  useEffect(() => {
    const gameState = new GameState();
    gameStateRef.current = gameState;

    const handleGridUpdate = (data: CellData[][]) => {
      setGrid([...data]);
    };

    const handleScoreUpdate = (data: { score: number }) => {
      setScore(data.score);
    };

    const handleTimerUpdate = (data: { timer: number }) => {
      setTimer(data.timer);
    };

    const handleTimerExpired = () => {
      showToast("Time is up!", "error");
    };

    const handleCellsMatched = () => {
      showToast("Match!", "success");
    };

    const handleRowAdded = () => {
      showToast("Row added!", "info");
    };

    // Subscribe to cell selection changes
    const handleCellSelected = (data: { position: Position | null }) => {
      setSelectedCell(data.position);
    };

    const handleLevelStarted = (data: { level: LevelConfig }) => {
      setCurrentLevel(data.level);
      setIsLevelComplete(false);
    };

    const handleLevelCompleted = (data: { hasNextLevel: boolean }) => {
      setIsLevelComplete(true);
      if (data.hasNextLevel) {
        showToast("Level Complete!", "success");
        setShowLevelTransition(true);
      } else {
        showToast("🎉 You Won! All levels complete!", "success");
        setTimeout(() => {
          setIsGameOver(true);
        }, 1500);
      }
    };

    const handleLevelFailed = () => {
      showToast("Level Failed!", "error");
      setTimeout(() => {
        setIsGameOver(true);
      }, 1000);
    };

    const handleGameOver = () => {
      setIsGameOver(true);
    };

    gameState.on(GameEvent.GRID_UPDATED, handleGridUpdate);
    gameState.on(GameEvent.SCORE_UPDATED, handleScoreUpdate);
    gameState.on(GameEvent.TIMER_UPDATED, handleTimerUpdate);
    gameState.on(GameEvent.TIMER_EXPIRED, handleTimerExpired);
    gameState.on(GameEvent.CELLS_MATCHED, handleCellsMatched);
    gameState.on(GameEvent.ROW_ADDED, handleRowAdded);
    gameState.on(GameEvent.CELL_SELECTED, handleCellSelected);
    gameState.on(GameEvent.LEVEL_STARTED, handleLevelStarted);
    gameState.on(GameEvent.LEVEL_COMPLETED, handleLevelCompleted);
    gameState.on(GameEvent.LEVEL_FAILED, handleLevelFailed);
    gameState.on(GameEvent.GAME_OVER, handleGameOver);

    const initialState = gameState.getStateSnapshot();
    setGrid(initialState.grid);
    setScore(initialState.score);
    setTimer(initialState.timer);
    setAddRowUses(initialState.addRowUses);
    setCurrentLevel(gameState.getCurrentLevel());
    setStage(gameState.getCurrentLevelNumber());
    setTargetScore(gameState.getCurrentLevelTargetScore());

    return () => {
      gameState.destroy();
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [showToast]);

  useEffect(() => {
    if (!showLevelTransition && !isGameOver && gameStateRef.current) {
      timerIntervalRef.current = setInterval(() => {
        gameStateRef.current?.decrementTimer();
      }, 1000);

      return () => {
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
        }
      };
    }
  }, [showLevelTransition, isGameOver]);

  // Updated cell press handler with shake animation
  const handleCellPress = useCallback((row: number, col: number) => {
    if (!gameStateRef.current) return;

    impactAsync(ImpactFeedbackStyle.Soft);

    const result = gameStateRef.current.selectCell(row, col);
    // const selected = gameStateRef.current.getSelectedCell();
    // setSelectedCell(selected);
    // console.log(selected);

    if (
      !result.success &&
      result.invalidPath &&
      result.invalidPath.length > 0
    ) {
      // Show shake animation on invalid path
      setInvalidCells(result.invalidPath);
      setTimeout(() => {
        setInvalidCells([]);
      }, 600);
    }
  }, []);

  const handleAddRow = useCallback(() => {
    if (!gameStateRef.current) return;

    const success = gameStateRef.current.addRow();
    if (!success) {
      showToast("No empty rows available!", "error");
    } else {
      setAddRowUses(gameStateRef.current.getAddRowUses());
      // Scroll to the newly added rows after a brief delay
      setTimeout(() => {
        if (scrollViewRef.current && gameStateRef.current) {
          // Calculate the position of the new rows
          const grid = gameStateRef.current?.getGrid();
          if (grid) {
            const filledRows = grid.filter((row) =>
              row.some((cell) => cell.value !== null)
            ).length;

            // Scroll to show the new rows (with some offset to see them appearing)
            const cellSize = (width * 0.94) / (grid[0]?.length || 9);
            const scrollPosition = (filledRows - 4) * cellSize; // Show 4 rows before the new ones

            scrollViewRef.current.scrollTo({
              y: Math.max(0, scrollPosition),
              animated: true,
            });
          }
        }
      }, 100);
    }
  }, [showToast]);

  const handleStartLevel = useCallback(() => {
    setShowLevelTransition(false);

    if (isLevelComplete && gameStateRef.current) {
      gameStateRef.current.startNextLevel();

      const newState = gameStateRef.current.getStateSnapshot();
      setGrid(newState.grid);
      setScore(newState.score);
      setTimer(newState.timer);
      setAddRowUses(newState.addRowUses);
      setCurrentLevel(gameStateRef.current.getCurrentLevel());
      setStage(newState.currentLevel);
      setTargetScore(newState.currentLevelTargetScore);
    }
  }, [isLevelComplete]);

  const handleRestart = useCallback(() => {
    if (!gameStateRef.current) return;

    //Clear timer first
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    gameStateRef.current.restartLevel();
    const newState = gameStateRef.current.getStateSnapshot();
    setGrid(newState.grid);
    setScore(newState.score);
    setTimer(newState.timer);
    setAddRowUses(newState.addRowUses);
    setIsGameOver(false);
    setIsLevelComplete(false);
    setSelectedCell(null);
    setInvalidCells([]);
  }, []);

  const handleGoHome = useCallback(() => {
    // Clean up timer interval
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    // Destroy game state (removes all event listeners)
    if (gameStateRef.current) {
      gameStateRef.current.destroy();
      gameStateRef.current = null;
    }

    // Reset UI state
    setIsGameOver(false);
    setIsLevelComplete(false);
    setSelectedCell(null);
    setInvalidCells([]);
    setToasts([]);

    // Navigate to home
    navigation.navigate("Home");
  }, [navigation]);

  if (!currentLevel) {
    return null;
  }

  return (
    <View style={[styles.gameMainContainer, { height, width }]}>
      <GameBackground />
      <GameStars />

      {/* Only hide game UI when NOT game over */}
      {!showLevelTransition && (
        <>
          <View style={styles.header}>
            <GameGoBack onPress={handleGoHome} />
            <GameCard
              stage={stage}
              score={score}
              timer={timer}
              target={targetScore}
            />
          </View>

          <View style={styles.gridArea}>
            <ScrollView
              ref={scrollViewRef}
              contentContainerStyle={styles.gridContent}
              showsVerticalScrollIndicator={false}
              overScrollMode="never"
            >
              <GameGrid
                grid={grid}
                onCellPress={handleCellPress}
                selectedCell={selectedCell}
                invalidCells={invalidCells}
              />
            </ScrollView>
          </View>

          <View style={styles.footer}>
            <GameAddButton
              count={addRowUses}
              onPress={handleAddRow}
              disabled={addRowUses === 0}
            />
          </View>
        </>
      )}

      {showLevelTransition && (
        <GameLevelTransition
          visible={showLevelTransition}
          level={currentLevel}
          onStartLevel={handleStartLevel}
          isVictory={isLevelComplete}
        />
      )}

      {isGameOver && (
        <GameEnd
          score={score}
          onPressRestart={handleRestart}
          onPressHome={handleGoHome}
        />
      )}

      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onHide={() => hideToast(toast.id)}
        />
      ))}
    </View>
  );
};

export default MainGameScreen;

const styles = StyleSheet.create({
  gameMainContainer: {
    position: "relative",
    flex: 1,
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    // paddingHorizontal: 20,
    height: "15%",
    zIndex: 20,
    // borderColor: "red",
    // borderWidth: 2,
  },
  gridArea: {
    position: "absolute",
    top: "15%",
    bottom: 0,
    left: 0,
    right: 0,
    width: "100%",
    height: "68%",
    // paddingHorizontal: PADDING_HORIZONTAL,
    // borderColor: "yellow",
    // borderWidth: 2,
    // overflow: "scroll",
  },
  gridContent: {
    flexGrow: 1,
    justifyContent: "center", 
    alignItems: "center",
    flex: 1,
    position: "absolute",
    top: 10,
    right: 0,
    left: 0,
    // borderColor: "cyan",
    // borderWidth: 2,
  },

  footer: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 20,
  },
});
