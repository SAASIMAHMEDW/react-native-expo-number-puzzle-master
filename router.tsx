import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MainGameScreen from "@screens/game";
import MainHomeScreen from "@screens/home";
import { RootStackParamList } from "@shared/types";

const Stack = createNativeStackNavigator<RootStackParamList>();
export default function Router() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Home"
          component={MainHomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Game"
          component={MainGameScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
