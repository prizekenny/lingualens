//const authKey = process.env.DEEPL_API_KEY;

import axios from "axios";

const authKey = process.env.DEEPL_API_KEY;
const API_URL = "https://api-free.deepl.com/v2/translate";

export async function translate(text, sourceLang = "en", targetLang = "zh") {
  try {
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
