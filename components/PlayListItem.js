import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const PlaylistItem = ({
  id,
  name,
  artist,
  duration,
  favorite,
  onPlay,
  onToggleFavorite,
  onArtistPress,
}) => {
  return (
    <View className="flex-row items-center justify-between bg-background mr-2 rounded-lg p-1 shadow-md">
      {/* Play button */}
      <TouchableOpacity onPress={onPlay} className="p-2">
        <Ionicons name="play" size={24} color="#4CAF50" />
      </TouchableOpacity>

      {/* Song information */}
      <View className="flex-1 ml-3">
        <Text className="text-base font-bold text-gray-900" numberOfLines={1}>
          {name}
        </Text>
        <TouchableOpacity onPress={onArtistPress}>
          <Text className="text-sm text-gray-600" numberOfLines={1}>
            {artist}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Song time and fav button */}
      <View className="flex-row items-center">
        <Text className="text-sm text-gray-600 mr-3">
          {formatDuration(duration)}
        </Text>
        <TouchableOpacity
          onPress={() => {
            onToggleFavorite(id);
          }}
        >
          <Ionicons
            name={favorite ? "heart" : "heart-outline"}
            size={20}
            color={favorite ? "#FF914D" : "gray"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PlaylistItem;

function formatDuration(milliseconds) {
  // Convert milliseconds to total seconds
  const totalSeconds = Math.floor(milliseconds / 1000);

  // Calculate hours, minutes, and remaining seconds
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  // If hours is 0, return mm:ss format
  if (hours === 0) {
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }

  // Otherwise, return full hh:mm:ss format
  const paddedHours = hours.toString().padStart(2, "0");
  const paddedMinutes = minutes.toString().padStart(2, "0");
  const paddedSeconds = seconds.toString().padStart(2, "0");

  return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
}
