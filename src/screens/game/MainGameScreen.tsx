import React, { useCallback, useEffect, useRef, useState } from "react";
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

import { GRID } from "./constants";
import { Toast } from "@shared/components";
import { ToastMessageType } from "@shared/components/Toast";

import { RootStackParamList } from "@shared/types";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Cell, GameState } from "./engine";

const { height, width } = Dimensions.get("window");
const PADDING_HORIZONTAL = width * 0.03;
const TOP_BAR_HEIGHT = height * 0.2;

type Props = NativeStackScreenProps<RootStackParamList, "Game">;

const MainGameScreen = ({ navigation }: Props) => {
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [selectedCells, setSelectedCells] = useState<Cell[]>([]);
  const [shakingCells, setShakingCells] = useState<string[]>([]);

  const [score, setScore] = useState(0);
  const [stage, setStage] = useState(1);

  const [gameEnd, setGameEnd] = useState(false);
  const [endMessage, setEndMessage] = useState("");

  const [toasts, setToasts] = useState<ToastMessageType[]>([]);
  const toastIdRef = useRef(0);

  const engineRef = useRef<GameState | null>(null);

  // ------------------------------
  // INIT ENGINE
  // ------------------------------
  useEffect(() => {
    const engine = new GameState({
      grid: {
        rows: GRID.INITIAL_ROWS,
        cols: GRID.INITIAL_COLS,
        initialFilled: GRID.INITIAL_FILLED_ROWS,
      },
      levels: {
        1: { target: 10, timeLimit: 30, bonusTime: 3, allowBonus: true },
        2: { target: 20, timeLimit: 60, bonusTime: 3, allowBonus: true },
        3: { target: 30, timeLimit: 180, bonusTime: 0, allowBonus: false },
      },
    });

    engineRef.current = engine;
    setGrid(engine.grid.rows);

    engine.onGridChange = (g) => setGrid([...g]);
    engine.onScore = (s) => setScore(s);
    engine.onStageChange = (s) => setStage(s);

    return () => {
      engineRef.current = null;
    };
  }, []);

  // ------------------------------
  // HANDLE CELL PRESS
  // ------------------------------
  const handleCellPress = useCallback(
    async (cell: Cell) => {
      if (gameEnd) return;

      // First selection
      if (selectedCells.length === 0) {
        setSelectedCells([cell]);
        return;
      }

      // Second selection: send to engine
      if (selectedCells.length === 1) {
        const a = selectedCells[0];
        const b = cell;

        if (a.row === b.row && a.col === b.col) {
          setSelectedCells([]);
          return;
        }

        const engine = engineRef.current;
        if (!engine) return;

        const result = engine.select(a, b);

        // if (result.success) {
        //   // Match happened
        //   setSelectedCells([]);
        // } else {
        //   // INVALID MOVE → shake effect
        //   setShakingCells([`${a.row}-${a.col}`, `${b.row}-${b.col}`]);
        //   setTimeout(() => setShakingCells([]), 500);

        //   setSelectedCells([]);
        // }
        if (result.success) {
          setSelectedCells([]);
        } else {
          // Decide shake behavior:
          // - To shake selected cells (recommended): use selected pair
          // - To highlight/ shake interposing cells: use result.betweenCells
          const shakeSelectedOnInvalid = false;

          if (shakeSelectedOnInvalid) {
            setShakingCells([`${a.row}-${a.col}`, `${b.row}-${b.col}`]);
          } else {
            setShakingCells(result.betweenCells ?? []);
          }

          // clear shake after short timeout
          setTimeout(() => setShakingCells([]), 450);
          setSelectedCells([]);
        }
      }
    },
    [selectedCells, gameEnd]
  );

  // ------------------------------
  // ADD BUTTON
  // ------------------------------
  const handleAddRow = () => {
    const engine = engineRef.current;
    if (!engine || gameEnd) return;

    engine.addRow();
  };

  // ------------------------------
  // END GAME (stage 3 finish)
  // ------------------------------
  useEffect(() => {
    if (stage === 4) {
      setGameEnd(true);
      setEndMessage("🎉 You Beat All Stages!");
    }
  }, [stage]);

  // ------------------------------
  // TOAST HELPERS
  // ------------------------------
  const showToast = (
    message: string,
    type: "success" | "error" | "warning" | "info" = "info"
  ) => {
    const id = toastIdRef.current++;
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // ------------------------------
  // RENDER
  // ------------------------------
  return (
    <View style={styles.container}>
      <GameBackground />
      <GameStars />

      {!gameEnd && <GameGoBack onPress={() => navigation.goBack()} />}

      {!gameEnd ? (
        <>
          <View style={styles.topBar}>
            <GameCard
              stage={stage}
              score={score}
              timer={"--:--"} // Timer now handled separately if needed
              target={
                stage === 1 ? 10 : stage === 2 ? 20 : stage === 3 ? 30 : 0
              }
            />
          </View>

          <View style={styles.gridArea}>
            <ScrollView
              contentContainerStyle={styles.gridContent}
              showsVerticalScrollIndicator={false}
              overScrollMode="never"
            >
              <GameGrid
                grid={grid}
                selectedCells={selectedCells}
                shakingCells={shakingCells}
                onCellPress={handleCellPress}
              />
            </ScrollView>
          </View>

          <View style={styles.addButtonContainer}>
            <GameAddButton count={2} disabled={false} onPress={handleAddRow} />
          </View>
        </>
      ) : (
        <GameEnd
          message={endMessage}
          score={score}
          onPressRestart={() => navigation.replace("Game")}
          onPressHome={() =>
            navigation.reset({
              index: 0,
              routes: [{ name: "Home" }],
            })
          }
        />
      )}

      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
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
    borderColor: "#ff0000ff",
    borderWidth: 2,
  },
  topBar: {
    position: "absolute",
    top: 0,
    width: "100%",
    height: TOP_BAR_HEIGHT - 22,
    justifyContent: "flex-end",
    zIndex: 10,
  },
  gridArea: {
    position: "absolute",
    top: TOP_BAR_HEIGHT - 15,
    bottom: 0,
    width: "100%",
    paddingHorizontal: PADDING_HORIZONTAL,
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
    borderColor: "#ddff00ff",
    borderWidth: 2,
  },
});
