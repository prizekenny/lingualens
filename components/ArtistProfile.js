import { View, Text, Image } from "react-native";
import React from "react";

const ArtistProfile = ({
  cover,
  artist,
  albumCount,
  songCount,
  biography,
}) => {
  return (
    <View className="w-full flex-col items-center">
      {/* Artist Image */}
      <Image
        source={{ uri: cover || "https://via.placeholder.com/300" }}
        className="w-full h-48 rounded-3xl"
      />

      {/* Artist information */}
      <View className="mt-4">
        <Text 
          className="text-2xl font-bold text-textPrimary text-center"
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {artist}
        </Text>
        <Text className="text-gray-600 mt-1 text-center">
          {albumCount} Album{albumCount !== 1 ? "s" : ""} · {songCount} Song
          {songCount !== 1 ? "s" : ""}
        </Text>
        <Text 
          className="text-gray-500 text-center mt-3 px-4"
          numberOfLines={3}
          ellipsizeMode="tail"
        >
          {biography}
        </Text>
      </View>
    </View>
  );
};

export default ArtistProfile;