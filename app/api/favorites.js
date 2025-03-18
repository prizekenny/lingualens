import axios from "axios";
import { translateTextAPI } from "./translate"; // ⬅ 使用静态函数
const baseUrl = process.env.MOCK_API;

// 自动翻译后保存
export const addFavorite = async (favorite) => {
  try {
    const translatedWord = await translateTextAPI(favorite.word);
    const translatedExample = await translateTextAPI(favorite.example || "");

    const favoriteWithTranslation = {
      ...favorite,
      translation: translatedWord,
      exampleTranslation: translatedExample,
    };

    const response = await axios.post(
      `${baseUrl}/favorites`,
      favoriteWithTranslation
    );
    return response.data;
  } catch (err) {
    console.error("Error adding favorite with translation:", err);
    throw err;
  }
};

export const getFavorites = async () => {
  const response = await axios.get(`${baseUrl}/favorites`);
  return response.data;
};

export const deleteFavorite = async (id) => {
  const response = await axios.delete(`${baseUrl}/favorites/${id}`);
  return response.data;
};
