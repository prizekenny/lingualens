import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import Slider from "@react-native-community/slider";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router"; // 导入 useRouter
import { useTracks } from "../app/context/TrackProvider";

const NowPlaying = () => {
  const {
    playingTrack,
    currentTime,
    isPlaying,
    togglePlayPause,
    playNextTrack,
    playPreviousTrack,
    setCurrentTime,
  } = useTracks();
  const router = useRouter(); // 初始化 router

  if (!playingTrack) return null;

  return (
    <View className="absolute bottom-0 bg-white shadow-lg w-full">
      {/* Now Playing Content */}
      <View className="flex-row items-center px-2 pt-2">
        {/* Clickable Album Cover */}
        <TouchableOpacity
          onPress={() => router.push("/music")} // 跳转到 MusicScreen
          style={{ marginRight: 8 }}
        >
          <Image
            source={{ uri: playingTrack.cover }}
            className="w-12 h-12 rounded-lg"
          />
        </TouchableOpacity>

        {/* Song Info */}
        <View className="flex-1 ml-2">
          <Text numberOfLines={1} className="font-bold text-textPrimary">
            {playingTrack.name}
          </Text>
          <Text numberOfLines={1} className="text-textSecondary text-sm">
            {playingTrack.artist}
          </Text>
        </View>

        {/* Playback Controls */}
        <View className="flex-row items-center">
          <TouchableOpacity onPress={playPreviousTrack} style={{ padding: 2 }}>
            <Ionicons name="play-skip-back" size={24} color="gray" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={togglePlayPause}
            className="mx-3"
            style={{ padding: 0 }}
          >
            <Ionicons
              name={isPlaying ? "pause-circle" : "play-circle"}
              size={48}
              color="#FF914D"
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={playNextTrack} style={{ padding: 2 }}>
            <Ionicons name="play-skip-forward" size={24} color="gray" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Progress Bar */}
      <Slider
        minimumValue={0}
        maximumValue={playingTrack.duration / 1000} // Track duration in seconds
        value={currentTime}
        onValueChange={setCurrentTime}
        minimumTrackTintColor="#FF914D" // Primary color
        maximumTrackTintColor="#ccc"
        thumbTintColor="#FF914D"
        style={{ marginHorizontal: 8 }}
      />
    </View>
  );
};

export default NowPlaying;
