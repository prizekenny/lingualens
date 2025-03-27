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
import { useTranslation } from "../i18n/useTranslation";

import { Pressable } from "react-native";

const FavListScreen = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWord, setSelectedWord] = useState(null);
  const { t } = useTranslation();

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
      t("favorites.deleteTitle"),
      t("favorites.deleteConfirm", { word: word }),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: async () => {
            try {
              await removeFavorite(word);
              await fetchFavorites();
            } catch (error) {
              console.error("❌ 删除收藏失败:", error);
              Alert.alert(t("common.error"), t("favorites.deleteError"));
            }
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 px-4 pt-14 bg-white">
      <Text className="text-2xl font-bold mb-4">{t("favorites.title")}</Text>

      {loading ? (
        <View className="flex-1 justify-center items-center mt-5">
          <ActivityIndicator size="large" color="#FF914D" />
          <Text className="text-gray-500 mt-2">{t("favorites.loading")}</Text>
        </View>
      ) : favorites.length === 0 ? (
        <Text className="text-gray-500 text-center mt-10">
          {t("favorites.empty")}
        </Text>
      ) : (
        <ScrollView className="pr-5">
          {favorites.map((item, index) => (
            <View
              key={item.id || index}
              className="mb-6 border-b border-gray-200 pb-4"
            >
              <View className="flex-row justify-between items-center">
                {/* 点击单词，打开 WordCard */}
                <TouchableOpacity onPress={() => setSelectedWord(item.word)}>
                  <Text className="text-lg font-semibold text-gray-900">
                    {item.word}
                  </Text>
                </TouchableOpacity>

                {/* 删除按钮 */}
                <TouchableOpacity
                  onPress={() => handleDelete(item.word)}
                  className="bg-red-500 px-2 py-1 rounded-lg"
                >
                  <Text className="text-white">{t("common.delete")}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* 弹出 WordCard */}
      <Modal visible={selectedWord !== null} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          {/* 点击遮罩关闭 */}
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

          {/* 点击卡片不会触发关闭 */}
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
            {selectedWord && (
              <WordCard wordName={selectedWord} onClose={handleCloseWordCard} />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default FavListScreen;
