import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router"; // Import router for navigation
import { getTracks } from "../api/music"; // Ensure this path is correct
import { useTracks } from "../context/TrackProvider"; // Context for managing tracks

const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [songs, setSongs] = useState([]);
  const [displaySongs, setDisplaySongs] = useState([]);
  const router = useRouter(); // Initialize navigation
  const { setPlayingTrack } = useTracks(); // Context function to set the current track

  const categories = [
    { id: "1", name: "The Best of 2024", image: "https://picsum.photos/200" },
    { id: "2", name: "Holiday", image: "https://picsum.photos/id/15/200" },
    { id: "3", name: "Hip-Hop/Rap", image: "https://picsum.photos/id/20/200" },
    { id: "4", name: "Chill", image: "https://picsum.photos/id/38/200" },
    { id: "5", name: "Relaxing", image: "https://picsum.photos/id/42/200" },
    { id: "6", name: "Top Hits", image: "https://picsum.photos/id/57/200" },
  ];

  useEffect(() => {
    const fetchSongs = async () => {
      const data = await getTracks();
      setSongs(data);
    };
    fetchSongs();
  }, []);

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (text === "") {
      setDisplaySongs([]);
      return;
    }
    const filtered = songs.filter(
      (song) =>
        song.name.toLowerCase().includes(text.toLowerCase()) ||
        song.artist.toLowerCase().includes(text.toLowerCase())
    );
    setDisplaySongs(filtered.length > 0 ? filtered : "noresults");
  };

  const handleSongPress = (song) => {
    setPlayingTrack(song); // Set the selected track as the current track
    router.push("/music"); // Navigate to the music screen
  };

  const handleCategoryPress = () => {
    const randomSongs = songs.sort(() => 0.5 - Math.random()).slice(0, 5);
    setDisplaySongs(randomSongs);
  };

  const handleCancel = () => {
    setSearchQuery("");
    setDisplaySongs([]);
  };

  const handleArtistPress = (artistName) => {
    router.push({
      pathname: "/artist/[name]",
      params: { name: artistName }
    });
  };

  const renderSongItem = ({ item }) => (
    <TouchableOpacity
      className="flex-row items-center border-b border-gray-300 py-2"
      onPress={() => handleSongPress(item)}
    >
      <Image
        source={{ uri: item.cover }}
        className="w-12 h-12 rounded-full mr-4"
      />
      <View className="flex-1">
        <Text className="text-base font-bold text-gray-800">{item.name}</Text>
        <TouchableOpacity onPress={() => handleArtistPress(item.artist)}>
          <Text className="text-sm text-gray-500">{item.artist}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      className="flex-1 m-2 bg-gray-100 rounded-lg shadow-md overflow-hidden"
      onPress={handleCategoryPress}
    >
      <Image source={{ uri: item.image }} className="w-full h-32" />
      <Text className="text-center text-sm font-bold text-gray-800 p-2">
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 px-5 mt-14">
      <View className="my-3">
        <View className="flex-row items-center bg-gray-100 border-2 border-orange-500 rounded-full px-4 h-12">
          <Ionicons name="search" size={20} color="#aaa" className="mr-2" />
          <TextInput
            className="flex-1 text-base text-gray-800 bg-transparent"
            placeholder="Search songs or artists..."
            placeholderTextColor="#aaa"
            value={searchQuery}
            onChangeText={handleSearch}
          />
          <TouchableOpacity onPress={handleCancel}>
            <Text className="text-orange-500 text-base font-bold ml-2">
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={
          displaySongs.length > 0 && displaySongs !== "noresults"
            ? displaySongs
            : categories
        }
        key={
          displaySongs.length > 0 && displaySongs !== "noresults"
            ? "one-column"
            : "two-column"
        } // Change key to force re-render
        keyExtractor={(item) => item.id.toString()}
        renderItem={
          displaySongs.length > 0 && displaySongs !== "noresults"
            ? renderSongItem
            : renderCategoryItem
        }
        numColumns={
          displaySongs.length > 0 && displaySongs !== "noresults" ? 1 : 2
        }
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={
          displaySongs === "noresults" && (
            <View className="flex-1 justify-center items-center mt-5">
              <Text className="text-lg text-gray-500">
                Sorry, there are no relevant results...
              </Text>
            </View>
          )
        }
      />
    </View>
  );
};

export default SearchScreen;
