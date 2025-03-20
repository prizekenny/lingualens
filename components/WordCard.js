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
import { fetchWordDetails } from "../app/api/dictionary";

const WordCard = ({ wordName, onClose }) => {
  const { translateText } = useTranslate();
  const { language } = useLanguage();
  const { toggleFavorite, isFavoriteExist, favorites } = useFavorites();

  const [translatedWord, setTranslatedWord] = useState("");
  const [wordDetails, setWordDetails] = useState(null);
  const [exampleTranslation, setExampleTranslation] = useState("");
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    const loadWordData = async () => {
      setLoading(true);
      try {
        const details = await fetchWordDetails(wordName);
        setWordDetails(details);
        const translated = await translateText(wordName);
        setTranslatedWord(translated);

        if (details.definitions[0]?.example) {
          const exampleTranslated = await translateText(
            details.definitions[0].example
          );
          setExampleTranslation(exampleTranslated);
        } else {
          setExampleTranslation("");
        }
      } catch (error) {
        setWordDetails({
          phonetic: "",
          definitions: [{ definition: "No definition found.", example: "" }],
        });
        setExampleTranslation("");
      }

      setIsFavorited(isFavoriteExist({ word: wordName }));
      setLoading(false);
    };

    loadWordData();
  }, [wordName, language, favorites]);

  const handleToggleFavorite = async () => {
    try {
      await toggleFavorite({
        word: wordName,
        translation: translatedWord,
        example: wordDetails?.definitions[0]?.example || "",
        exampleTranslation,
      });

      const nowFavorite = isFavoriteExist({ word: wordName });
      setIsFavorited(nowFavorite);
      Alert.alert(
        nowFavorite ? "Added to favorites!" : "Removed from favorites"
      );
    } catch (err) {
      console.error("Toggle favorite failed:", err);
      Alert.alert("Error", "Could not toggle favorite. Please try again.");
    }
  };

  return (
    <View
      style={{
        width: "90%",
        backgroundColor: "#1F2937",
        borderRadius: 12,
        padding: 24,
      }}
    >
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-white text-2xl font-bold">
          {wordName} <Text className="text-orange-400">{translatedWord}</Text>
        </Text>
        <TouchableOpacity onPress={handleToggleFavorite}>
          <Ionicons
            name={isFavorited ? "heart" : "heart-outline"}
            size={28}
            color="orange"
          />
        </TouchableOpacity>
      </View>

      {wordDetails?.phonetic ? (
        <Text className="text-gray-400 text-lg mb-4">
          {wordDetails.phonetic}
        </Text>
      ) : null}

      {loading ? (
        <ActivityIndicator color="orange" />
      ) : (
        <View>
          <Text className="text-white text-base mb-2">
            {wordDetails?.definitions[0]?.definition || "No definition."}
          </Text>
          {wordDetails?.definitions[0]?.example ? (
            <>
              <Text className="text-gray-400 text-sm">
                Example: {wordDetails.definitions[0].example}
              </Text>
              <Text className="text-orange-400 text-sm mt-1">
                {exampleTranslation}
              </Text>
            </>
          ) : (
            <Text className="text-gray-400 text-sm">No example available.</Text>
          )}
        </View>
      )}

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
