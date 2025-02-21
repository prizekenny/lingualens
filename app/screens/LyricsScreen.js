import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";

const LyricsScreen = ({ route, navigation }) => {
  const { song } = route.params;

  const lyrics = [
    `Lyrics for ${song.name} by ${song.artist}`,
    "Line 1 of lyrics...",
    "Line 2 of lyrics...",
    "Line 3 of lyrics...",
    "Line 4 of lyrics...",
  ];

  return (
    <View className="flex-1 bg-background p-4">
      <ScrollView>
        {lyrics.map((line, index) => (
          <Text key={index} className="text-textPrimary mb-2">
            {line}
          </Text>
        ))}
      </ScrollView>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        className="mt-4 bg-secondary p-4 rounded"
      >
        <Text className="text-white text-center">Back to Music</Text>
      </TouchableOpacity>
    </View>
  );
};

export default LyricsScreen;
