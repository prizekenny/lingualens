import { Stack } from "expo-router";
import { NativeWindStyleSheet } from "nativewind";
import { TracksProvider } from "./context/TrackProvider";
import { LanguageProvider } from "./context/LanguageProvider";

export default function Layout() {
  NativeWindStyleSheet.setOutput({ default: "native" });

  return (
    <LanguageProvider>
      <TracksProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="[tabs]" options={{ headerShown: false }} />
        </Stack>
      </TracksProvider>
    </LanguageProvider>
  );
}
