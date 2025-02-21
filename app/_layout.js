import { Stack } from "expo-router";
import { NativeWindStyleSheet } from "nativewind";
import { TracksProvider } from "./context/TrackProvider";

export default function Layout() {
  // Without this line, only one tag in className will be output
  NativeWindStyleSheet.setOutput({ default: "native" });
  return (
    <TracksProvider>
      <Stack
        initialRouteName="screens/LoadingScreen"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen
          name="screens/LoadingScreen"
          options={{ title: "Loading", headerShown: false }}
        />
        <Stack.Screen
          name="screens/LoginScreen"
          options={{ title: "Login", headerShown: false }}
        />
        <Stack.Screen
          name="screens/ForgetPasswordScreen"
          options={{ title: "Reset Password", headerShown: false }}
        />
        <Stack.Screen
          name="screens/RegisterScreen"
          options={{ title: "Register Account", headerShown: false }}
        />
        <Stack.Screen name="[tabs]" options={{ headerShown: false }} />
      </Stack>
    </TracksProvider>
  );
}
