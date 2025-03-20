import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useTranslate } from "../api/translate";
import { useLanguage } from "../context/LanguageProvider";

const FavListScreen = () => {
  const { translateText } = useTranslate();
  const { language } = useLanguage();
  const [translatedFavorites, setTranslatedFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const processFavorites = async () => {
      setLoading(true);

      const translations = await Promise.all(
        favorites.map(async (fav) => {
          if (fav.translation && fav.exampleTranslation) {
            return { ...fav };
          }
          try {
            const [translatedWord, translatedExample] = await Promise.all([
              translateText(fav.word),
              translateText(fav.example || ""),
            ]);
            return {
              ...fav,
              translation: translatedWord,
              exampleTranslation: translatedExample,
            };
          } catch (err) {
            console.error("Translation failed for:", fav.word, err);
            return {
              ...fav,
              translation: "Translation failed",
              exampleTranslation: "",
            };
          }
        })
      );

      setTranslatedFavorites(translations);
      setLoading(false);
    };

    if (favorites.length > 0) {
      processFavorites();
    } else {
      setTranslatedFavorites([]);
      setLoading(false);
    }
  }, [favorites, language]);

  const handleDelete = async (id) => {
    Alert.alert(
      "Delete Favorite",
      "Are you sure you want to delete this favorite?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteFavorite(id);
              await refreshFavorites(); // 删除后刷新列表
            } catch (err) {
              console.error("Failed to delete favorite:", err);
              Alert.alert(
                "Error",
                "Could not delete favorite. Please try again."
              );
            }
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 px-4 pt-14 bg-white">
      <Text className="text-2xl font-bold mb-4">Favorites</Text>
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
            <View
              key={item.id || index}
              className="mb-6 border-b border-gray-200 pb-4"
            >
              <View className="flex-row justify-between items-center">
                <Text className="text-lg font-semibold text-gray-900">
                  {index + 1}. {item.word}
                </Text>
                <TouchableOpacity
                  onPress={() => handleDelete(item.id)}
                  className="bg-red-500 px-2 py-1 rounded"
                >
                  <Text className="text-white">Delete</Text>
                </TouchableOpacity>
              </View>
              <Text className="text-orange-500 text-base mt-1">
                {item.translation}
              </Text>
              <Text className="text-gray-500 text-sm mt-2">Example:</Text>
              <Text className="text-gray-600 text-sm mt-1 italic">
                {item.example || "No example available."}
              </Text>
              {item.exampleTranslation && (
                <Text className="text-orange-400 text-sm mt-1">
                  {item.exampleTranslation}
                </Text>
              )}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

export default FavListScreen;
