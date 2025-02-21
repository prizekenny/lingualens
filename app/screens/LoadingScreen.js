import { View, Text } from "react-native";
import React, { useEffect } from "react";
import Logo from "../../components/Logo";
import { useRouter } from "expo-router";

const LoadingScreen = () => {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/screens/LoginScreen");
    }, 2000);

    return () => clearTimeout(timer);
  }, []);
  return (
    <View className="flex-1 items-center justify-center">
      <Text className="text-red-600 text-5xl">Loading...</Text>
      <Logo imageSize={100} fontSize={40} />
    </View>
  );
};
export default LoadingScreen;
