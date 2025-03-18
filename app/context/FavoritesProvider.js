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

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const data = await apiGetFavorites();
        setFavorites(data);
      } catch (error) {
        console.error("Error fetching favorites:", error);
      }
    };
    fetchFavorites();
  }, []);

  const addFavorite = async (favorite) => {
    if (isFavoriteExist(favorite)) return;
    try {
      const added = await apiAddFavorite(favorite);
      setFavorites((prev) => [...prev, added]);
    } catch (err) {
      console.error("Error adding favorite:", err);
    }
  };

  const deleteFavorite = async (id) => {
    try {
      await apiDeleteFavorite(id);
      setFavorites((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Error deleting favorite:", err);
    }
  };

  const isFavoriteExist = (favorite) =>
    favorites.some(
      (item) => item.word.toLowerCase() === favorite.word.toLowerCase()
    );

  const toggleFavorite = (favorite) => {
    const existing = favorites.find((item) => item.word === favorite.word);
    if (existing) {
      deleteFavorite(existing.id);
    } else {
      addFavorite(favorite);
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
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};
