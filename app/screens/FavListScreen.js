import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useFavorites } from "../context/FavoritesProvider";
import { useTranslate } from "../api/translate";
import { useLanguage } from "../context/LanguageProvider";
import { deleteFavorite } from "../api/favorites"; // ⬅ 一定要引入删除API

const FavListScreen = () => {
  const { favorites, refreshFavorites } = useFavorites();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const { translateText } = useTranslate();

  // 添加本地化文本对象
  const localizedText = {
    "en-US": {
      favorites: "Favorites",
      loading: "Loading translations...",
      noFavorites: "No favorites yet.",
      example: "Example:",
      noExample: "No example available.",
      delete: "Remove",
      deleteTitle: "Remove from Favorites",
      deleteConfirm: "Are you sure you want to remove this item from favorites?",
      cancel: "Cancel",
      error: "Error",
      deleteError: "Could not remove from favorites. Please try again.",
      loadError: "Could not load favorites. Please try again."
    },
    "zh-CN": {
      favorites: "收藏夹",
      loading: "正在加载翻译...",
      noFavorites: "暂无收藏。",
      example: "例句：",
      noExample: "暂无例句。",
      delete: "移除",
      deleteTitle: "移除收藏",
      deleteConfirm: "确定要将此项从收藏夹中移除吗？",
      cancel: "取消",
      error: "错误",
      deleteError: "从收藏夹移除失败，请重试。",
      loadError: "无法加载收藏列表，请重试。"
    },
    "fr": {
      favorites: "Favoris",
      loading: "Chargement des traductions...",
      noFavorites: "Pas encore de favoris.",
      example: "Exemple :",
      noExample: "Aucun exemple disponible.",
      delete: "Retirer",
      deleteTitle: "Retirer des favoris",
      deleteConfirm: "Voulez-vous vraiment retirer cet élément des favoris ?",
      cancel: "Annuler",
      error: "Erreur",
      deleteError: "Impossible de retirer des favoris. Veuillez réessayer.",
      loadError: "Erreur lors de la chargement des favoris. Veuillez réessayer plus tard."
    },
    "de": {
      favorites: "Favoriten",
      loading: "Übersetzungen werden geladen...",
      noFavorites: "Noch keine Favoriten.",
      example: "Beispiel:",
      noExample: "Kein Beispiel verfügbar.",
      delete: "Entfernen",
      deleteTitle: "Aus Favoriten entfernen",
      deleteConfirm: "Möchten Sie diesen Eintrag wirklich aus den Favoriten entfernen?",
      cancel: "Abbrechen",
      error: "Fehler",
      deleteError: "Konnte nicht aus Favoriten entfernt werden. Bitte versuchen Sie es erneut.",
      loadError: "Fehler beim Laden der Favoriten. Bitte versuchen Sie es später erneut."
    },
    "ja": {
      favorites: "お気に入り",
      loading: "翻訳を読み込み中...",
      noFavorites: "お気に入りはまだありません。",
      example: "例文：",
      noExample: "例文はありません。",
      delete: "解除",
      deleteTitle: "お気に入りから解除",
      deleteConfirm: "このアイテムをお気に入りから解除してもよろしいですか？",
      cancel: "キャンセル",
      error: "エラー",
      deleteError: "お気に入りから解除できませんでした。もう一度お試しください。",
      loadError: "お気に入りの読み込み中にエラーが発生しました。もう一度お試しください。"
    },
    "ko": {
      favorites: "즐겨찾기",
      loading: "번역 로딩 중...",
      noFavorites: "아직 즐겨찾기가 없습니다.",
      example: "예문:",
      noExample: "예문이 없습니다.",
      delete: "해제",
      deleteTitle: "즐겨찾기에서 해제",
      deleteConfirm: "이 항목을 즐겨찾기에서 해제하시겠습니까?",
      cancel: "취소",
      error: "오류",
      deleteError: "즐겨찾기에서 해제할 수 없습니다. 다시 시도해주세요.",
      loadError: "즐겨찾기 로딩 중 오류가 발생했습니다. 나중에 다시 시도해주세요."
    },
    "es": {
      favorites: "Favoritos",
      loading: "Cargando traducciones...",
      noFavorites: "Aún no hay favoritos.",
      example: "Ejemplo:",
      noExample: "No hay ejemplo disponible.",
      delete: "Quitar",
      deleteTitle: "Quitar de favoritos",
      deleteConfirm: "¿Está seguro de que desea quitar este elemento de favoritos?",
      cancel: "Cancelar",
      error: "Error",
      deleteError: "No se pudo quitar de favoritos. Por favor, inténtelo de nuevo.",
      loadError: "Error al cargar favoritos. Por favor, inténtelo de nuevo más tarde."
    }
  };

  // 获取本地化文本的辅助函数
  const getText = (key) => {
    if (localizedText[language]?.[key]) {
      return localizedText[language][key];
    }
    if (language.startsWith("zh") && localizedText["zh-CN"]?.[key]) {
      return localizedText["zh-CN"][key];
    }
    return localizedText["en-US"][key];
  };

  useEffect(() => {
    const loadFavorites = async () => {
      setLoading(true);
      try {
        await refreshFavorites();
      } catch (error) {
        console.error("Error loading favorites:", error);
        Alert.alert(getText("error"), getText("loadError"));
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, [language]);

  const handleDelete = async (id) => {
    Alert.alert(
      getText("deleteTitle"),
      getText("deleteConfirm"),
      [
        { text: getText("cancel"), style: "cancel" },
        {
          text: getText("delete"),
          style: "destructive",
          onPress: async () => {
            try {
              await deleteFavorite(id);
              await refreshFavorites();
            } catch (err) {
              console.error("Failed to delete favorite:", err);
              Alert.alert(getText("error"), getText("deleteError"));
            }
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 px-4 pt-14 bg-white">
      <Text className="text-2xl font-bold mb-4">{getText("favorites")}</Text>
      {loading ? (
        <View className="flex-1 justify-center items-center mt-5">
          <ActivityIndicator size="large" color="#FF914D" />
          <Text className="text-gray-500 mt-2">{getText("loading")}</Text>
        </View>
      ) : favorites.length === 0 ? (
        <Text className="text-gray-500 text-center mt-10">
          {getText("noFavorites")}
        </Text>
      ) : (
        <ScrollView>
          {favorites.map((item, index) => (
            <View
              key={item.id}
              className="mb-6 border-b border-gray-200 pb-4"
            >
              <View className="flex-row justify-between items-center">
                <Text className="text-lg font-semibold text-gray-900">
                  {index + 1}. {item.word}
                </Text>
                <TouchableOpacity
                  onPress={() => handleDelete(item.id)}
                  className="bg-red-500 px-2 py-1 rounded"
                >
                  <Text className="text-white">{getText("delete")}</Text>
                </TouchableOpacity>
              </View>
              <Text className="text-orange-500 text-base mt-1">
                {item.translation}
              </Text>
              <Text className="text-gray-500 text-sm mt-2">{getText("example")}</Text>
              <Text className="text-gray-600 text-sm mt-1 italic">
                {item.example || getText("noExample")}
              </Text>
              {item.exampleTranslation && (
                <Text className="text-orange-400 text-sm mt-1">
                  {item.exampleTranslation}
                </Text>
              )}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

export default FavListScreen;
