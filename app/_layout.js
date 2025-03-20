import { Stack } from "expo-router";
import { NativeWindStyleSheet } from "nativewind";
import { FavoritesProvider } from "./context/FavoritesProvider";
import { LanguageProvider } from "./context/LanguageProvider";

export default function Layout() {
  NativeWindStyleSheet.setOutput({ default: "native" });

  return (
    <LanguageProvider>
      <FavoritesProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="[tabs]" options={{ headerShown: false }} />
        </Stack>
      </FavoritesProvider>
    </LanguageProvider>
  );
}
