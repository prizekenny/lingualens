import { Stack } from "expo-router";
import { NativeWindStyleSheet } from "nativewind";
import { TracksProvider } from "./context/TrackProvider";
import { LanguageProvider } from "./context/LanguageProvider";

export default function Layout() {
  NativeWindStyleSheet.setOutput({ default: "native" });

  return (
    <LanguageProvider>
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
    </LanguageProvider>
  );
}
