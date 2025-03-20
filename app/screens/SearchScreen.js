import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { fetchWordDetails } from "../api/dictionary";
import { useTranslate } from "../api/translate";
import WordCard from "../../components/WordCard";

const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [wordDetail, setWordDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const { translateText } = useTranslate();

  const handleTranslate = async () => {
    if (searchQuery.trim() === "") return;

    setIsLoading(true);
    setErrorMessage("");

    try {
      const wordDetails = await fetchWordDetails(searchQuery);

      let translatedDefinitions = [];
      for (const def of wordDetails.definitions) {
        try {
          const translatedDefinition = await translateText(def.definition);
          const translatedExample = def.example
            ? await translateText(def.example)
            : "";
          translatedDefinitions.push({
            definition: def.definition,
            translatedDefinition,
            example: def.example,
            exampleTranslation: translatedExample,
          });
        } catch (translationError) {
          translatedDefinitions.push({
            definition: def.definition,
            translatedDefinition: "Translation unavailable",
            example: def.example,
            exampleTranslation: "",
          });
        }
      }

      setWordDetail({
        phonetic: wordDetails.phonetic,
        definitions: translatedDefinitions,
      });
    } catch (error) {
      console.error("Error fetching word details:", error);
      setErrorMessage("Word not found or API error.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setSearchQuery("");
    setWordDetail(null);
    setErrorMessage("");
  };

  return (
    <View className="flex-1 px-5 mt-14">
      <View className="my-3">
        <View className="flex-row items-center bg-gray-100 border-2 border-orange-500 rounded-full px-4 h-12">
          <Ionicons name="search" size={20} color="#aaa" />
          <TextInput
            className="flex-1 pl-2 pb-1 text-base text-gray-800 bg-transparent"
            placeholder="Enter word..."
            placeholderTextColor="#aaa"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity onPress={handleCancel}>
            <Text className="text-orange-500 text-base font-bold ml-2">
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          onPress={handleTranslate}
          className="mt-2 bg-orange-500 rounded-full py-2 px-4"
        >
          <Text className="text-white text-base font-bold text-center">
            Translate
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, alignItems: "center" }}
      >
        {isLoading && (
          <View className="mt-10">
            <ActivityIndicator size="large" color="#FF914D" />
            <Text className="text-base text-gray-800 mt-2">Loading...</Text>
          </View>
        )}

        {errorMessage !== "" && (
          <View className="mt-10">
            <Text className="text-base text-red-500">{errorMessage}</Text>
          </View>
        )}

        {wordDetail && (
          <View className="mt-5 mb-10 w-full items-center">
            <WordCard
              wordName={searchQuery}
              wordDetail={wordDetail}
              onClose={handleCancel}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default SearchScreen;
