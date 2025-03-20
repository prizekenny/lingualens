import db from './db';

// 搜索历史相关操作
export const searchHistoryOperations = {
  // 添加搜索历史
  addSearchHistory: (userId, word, definitions = null, phonetic = null) => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'INSERT INTO search_history (user_id, word) VALUES (?, ?)',
          [userId, word],
          (_, result) => {
            resolve(result.insertId);
          },
          (_, error) => {
            reject(error);
          }
        );
      });
    });
  },

  // 检查搜索历史是否存在
  checkSearchHistory: (userId, word) => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM search_history WHERE user_id = ? AND word = ?',
          [userId, word],
          (_, result) => {
            resolve(result.rows.length > 0);
          },
          (_, error) => {
            reject(error);
          }
        );
      });
    });
  },

  // 获取搜索历史
  getSearchHistory: (userId, limit = 20) => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM search_history WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
          [userId, limit],
          (_, result) => {
            const history = [];
            for (let i = 0; i < result.rows.length; i++) {
              history.push(result.rows.item(i));
            }
            resolve(history);
          },
          (_, error) => {
            reject(error);
          }
        );
      });
    });
  },

  // 获取最近搜索的单词（不重复）
  getRecentUniqueSearches: (userId, limit = 10) => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT word, MAX(created_at) as latest_search FROM search_history WHERE user_id = ? GROUP BY word ORDER BY latest_search DESC LIMIT ?',
          [userId, limit],
          (_, result) => {
            const history = [];
            for (let i = 0; i < result.rows.length; i++) {
              history.push(result.rows.item(i));
            }
            resolve(history);
          },
          (_, error) => {
            reject(error);
          }
        );
      });
    });
  },

  // 清除所有搜索历史
  clearSearchHistory: (userId) => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'DELETE FROM search_history WHERE user_id = ?',
          [userId],
          (_, result) => {
            resolve(result.rowsAffected);
          },
          (_, error) => {
            reject(error);
          }
        );
      });
    });
  },
  
  // 删除特定的搜索记录
  removeSearchItem: (searchId) => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'DELETE FROM search_history WHERE id = ?',
          [searchId],
          (_, result) => {
            resolve(result.rowsAffected);
          },
          (_, error) => {
            reject(error);
          }
        );
      });
    });
  },
  
  // 搜索单词
  searchWords: (term) => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `SELECT DISTINCT word FROM 
           (SELECT word FROM words WHERE word LIKE ? 
            UNION 
            SELECT word FROM search_history WHERE word LIKE ?) 
           AS combined_search ORDER BY word`,
          [`%${term}%`, `%${term}%`],
          (_, result) => {
            const words = [];
            for (let i = 0; i < result.rows.length; i++) {
              words.push(result.rows.item(i).word);
            }
            resolve(words);
          },
          (_, error) => {
            reject(error);
          }
        );
      });
    });
  }
};

export default searchHistoryOperations;
