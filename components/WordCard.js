import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslate } from "../app/api/translate";
import { useLanguage } from "../app/context/LanguageProvider";
import { useFavorites } from "../app/context/FavoritesProvider";

const WordCard = ({ wordName, wordDetail = {}, onClose }) => {
  const { phonetic = "", definitions = [] } = wordDetail;
  const { translateText } = useTranslate();
  const { language } = useLanguage();
  const { favorites, toggleFavorite, isFavoriteExist } = useFavorites();

  const [translatedWord, setTranslatedWord] = useState("");
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    const doTranslate = async () => {
      setLoading(true);
      const wordResult = await translateText(wordName);
      setTranslatedWord(wordResult);
      setIsFavorited(isFavoriteExist({ word: wordName }));
      setLoading(false);
    };
    doTranslate();
  }, [wordName, language, favorites]);

  const handleToggleFavorite = () => {
    const firstExample = definitions[0]?.example || "";
    const firstExampleTranslation = definitions[0]?.exampleTranslation || "";

    toggleFavorite({
      word: wordName,
      translation: translatedWord,
      example: firstExample,
      exampleTranslation: firstExampleTranslation,
    });
    setIsFavorited(!isFavorited);
    Alert.alert(isFavorited ? "Removed from favorites" : "Added to favorites!");
  };

  return (
    <View
      style={{
        width: "90%",
        backgroundColor: "#1F2937",
        borderRadius: 12,
        padding: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
      }}
    >
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-white text-2xl font-bold">
          {wordName}{" "}
          <Text className="text-orange-400">
            {loading ? "..." : translatedWord}
          </Text>
        </Text>
        <TouchableOpacity onPress={handleToggleFavorite}>
          <Ionicons
            name={isFavorited ? "heart" : "heart-outline"}
            size={28}
            color="orange"
          />
        </TouchableOpacity>
      </View>

      {phonetic && (
        <Text className="text-gray-400 text-lg mb-4">/{phonetic}/</Text>
      )}

      <View>
        {definitions.map((def, index) => (
          <View key={index} className="mb-4">
            <Text className="text-white text-base">
              {index + 1}. {def.definition}
            </Text>
            {def.translatedDefinition && (
              <Text className="text-orange-300 text-sm mt-1">
                {def.translatedDefinition}
              </Text>
            )}
            {def.example && (
              <>
                <Text className="text-gray-400 text-sm mt-1">
                  Example: {def.example}
                </Text>
                {def.exampleTranslation && (
                  <Text className="text-orange-400 text-sm mt-1">
                    {def.exampleTranslation}
                  </Text>
                )}
              </>
            )}
          </View>
        ))}
      </View>

      <TouchableOpacity
        onPress={onClose}
        className="mt-4 bg-red-500 rounded-full py-2 px-4 self-center"
      >
        <Text className="text-white text-center font-bold">Close</Text>
      </TouchableOpacity>
    </View>
  );
};

export default WordCard;
