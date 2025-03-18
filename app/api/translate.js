import axios from "axios";
import { useLanguage } from "../context/LanguageProvider";
import { languageCodeMap } from "../screens/SettingsScreen"; // 从 settings screen 引用映射表

const authKey = process.env.DEEPL_API_KEY;
const API_URL = "https://api-free.deepl.com/v2/translate";

export function useTranslate() {
  const { language } = useLanguage();

  const translateText = async (text) => {
    const targetLang = languageCodeMap[language] || "ZH"; // 没找到就默认中文

    try {
      const response = await axios.post(
        API_URL,
        {
          text: [text],
          source_lang: "EN", // 默认翻译英文
          target_lang: targetLang,
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
  };

  return { translateText };
}
