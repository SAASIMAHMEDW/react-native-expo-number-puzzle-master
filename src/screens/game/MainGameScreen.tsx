import React, { useCallback, useEffect, useMemo, useState } from "react";
import { StyleSheet, View, Dimensions, ScrollView } from "react-native";
import {
  GameAddButton,
  GameBackground,
  GameCard,
  GameEnd,
  GameGoBack,
  GameStars,
} from "./components"; // keep your imports
import { GameGrid } from "./components";
import { CellData } from "./types"; // your CellData type
import generateRow from "./utils/generateRow"; // your helper (returns CellData[])
import makeId from "./utils/makeId";
import { RootStackParamList } from "@shared/types";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

type Props = NativeStackScreenProps<RootStackParamList, "Game">;
const { height, width } = Dimensions.get("window");

const INITIAL_ROWS = 9;
const INITIAL_COLS = 9;
const INITIAL_FILLED_ROWS = 3;
const ADD_BUTTON_USES = 3;

const MainGameScreen = ({ navigation }: Props) => {
  // Game End screen state
  const [gameEnd, setGameEnd] = useState<boolean>(false);
  // Amount we will add next (starts equal to initial filled rows)
  const [nextAddCount, setNextAddCount] = useState<number>(INITIAL_FILLED_ROWS);
  // Number of times add button has been clicked
  const [usesLeft, setUsesLeft] = useState<number>(ADD_BUTTON_USES);

  // gridRows: array of CellData[] rows. We'll keep an *extra empty row* at the end for your fade.
  const initialGrid = useMemo(() => {
    // create INITIAL_ROWS rows, but only fill values for first INITIAL_FILLED_ROWS
    const rows: CellData[][] = [];
    for (let r = 0; r < INITIAL_ROWS; r++) {
      if (r < INITIAL_FILLED_ROWS) {
        rows.push(generateRow(r, INITIAL_COLS)); // full row with random values
      } else {
        // create empty row (value 0 or null — we'll use null to represent empty)
        rows.push(
          Array.from({ length: INITIAL_COLS }).map((_, c) => ({
            id: makeId(r, c),
            row: r,
            col: c,
            value: null as number | null,
            faded: false,
          }))
        );
      }
    }
    // ensure one extra empty row at end for fade
    rows.push(
      Array.from({ length: INITIAL_COLS }).map((_, c) => ({
        id: makeId(INITIAL_ROWS, c),
        row: INITIAL_ROWS,
        col: c,
        value: null as number | null,
        faded: false,
      }))
    );
    return rows;
  }, []);

  const [gridRows, setGridRows] = useState<CellData[][]>(initialGrid);

  const handleAddPress = useCallback(() => {
    if (usesLeft <= 0) return;

    setGridRows((prev) => {
      // how many rows to fill now = nextAddCount
      let toFill = nextAddCount;
      // compute total rows currently available excluding the extra empty final row
      const existingRows = prev.length - 1; // last one is extra empty
      // count currently filled rows (rows where first cell not null)
      let filledCount = prev.reduce(
        (acc, row) => (row[0]?.value != null ? acc + 1 : acc),
        0
      );

      // target filled rows after adding:
      const targetFilled = filledCount + toFill;

      // If we don't have enough rows, append empty rows to reach targetFilled (plus keep one extra)
      let newRows = prev.slice(0, prev.length - 1); // drop final extra for manipulation
      while (newRows.length < targetFilled) {
        const newRowIndex = newRows.length;
        newRows.push(
          Array.from({ length: INITIAL_COLS }).map((_, c) => ({
            id: makeId(newRowIndex, c),
            row: newRowIndex,
            col: c,
            value: null as number | null,
            faded: false,
          }))
        );
      }

      // Fill rows from filledCount -> targetFilled-1
      for (let r = filledCount; r < targetFilled; r++) {
        // Generate a new random row
        const generated = generateRow(r, INITIAL_COLS);
        // Keep previous rows as-is, replace this row's values
        newRows[r] = generated;
      }

      // push back the extra empty row
      const extraRowIndex = newRows.length;
      newRows.push(
        Array.from({ length: INITIAL_COLS }).map((_, c) => ({
          id: makeId(extraRowIndex, c),
          row: extraRowIndex,
          col: c,
          value: null as number | null,
          faded: false,
        }))
      );

      return newRows;
    });

    // decrement uses and double nextAddCount
    setUsesLeft((u) => Math.max(0, u - 1));
    setNextAddCount((n) => n * 2);
  }, [usesLeft, nextAddCount]);

  useEffect(() => {
    if (usesLeft <= 0) {
      setGameEnd(true);
    }
  }, [usesLeft]);

  if (gameEnd)
    return (
      <GameEnd
        message="Timer Ends"
        onPressRestart={() => navigation.navigate("Game")}
        onPressHome={() => navigation.navigate("Home")}
      />
    );

  return (
    <View style={styles.container}>
      <GameBackground />
      <GameGoBack onPress={() => navigation.goBack()} />
      <GameStars />
      <GameCard stage={1} score={50} timer="01:23" />

      <View style={styles.gridWrapper}>
        {/* ScrollView so the grid can be scrolled if taller than wrapper */}
        <ScrollView
          style={{ width: "100%" }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ alignItems: "center" }}
        >
          <GameGrid rowsData={gridRows} cols={INITIAL_COLS} />
        </ScrollView>
      </View>

      <GameAddButton
        count={usesLeft}
        onPress={handleAddPress}
        disabled={usesLeft <= 0}
      />
    </View>
  );
};

export default MainGameScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: "#05000d",
    overflow: "hidden",
  },
  gridWrapper: {
    position: "absolute",
    top: height * 0.15 + height * 0.03, // 3% gap below GameCard
    width: width * 0.98,
    height: height * 0.8,
    alignSelf: "center",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingHorizontal: width * 0.04, // 4% side gap
    zIndex: 10,
  },
});
