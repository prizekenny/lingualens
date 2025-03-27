import { getFavoriteByWord } from "./DatabaseService";
import { fetchWordDetails } from "../api/dictionary";
import { translate } from "../api/translate";

/**
 * 1️⃣ 从数据库获取单词
 */
export const fetchWordFromDatabase = async (wordName) => {
  try {
    const wordData = await getFavoriteByWord(wordName);
    if (wordData) {
      console.log(`📌 "${wordName}" 从数据库获取:`, wordData);
      return {
        word: wordData.word,
        phonetic: wordData.phonetic || "",
        translation: wordData.translation || "",
        language: wordData.language || "en", // ✅ 补上 language 字段
        definitions: wordData.definitions.map((def) => ({
          definition: def.definition,
          translation: def.translation || "Translation unavailable",
          example: def.example || "",
          exampleTranslation: def.exampleTranslation || "",
        })),
        source: "database",
      };
    }
    return null;
  } catch (error) {
    console.error("❌ 数据库获取失败:", error);
    return null;
  }
};

/**
 * 2️⃣ 从网络 API 获取单词（包括翻译）
 */
export const fetchWordFromAPI = async (wordName) => {
  try {
    console.log(`📌 "${wordName}" 不在数据库，使用 API 获取`);

    const details = await fetchWordDetails(wordName);
    if (!details) {
      console.error("❌ API 获取失败: 没有返回数据");
      return null;
    }

    // 获取当前语言环境
    const currentLanguage = global.currentLanguage || "zh-CN";
    const { languageCodeMap } = require("../screens/SettingsScreen");
    const targetLang = languageCodeMap[currentLanguage] || "ZH";

    // 检查是否为英文模式
    const isEnglishMode =
      targetLang.toUpperCase() === "EN" || targetLang.toUpperCase() === "EN-GB";

    // 翻译单词 - 英文模式下设置为空字符串
    const translatedWord = isEnglishMode ? "" : await translate(wordName);

    // **合并所有定义，发送一次请求**
    const definitionsText = details.definitions
      .map((d) => d.definition)
      .join(" ||| ");
    console.log("📌 definitionsText:", definitionsText);

    let translatedDefinitions = [];
    if (definitionsText && !isEnglishMode) {
      // 英文模式下不翻译定义
      const translatedText = await translate(definitionsText); // **一次翻译所有定义**
      console.log("📌 translatedText:", translatedText);

      // **修正可能的分隔符错误**
      const safeText = translatedText.replace(/[\|]+/g, "|||");
      translatedDefinitions = safeText.split(/\s*\|\|\|\s*/);

      // **调试信息**
      console.log("📌 翻译分割后:", translatedDefinitions);
      console.log("📌 定义数量:", details.definitions.length);
      console.log("📌 翻译数组数量:", translatedDefinitions.length);

      // **如果数量不匹配，手动填充**
      while (translatedDefinitions.length < details.definitions.length) {
        translatedDefinitions.push("Translation unavailable");
      }
    }

    // **构造定义列表**
    const definitions = details.definitions.map((def, index) => ({
      definition: def.definition,
      translation: isEnglishMode
        ? ""
        : translatedDefinitions[index] || "Translation unavailable",
      example: def.example || "",
      exampleTranslation: "",
    }));

    return {
      word: wordName,
      phonetic: details.phonetic || "",
      translation: translatedWord,
      definitions,
      source: "api",
    };
  } catch (error) {
    console.error("❌ API 获取失败:", error);
    return null;
  }
};

/**
 * 3️⃣ 自动判断获取方式（数据库优先，API 兜底）
 */
export const getWordData = async (wordName, currentLanguage) => {
  console.log(`📌 获取 "${wordName}" 数据，当前语言: ${currentLanguage}`);

  // **优先查数据库**
  let wordData = await fetchWordFromDatabase(wordName);

  // 如果从数据库获取到了数据，但语言环境已变更，则需要重新获取翻译
  if (wordData && wordData.language !== currentLanguage) {
    console.log(
      `📌 语言已更改(${wordData.language} -> ${currentLanguage})，重新获取翻译`
    );
    return await fetchWordFromAPI(wordName);
  }

  if (wordData) return wordData;

  // **数据库里没有，就从 API 获取**
  const apiData = await fetchWordFromAPI(wordName);
  if (apiData) {
    // 添加当前语言标记
    apiData.language = currentLanguage;
  }
  return apiData;
};
