import axios from "axios";
import { translateTextAPI } from "./translate"; // ⬅ 使用已有翻译函数

const baseUrl = process.env.MOCK_API;

// 添加收藏项并自动翻译
export const addFavorite = async (favorite) => {
  if (!favorite || !favorite.word) {
    throw new Error("Favorite object or word is missing!");
  }

  try {
    const [translatedWord, translatedExample] = await Promise.all([
      translateTextAPI(favorite.word),
      translateTextAPI(favorite.example || ""),
    ]);

    const favoriteWithTranslation = {
      ...favorite,
      translation: translatedWord,
      exampleTranslation: translatedExample,
    };

    const response = await axios.post(
      `${baseUrl}/favorites`,
      favoriteWithTranslation
    );

    if (response.status !== 201 && response.status !== 200) {
      throw new Error(`Failed to add favorite: ${response.statusText}`);
    }

    return response.data;
  } catch (err) {
    console.error(
      "Error adding favorite with translation:",
      err.response?.data || err
    );
    throw err;
  }
};

// 获取所有收藏项
export const getFavorites = async () => {
  try {
    const response = await axios.get(`${baseUrl}/favorites`);
    if (response.status !== 200) {
      throw new Error(`Failed to fetch favorites: ${response.statusText}`);
    }
    return response.data;
  } catch (err) {
    console.error("Error fetching favorites:", err.response?.data || err);
    throw err;
  }
};

// 删除指定收藏项
export const deleteFavorite = async (id) => {
  if (!id) {
    throw new Error("Favorite ID is required for deletion!");
  }

  try {
    const response = await axios.delete(`${baseUrl}/favorites/${id}`);
    if (response.status !== 200 && response.status !== 204) {
      throw new Error(`Failed to delete favorite: ${response.statusText}`);
    }
    return response.data;
  } catch (err) {
    console.error("Error deleting favorite:", err.response?.data || err);
    throw err;
  }
};
