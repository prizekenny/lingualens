import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLanguage } from "../app/context/LanguageProvider";
import { translate } from "../app/api/translate";
import { fetchWordDetails } from "../app/api/dictionary";
import {
  isFavorite,
  addFavorite,
  removeFavorite,
  getFavoriteByWord, // ✅ 从数据库获取单词
} from "../app/services/DatabaseService";

const WordCard = ({ wordName, onClose }) => {
  const { language } = useLanguage();

  const [translatedWord, setTranslatedWord] = useState("");
  const [wordDetails, setWordDetails] = useState(null);
  const [translatedDefinitions, setTranslatedDefinitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    const loadWordData = async () => {
      setLoading(true);
      try {
        console.log(`📌 检查 "${wordName}" 是否在数据库中`);

        let details = await getFavoriteByWord(wordName); // ✅ 先从数据库查询
        if (details) {
          console.log("📌 从数据库获取:", details);
          setTranslatedWord(details.translation || ""); // ✅ 直接使用数据库翻译

          // ✅ 确保 definitions 格式正确
          setTranslatedDefinitions(
            details.definitions.map((def) => ({
              original: def.definition,
              translated: def.translation || "Translation unavailable",
              example: def.example || "",
              exampleTranslation: def.exampleTranslation || "",
            }))
          );
        } else {
          console.log(`📌 "${wordName}" 不在数据库中，使用 API 获取`);
          details = await fetchWordDetails(wordName); // ❌ 不在数据库里，就从 API 获取

          // ✅ 翻译单词
          const translated = await translate(wordName);
          setTranslatedWord(translated);

          // ✅ 翻译所有定义
          const delay = (ms) =>
            new Promise((resolve) => setTimeout(resolve, ms));

          const defs = [];
          if (details?.definitions?.length > 0) {
            for (const def of details.definitions) {
              try {
                await delay(500);
                const translatedText = await translate(def.definition);
                defs.push({
                  original: def.definition,
                  translated: translatedText,
                  example: def.example || "",
                });
              } catch (err) {
                console.error("Translation error:", err.message);
                defs.push({
                  original: def.definition,
                  translated: "Translation unavailable",
                  example: def.example || "",
                });
              }
            }
          } else {
            defs.push({
              original: "No definition available",
              translated: "无可用定义",
              example: "",
            });
          }

          setTranslatedDefinitions(defs);
        }

        setWordDetails(details);
      } catch (error) {
        console.error("❌ 获取单词详情失败:", error);
        setWordDetails({
          phonetic: "",
          definitions: [{ definition: "No definition found.", example: "" }],
        });
        setTranslatedDefinitions([]);
      } finally {
        setLoading(false);
      }
    };

    loadWordData();
  }, [wordName, language]);

  // ✅ **每次打开 WordCard，都检查收藏状态**
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      try {
        const favorited = await isFavorite(wordName);
        setIsFavorited(favorited);
      } catch (error) {
        console.error("❌ 检查收藏状态失败:", error);
      }
    };

    if (wordName) {
      checkFavoriteStatus();
    }
  }, [wordName]);

  // ✅ **切换收藏状态**
  const handleToggleFavorite = async () => {
    if (!wordName || wordName.trim() === "") {
      Alert.alert("Error", "Invalid word name");
      console.error("❌ Error: wordName is empty or invalid.");
      return;
    }

    try {
      const exists = await isFavorite(wordName);

      if (exists) {
        await removeFavorite(wordName);
        setIsFavorited(false);
        Alert.alert("Removed from favorites");
      } else {
        const definitionsArray =
          translatedDefinitions.map((def) => ({
            definition: def.original || "",
            translation: def.translated || "",
            example: def.example || "",
            exampleTranslation: "",
          })) || [];

        await addFavorite({
          word: wordName,
          phonetic: wordDetails?.phonetic || "",
          definitions: definitionsArray,
        });
        setIsFavorited(true);
        Alert.alert("Added to favorites successfully!");
      }
    } catch (err) {
      console.error("❌ 切换收藏状态失败:", err);
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
        maxHeight: "80%",
      }}
    >
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <Text className="text-white text-xl font-bold">{wordName}</Text>
          <Text className="text-orange-400 text-sm ml-2">{translatedWord}</Text>
        </View>
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
        <View style={{ height: 400 }}>
          <ScrollView showsVerticalScrollIndicator={true}>
            {translatedDefinitions.length > 0 ? (
              translatedDefinitions.map((item, index) => (
                <View key={index} className="mb-5">
                  <Text className="text-sm text-gray-200">
                    {index + 1}. {item.original}
                  </Text>
                  <Text className="text-xs text-gray-400 mt-1">
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
                No definitions available
              </Text>
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
