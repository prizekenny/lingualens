import React, { createContext, useContext, useState, useEffect } from "react";
import { favoritesOperations } from "../database/wordRepository";

// 创建收藏上下文
const FavoritesContext = createContext();

// 导出使用收藏上下文的钩子
export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
};

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  
  // 硬编码用户ID，后期可以替换为真实的身份验证系统
  const DEFAULT_USER_ID = "1"; 

  // 刷新收藏列表
  const refreshFavorites = async () => {
    try {
      const data = await favoritesOperations.getFavorites(DEFAULT_USER_ID);
      setFavorites(data);
    } catch (error) {
      console.error("获取收藏列表失败:", error);
    }
  };

  // 初始化时加载收藏
  useEffect(() => {
    refreshFavorites();
  }, []);

  // 添加收藏
  const addFavorite = async (favorite) => {
    if (isFavoriteExist(favorite)) return;
    try {
      await favoritesOperations.addFavorite(DEFAULT_USER_ID, favorite);
      await refreshFavorites();
    } catch (err) {
      console.error("添加收藏失败:", err);
    }
  };

  // 删除收藏
  const deleteFavorite = async (id) => {
    try {
      await favoritesOperations.deleteFavorite(id);
      await refreshFavorites();
    } catch (err) {
      console.error("删除收藏失败:", err);
    }
  };

  // 检查收藏是否存在
  const isFavoriteExist = (favorite) =>
    favorites.some(
      (item) => item.word.toLowerCase() === favorite.word.toLowerCase()
    );

  // 切换收藏状态
  const toggleFavorite = async (favorite) => {
    try {
      await favoritesOperations.toggleFavorite(DEFAULT_USER_ID, favorite);
      await refreshFavorites();
    } catch (err) {
      console.error("切换收藏状态失败:", err);
    }
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addFavorite,
        deleteFavorite,
        toggleFavorite,
        isFavoriteExist,
        refreshFavorites,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};
