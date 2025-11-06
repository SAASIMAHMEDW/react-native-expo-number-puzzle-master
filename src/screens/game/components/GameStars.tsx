import { useEffect, useMemo } from "react";
import { Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";

const { width: W, height: H } = Dimensions.get("window");
const TOP_ZONE = H * 0.3;

const GameStars = () => {
  const NUM_STARS = 35;

  const stars = useMemo(
    () =>
      Array.from({ length: NUM_STARS }).map((_, i) => ({
        id: i,
        size: Math.random() * 2.5 + 0.5,
        x: Math.random() * W,
        y: Math.random() * TOP_ZONE,
        speed: Math.random() * 30000 + 40000, // very slow drift
        color: Math.random() > 0.8 ? "#ffd700" : "#ffffff",
        baseOpacity: Math.random() * 0.5 + 0.5,
        pulseDuration: Math.random() * 3000 + 2000,
      })),
    []
  );

  return (
    <>
      {stars.map((star) => (
        <Star key={star.id} star={star} />
      ))}
    </>
  );
};

const Star = ({ star }: { star: any }) => {
  const translateX = useSharedValue(star.x);
  const opacity = useSharedValue(star.baseOpacity);
  const scale = useSharedValue(1);

  useEffect(() => {
    // slow movement right -> left
    translateX.value = withRepeat(
      withTiming(-10, {
        duration: star.speed,
        easing: Easing.linear,
      }),
      -1,
      false
    );

    // random glow/pulse
    opacity.value = withRepeat(
      withTiming(Math.random() * 0.5 + 0.3, {
        duration: star.pulseDuration,
        easing: Easing.inOut(Easing.quad),
      }),
      -1,
      true
    );

    scale.value = withRepeat(
      withTiming(Math.random() * 0.3 + 0.8, {
        duration: star.pulseDuration,
        easing: Easing.inOut(Easing.quad),
      }),
      -1,
      true
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    position: "absolute",
    left: translateX.value,
    top: star.y,
    width: star.size,
    height: star.size,
    borderRadius: star.size / 2,
    backgroundColor: star.color,
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return <Animated.View style={style} />;
};

export default GameStars;
