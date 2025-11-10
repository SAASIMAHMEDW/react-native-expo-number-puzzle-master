import { StyleSheet } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import Router from "router";

export default function App() {
  return (
    <SafeAreaProvider style={styles.container}>
      <SafeAreaView style={styles.container}>
        <Router />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
