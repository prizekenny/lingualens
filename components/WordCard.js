import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  isFavorite,
  removeFavorite,
  addFavorite,
} from "../app/services/DatabaseService";
import { getWordData } from "../app/services/WordService";
import { useLanguage } from "../app/context/LanguageProvider";

const WordCard = ({ wordName, onClose }) => {
  const [wordDetails, setWordDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: "" });
  const [fadeAnim] = useState(new Animated.Value(0));
  // const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();

  useEffect(() => {
    const loadWord = async () => {
      setLoading(true);
      try {
        const data = await getWordData(wordName, language || "en");
        if (data) {
          setWordDetails(data);
          setIsFavorited(await isFavorite(wordName));
        }
      } catch (error) {
        console.error(`❌ ${t("error.loadWordFailed")}`, error);
      }
      setLoading(false);
    };

    loadWord();
  }, [wordName, language]);

  // 显示自动消失的提示消息
  const showToast = (message) => {
    setToast({ visible: true, message });

    // 淡入动画
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // 设置定时器，2秒后自动隐藏
    setTimeout(() => {
      // 淡出动画
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setToast({ visible: false, message: "" });
      });
    }, 2000);
  };

  // 切换收藏状态
  const handleToggleFavorite = async () => {
    try {
      if (isFavorited) {
        await removeFavorite(wordName);
        setIsFavorited(false);
        showToast(t("toast.removedFromFavorites"));
      } else {
        await addFavorite({ ...wordDetails, language });
        setIsFavorited(true);
        showToast(t("toast.addedToFavorites"));
      }
    } catch (err) {
      console.error(`❌ ${t("error.favoriteOperationFailed")}`, err);
    }
  };

  const isPopup = !!onClose;

  return (
    <View
      style={[
        !isPopup
          ? {
              flex: 1,
              width: "100%",
              padding: 2,
            }
          : {
              width: "100%",
              backgroundColor: "#1F2937",
              borderRadius: 12,
              padding: 12,
              maxHeight: "100%",
              minWidth: "100%",
              maxWidth: "100%",
              width: "90%",
            },
      ]}
    >
      <View className="flex-row items-center justify-between mb-3">
        <View>
          <Text
            className={`text-xl font-bold ${
              isPopup ? "text-white" : "text-gray-800"
            }`}
          >
            {wordName}
          </Text>
          {/* 添加音标显示 */}
          {wordDetails?.phonetic && (
            <Text
              className={`text-sm mt-1 ${
                isPopup ? "text-gray-300" : "text-gray-500"
              }`}
            >
              {wordDetails.phonetic}
            </Text>
          )}
          {wordDetails?.translation ? (
            <Text
              className={`text-sm mt-2 ${
                isPopup ? "text-orange-400" : "text-orange-600"
              }`}
            >
              {wordDetails.translation}
            </Text>
          ) : null}
        </View>
        {!loading && (
          <TouchableOpacity onPress={handleToggleFavorite}>
            <Ionicons
              name={isFavorited ? "heart" : "heart-outline"}
              size={24}
              color="orange"
            />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <ActivityIndicator color="orange" />
      ) : wordDetails ? (
        <ScrollView showsVerticalScrollIndicator={true} className="pr-2">
          {wordDetails.definitions.length > 0 ? (
            wordDetails.definitions.map((item, index) => (
              <View key={index} className="mb-5">
                <Text
                  className={`text-sm ${
                    isPopup ? "text-gray-200" : "text-gray-800"
                  }`}
                >
                  {index + 1}. {item.definition}
                </Text>
                <Text
                  className={`text-xs mt-1 ${
                    isPopup ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {item.translation}
                </Text>
              </View>
            ))
          ) : (
            <Text className="text-sm text-gray-400">
              {t("wordCard.noDefinitions")}
            </Text>
          )}
        </ScrollView>
      ) : (
        <Text className="text-sm text-gray-400">
          {t("wordCard.noDataFound")}
        </Text>
      )}

      {/* 自动消失的提示消息 */}
      {toast.visible && (
        <Animated.View
          style={{
            position: "absolute",
            top: "50%", // 放置在垂直中心
            left: 0,
            right: 0,
            transform: [{ translateY: -20 }], // 微调位置，向上偏移一点
            backgroundColor: "rgba(0,0,0,0.7)",
            padding: 10,
            borderRadius: 5,
            marginHorizontal: 20, // 水平方向留出空间
            alignItems: "center",
            justifyContent: "center",
            opacity: fadeAnim,
            zIndex: 100, // 确保显示在其他内容之上
          }}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>
            {toast.message}
          </Text>
        </Animated.View>
      )}
    </View>
  );
};

export default WordCard;
