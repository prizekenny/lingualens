import { View, Text, Image, ScrollView } from "react-native";

import { useTracks } from "../context/TrackProvider";
import PublicPlaylistItem from "../../components/PublicPlayListItem";
import { useRouter } from "expo-router";

const ProfileScreen = () => {
  const { tracks, setPlayingTrack } = useTracks();

  const router = useRouter();
  const handlePlay = (track) => {
    setPlayingTrack(track);
    router.push("/music");
  };

  return (
    <ScrollView className="flex-1 bg-background">
      {/* Top Section */}
      <View className="bg-white rounded-b-3xl shadow-md p-6 items-center pt-14">
        <Image
          source={{ uri: "https://picsum.photos/200?random=1001" }}
          className="w-24 h-24 rounded-full mb-4"
        />
        <Text className="text-textSecondary">soroushnorozynui@gmail.com</Text>
        <Text className="text-textPrimary text-xl font-bold">Soroushnrz</Text>
        <View className="flex-row justify-around w-full mt-4">
          <View className="items-center">
            <Text className="text-textPrimary font-bold">778</Text>
            <Text className="text-textSecondary">Followers</Text>
          </View>
          <View className="items-center">
            <Text className="text-textPrimary font-bold">243</Text>
            <Text className="text-textSecondary">Following</Text>
          </View>
        </View>
      </View>

      {/* Public Playlists Section */}
      <View className="p-4">
        <Text className="text-textPrimary text-lg font-bold mb-4">
          Public Playlists
        </Text>
        {tracks.length == 0 && <p>No Data</p>}
        {tracks.length > 0 && (
          <ScrollView
            showsVerticalScrollIndicator={true}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={true}
            contentContainerStyle={{ paddingBottom: 20 }}
            className="gap-2 pb-24"
          >
            {tracks.length == 0 && <Text>Loading...</Text>}
            {tracks
              .filter((track) => track.favorite)
              .map((track, index) => (
                /* must use View to wrap PlaylistItem, otherwise the parent gap does not work */
                <View key={index}>
                  <PublicPlaylistItem
                    id={track.id}
                    name={track.name}
                    cover={track.cover}
                    artist={track.artist}
                    duration={track.duration}
                    favorite={track.favorite}
                    onPlay={() => handlePlay(track)}
                  />
                </View>
              ))}
          </ScrollView>
        )}
      </View>
    </ScrollView>
  );
};

export default ProfileScreen;
