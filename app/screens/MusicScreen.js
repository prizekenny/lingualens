import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import Slider from "@react-native-community/slider";
import { useTracks } from "../context/TrackProvider";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const MusicScreen = () => {
  const {
    playingTrack,
    setPlayingTrack,
    currentTime,
    isPlaying,
    togglePlayPause,
    playNextTrack,
    playPreviousTrack,
    setCurrentTime,
    togglePlayMode,
    playMode,
    updateTrack,
    isTrackInCollection,
    toggleTrackInCollection,
  } = useTracks();

  const router = useRouter();

  // Format time (milliseconds) into mm:ss
  const formatTime = (timeInMs) => {
    const totalSeconds = Math.floor(timeInMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleToggleFavorite = async (id) => {
    if (!isTrackInCollection(playingTrack)) {
      return;
    }
    if (playingTrack) {
      const newTrack = { ...playingTrack, favorite: !playingTrack.favorite };
      updateTrack(id, newTrack);
      setPlayingTrack(newTrack);
    }
  };

  const handleArtistPress = (artistName) => {
    router.push({
      pathname: "/artist/[name]",
      params: { name: artistName }
    });
  };

  if (playingTrack === null) return null;

  return (
    <View className="flex-1 p-4 mt-14">
      {/* Navigation Bar */}
      <View className="flex-row items-center justify-between py-4 px-4 shadow-sm">
        <TouchableOpacity
          onPress={() => {
            if (!isPlaying) setPlayingTrack(null);
            router.back();
          }}
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-xl font-bold">Now Playing</Text>
        <TouchableOpacity>
          <Feather name="more-vertical" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* Album Cover */}
      <View
        className="items-center justify-center mt-16 mb-6"
        style={{ height: "40%" }}
      >
        <Image
          source={{ uri: playingTrack.cover }}
          className="w-96 h-96 mb-4 rounded-xl"
        />
      </View>

      {/* Song Info */}
      <View className="flex-row justify-between items-center mt-4 px-4">
        <View>
          <Text className="text-textPrimary text-xl font-bold">
            {playingTrack.name}
          </Text>
          <TouchableOpacity onPress={() => handleArtistPress(playingTrack.artist)}>
            <Text className="text-textSecondary">{playingTrack.artist}</Text>
          </TouchableOpacity>
        </View>
        {/* Icons Container */}
        <View className="flex-row items-center space-x-3 gap-5">
          <TouchableOpacity
            onPress={() => {
              handleToggleFavorite(playingTrack.id);
            }}
          >
            <Ionicons
              name={playingTrack.favorite ? "heart" : "heart-outline"}
              size={28}
              color={playingTrack.favorite ? "#FF914D" : "gray"}
            />
          </TouchableOpacity>
          {/* Star Icon */}
          <TouchableOpacity
            onPress={() => toggleTrackInCollection(playingTrack)}
          >
            <Ionicons
              name={isTrackInCollection(playingTrack) ? "star" : "star-outline"}
              size={28}
              color={isTrackInCollection(playingTrack) ? "#FF914D" : "gray"}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Progress Bar */}
      <View className="mt-6 px-4">
        <Slider
          minimumValue={0}
          maximumValue={playingTrack.duration} // Duration in ms
          value={currentTime * 1000} // Convert seconds to ms
          minimumTrackTintColor="#FF914D" // Tailwind primary color
          maximumTrackTintColor="#ccc"
          thumbTintColor="#FF914D" // Tailwind primary color
          onValueChange={(value) => setCurrentTime(value / 1000)} // Convert ms to seconds
        />
        <View className="flex-row justify-between mt-2">
          <Text className="text-textSecondary">
            {formatTime(currentTime * 1000)}
          </Text>
          <Text className="text-textSecondary">
            {formatTime(playingTrack.duration - currentTime * 1000)}
          </Text>
        </View>
      </View>

      {/* Playback Controls */}
      <View className="absolute bottom-0 left-0 right-0 px-4 py-6 mb-14">
        <View className="flex-row justify-between items-center px-5">
          {/* Play Mode Button */}
          <TouchableOpacity onPress={togglePlayMode}>
            <Ionicons
              name={
                playMode === "sequential"
                  ? "list-outline"
                  : playMode === "shuffle"
                  ? "shuffle-outline"
                  : "repeat-outline"
              }
              size={28}
              color="#757575"
            />
          </TouchableOpacity>

          {/* Previous Track */}
          <TouchableOpacity onPress={playPreviousTrack}>
            <Ionicons name="play-skip-back" size={40} color="#212121" />
          </TouchableOpacity>

          {/* Play/Pause Button */}
          <TouchableOpacity onPress={togglePlayPause}>
            <Ionicons
              name={isPlaying ? "pause-circle" : "play-circle"}
              size={100}
              color="#FF914D" // Tailwind primary color
            />
          </TouchableOpacity>

          {/* Next Track */}
          <TouchableOpacity onPress={playNextTrack}>
            <Ionicons name="play-skip-forward" size={40} color="#212121" />
          </TouchableOpacity>

          {/* Lyrics Button */}
          <TouchableOpacity>
            <Ionicons name="book-outline" size={28} color="#212121" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default MusicScreen;
