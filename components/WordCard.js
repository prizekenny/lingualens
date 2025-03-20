import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { translate } from "../app/api/translate"; // 直接导入 translate 函数
import { useLanguage } from "../app/context/LanguageProvider";
import { useFavorites } from "../app/context/FavoritesProvider";
import { fetchWordDetails } from "../app/api/dictionary";

const WordCard = ({ wordName, onClose }) => {
  const { language } = useLanguage();
  const { toggleFavorite, isFavoriteExist, favorites } = useFavorites();

  const [translatedWord, setTranslatedWord] = useState("");
  const [wordDetails, setWordDetails] = useState(null);
  const [translatedDefinitions, setTranslatedDefinitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    const loadWordData = async () => {
      setLoading(true);
      try {
        const details = await fetchWordDetails(wordName);
        setWordDetails(details);
        
        // 只传递一个参数，与 SearchScreen 保持一致
        const translated = await translate(wordName);
        setTranslatedWord(translated);

        // 添加延迟功能以避免API限流
        const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
        
        // 翻译所有定义
        const defs = [];
        if (details && details.definitions && details.definitions.length > 0) {
          // 添加调试信息
          console.log("开始翻译定义, 数量:", details.definitions.length);
          
          for (const def of details.definitions) {
            try {
              // 增加更长的延迟到200ms，进一步减少429错误
              await delay(200);
              const translatedText = await translate(def.definition);
              defs.push({
                original: def.definition,
                translated: translatedText,
                example: def.example
              });
              // 添加调试信息
              console.log("翻译成功:", def.definition.substring(0, 20) + "...");
            } catch (err) {
              console.log("Translation error:", err.message);
              defs.push({
                original: def.definition,
                translated: "Translation unavailable",
                example: def.example
              });
            }
          }
        } else {
          // 如果没有定义，添加一个默认项
          console.log("没有找到定义或定义为空");
          defs.push({
            original: "No definition available",
            translated: "无可用定义",
            example: ""
          });
        }

        // 确保设置翻译定义数组
        console.log("设置翻译定义，数量:", defs.length);
        setTranslatedDefinitions(defs);
      } catch (error) {
        console.error("Word details error:", error);
        setWordDetails({
          phonetic: "",
          definitions: [{ definition: "No definition found.", example: "" }],
        });
        setTranslatedDefinitions([]);
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
        exampleTranslation: translatedDefinitions[0]?.translated || "",
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
        padding: 16,
        maxHeight: '80%'
      }}
    >
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-white text-xl font-bold">
          {wordName} <Text className="text-orange-400">{translatedWord}</Text>
        </Text>
        <TouchableOpacity onPress={handleToggleFavorite}>
          <Ionicons
            name={isFavorited ? "heart" : "heart-outline"}
            size={24}
            color="orange"
          />
        </TouchableOpacity>
      </View>

      {wordDetails?.phonetic ? (
        <Text className="text-gray-400 text-sm mb-3">
          {wordDetails.phonetic}
        </Text>
      ) : null}

      {loading ? (
        <ActivityIndicator color="orange" />
      ) : (
        <View style={{ height: 300 }}>  {/* 添加固定高度容器 */}
          <ScrollView 
            showsVerticalScrollIndicator={true}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            {translatedDefinitions.length > 0 ? (
              translatedDefinitions.map((item, index) => (
                <View key={index} className="mb-5">
                  <Text className="text-sm text-gray-200">
                    {index + 1}. {item.original}
                  </Text>
                  <Text className="text-sm text-gray-400 mt-1">
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
              <Text className="text-sm text-gray-400">No definitions available</Text>
            )}
          </ScrollView>
        </View>
      )}

      <TouchableOpacity
        onPress={onClose}
        className="mt-3 bg-red-500 rounded-full py-2 px-4 self-center"
      >
        <Text className="text-white text-center font-bold">Close</Text>
      </TouchableOpacity>
    </View>
  );
};

export default WordCard;
