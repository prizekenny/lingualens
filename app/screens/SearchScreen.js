import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getWordData } from "../services/WordService";
import WordCard from "../../components/WordCard";
import { useTranslation } from "../i18n/useTranslation";
import { TouchableWithoutFeedback } from "react-native";

import { Pressable } from "react-native";

const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [wordData, setWordData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showWordCard, setShowWordCard] = useState(false);
  const { t } = useTranslation();

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
        // setShowWordCard(true); // 显示单词卡
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
    setShowWordCard(false);
  };

  // 关闭词卡
  const handleCloseWordCard = () => {
    setShowWordCard(false);
  };

  return (
    <View className="flex-1 px-5 mt-14">
      {/* 🔹 搜索框 */}
      <View className="my-3">
        <View className="flex-row items-center bg-gray-100 border-2 border-orange-500 rounded-full px-4 h-12">
          <Ionicons name="search" size={20} color="#aaa" className="mr-2" />
          <TextInput
            className="flex-1 pl-2 pb-1 text-base text-gray-800 bg-transparent"
            placeholder={t("search.placeholder")}
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
            <Text className="text-orange-500 font-bold">
              {t("common.translate")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 🔹 显示查询结果摘要 */}
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
            <TouchableOpacity
              onPress={() => setShowWordCard(true)}
              className="bg-gray-100 p-4 rounded-lg w-full"
            >
              <Text className="text-lg font-bold">{wordData.word}</Text>
              <Text className="text-sm text-gray-600">
                {wordData.translation?.substring(0, 100)}...
              </Text>
              <Text className="text-orange-500 mt-2">
                {t("search.viewDetails")}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* 单词卡弹窗 */}
      {showWordCard && wordData?.word && (
        <Modal visible={showWordCard} transparent animationType="fade">
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "rgba(0,0,0,0.5)",
            }}
          >
            {/* 点击遮罩区域关闭 */}
            <Pressable
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
              }}
              onPress={handleCloseWordCard}
            />

            {/* 卡片容器，设置最大高度和边距 */}
            <View
              style={{
                width: "90%",
                maxHeight: "70%",
                backgroundColor: "#1F2937",
                borderRadius: 12,
                paddingVertical: 6,
                paddingHorizontal: 6,
              }}
            >
              <WordCard
                wordName={wordData.word}
                onClose={handleCloseWordCard}
              />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

export default SearchScreen;
