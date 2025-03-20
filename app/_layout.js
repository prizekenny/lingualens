import { Stack } from "expo-router";
import { NativeWindStyleSheet } from "nativewind";
import { LanguageProvider } from "./context/LanguageProvider";

export default function Layout() {
  NativeWindStyleSheet.setOutput({ default: "native" });

  return (
    <LanguageProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="[tabs]" options={{ headerShown: false }} />
      </Stack>
    </LanguageProvider>
  );
}
