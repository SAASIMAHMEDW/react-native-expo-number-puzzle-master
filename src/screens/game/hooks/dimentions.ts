import { useWindowDimensions } from "react-native";

export default function useDimentions() {
  const { height, width } = useWindowDimensions();

  return { height, width };
}
