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
const ADD_BUTTON_USES = 6;
const TOTAL_SECONDS = 120;

const makeId = (r: number, c: number) =>
  `${r}-${c}-${Math.random().toString(36).slice(2, 6)}`;

const generateRow = (rowIndex: number, cols: number): CellData[] =>
  Array.from({ length: cols }).map((_, c) => ({
    id: makeId(rowIndex, c),
    row: rowIndex,
    col: c,
    value: Math.ceil(Math.random() * 9),
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
  // Game End Screen Message States
  const [gameEndMessage, setGameEndMessage] = useState("");
  const [score, setScore] = useState(0);
  const [gameStage, setGameStage] = useState(1);
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECONDS);
  const [gameEnd, setGameEnd] = useState(false);
  const [nextAddCount, setNextAddCount] = useState(INITIAL_FILLED_ROWS);
  const [usesLeft, setUsesLeft] = useState(ADD_BUTTON_USES);

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
    rows.push(
      Array.from({ length: INITIAL_COLS }).map((_, c) => ({
        id: makeId(INITIAL_ROWS, c),
        row: INITIAL_ROWS,
        col: c,
        value: null,
        faded: false,
      }))
    );
    return rows;
  }, []);

  const [gridRows, setGridRows] = useState<CellData[][]>(initialGrid);

  const handleAddPress = useCallback(() => {
    if (usesLeft <= 0) return;
    setGridRows((prev) => {
      let toFill = nextAddCount;
      const existingRows = prev.length - 1; // Exclude extra row
      let filledCount = prev.reduce(
        (acc, row) => (row[0]?.value != null ? acc + 1 : acc),
        0
      );
      const targetFilled = filledCount + toFill;
      let newRows = prev.slice(0, prev.length - 1);
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
      for (let r = filledCount; r < targetFilled; r++) {
        newRows[r] = generateRow(r, INITIAL_COLS);
      }
      const extraRowIndex = newRows.length;
      newRows.push(
        Array.from({ length: INITIAL_COLS }).map((_, c) => ({
          id: makeId(extraRowIndex, c),
          row: extraRowIndex,
          col: c,
          value: null,
          faded: false,
        }))
      );
      return newRows;
    });
    setUsesLeft((u) => Math.max(0, u - 1));
    setNextAddCount((n) => n * 2);
  }, [usesLeft, nextAddCount]);

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

  if (gameEnd)
    return (
      <GameEnd
        message={gameEndMessage}
        score={score}
        onPressRestart={() => navigation.navigate("Game")}
        onPressHome={() => navigation.navigate("Home")}
      />
    );

  return (
    <View style={styles.container}>
      <GameBackground />
      <GameStars />

      {/* GoBack always at the very top left (fixed) */}
      <GameGoBack onPress={() => navigation.goBack()} />

      {/* Game State Card */}
      <View style={styles.topBar}>
        <GameCard stage={gameStage} score={score} timer={formattedTime} />
      </View>

      {/* GameGrid in remaining area, AddButton below it */}
      <View style={styles.gridArea}>
        <ScrollView
          overScrollMode="never" //
          bounces={false}
          contentContainerStyle={styles.gridContent}
          showsVerticalScrollIndicator={false}
        >
          <GameGrid
            key={gameId}
            rowsData={gridRows}
            onScore={(d) => setScore((s) => s + d)}
            cols={INITIAL_COLS}
            disabled={!!gameEnd}
          />
        </ScrollView>
      </View>
      <View style={styles.addButtonContainer}>
        <GameAddButton
          count={usesLeft}
          onPress={handleAddPress}
          disabled={usesLeft <= 0}
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
    // alignItems: "center",
    // paddingBottom: 90,
    // paddingTop: 10,
    // height: "100%",
    // borderBlockColor: "yellow",
    // borderWidth: 5,
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
