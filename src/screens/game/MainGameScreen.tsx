// MainGameScreen.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
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

const { height, width } = Dimensions.get("window");
const PADDING_HORIZONTAL = width * 0.03;
const TOP_BAR_HEIGHT = height * 0.2;

const INITIAL_ROWS = 9;
const INITIAL_COLS = 9;
const INITIAL_FILLED_ROWS = 3;
const ADD_BUTTON_USES = 3;
const TOTAL_SECONDS = 20;
const STAGES = 3;

const makeId = (r: number, c: number) =>
  `${r}-${c}-${Math.random().toString(36).slice(2, 6)}`;

const generateRow = (rowIndex: number, cols: number): CellData[] =>
  Array.from({ length: cols }).map((_, c) => ({
    id: makeId(rowIndex, c),
    row: rowIndex,
    col: c,
    value: Math.ceil(Math.random() * 9),
    // value: 2,
    faded: false,
  }));

export interface CellData {
  id: string;
  row: number;
  col: number;
  value: number | null;
  faded: boolean;
}

type Props = NativeStackScreenProps<RootStackParamList, "Game">;

const MainGameScreen = ({ navigation }: Props) => {
  const [gameId, setGameId] = useState(1);
  const [gameEndMessage, setGameEndMessage] = useState("");
  const [score, setScore] = useState(0);
  const [target, setTarget] = useState(10);
  const [gameStage, setGameStage] = useState(1);
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECONDS);
  const [gameEnd, setGameEnd] = useState(false);
  const [nextAddCount, setNextAddCount] = useState(INITIAL_FILLED_ROWS);
  const [usesLeft, setUsesLeft] = useState(ADD_BUTTON_USES);
  const [isAddingRows, setIsAddingRows] = useState(false);

  const initialGrid = useMemo(() => {
    const rows: CellData[][] = [];
    for (let r = 0; r < INITIAL_ROWS; r++) {
      if (r < INITIAL_FILLED_ROWS) {
        rows.push(generateRow(r, INITIAL_COLS));
      } else {
        rows.push(
          Array.from({ length: INITIAL_COLS }).map((_, c) => ({
            id: makeId(r, c),
            row: r,
            col: c,
            value: null,
            faded: false,
          }))
        );
      }
    }
    return rows;
  }, []);

  const [gridRows, setGridRows] = useState<CellData[][]>(initialGrid);

  const handleAddPress = useCallback(() => {
    if (usesLeft <= 0 || isAddingRows) return;

    setIsAddingRows(true);

    // Simulate async row generation with timeout
    setTimeout(() => {
      setGridRows((prev) => {
        let toFill = nextAddCount;
        const existingRows = prev.length;
        let filledCount = prev.reduce(
          (acc, row) => (row[0]?.value != null ? acc + 1 : acc),
          0
        );
        const targetFilled = filledCount + toFill;
        let newRows = [...prev];

        // Add new rows if needed
        while (newRows.length < targetFilled) {
          const newRowIndex = newRows.length;
          newRows.push(
            Array.from({ length: INITIAL_COLS }).map((_, c) => ({
              id: makeId(newRowIndex, c),
              row: newRowIndex,
              col: c,
              value: null,
              faded: false,
            }))
          );
        }

        // Fill rows with numbers
        for (let r = filledCount; r < targetFilled; r++) {
          newRows[r] = generateRow(r, INITIAL_COLS);
        }

        return newRows;
      });

      setUsesLeft((u) => Math.max(0, u - 1));
      setNextAddCount((n) => n * 2);
      setIsAddingRows(false);
    }, 150); // Small delay to show loading state
  }, [usesLeft, nextAddCount, isAddingRows]);

  const handleScore = useCallback((delta: number) => {
    setScore((s) => s + delta);
  }, []);

  const handleGridUpdate = useCallback((updatedRows: CellData[][]) => {
    setGridRows(updatedRows);
  }, []);

  const minutes = Math.floor(secondsLeft / 60)
    .toString()
    .padStart(2, "0");
  const secs = (secondsLeft % 60).toString().padStart(2, "0");
  const formattedTime = `${minutes}:${secs}`;

  useEffect(() => {
    if (!gameEnd) return;
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(id);
          setGameEnd(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [gameEnd]);

  useEffect(() => {
    if (score === target) {
      switch (gameStage) {
        case 1:
          setTarget((t) => t + 20);
          setGameStage((s) => s + 1);
          setSecondsLeft((prev) => prev + TOTAL_SECONDS * 2);
          break;
        case 2:
          setTarget((t) => t + 40);
          setGameStage((s) => s + 1);
          setSecondsLeft((prev) => prev + TOTAL_SECONDS * 3);
          break;
        case 3:
          setTarget((t) => t + 60);
          setGameStage((s) => s + 1);
          setSecondsLeft((prev) => prev + TOTAL_SECONDS * 4);
          break;
        default:
          break;
      }
      setTarget((t) => t + 10);
      setGameStage((s) => s + 1);
      setSecondsLeft((prev) => prev + TOTAL_SECONDS * 2);
    } else {
      setSecondsLeft((prev) => prev + 3);
    }
  }, [score]);

  const handlePressRestart = () => {
    setGameId((g) => g + 1);
    setGameEnd(false);
    setScore(0);
    setGameStage(1);
    setSecondsLeft(TOTAL_SECONDS);
    setNextAddCount(INITIAL_FILLED_ROWS);
    setUsesLeft(ADD_BUTTON_USES);
    setGridRows(initialGrid);
    setGameEndMessage("");
    setIsAddingRows(false);
  };

  return (
    <View style={styles.container}>
      {gameEnd && (
        <GameEnd
          message={gameEndMessage}
          score={score}
          onPressRestart={() => handlePressRestart()}
          onPressHome={() => navigation.navigate("Home")}
        />
      )}

      <GameBackground />
      <GameStars />

      <GameGoBack onPress={() => navigation.goBack()} />

      <View style={styles.topBar}>
        <GameCard
          key={`${gameStage + score + formattedTime + target}`}
          stage={gameStage}
          score={score}
          timer={formattedTime}
          target={target}
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
            cols={INITIAL_COLS}
            disabled={gameEnd}
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
  },
});
