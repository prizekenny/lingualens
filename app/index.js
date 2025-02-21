import { StyleSheet, Text, View, Button } from "react-native";
import LoadingScreen from "./screens/LoadingScreen";
import { TracksProvider } from "./context/TrackProvider";

export default function Page() {
  return (
    <View className="flex-1">
      <LoadingScreen />
    </View>
  );
}
