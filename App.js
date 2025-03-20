import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { initDatabase } from './app/services/DatabaseService';
import { useEffect } from 'react';

export default function App() {
  useEffect(() => {
    initDatabase()
      .then(() => console.log("数据库初始化成功"))
      .catch(error => console.error("数据库初始化失败:", error));
  }, []);

  return (
    <View style={styles.container}>
      <Text>Open up App.js to start working on your app!</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
