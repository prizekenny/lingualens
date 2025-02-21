import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native";
import React, { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import ArtistProfile from "../../components/ArtistProfile";
import AlbumCard from "../../components/AlbumCard";
import PlaylistItem from "../../components/PlayListItem";
import { getNewAlbums, getTracks, updateTrack } from "../api/music";
import { useTracks } from "../context/TrackProvider";
import NowPlaying from "../../components/NowPlaying";

const ArtistScreen = ({ artist }) => {
  const { tracks, setTracks, updateTrack, setPlayingTrack } = useTracks();
  const [artistInfo, setArtistInfo] = useState({
    cover: "https://picsum.photos/200?random=1001",
    artist: artist || "Loading...",
    albumCount: 0,
    songCount: 0,
    biography: "Loading...",
  });
  const [albums, setAlbums] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchArtistData = async () => {
      try {
        const allAlbums = await getNewAlbums();
        
        const tracksData = await getTracks();
        setTracks(tracksData);

        const artistTracks = tracksData.filter(track => track.artist === artist);
        
        if (artistTracks.length > 0) {
          const artistAlbumNames = [...new Set(artistTracks.map(track => track.album))];
          
          const artistAlbums = allAlbums.filter(album => 
            artistAlbumNames.includes(album.name) && album.artist === artist
          );
          
          setAlbums(artistAlbums);
          
          setArtistInfo({
            cover: artistTracks[0].cover,
            artist: artist,
            albumCount: artistAlbumNames.length,
            songCount: artistTracks.length,
            biography: "Artist biography will be updated soon...",
          });
        }
      } catch (error) {
        console.error("Error fetching artist data:", error);
      }
    };

    if (artist) {
      fetchArtistData();
    }
  }, [artist]);

  const handlePlay = (track) => {
    setPlayingTrack(track);
    router.push("/music");
  };

  const handleToggleFavorite = async (id) => {
    const updatedTrack = tracks.find((track) => track.id === id);
    if (updatedTrack) {
      updateTrack(id, { favorite: !updatedTrack.favorite });
    }
  };

  const artistTracks = tracks.filter(track => track.artist === artist);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/[tabs]");
    }
  };

  return (
    <View className="bg-background flex-1">
      {/* Navigation Bar */}
      <View className="flex-row items-center justify-between py-4 px-4 mt-14 shadow-sm">
        <TouchableOpacity
          onPress={handleBack}
          className="p-2"
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-xl font-bold">{artist}</Text>
        <View style={{ width: 24 }} /> {/* Spacer for alignment */}
      </View>

      <ScrollView className="flex-1 px-5 mb-24">
        {/* Artist Profile */}
        <ArtistProfile {...artistInfo} />

        {/* Albums */}
        <View className="mt-6">
          <Text className="text-textPrimary text-xl mb-4">Albums</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={true}
            className="gap-4"
          >
            {albums.length === 0 ? (
              <Text className="text-gray-500">Loading...</Text>
            ) : (
              albums.map((album) => (
                <AlbumCard
                  key={album.id}
                  cover={album.cover}
                  name={album.name}
                  artist={album.artist}
                  onPlay={() => handlePlay(artistTracks.find(t => t.album === album.name))}
                />
              ))
            )}
          </ScrollView>
        </View>

        {/* Popular Songs */}
        <View className="mt-6">
          <Text className="text-textPrimary text-xl mb-4">Popular Songs</Text>
          {artistTracks.length === 0 ? (
            <Text className="text-gray-500">Loading...</Text>
          ) : (
            artistTracks.map((track) => (
              <View key={track.id} className="mb-2">
                <PlaylistItem
                  id={track.id}
                  name={track.name}
                  artist={track.artist}
                  duration={track.duration}
                  favorite={track.favorite}
                  onPlay={() => handlePlay(track)}
                  onToggleFavorite={() => handleToggleFavorite(track.id)}
                />
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Now Playing - Fixed at bottom */}
      <View className="absolute bottom-0 left-0 right-0">
        <NowPlaying />
      </View>
    </View>
  );
};

export default ArtistScreen;