import axios from "axios";
import { useLanguage } from "../context/LanguageProvider";
import { languageCodeMap } from "../screens/SettingsScreen";

const authKey = process.env.EXPO_PUBLIC_DEEPL_API_KEY;
const API_URL = "https://api-free.deepl.com/v2/translate";

// ✅ 通用静态方法（可供 Provider / 非 React Hook 中调用）
export const translateTextAPI = async (text, targetLang = "ZH") => {
  try {
    const response = await axios.post(
      API_URL,
      {
        text: [text],
        source_lang: "EN",
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

// ✅ React hook 方法，自动根据当前语言翻译
export function useTranslate() {
  const { language } = useLanguage();
  const targetLang = languageCodeMap[language] || "ZH";

  const translateText = async (text) => {
    return await translateTextAPI(text, targetLang);
  };

  return { translateText };
}
