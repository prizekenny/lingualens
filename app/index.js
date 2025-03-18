// import { StyleSheet, Text, View, Button } from "react-native";
// import MainScreen from "./screens/MainScreen";
// import { TracksProvider } from "./context/TrackProvider";

// export default function Page() {
//   return (
//     <View className="flex-1">
//       <MainScreen />
//     </View>
//   );
// }

// import { Redirect } from "expo-router";

// export default function Page() {
//   return <Redirect href="/tabs" />;
// }

import { Redirect } from "expo-router";
import { View, Text, ActivityIndicator, Image } from "react-native";
import { useEffect, useState } from "react";

export default function Page() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#fff",
        }}
      >
        <Image
          source={require("../assets/icon.png")}
          style={{ width: 100, height: 100, marginBottom: 20 }}
        />
        <Text
          style={{
            fontSize: 24,
            fontWeight: "bold",
            color: "#FF914D",
            marginBottom: 10,
          }}
        >
          Welcome to LinguaLens
        </Text>
        <ActivityIndicator size="large" color="#FF914D" />
      </View>
    );
  }

  return <Redirect href="/tabs" />;
}
