import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useTracks } from "../context/TrackProvider"; // 如果你的收藏是保存在 tracks 里
import { useTranslate } from "../api/translate";

const FavoritesScreen = () => {
  const { tracks } = useTracks(); // 假设收藏词存在 tracks
  const favorites = tracks.filter((track) => track.isFavorite); // 按 isFavorite 筛选
  const { translateText } = useTranslate();

  const [translatedFavorites, setTranslatedFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const translateAll = async () => {
      setLoading(true);
      const translatedList = [];

      for (const word of favorites) {
        try {
          const translation = await translateText(word.name);
          translatedList.push({
            english: word.name,
            translation: translation,
            artist: word.artist, // 其他信息可保留
          });
        } catch (err) {
          translatedList.push({
            english: word.name,
            translation: "Translation failed",
            artist: word.artist,
          });
        }
      }

      setTranslatedFavorites(translatedList);
      setLoading(false);
    };

    if (favorites.length > 0) {
      translateAll();
    } else {
      setTranslatedFavorites([]);
      setLoading(false);
    }
  }, [favorites]);

  return (
    <View className="flex-1 px-4 pt-14 bg-white">
      <Text className="text-2xl font-bold mb-4">Favourites</Text>

      {loading ? (
        <View className="flex-1 justify-center items-center mt-5">
          <ActivityIndicator size="large" color="#FF914D" />
          <Text className="text-gray-500 mt-2">Loading translations...</Text>
        </View>
      ) : translatedFavorites.length === 0 ? (
        <Text className="text-gray-500 text-center mt-10">
          No favorites yet.
        </Text>
      ) : (
        <ScrollView>
          {translatedFavorites.map((item, index) => (
            <View key={index} className="mb-6 border-b border-gray-200 pb-4">
              <Text className="text-lg font-semibold text-gray-900">
                {index + 1}. {item.english}
              </Text>
              <Text className="text-orange-500 text-base mt-1">
                {item.translation}
              </Text>
              {item.artist && (
                <Text className="text-sm text-gray-500 mt-1">
                  Example: {item.artist}
                </Text>
              )}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

export default FavoritesScreen;
