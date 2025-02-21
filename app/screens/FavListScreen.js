import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import PlaylistItem from "../../components/PlayListItem";
import { useRouter } from "expo-router";
import { useTracks } from "../context/TrackProvider";
import NowPlaying from "../../components/NowPlaying";

const FavListScreen = () => {
  const [isRandom, setIsRandom] = useState(false);
  const router = useRouter();
  const { tracks, setPlayingTrack, updateTrack } = useTracks();

  // Get favorite tracks
  const favoriteTracks = tracks.filter(track => track.favorite);

  // Handle play
  const handlePlay = (track) => {
    setPlayingTrack(track);
    router.push("/music");
  };

  // Toggle favorite status
  const handleToggleFavorite = async (id) => {
    const updatedTrack = tracks.find((track) => track.id === id);
    if (updatedTrack) {
      updateTrack(id, { favorite: !updatedTrack.favorite });
    }
  };

  // Play all tracks
  const handlePlayAll = () => {
    if (favoriteTracks.length > 0) {
      const trackToPlay = isRandom 
        ? favoriteTracks[Math.floor(Math.random() * favoriteTracks.length)]
        : favoriteTracks[0];
      handlePlay(trackToPlay);
    }
  };

  // Toggle random state
  const toggleRandom = () => {
    setIsRandom(!isRandom);
  };

  return (
    <View className="bg-background flex-1 flex-col px-5 pt-8">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-6">
        <Text className="text-2xl font-bold text-textPrimary">Favorite Songs</Text>
        <Text className="text-gray-500">{favoriteTracks.length} songs</Text>
      </View>

      {/* Play Controls */}
      <View className="flex-row items-center justify-between bg-white rounded-xl p-4 mb-6 shadow-sm">
        <TouchableOpacity 
          onPress={handlePlayAll}
          className="flex-row items-center"
        >
          <Ionicons name="play-circle" size={32} color="#4CAF50" />
          <Text className="ml-2 text-lg font-semibold text-textPrimary">
            Play All
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={toggleRandom}
          className="flex-row items-center"
        >
          <Ionicons 
            name={isRandom ? "shuffle" : "shuffle-outline"} 
            size={24} 
            color={isRandom ? "#4CAF50" : "#666"} 
          />
          <Text className={`ml-1 ${isRandom ? "text-green-600" : "text-gray-600"}`}>
            Random
          </Text>
        </TouchableOpacity>
      </View>

      {/* Playlist */}
      <ScrollView
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={true}
        className="gap-2 pb-24"
      >
        {favoriteTracks.length === 0 ? (
          <Text className="text-center text-gray-500 mt-10">
            No favorite songs yet
          </Text>
        ) : (
          favoriteTracks.map((track) => (
            <View key={track.id}>
              <PlaylistItem
                id={track.id}
                name={track.name}
                artist={track.artist}
                duration={track.duration}
                favorite={track.favorite}
                onPlay={() => handlePlay(track)}
                onToggleFavorite={() => handleToggleFavorite(track.id)}
                onArtistPress={() => router.push({
                  pathname: "/artist/[name]",
                  params: { name: track.artist }
                })}
              />
            </View>
          ))
        )}
      </ScrollView>

      {/* Now Playing */}
      <View>
        <NowPlaying />
      </View>
    </View>
  );
};

export default FavListScreen;