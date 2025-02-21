import { View, Text, Image } from "react-native";
import React from "react";
import { APP_NAME } from "../config/constants";
import { useFonts } from "expo-font";

const Logo = ({
  imageSize = 50,
  fontSize = 24,
  color = "text-primary",
  spacing = 2,
}) => {
  const [fontsLoaded] = useFonts({
    FredokaOne: require("../assets/fonts/FredokaOne-Regular.ttf"),
  });

  if (!fontsLoaded) {
    return <Text>"FredokaOne font loads failed!</Text>;
  }

  return (
    <View className="flex-row items-center">
      <View
        style={{
          width: imageSize - 20,
          height: imageSize,
          overflow: "hidden",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Image
          source={require("../assets/icon.png")}
          style={{
            width: imageSize * 1.5,
            height: imageSize,
            resizeMode: "cover",
          }}
        />
      </View>
      <Text
        className={`${color} ml-${spacing}`}
        style={{
          fontFamily: "FredokaOne",
          fontSize: fontSize,
        }}
      >
        {APP_NAME}
      </Text>
    </View>
  );
};

export default Logo;
