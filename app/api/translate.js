//const authKey = process.env.DEEPL_API_KEY;

import axios from "axios";
import { useLanguage } from "../context/LanguageProvider";

const authKey = process.env.DEEPL_API_KEY;
const API_URL = "https://api-free.deepl.com/v2/translate";

export async function translate(text, sourceLang = "en", targetLang = null) {
  try {
    // 如果没有提供目标语言，从 languageCodeMap 获取当前语言对应的 DeepL 代码
    if (!targetLang) {
      // 这里需要通过其他方式获取当前语言，因为函数中不能直接使用 Hook
      const currentLanguage = global.currentLanguage || "zh-CN";
      const { languageCodeMap } = require("../screens/SettingsScreen");
      targetLang = languageCodeMap[currentLanguage] || "ZH";
      
      // 添加调试日志
      console.log(`Translate: currentLanguage=${currentLanguage}, targetLang=${targetLang}`);
    }
    
    // 如果目标语言是英文，直接返回原文
    if (targetLang.toUpperCase() === "EN" || targetLang.toUpperCase() === "EN-GB") {
      console.log("英文模式：跳过翻译", text);
      return text;
    }

    const response = await axios.post(
      API_URL,
      {
        text: [text],
        source_lang: sourceLang.toUpperCase(),
        target_lang: targetLang.toUpperCase(),
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `DeepL-Auth-Key ${authKey}`,
        },
      }
    );

    return response.data.translations[0].text;
  } catch (error) {
    console.error("Translation error:", error);
    return "Translation failed";
  }
}

export default { translate };
