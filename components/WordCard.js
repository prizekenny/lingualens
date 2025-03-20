import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  isFavorite,
  removeFavorite,
  addFavorite,
} from "../app/services/DatabaseService";
import { getWordData } from "../app/services/WordService";

const WordCard = ({ wordName, onClose }) => {
  const [wordDetails, setWordDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    const loadWord = async () => {
      setLoading(true);
      try {
        const data = await getWordData(wordName);
        if (data) {
          setWordDetails(data);
          setIsFavorited(await isFavorite(wordName));
        }
      } catch (error) {
        console.error("❌ 加载单词失败:", error);
      }
      setLoading(false);
    };

    loadWord();
  }, [wordName]);

  // 切换收藏状态
  const handleToggleFavorite = async () => {
    try {
      if (isFavorited) {
        await removeFavorite(wordName);
        setIsFavorited(false);
        Alert.alert("Removed from favorites");
      } else {
        await addFavorite(wordDetails);
        setIsFavorited(true);
        Alert.alert("Added to favorites");
      }
    } catch (err) {
      console.error("❌ 收藏操作失败:", err);
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
        <Text className="text-white text-xl font-bold">{wordName}</Text>
        <TouchableOpacity onPress={handleToggleFavorite}>
          <Ionicons
            name={isFavorited ? "heart" : "heart-outline"}
            size={24}
            color="orange"
          />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color="orange" />
      ) : wordDetails ? (
        <ScrollView
          showsVerticalScrollIndicator={true}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          <Text className="text-orange-400 text-sm mb-3">
            {wordDetails.translation}
          </Text>
          {wordDetails.definitions.length > 0 ? (
            wordDetails.definitions.map((item, index) => (
              <View key={index} className="mb-5">
                <Text className="text-sm text-gray-200">
                  {index + 1}. {item.original}
                </Text>
                <Text className="text-xs text-gray-400 mt-1">
                  {item.translated}
                </Text>
              </View>
            ))
          ) : (
            <Text className="text-sm text-gray-400">
              No definitions available
            </Text>
          )}
        </ScrollView>
      ) : (
        <Text className="text-sm text-gray-400">No data found</Text>
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
