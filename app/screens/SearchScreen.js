import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { translate } from "../api/translate"; // Import translation function
import { fetchWordDetails } from "../api/dictionary"; // Import dictionary function

const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [translatedQuery, setTranslatedQuery] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleTranslate = async () => {
    if (searchQuery.trim() === "") return;

    setIsLoading(true);
    setErrorMessage("");
    setTranslatedQuery([]);

    try {
      const wordDetails = await fetchWordDetails(searchQuery);

      const translatedDefinitions = await Promise.all(
        wordDetails.definitions.map(async (def) => {
          const translatedText = await translate(def.definition);
          return {
            original: def.definition,
            translated: translatedText,
            example: def.example,
          };
        })
      );

      setTranslatedQuery(translatedDefinitions);
    } catch (error) {
      console.error("词典查询错误 Dictionary fetch error:", error);
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setSearchQuery("");
    setTranslatedQuery([]);
    setErrorMessage("");
  };

  return (
    <View className="flex-1 px-5 mt-14">
      <View className="my-3">
        <View className="flex-row items-center bg-gray-100 border-2 border-orange-500 rounded-full px-4 h-12">
          <Ionicons name="search" size={20} color="#aaa" className="mr-2" />
          <TextInput
            className="flex-1 pl-2 pb-1 text-base text-gray-800 bg-transparent"
            placeholder="Enter text to translate..."
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

      {isLoading && (
        <View className="flex-1 justify-center items-center mt-5">
          <Text className="text-lg text-gray-800">Loading...</Text>
        </View>
      )}

      {errorMessage !== "" && (
        <View className="flex-1 justify-center items-center mt-5">
          <Text className="text-lg text-red-500">{errorMessage}</Text>
        </View>
      )}

      {translatedQuery.length > 0 && (
        <View className="flex-1 mt-5">
          {translatedQuery.map((item, index) => (
            <View key={index} className="mb-4">
              <Text className="text-lg text-gray-800">
                {index + 1}. {item.original}
              </Text>
              <Text className="text-lg text-gray-800 mt-2">
                {item.translated}
              </Text>
              {item.example && (
                <Text className="text-sm text-gray-600 mt-2">
                  Example: {item.example}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

export default SearchScreen;
