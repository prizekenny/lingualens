import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { fetchWordDetails } from "../api/dictionary"; // 保留字典查询
import { useTranslate } from "../api/translate"; // 使用封装好的翻译 Hook

const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [translatedQuery, setTranslatedQuery] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const { translateText } = useTranslate(); // 动态获取翻译函数

  const handleTranslate = async () => {
    if (searchQuery.trim() === "") return;

    setIsLoading(true);
    setErrorMessage("");
    setTranslatedQuery([]);

    try {
      const wordDetails = await fetchWordDetails(searchQuery);

      const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

      let translatedDefinitions = [];
      for (const def of wordDetails.definitions) {
        try {
          const translatedText = await translateText(def.definition);
          translatedDefinitions.push({
            original: def.definition,
            translated: translatedText,
            example: def.example,
          });
          await delay(50); // 稍微大一点的延迟，避免API过载
        } catch (translationError) {
          console.log("Translation error:", translationError.message);
          translatedDefinitions.push({
            original: def.definition,
            translated: "Translation unavailable",
            example: def.example,
          });
        }
      }

      setTranslatedQuery(translatedDefinitions);
    } catch (error) {
      if (!error.message.includes("429")) {
        console.error("Dictionary fetch error:", error);
        setErrorMessage(error.message);
      } else {
        console.log("API rate limit exceeded:", error.message);
        setErrorMessage("Translation service is busy, please try again later.");
      }
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
      {/* 搜索区域 */}
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

      {/* 翻译结果 */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={true}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {isLoading && (
          <View className="flex-1 justify-center items-center mt-5">
            <Text className="text-base text-gray-800">Loading...</Text>
          </View>
        )}

        {errorMessage !== "" && (
          <View className="flex-1 justify-center items-center mt-5">
            <Text className="text-base text-red-500">{errorMessage}</Text>
          </View>
        )}

        {translatedQuery.length > 0 && (
          <View className="mt-5 pb-10">
            {translatedQuery.map((item, index) => (
              <View key={index} className="mb-6">
                <Text className="text-sm text-gray-800">
                  {index + 1}. {item.original}
                </Text>
                <Text className="text-sm text-orange-500 mt-1">
                  {item.translated}
                </Text>
                {item.example && (
                  <Text className="text-xs text-gray-500 mt-1">
                    Example: {item.example}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default SearchScreen;
