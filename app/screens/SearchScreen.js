import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  FlatList,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { fetchWordDetails } from "../api/dictionary";
import { useTranslate } from "../api/translate";
import WordCard from "../../components/WordCard";
import { useLanguage } from "../context/LanguageProvider";
import { useFavorites } from "../context/FavoritesProvider";
import { searchHistoryOperations } from "../database/searchHistoryRepository";
import { getWordDetailForCard } from "../database/wordRepository";
import db, { initDB } from "../database/db";
import { languageCodeMap } from './SettingsScreen';

const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [wordDetail, setWordDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchHistory, setSearchHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedWordName, setSelectedWordName] = useState("");

  const { translateText } = useTranslate();
  const { language } = useLanguage();
  const { favorites, isFavoriteExist } = useFavorites();

  // 默认用户ID - 与 FavoritesProvider 保持一致
  const DEFAULT_USER_ID = "1";

  // 确保数据库初始化
  useEffect(() => {
    const ensureDBInitialized = async () => {
      try {
        await initDB();
        console.log("Database initialized successfully");
      } catch (error) {
        console.error("Database initialization failed:", error);
      }
    };
    
    ensureDBInitialized();
  }, []);

  // 本地化文字对象，与 MainScreen.js 一致
  const localizedText = {
    "en-US": {
      searchPlaceholder: "Enter word...",
      cancelButton: "Cancel",
      translateButton: "Translate",
      loading: "Loading...",
      notFound: "Word not found or API error.",
      translationUnavailable: "Translation unavailable",
      recentSearches: "Recent Searches",
      clearHistory: "Clear History",
      noRecentSearches: "No recent searches"
    },
    "zh-CN": {
      searchPlaceholder: "输入单词...",
      cancelButton: "取消",
      translateButton: "翻译",
      loading: "加载中...",
      notFound: "找不到单词或API错误。",
      translationUnavailable: "翻译不可用",
      recentSearches: "最近搜索",
      clearHistory: "清除历史",
      noRecentSearches: "没有最近的搜索"
    },
    "fr": {
      searchPlaceholder: "Entrez un mot...",
      cancelButton: "Annuler",
      translateButton: "Traduire",
      loading: "Chargement...",
      notFound: "Mot non trouvé ou erreur API.",
      translationUnavailable: "Traduction indisponible",
      recentSearches: "Recherches récentes",
      clearHistory: "Effacer l'historique",
      noRecentSearches: "Aucune recherche récente"
    },
    "de": {
      searchPlaceholder: "Wort eingeben...",
      cancelButton: "Abbrechen",
      translateButton: "Übersetzen",
      loading: "Wird geladen...",
      notFound: "Wort nicht gefunden oder API-Fehler.",
      translationUnavailable: "Übersetzung nicht verfügbar",
      recentSearches: "Letzte Suchen",
      clearHistory: "Verlauf löschen",
      noRecentSearches: "Keine letzten Suchen"
    },
    "ja": {
      searchPlaceholder: "単語を入力...",
      cancelButton: "キャンセル",
      translateButton: "翻訳",
      loading: "読み込み中...",
      notFound: "単語が見つからないか、APIエラーです。",
      translationUnavailable: "翻訳は利用できません",
      recentSearches: "最近の検索",
      clearHistory: "履歴を消去",
      noRecentSearches: "最近の検索はありません"
    },
    "ko": {
      searchPlaceholder: "단어 입력...",
      cancelButton: "취소",
      translateButton: "번역",
      loading: "로딩 중...",
      notFound: "단어를 찾을 수 없거나 API 오류입니다.",
      translationUnavailable: "번역 불가",
      recentSearches: "최근 검색",
      clearHistory: "기록 삭제",
      noRecentSearches: "최근 검색 없음"
    },
    "es": {
      searchPlaceholder: "Introduce una palabra...",
      cancelButton: "Cancelar",
      translateButton: "Traducir",
      loading: "Cargando...",
      notFound: "Palabra no encontrada o error de API.",
      translationUnavailable: "Traducción no disponible",
      recentSearches: "Búsquedas recientes",
      clearHistory: "Borrar historial",
      noRecentSearches: "No hay búsquedas recientes"
    }
  };

  // 获取当前语言的文字
  const getText = (key) => {
    // 检查当前语言是否有对应的翻译
    if (localizedText[language]?.[key]) {
      return localizedText[language][key];
    }
    // 如果是中文变体但找不到精确匹配，尝试使用 zh-CN
    if (language.startsWith("zh") && localizedText["zh-CN"]?.[key]) {
      return localizedText["zh-CN"][key];
    }
    // 默认回退到英文
    return localizedText["en-US"][key];
  };

  // 加载搜索历史
  useEffect(() => {
    loadSearchHistory();
  }, []);

  const loadSearchHistory = async () => {
    try {
      const history = await searchHistoryOperations.getRecentUniqueSearches(DEFAULT_USER_ID);
      setSearchHistory(history);
    } catch (error) {
      console.error("Error loading search history:", error);
    }
  };

  // 保存搜索历史
  const saveSearchHistory = async (word) => {
    try {
      await searchHistoryOperations.addSearchHistory(DEFAULT_USER_ID, word);
      await loadSearchHistory();
    } catch (error) {
      console.error("Error saving search history:", error);
    }
  };

  // 清除搜索历史
  const clearSearchHistory = async () => {
    try {
      await searchHistoryOperations.clearSearchHistory(DEFAULT_USER_ID);
      setSearchHistory([]);
    } catch (error) {
      console.error("Error clearing search history:", error);
    }
  };

  const handleSearch = async (word = searchQuery) => {
    if (word.trim() === "") return;
    
    // 关闭键盘
    Keyboard.dismiss();

    // 保存到搜索历史
    await saveSearchHistory(word);
    
    if (word !== searchQuery) {
      setSearchQuery(word);
    }
    
    setIsLoading(true);
    setErrorMessage("");
    setShowHistory(false);
    setSelectedWordName(word); // 设置当前选中的单词名称

    try {
      // 先尝试从数据库获取词汇详情
      const localWordDetail = await getWordDetailForCard(word);
      
      if (localWordDetail && localWordDetail.definitions && localWordDetail.definitions.length > 0 && 
          (localWordDetail.definitions[0].definition || localWordDetail.definitions[0].translation)) {
        // 使用数据库中的详情
        setWordDetail(localWordDetail);
      } else {
        // 如果数据库中没有，则从API获取
        const wordDetails = await fetchWordDetails(word);

        let translatedDefinitions = [];
        for (const def of wordDetails.definitions) {
          try {
            const translatedDefinition = await translateText(def.definition);
            const translatedExample = def.example
              ? await translateText(def.example)
              : "";
            translatedDefinitions.push({
              definition: def.definition,
              translation: translatedDefinition, // 修改字段名以匹配 WordCard 的期望
              example: def.example,
              exampleTranslation: translatedExample,
            });
          } catch (translationError) {
            translatedDefinitions.push({
              definition: def.definition,
              translation: getText("translationUnavailable"), // 修改字段名
              example: def.example,
              exampleTranslation: "",
            });
          }
        }

        // 构建与 WordCard 期望格式一致的对象
        setWordDetail({
          word: word,
          phonetic: wordDetails.phonetic,
          definitions: translatedDefinitions,
          isFavorite: isFavoriteExist({ word })
        });
      }
    } catch (error) {
      console.error("Error fetching word details:", error);
      setErrorMessage(getText("notFound"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setSearchQuery("");
    setWordDetail(null);
    setErrorMessage("");
    setSelectedWordName("");
  };

  const handleInputFocus = () => {
    if (searchHistory.length > 0) {
      setShowHistory(true);
    }
  };

  // 处理提交事件（按下回车键）
  const handleSubmit = () => {
    if (searchQuery.trim()) {
      handleSearch();
    }
  };

  // 关闭 WordCard 时的回调
  const handleWordCardClose = () => {
    setWordDetail(null);
    setSelectedWordName("");
  };

  return (
    <View className="flex-1 px-5 mt-14">
      <View className="my-3">
        <View className="flex-row items-center bg-gray-100 border-2 border-orange-500 rounded-full px-4 h-12">
          <Ionicons name="search" size={20} color="#aaa" />
          <TextInput
            className="flex-1 pl-2 pb-1 text-base text-gray-800 bg-transparent"
            placeholder={getText("searchPlaceholder")}
            placeholderTextColor="#aaa"
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              if (text === "") {
                setShowHistory(searchHistory.length > 0);
              }
            }}
            onFocus={handleInputFocus}
            onSubmitEditing={handleSubmit}
            returnKeyType="search"
          />
          <TouchableOpacity onPress={handleCancel}>
            <Text className="text-orange-500 text-base font-bold ml-2">
              {getText("cancelButton")}
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          onPress={() => handleSearch()}
          className="mt-2 bg-orange-500 rounded-full py-2 px-4"
        >
          <Text className="text-white text-base font-bold text-center">
            {getText("translateButton")}
          </Text>
        </TouchableOpacity>
      </View>

      {showHistory && searchHistory.length > 0 && !wordDetail && (
        <View className="mb-4">
          <View className="flex-row justify-between items-center">
            <Text className="text-gray-600 font-bold text-base mb-2">
              {getText("recentSearches")}
            </Text>
            <TouchableOpacity onPress={clearSearchHistory}>
              <Text className="text-orange-500 text-sm">
                {getText("clearHistory")}
              </Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={searchHistory}
            keyExtractor={(item, index) => `${item.word}-${index}`}
            renderItem={({ item }) => (
              <TouchableOpacity 
                className="py-3 border-b border-gray-200"
                onPress={() => handleSearch(item.word)}
              >
                <Text className="text-gray-800">{item.word}</Text>
              </TouchableOpacity>
            )}
            style={{ maxHeight: 200 }}
          />
        </View>
      )}

      {showHistory && searchHistory.length === 0 && (
        <Text className="text-gray-500 text-center mt-4">
          {getText("noRecentSearches")}
        </Text>
      )}

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, alignItems: "center" }}
      >
        {isLoading && (
          <View className="mt-10">
            <ActivityIndicator size="large" color="#FF914D" />
            <Text className="text-base text-gray-800 mt-2">{getText("loading")}</Text>
          </View>
        )}

        {errorMessage !== "" && (
          <View className="mt-10">
            <Text className="text-base text-red-500">{errorMessage}</Text>
          </View>
        )}

        {wordDetail && selectedWordName && (
          <View className="mt-5 mb-10 w-full items-center">
            <WordCard
              wordName={selectedWordName}
              onClose={handleWordCardClose}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default SearchScreen;
