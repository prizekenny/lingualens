import React from "react";
import { View, Text, Image } from "react-native";

const NewAlbum = ({ album, artist, cover }) => {
  return (
    <View className="flex-row items-center bg-primary rounded-3xl shadow-md p-2">
      {/* Album information on left part */}
      <View className="flex-1 gap-2">
        <Text className="text-xs text-white">New Album</Text>
        <Text className="text-lg font-bold text-white" numberOfLines={2}>
          {album}
        </Text>
        <Text className="text-sm text-white" numberOfLines={1}>
          {artist}
        </Text>
      </View>

      {/* Artist photo on the right part */}
      <View className="relative w-48 h-28 pl-5">
        <Image
          source={{ uri: cover || "https://via.placeholder.com/40" }}
          className="w-full h-full rounded-3xl"
        />
      </View>
    </View>
  );
};

export default NewAlbum;
