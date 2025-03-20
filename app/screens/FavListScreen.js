import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Modal,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native"; // ✅ 监听屏幕聚焦
import { getAllFavorites, removeFavorite } from "../services/DatabaseService";
import WordCard from "../../components/WordCard";

const FavListScreen = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWord, setSelectedWord] = useState(null);

  // 加载收藏列表
  const fetchFavorites = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllFavorites();
      console.log("📌 获取收藏列表:", data);
      setFavorites(data);
    } catch (error) {
      console.error("❌ 获取收藏列表失败:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ 监听屏幕重新聚焦时，自动刷新收藏列表
  useFocusEffect(
    useCallback(() => {
      fetchFavorites();
    }, [fetchFavorites])
  );

  // 当 WordCard 关闭时，刷新收藏列表
  const handleCloseWordCard = () => {
    setSelectedWord(null);
    fetchFavorites(); // **确保 WordCard 里收藏状态变更后，刷新列表**
  };

  // 删除收藏
  const handleDelete = async (word) => {
    Alert.alert(
      "Delete Favorite",
      `Are you sure you want to remove "${word}" from favorites?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await removeFavorite(word);
              await fetchFavorites(); // **删除成功后，刷新收藏列表**
            } catch (error) {
              console.error("❌ 删除收藏失败:", error);
              Alert.alert(
                "Error",
                "Could not delete favorite. Please try again."
              );
            }
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 px-4 pt-14 bg-white">
      <Text className="text-2xl font-bold mb-4">Favorites</Text>

      {loading ? (
        <View className="flex-1 justify-center items-center mt-5">
          <ActivityIndicator size="large" color="#FF914D" />
          <Text className="text-gray-500 mt-2">Loading favorites...</Text>
        </View>
      ) : favorites.length === 0 ? (
        <Text className="text-gray-500 text-center mt-10">
          No favorites yet.
        </Text>
      ) : (
        <ScrollView>
          {favorites.map((item, index) => (
            <View
              key={item.id || index}
              className="mb-6 border-b border-gray-200 pb-4"
            >
              <View className="flex-row justify-between items-center">
                {/* 点击单词，打开 WordCard */}
                <TouchableOpacity onPress={() => setSelectedWord(item.word)}>
                  <Text className="text-lg font-semibold text-gray-900">
                    {index + 1}. {item.word}
                  </Text>
                </TouchableOpacity>

                {/* 删除按钮 */}
                <TouchableOpacity
                  onPress={() => handleDelete(item.word)}
                  className="bg-red-500 px-2 py-1 rounded-lg"
                >
                  <Text className="text-white">Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* 弹出 WordCard */}
      <Modal visible={selectedWord !== null} transparent animationType="fade">
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          {selectedWord && (
            <WordCard wordName={selectedWord} onClose={handleCloseWordCard} />
          )}
        </View>
      </Modal>
    </View>
  );
};

export default FavListScreen;
