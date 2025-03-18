import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { useFavorites } from "../context/FavoritesProvider";
import { useTranslate } from "../api/translate";
import { useLanguage } from "../context/LanguageProvider";

const FavListScreen = () => {
  const { favorites } = useFavorites();
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
            return {
              english: fav.word,
              translation: fav.translation,
              example: fav.example || "No example available.",
              exampleTranslation: fav.exampleTranslation,
            };
          }

          try {
            const translatedWord = await translateText(fav.word);
            const translatedExample = await translateText(fav.example || "");
            return {
              english: fav.word,
              translation: translatedWord,
              example: fav.example || "No example available.",
              exampleTranslation: translatedExample,
            };
          } catch (err) {
            console.error("Translation failed for:", fav.word, err);
            return {
              english: fav.word,
              translation: "Translation failed",
              example: fav.example || "No example available.",
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
  }, [favorites, language]); // 放在外层 useEffect 的依赖数组

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
            <View key={index} className="mb-6 border-b border-gray-200 pb-4">
              <Text className="text-lg font-semibold text-gray-900">
                {index + 1}. {item.english}
              </Text>
              <Text className="text-orange-500 text-base mt-1">
                {item.translation}
              </Text>
              <Text className="text-gray-500 text-sm mt-2">Example:</Text>
              <Text className="text-gray-600 text-sm mt-1 italic">
                {item.example}
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
