import React, { useEffect } from "react";
import { Text, StyleSheet, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
  interpolate,
} from "react-native-reanimated";

interface GameCellProps {
  value: number;
  row: number;
  col: number;
  fontSize?: number;
  isSelected: boolean;
  isFaded: boolean;
  isShaking?: boolean;
  onPress: (row: number, col: number, value: number) => void;
}

const CELL_NUMBER_COLORS = [
  "#FF6F61",
  "#FFB400",
  "#6BCB77",
  "#4D96FF",
  "#C77DFF",
  "#FF4B91",
  "#FFD93D",
  "#00C2A8",
  "#FF8B13",
];

const GameCell: React.FC<GameCellProps> = ({
  value,
  fontSize = 36,
  onPress,
  row,
  col,
  isSelected,
  isFaded,
  isShaking = false,
}) => {
  const scale = useSharedValue(value != null ? 0 : 0.6);
  const opacity = useSharedValue(value != null ? 0 : 0);
  const rotation = useSharedValue(0);
  const borderOpacity = useSharedValue(0);

  // Smooth glow for selected cells
  useEffect(() => {
    borderOpacity.value = withTiming(isSelected ? 1 : 0, {
      duration: 200,
      easing: Easing.out(Easing.cubic),
    });
  }, [isSelected]);

  // Number pop-in animation
  useEffect(() => {
    if (value != null && !isFaded) {
      opacity.value = withSequence(
        withTiming(0, { duration: 0 }),
        withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) })
      );
      scale.value = withSequence(
        withTiming(0.3, { duration: 0 }),
        withTiming(1.2, { duration: 250, easing: Easing.out(Easing.cubic) }),
        withTiming(1, { duration: 150, easing: Easing.inOut(Easing.cubic) })
      );
    }
  }, [value, isFaded]);

  // Faded cells (after match)
  useEffect(() => {
    if (isFaded) {
      opacity.value = withTiming(0.15, { duration: 300 }); // fade to 30% opacity
      scale.value = withTiming(1, { duration: 300 }); // no shrink
    } else {
      opacity.value = withTiming(1, { duration: 300 }); // restore when not faded
    }
  }, [isFaded]);

  // Shake animation for invalid move
  useEffect(() => {
    if (isShaking) {
      rotation.value = withSequence(
        withTiming(6, { duration: 60 }),
        withTiming(-6, { duration: 60 }),
        withTiming(4, { duration: 60 }),
        withTiming(-4, { duration: 60 }),
        withTiming(0, { duration: 50 })
      );
    }
  }, [isShaking]);

  const color =
    value != null
      ? CELL_NUMBER_COLORS[(value - 1) % CELL_NUMBER_COLORS.length]
      : "#fff";

  // --- BORDER + GLOW STYLE ---
  const cellContainerStyle = useAnimatedStyle(() => {
    const borderColor = color;
    return {
      borderWidth: interpolate(borderOpacity.value, [0, 1], [0, 2]),
      borderColor: borderColor,
      borderRadius: 4,
      backgroundColor: isSelected ? `${borderColor}22` : "transparent",
      shadowColor: borderColor,
      shadowOpacity: interpolate(borderOpacity.value, [0, 1], [0, 0.5]),
      shadowRadius: interpolate(borderOpacity.value, [0, 1], [0, 8]),
      shadowOffset: { width: 0, height: 0 },
    };
  });

  // --- SHAKE (invalid) STYLE ---
  const shakingBgStyle = useAnimatedStyle(() => ({
    backgroundColor: isShaking ? "rgba(255, 60, 60, 0.25)" : "transparent",
    borderColor: isShaking ? "rgba(255, 60, 60, 0.8)" : "transparent",
    borderWidth: isShaking ? 2 : 0,
    transform: [{ scale: isShaking ? 1.05 : 1 }],
  }));

  // --- NUMBER ANIMATION STYLE ---
  const numberStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }, { scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Pressable
      onPress={() => !isFaded && onPress(row, col, value)}
      disabled={isFaded}
      style={{ flex: 1, width: "100%" }}
    >
      <Animated.View style={[styles.cellWrapper, cellContainerStyle]}>
        {/* Red flash background for invalid move */}
        <Animated.View
          style={[StyleSheet.absoluteFill, shakingBgStyle, { borderRadius: 4 }]}
        />

        {/* Number */}
        {value != null && (
          <Animated.View style={[styles.numberContainer, numberStyle]}>
            <Text
              style={[
                styles.text,
                {
                  fontSize,
                  color: isSelected ? "#FFFFFF" : color,
                },
              ]}
            >
              {value}
            </Text>
          </Animated.View>
        )}
      </Animated.View>
    </Pressable>
  );
};

export default GameCell;

const styles = StyleSheet.create({
  cellWrapper: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
    overflow: "visible", // allow glow to extend outside cell
  },
  numberContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
  text: {
    fontWeight: "800",
    fontFamily: "MomoTrustDisplay-Regular",
  },
});

// // GameCell.tsx
// import React, { useEffect } from "react";
// import { Text, StyleSheet, View, Pressable } from "react-native";
// import Animated, {
//   useSharedValue,
//   useAnimatedStyle,
//   withTiming,
//   withSequence,
//   Easing,
//   interpolate,
// } from "react-native-reanimated";

// interface GameCellProps {
//   value: number;
//   row: number;
//   col: number;
//   fontSize?: number;
//   isSelected: boolean;
//   isFaded: boolean;
//   isShaking?: boolean;
//   onPress: (row: number, col: number, value: number) => void;
// }

// const CELL_NUMBER_COLORS = [
//   "#FF6F61",
//   "#FFB400",
//   "#6BCB77",
//   "#4D96FF",
//   "#C77DFF",
//   "#FF4B91",
//   "#FFD93D",
//   "#00C2A8",
//   "#FF8B13",
// ];

// const GameCell: React.FC<GameCellProps> = ({
//   value,
//   fontSize = 36,
//   onPress,
//   row,
//   col,
//   isSelected,
//   isFaded,
//   isShaking = false,
// }) => {
//   const scale = useSharedValue(value != null ? 0 : 0.6);
//   const opacity = useSharedValue(value != null ? 0 : 0);
//   const rotation = useSharedValue(0);
//   const borderOpacity = useSharedValue(0);
//   const bgOpacity = useSharedValue(0);

//   // Number appearance animation
//   useEffect(() => {
//     if (value != null && !isFaded) {
//       opacity.value = withSequence(
//         withTiming(0, { duration: 0 }),
//         withTiming(1, {
//           duration: 400,
//           easing: Easing.out(Easing.cubic),
//         })
//       );
//       scale.value = withSequence(
//         withTiming(0.3, { duration: 0 }),
//         withTiming(1.2, {
//           duration: 250,
//           easing: Easing.out(Easing.cubic),
//         }),
//         withTiming(1, {
//           duration: 150,
//           easing: Easing.inOut(Easing.cubic),
//         })
//       );
//     }
//   }, [value, isFaded]);

//   // Faded state animation
//   useEffect(() => {
//     if (isFaded) {
//       opacity.value = withTiming(0.15, {
//         duration: 300,
//         easing: Easing.out(Easing.quad),
//       });
//     }
//   }, [isFaded]);

//   // Selection animation
//   useEffect(() => {
//     if (isSelected) {
//       borderOpacity.value = withTiming(1, { duration: 200 });
//       bgOpacity.value = withTiming(1, { duration: 200 });
//     } else {
//       borderOpacity.value = withTiming(0, { duration: 200 });
//       bgOpacity.value = withTiming(0, { duration: 200 });
//     }
//   }, [isSelected]);

//   // Bell shake animation (shake NUMBER only, not cell)
//   useEffect(() => {
//     if (isShaking) {
//       rotation.value = withSequence(
//         withTiming(6, {
//           duration: 75,
//           easing: Easing.bezier(0.36, 0.07, 0.19, 0.97),
//         }),
//         withTiming(-6, {
//           duration: 75,
//           easing: Easing.bezier(0.36, 0.07, 0.19, 0.97),
//         }),
//         withTiming(4.5, {
//           duration: 75,
//           easing: Easing.bezier(0.36, 0.07, 0.19, 0.97),
//         }),
//         withTiming(-4.5, {
//           duration: 75,
//           easing: Easing.bezier(0.36, 0.07, 0.19, 0.97),
//         }),
//         withTiming(2.5, {
//           duration: 75,
//           easing: Easing.bezier(0.36, 0.07, 0.19, 0.97),
//         }),
//         withTiming(-2.5, {
//           duration: 50,
//           easing: Easing.bezier(0.36, 0.07, 0.19, 0.97),
//         }),
//         withTiming(1, {
//           duration: 30,
//           easing: Easing.bezier(0.36, 0.07, 0.19, 0.97),
//         }),
//         withTiming(0, {
//           duration: 20,
//           easing: Easing.bezier(0.36, 0.07, 0.19, 0.97),
//         })
//       );
//     }
//   }, [isShaking]);

//   const color =
//     value != null
//       ? CELL_NUMBER_COLORS[(value - 1) % CELL_NUMBER_COLORS.length]
//       : "#fff";

//   // Cell container style (border + background)
//   // const cellContainerStyle = useAnimatedStyle(() => {
//   //   const borderColor = color;
//   //   const bgColor = color;

//   //   return {
//   //     borderWidth: interpolate(borderOpacity.value, [0, 1], [0, 3]),
//   //     borderColor: borderColor,
//   //     backgroundColor: `${bgColor}${Math.round(bgOpacity.value * 25)
//   //       .toString(16)
//   //       .padStart(2, "0")}`, // Light shade
//   //     shadowOpacity: borderOpacity.value * 0.5,
//   //     shadowColor: borderColor,
//   //     shadowOffset: { width: 0, height: 0 },
//   //     shadowRadius: interpolate(borderOpacity.value, [0, 1], [0, 8]),
//   //   };
//   // });
//   // const cellContainerStyle = useAnimatedStyle(() => {
//   //   const borderColor = color;
//   //   const bgColor = color;

//   //   // More pronounced border & glow when selected
//   //   const borderWidth = interpolate(borderOpacity.value, [0, 1], [0, 4]);
//   //   const shadowRadius = interpolate(borderOpacity.value, [0, 1], [0, 10]);

//   //   return {
//   //     borderWidth,
//   //     borderColor,
//   //     backgroundColor: isSelected
//   //       ? `${bgColor}33` // translucent background
//   //       : "transparent",
//   //     shadowColor: borderColor,
//   //     shadowOpacity: borderOpacity.value * 0.8,
//   //     shadowRadius,
//   //     shadowOffset: { width: 0, height: 0 },
//   //   };
//   // });
//   const cellContainerStyle = useAnimatedStyle(() => {
//     const borderColor = color;
//     const glowColor = color;

//     return {
//       borderWidth: interpolate(borderOpacity.value, [0, 1], [0, 2.5]),
//       borderColor: borderColor,
//       backgroundColor: isSelected ? `${glowColor}22` : "transparent",
//       shadowColor: glowColor,
//       shadowOpacity: interpolate(borderOpacity.value, [0, 1], [0, 0.4]),
//       shadowRadius: interpolate(borderOpacity.value, [0, 1], [0, 6]),
//       shadowOffset: { width: 0, height: 0 },
//     };
//   });

//   // Number text style (shake + visibility)
//   const numberStyle = useAnimatedStyle(() => ({
//     transform: [
//       {
//         rotate: `${rotation.value}deg`,
//       },
//       { scale: scale.value },
//     ],
//     opacity: opacity.value,
//   }));

//   // Background for shaking cells (light red)
//   // const shakingBgStyle = useAnimatedStyle(() => ({
//   //   backgroundColor: isShaking ? "rgba(255, 100, 100, 0.18)" : "transparent",
//   //   borderColor: isShaking ? color : "transparent",
//   //   borderWidth: isShaking ? 1 : 0,
//   // }));
//   const shakingBgStyle = useAnimatedStyle(() => {
//     const bg = isShaking
//       ? "rgba(255, 60, 60, 0.25)" // semi-transparent red
//       : "transparent";
//     const border = isShaking ? "rgba(255, 80, 80, 0.8)" : "transparent";

//     return {
//       backgroundColor: bg,
//       borderColor: border,
//       borderWidth: isShaking ? 2 : 0,
//       transform: [{ scale: isShaking ? 1.05 : 1 }],
//     };
//   });

//   return (
//     <Pressable
//       onPress={() => !isFaded && onPress(row, col, value)}
//       disabled={isFaded}
//     >
//       <View
//         style={[
//           styles.cellWrapper,
//           cellContainerStyle,
//           {
//             backgroundColor: isSelected ? color + "45" : "transparent",
//           },
//         ]}
//       >
//         {/* Shaking background indicator */}
//         <Animated.View
//           style={[StyleSheet.absoluteFill, shakingBgStyle, { borderRadius: 4 }]}
//         />

//         {/* Cell with border and selection background */}
//         <Animated.View style={[styles.cell, { margin: 2 }, cellContainerStyle]}>
//           {value != null && (
//             <Animated.View style={[styles.numberContainer, numberStyle]}>
//               <Text
//                 style={[
//                   styles.text,
//                   {
//                     fontSize,
//                     color: isSelected ? "#FFFFFF" : color, // White when selected
//                   },
//                 ]}
//               >
//                 {value}
//               </Text>
//             </Animated.View>
//           )}
//         </Animated.View>
//       </View>
//     </Pressable>
//   );
// };

// export default GameCell;

// const styles = StyleSheet.create({
//   cellWrapper: {
//     flex: 1,
//     position: "relative",
//     width: "100%",
//     height: "100%",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   cell: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     borderRadius: 3,
//     width: "100%",
//     height: "100%",
//   },
//   numberContainer: {
//     justifyContent: "center",
//     alignItems: "center",
//     width: "100%",
//     height: "100%",
//   },
//   text: {
//     fontWeight: "800",
//     fontFamily: "MomoTrustDisplay-Regular",
//   },
// });
