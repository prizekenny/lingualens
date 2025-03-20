import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslate } from "../app/api/translate";
import { useLanguage } from "../app/context/LanguageProvider";
import { useFavorites } from "../app/context/FavoritesProvider";
import { getWordDetailForCard } from "../app/database/wordRepository";

const WordCard = ({ wordName, onClose }) => {
  const { translateText } = useTranslate();
  const { language } = useLanguage();
  const { toggleFavorite, isFavoriteExist, favorites } = useFavorites();

  const [translatedWord, setTranslatedWord] = useState("");
  const [wordDetails, setWordDetails] = useState(null);
  const [exampleTranslation, setExampleTranslation] = useState("");
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);

  // 默认用户ID - 与 FavoritesProvider 保持一致
  const DEFAULT_USER_ID = "1";

  // 添加本地化文本对象
  const localizedText = {
    "en-US": {
      noDefinition: "No definition found.",
      example: "Example:",
      noExample: "No example available.",
      close: "Close",
      error: "Error",
      toggleFavoriteError: "Failed to toggle favorite status. Please try again.",
      addedToFavorites: "Added to favorites!",
      removedFromFavorites: "Removed from favorites"
    },
    "zh-CN": {
      noDefinition: "无定义。",
      example: "例句:",
      noExample: "无例句。",
      close: "关闭",
      error: "错误",
      toggleFavoriteError: "无法切换收藏状态，请重试。",
      addedToFavorites: "已添加到收藏！",
      removedFromFavorites: "已从收藏中移除"
    },
    "fr": {
      noDefinition: "Aucune définition trouvée.",
      example: "Exemple:",
      noExample: "Aucun exemple disponible.",
      close: "Fermer",
      error: "Erreur",
      toggleFavoriteError: "Échec de la modification du statut favori. Veuillez réessayer.",
      addedToFavorites: "Ajouté aux favoris !",
      removedFromFavorites: "Retiré des favoris"
    },
    "de": {
      noDefinition: "Keine Definition gefunden.",
      example: "Beispiel:",
      noExample: "Kein Beispiel verfügbar.",
      close: "Schließen",
      error: "Fehler",
      toggleFavoriteError: "Fehler beim Ändern des Favoritenstatus. Bitte versuchen Sie es erneut.",
      addedToFavorites: "Zu Favoriten hinzugefügt!",
      removedFromFavorites: "Aus Favoriten entfernt"
    },
    "ja": {
      noDefinition: "定義が見つかりません。",
      example: "例文:",
      noExample: "例文はありません。",
      close: "閉じる",
      error: "エラー",
      toggleFavoriteError: "お気に入りの状態を変更できませんでした。もう一度お試しください。",
      addedToFavorites: "お気に入りに追加しました！",
      removedFromFavorites: "お気に入りから削除しました"
    },
    "ko": {
      noDefinition: "정의를 찾을 수 없습니다.",
      example: "예문:",
      noExample: "예문이 없습니다.",
      close: "닫기",
      error: "오류",
      toggleFavoriteError: "즐겨찾기 상태 변경에 실패했습니다. 다시 시도해주세요.",
      addedToFavorites: "즐겨찾기에 추가되었습니다!",
      removedFromFavorites: "즐겨찾기에서 제거되었습니다"
    },
    "es": {
      noDefinition: "No se encontró definición.",
      example: "Ejemplo:",
      noExample: "No hay ejemplo disponible.",
      close: "Cerrar",
      error: "Error",
      toggleFavoriteError: "Error al cambiar el estado de favorito. Por favor, inténtelo de nuevo.",
      addedToFavorites: "¡Añadido a favoritos!",
      removedFromFavorites: "Eliminado de favoritos"
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
    const loadWordData = async () => {
      setLoading(true);
      try {
        // 从数据库获取单词详情，而不是API
        const details = await getWordDetailForCard(wordName);
        setWordDetails(details);
        
        // 翻译单词（仍然使用翻译API）
        const translated = await translateText(wordName);
        setTranslatedWord(translated);

        // 如果有例句，则翻译例句
        if (details.definitions[0]?.example) {
          const exampleTranslated = await translateText(
            details.definitions[0].example
          );
          setExampleTranslation(exampleTranslated);
        } else {
          setExampleTranslation("");
        }
      } catch (error) {
        console.error("Error loading word data:", error);
        setWordDetails({
          phonetic: "",
          definitions: [{ definition: "No definition found.", example: "" }],
        });
        setExampleTranslation("");
      }

      // 检查是否已收藏
      setIsFavorited(isFavoriteExist({ word: wordName }));
      setLoading(false);
    };

    loadWordData();
  }, [wordName, language, favorites]);

  const handleToggleFavorite = async () => {
    try {
      // 使用本地数据库的收藏功能
      await toggleFavorite({
        word: wordName,
        translation: translatedWord,
        example: wordDetails?.definitions[0]?.example || "",
        exampleTranslation,
      });

      // 更新收藏状态
      const nowFavorite = isFavoriteExist({ word: wordName });
      setIsFavorited(nowFavorite);
      Alert.alert(
        nowFavorite ? getText("removedFromFavorites") : getText("addedToFavorites")
      );
    } catch (err) {
      console.error("切换收藏状态失败:", err);
      Alert.alert(getText("error"), getText("toggleFavoriteError"));
    }
  };

  return (
    <View
      style={{
        width: "90%",
        backgroundColor: "#1F2937",
        borderRadius: 12,
        padding: 24,
      }}
    >
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-white text-2xl font-bold">
          {wordName} <Text className="text-orange-400">{translatedWord}</Text>
        </Text>
        <TouchableOpacity onPress={handleToggleFavorite}>
          <Ionicons
            name={isFavorited ? "heart" : "heart-outline"}
            size={28}
            color="orange"
          />
        </TouchableOpacity>
      </View>

      {wordDetails?.phonetic ? (
        <Text className="text-gray-400 text-lg mb-4">
          {wordDetails.phonetic}
        </Text>
      ) : null}

      {loading ? (
        <ActivityIndicator color="orange" />
      ) : (
        <View>
          <Text className="text-white text-base mb-2">
            {wordDetails?.definitions[0]?.definition || getText("noDefinition")}
          </Text>
          {wordDetails?.definitions[0]?.example ? (
            <>
              <Text className="text-gray-400 text-sm">
                {getText("example")} {wordDetails.definitions[0].example}
              </Text>
              <Text className="text-orange-400 text-sm mt-1">
                {exampleTranslation}
              </Text>
            </>
          ) : (
            <Text className="text-gray-400 text-sm">{getText("noExample")}</Text>
          )}
        </View>
      )}

      <TouchableOpacity
        onPress={onClose}
        className="mt-4 bg-red-500 rounded-full py-2 px-4 self-center"
      >
        <Text className="text-white text-center font-bold">{getText("close")}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default WordCard;
