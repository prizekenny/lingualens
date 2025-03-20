import { getDatabase } from './db';

// 搜索历史相关操作
export const searchHistoryOperations = {
  // 添加搜索历史
  addSearchHistory: async (userId, word) => {
    try {
      const db = getDatabase();
      const [result] = await db.executeSql(
        'INSERT INTO search_history (user_id, word) VALUES (?, ?)',
        [userId, word]
      );
      return result.insertId;
    } catch (error) {
      console.error("Error adding search history:", error);
      throw error;
    }
  },

  // 检查搜索历史是否存在
  checkSearchHistory: async (userId, word) => {
    try {
      const db = getDatabase();
      const [result] = await db.executeSql(
        'SELECT * FROM search_history WHERE user_id = ? AND word = ?',
        [userId, word]
      );
      return result.rows.length > 0;
    } catch (error) {
      console.error("Error checking search history:", error);
      throw error;
    }
  },

  // 获取搜索历史
  getSearchHistory: async (userId, limit = 20) => {
    try {
      const db = getDatabase();
      const [result] = await db.executeSql(
        'SELECT * FROM search_history WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
        [userId, limit]
      );
      
      const history = [];
      for (let i = 0; i < result.rows.length; i++) {
        history.push(result.rows.item(i));
      }
      return history;
    } catch (error) {
      console.error("Error getting search history:", error);
      throw error;
    }
  },

  // 获取最近搜索的单词（不重复）
  getRecentUniqueSearches: async (userId, limit = 10) => {
    try {
      const db = getDatabase();
      const [result] = await db.executeSql(
        'SELECT word, MAX(created_at) as latest_search FROM search_history WHERE user_id = ? GROUP BY word ORDER BY latest_search DESC LIMIT ?',
        [userId, limit]
      );
      
      const history = [];
      for (let i = 0; i < result.rows.length; i++) {
        history.push(result.rows.item(i));
      }
      return history;
    } catch (error) {
      console.error("Error getting recent unique searches:", error);
      throw error;
    }
  },

  // 清除所有搜索历史
  clearSearchHistory: async (userId) => {
    try {
      const db = getDatabase();
      const [result] = await db.executeSql(
        'DELETE FROM search_history WHERE user_id = ?',
        [userId]
      );
      return result.rowsAffected;
    } catch (error) {
      console.error("Error clearing search history:", error);
      throw error;
    }
  },
  
  // 删除特定的搜索记录
  removeSearchItem: async (searchId) => {
    try {
      const db = getDatabase();
      const [result] = await db.executeSql(
        'DELETE FROM search_history WHERE id = ?',
        [searchId]
      );
      return result.rowsAffected;
    } catch (error) {
      console.error("Error removing search item:", error);
      throw error;
    }
  },
  
  // 搜索单词
  searchWords: async (term) => {
    try {
      const db = getDatabase();
      const [result] = await db.executeSql(
        `SELECT DISTINCT word FROM 
         (SELECT word FROM words WHERE word LIKE ? 
          UNION 
          SELECT word FROM search_history WHERE word LIKE ?) 
         AS combined_search ORDER BY word`,
        [`%${term}%`, `%${term}%`]
      );
      
      const words = [];
      for (let i = 0; i < result.rows.length; i++) {
        words.push(result.rows.item(i).word);
      }
      return words;
    } catch (error) {
      console.error("Error searching words:", error);
      throw error;
    }
  }
};

export default searchHistoryOperations;
