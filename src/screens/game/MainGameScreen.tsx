import React, { useCallback, useEffect, useState, useRef } from "react";
import { StyleSheet, View, Dimensions, ScrollView } from "react-native";
import {
  GameAddButton,
  GameBackground,
  GameCard,
  GameEnd,
  GameGoBack,
  GameStars,
  GameGrid,
} from "./components";
import { RootStackParamList } from "@shared/types";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Toast } from "@shared/components";

import { makeId, generateRow, generateInitialGrid } from "./utils";
import { CellData } from "./types";
import { GRID } from "./constants";
import { ToastMessageType } from "@shared/components/Toast";

const { height, width } = Dimensions.get("window");
const PADDING_HORIZONTAL = width * 0.03;
const TOP_BAR_HEIGHT = height * 0.2;

// Stage configuration based on requirements
const STAGE_CONFIG = {
  1: { timeLimit: 20, targetScore: 20, addsBonusTime: true },
  2: { timeLimit: 40, targetScore: 40, addsBonusTime: true },
  3: { timeLimit: 60, targetScore: 30, addsBonusTime: false },
};

type Props = NativeStackScreenProps<RootStackParamList, "Game">;

const MainGameScreen = ({ navigation }: Props) => {
  const [gameId, setGameId] = useState(1);
  const [gameEndMessage, setGameEndMessage] = useState("");
  const [score, setScore] = useState(0);
  const [gameStage, setGameStage] = useState(1);
  const [secondsLeft, setSecondsLeft] = useState(STAGE_CONFIG[1].timeLimit);
  const [gameEnd, setGameEnd] = useState(false);
  const [nextAddCount, setNextAddCount] = useState(GRID.INITIAL_FILLED_ROWS);
  const [usesLeft, setUsesLeft] = useState(GRID.ADD_BUTTON_USES);
  const [isAddingRows, setIsAddingRows] = useState(false);
  const [toasts, setToasts] = useState<ToastMessageType[]>([]);
  const toastIdCounter = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const timeWarningShown = useRef(false);
  const [gridRows, setGridRows] = useState<CellData[][]>(
    generateInitialGrid(
      GRID.INITIAL_ROWS,
      GRID.INITIAL_COLS,
      GRID.INITIAL_FILLED_ROWS
    )
  );

  const currentStageConfig =
    STAGE_CONFIG[gameStage as keyof typeof STAGE_CONFIG] || STAGE_CONFIG[3];

  // Show toast helper
  const showToast = useCallback(
    (
      message: string,
      type: "success" | "error" | "warning" | "info" = "info",
      position: "top" | "bottom" | "bottom-right" = "bottom-right"
    ) => {
      const id = toastIdCounter.current++;
      setToasts((prev) => [...prev, { id, message, type, position }]);
    },
    []
  );

  // Remove toast
  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const handleAddPress = useCallback(() => {
    if (usesLeft <= 0 || isAddingRows || gameEnd) return;

    setIsAddingRows(true);

    setTimeout(() => {
      setGridRows((prev) => {
        let toFill = nextAddCount;
        let filledCount = prev.reduce(
          (acc, row) => (row[0]?.value != null ? acc + 1 : acc),
          0
        );
        const targetFilled = filledCount + toFill;
        let newRows = [...prev];

        while (newRows.length < targetFilled) {
          const newRowIndex = newRows.length;
          newRows.push(
            Array.from({ length: GRID.INITIAL_COLS }).map((_, c) => ({
              id: makeId(newRowIndex, c),
              row: newRowIndex,
              col: c,
              value: null,
              faded: false,
            }))
          );
        }

        for (let r = filledCount; r < targetFilled; r++) {
          newRows[r] = generateRow(r, GRID.INITIAL_COLS);
        }

        return newRows;
      });

      setUsesLeft((u) => Math.max(0, u - 1));
      setNextAddCount((n) => n * 2);
      setIsAddingRows(false);
    }, 150);
  }, [usesLeft, nextAddCount, isAddingRows, gameEnd]);

  const handleScore = useCallback(
    (delta: number) => {
      if (gameEnd) return;

      setScore((s) => {
        const newScore = s + delta;

        // Add bonus time for matches if stage allows it
        if (currentStageConfig.addsBonusTime && delta > 0) {
          setSecondsLeft((prev) => prev + 3);
        }

        return newScore;
      });
    },
    [currentStageConfig, gameEnd]
  );

  const handleGridUpdate = useCallback((updatedRows: CellData[][]) => {
    setGridRows(updatedRows);
  }, []);

  const minutes = Math.floor(secondsLeft / 60)
    .toString()
    .padStart(2, "0");
  const secs = (secondsLeft % 60).toString().padStart(2, "0");
  const formattedTime = `${minutes}:${secs}`;

  // Timer logic
  useEffect(() => {
    if (gameEnd) {
      // Clear timer when game ends
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        const newTime = s - 1;

        // Check if time is up
        if (newTime <= 0) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          setGameEnd(true);
          setGameEndMessage("⏰ Time's Up! Game Over");
          showToast("Time's up!", "error");
          return 0;
        }

        // Show warning when time is running low
        if (newTime <= 10 && !timeWarningShown.current) {
          showToast("⚠️ Time is running out!", "warning");
          timeWarningShown.current = true;
        }

        return newTime;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [gameEnd, showToast]);

  // Stage progression logic
  useEffect(() => {
    if (gameEnd) return;

    // Stage 1: Need to reach 20 points
    if (gameStage === 1 && score >= STAGE_CONFIG[1].targetScore) {
      setGameStage(2);
      setSecondsLeft(STAGE_CONFIG[2].timeLimit);
      setUsesLeft((u) => u + 2);
      showToast("🎉 Stage 1 Completed!", "success");
      timeWarningShown.current = false;
    }
    // Stage 2: Need to reach 40 MORE points (total 60)
    else if (
      gameStage === 2 &&
      score >= STAGE_CONFIG[1].targetScore + STAGE_CONFIG[2].targetScore
    ) {
      setGameStage(3);
      setSecondsLeft(STAGE_CONFIG[3].timeLimit);
      setUsesLeft((u) => u + 2);
      showToast("🔥 Stage 2 Completed!", "success");
      timeWarningShown.current = false;
    }
    // Stage 3: Need to reach 30 MORE points (total 90)
    else if (
      gameStage === 3 &&
      score >=
        STAGE_CONFIG[1].targetScore +
          STAGE_CONFIG[2].targetScore +
          STAGE_CONFIG[3].targetScore
    ) {
      setGameEnd(true);
      setGameEndMessage("🏆 Congratulations! You Won!");
      showToast("🏆 Victory!", "success");
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [score, gameStage, gameEnd, showToast]);

  // restart function
  const handlePressRestart = useCallback(() => {
    // Clear timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Reset all states
    setGameId((g) => g + 1);
    setGameEnd(false);
    setScore(0);
    setGameStage(1);
    setSecondsLeft(STAGE_CONFIG[1].timeLimit);
    setNextAddCount(GRID.INITIAL_FILLED_ROWS);
    setUsesLeft(GRID.ADD_BUTTON_USES);
    setGridRows(
      generateInitialGrid(
        GRID.INITIAL_ROWS,
        GRID.INITIAL_COLS,
        GRID.INITIAL_FILLED_ROWS
      )
    ); // Generate NEW grid
    setGameEndMessage("");
    setIsAddingRows(false);
    setToasts([]);
    timeWarningShown.current = false;
  }, []);

  return (
    <View style={styles.container}>
      <GameBackground />
      <GameStars />

      {!gameEnd && <GameGoBack onPress={() => navigation.goBack()} />}

      {!gameEnd ? (
        <>
          <View style={styles.topBar}>
            <GameCard
              stage={gameStage}
              score={score}
              timer={formattedTime}
              target={currentStageConfig.targetScore}
            />
          </View>

          <View style={styles.gridArea}>
            <ScrollView
              overScrollMode="never"
              bounces={false}
              contentContainerStyle={styles.gridContent}
              showsVerticalScrollIndicator={false}
            >
              <GameGrid
                key={gameId}
                rowsData={gridRows}
                onScore={handleScore}
                onGridUpdate={handleGridUpdate}
                cols={GRID.INITIAL_COLS}
                disabled={false}
              />
            </ScrollView>
          </View>

          <View style={styles.addButtonContainer}>
            <GameAddButton
              count={usesLeft}
              onPress={handleAddPress}
              disabled={usesLeft <= 0 || isAddingRows}
            />
          </View>
        </>
      ) : (
        <GameEnd
          message={gameEndMessage}
          score={score}
          onPressRestart={handlePressRestart}
          onPressHome={() => navigation.navigate("Home")}
        />
      )}

      {/* Toast notifications */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          position={toast.position}
          onHide={() => removeToast(toast.id)}
        />
      ))}
    </View>
  );
};

export default MainGameScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
    width: "100%",
    height: "100%",
  },
  topBar: {
    position: "absolute",
    left: 0,
    top: 0,
    width: "100%",
    height: TOP_BAR_HEIGHT - 22,
    zIndex: 10,
    justifyContent: "flex-end",
  },
  gridArea: {
    position: "absolute",
    left: 0,
    right: 0,
    top: TOP_BAR_HEIGHT - 15,
    bottom: 0,
    paddingHorizontal: PADDING_HORIZONTAL,
    zIndex: 10,
    height: "68%",
  },
  gridContent: {
    flexGrow: 1,
  },
  addButtonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "flex-start",
    paddingHorizontal: PADDING_HORIZONTAL,
    justifyContent: "center",
    width: "100%",
    height: "16%",
    zIndex: 15,
  },
});
