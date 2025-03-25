import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getWordData } from "../services/WordService";
import WordCard from "../../components/WordCard";

const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [wordData, setWordData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // 🔹 处理查询
  const handleSearch = async () => {
    if (searchQuery.trim() === "") return;

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
            onSubmitEditing={handleSearch} // ⌨️ 回车等于点按钮
            returnKeyType="search"
          />
          {searchQuery !== "" && (
            <TouchableOpacity onPress={handleCancel} className="mr-2">
              <Ionicons name="close-circle" size={22} color="#DC2626" />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={handleSearch}>
            <Text className="text-orange-500 font-bold">Translate</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 🔹 显示查询结果 */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={true}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {errorMessage !== "" && (
          <View className="flex-1 justify-center items-center mt-5">
            <Text className="text-base text-red-500">{errorMessage}</Text>
          </View>
        )}

        {wordData && wordData.word && (
          <View className="items-center mt-5 pb-10">
            <WordCard wordName={wordData.word} />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default SearchScreen;
