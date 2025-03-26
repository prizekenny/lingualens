import { Stack } from "expo-router";
import { LanguageProvider } from "./context/LanguageProvider";

export default function Layout() {
  return (
    <LanguageProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="[tabs]" options={{ headerShown: false }} />
      </Stack>
    </LanguageProvider>
  );
}
