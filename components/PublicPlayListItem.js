import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const PublicPlaylistItem = ({ name, cover, artist, duration, onPlay }) => {
  return (
    <View className="flex-row items-center justify-between bg-background mr-2 rounded-lg p-1 shadow-md">
      {/* Cover */}
      <TouchableOpacity onPress={onPlay} className="p-2">
        <Image
          source={{ uri: cover || "https://via.placeholder.com/150" }}
          className="w-12 h-12 rounded-xl"
        />
      </TouchableOpacity>

      {/* Song information */}
      <View className="flex-1 ml-3">
        <Text className="text-base font-bold text-gray-900" numberOfLines={1}>
          {name}
        </Text>
        <Text className="text-sm text-gray-600" numberOfLines={1}>
          {artist}
        </Text>
      </View>

      {/* Song time and fav button */}
      <View className="flex-row items-center">
        <Text className="text-sm text-gray-600 mr-3">
          {formatDuration(duration)}
        </Text>
        <TouchableOpacity>
          <Ionicons name="ellipsis-vertical" size={20} color="gray" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PublicPlaylistItem;

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
