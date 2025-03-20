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
import { getWordData } from "../services/WordService"; // ✅ 使用wordService获取数据

const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [wordData, setWordData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // 🔹 处理查询
  const handleSearch = async () => {
    if (searchQuery.trim() === "") return;

    setIsLoading(true);
    setErrorMessage("");
    setWordData(null);

    try {
      const fetchedWordData = await getWordData(searchQuery);
      if (fetchedWordData) {
        console.log("📌 查询到的单词数据:", fetchedWordData);
        setWordData(fetchedWordData);
      } else {
        setErrorMessage("No definition found.");
      }
    } catch (error) {
      console.error("❌ 查询失败:", error);
      setErrorMessage("Failed to fetch word data.");
    } finally {
      setIsLoading(false);
    }
  };

  // 🔹 清空搜索框
  const handleCancel = () => {
    setSearchQuery("");
    setWordData(null);
    setErrorMessage("");
  };

  return (
    <View className="flex-1 px-5 mt-14">
      {/* 🔹 搜索框 */}
      <View className="my-3">
        <View className="flex-row items-center bg-gray-100 border-2 border-orange-500 rounded-full px-4 h-12">
          <Ionicons name="search" size={20} color="#aaa" className="mr-2" />
          <TextInput
            className="flex-1 pl-2 pb-1 text-base text-gray-800 bg-transparent"
            placeholder="Enter a word..."
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
          onPress={handleSearch}
          className="mt-2 bg-orange-500 rounded-full py-2 px-4"
        >
          <Text className="text-white text-base font-bold text-center">
            Search
          </Text>
        </TouchableOpacity>
      </View>

      {/* 🔹 显示查询结果 */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={true}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {isLoading && (
          <View className="flex-1 justify-center items-center mt-5">
            <ActivityIndicator size="large" color="#FF914D" />
            <Text className="text-base text-gray-800 mt-2">Loading...</Text>
          </View>
        )}

        {errorMessage !== "" && (
          <View className="flex-1 justify-center items-center mt-5">
            <Text className="text-base text-red-500">{errorMessage}</Text>
          </View>
        )}

        {/* 🔹 显示单词详情 */}
        {wordData && (
          <View className="mt-5 pb-10">
            {/* 显示音标 */}
            {wordData.phonetic && (
              <Text className="text-sm text-gray-500 mb-3">
                {wordData.word} {wordData.phonetic}
              </Text>
            )}

            {/* 显示定义列表 */}
            {wordData.definitions.length > 0 ? (
              wordData.definitions.map((item, index) => (
                <View key={index} className="mb-6">
                  <Text className="text-sm text-gray-800">
                    {index + 1}. {item.original}
                  </Text>
                  <Text className="text-sm text-gray-600 mt-1">
                    {item.translated}
                  </Text>
                  {item.example && (
                    <Text className="text-xs text-gray-500 mt-1">
                      Example: {item.example}
                    </Text>
                  )}
                </View>
              ))
            ) : (
              <Text className="text-sm text-gray-400">
                No definitions available.
              </Text>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default SearchScreen;
