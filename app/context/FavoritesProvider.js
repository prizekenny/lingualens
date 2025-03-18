import React, { createContext, useContext, useState, useEffect } from "react";
import {
  addFavorite as apiAddFavorite,
  deleteFavorite as apiDeleteFavorite,
  getFavorites as apiGetFavorites,
} from "../api/favorites";

const FavoritesContext = createContext();

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
};

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);

  const refreshFavorites = async () => {
    try {
      const data = await apiGetFavorites();
      setFavorites(data);
    } catch (error) {
      console.error("Error fetching favorites:", error);
    }
  };

  useEffect(() => {
    refreshFavorites();
  }, []);

  const addFavorite = async (favorite) => {
    if (isFavoriteExist(favorite)) return;
    try {
      await apiAddFavorite(favorite);
      await refreshFavorites();
    } catch (err) {
      console.error("Error adding favorite:", err);
    }
  };

  const deleteFavorite = async (id) => {
    try {
      await apiDeleteFavorite(id);
      await refreshFavorites();
    } catch (err) {
      console.error("Error deleting favorite:", err);
    }
  };

  const isFavoriteExist = (favorite) =>
    favorites.some(
      (item) => item.word.toLowerCase() === favorite.word.toLowerCase()
    );

  const toggleFavorite = async (favorite) => {
    const existing = favorites.find(
      (item) => item.word.toLowerCase() === favorite.word.toLowerCase()
    );
    if (existing) {
      await deleteFavorite(existing.id);
    } else {
      await addFavorite(favorite);
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
