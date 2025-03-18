import db from './db';

// 收藏单词相关操作
export const favoriteWordOperations = {
  // 添加收藏单词
  addFavoriteWord: (userId, word, phonetic = null) => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'INSERT INTO favorite_words (user_id, word, phonetic) VALUES (?, ?, ?)',
          [userId, word, phonetic],
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

  // 添加带定义的收藏单词
  addFavoriteWordWithDefinitions: (userId, word, phonetic, definitions) => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        // 先添加单词
        tx.executeSql(
          'INSERT INTO favorite_words (user_id, word, phonetic) VALUES (?, ?, ?)',
          [userId, word, phonetic],
          (_, wordResult) => {
            const wordId = wordResult.insertId;
            
            // 如果有定义数组，添加所有定义
            if (definitions && definitions.length > 0) {
              let completed = 0;
              
              definitions.forEach(def => {
                tx.executeSql(
                  'INSERT INTO word_definitions (word_id, part_of_speech, definition, example, translation) VALUES (?, ?, ?, ?, ?)',
                  [
                    wordId, 
                    def.partOfSpeech || null, 
                    def.definition || def.original, 
                    def.example || null,
                    def.translated || null
                  ],
                  () => {
                    completed++;
                    if (completed === definitions.length) {
                      resolve(wordId);
                    }
                  },
                  (_, error) => {
                    console.error('Error adding definition:', error);
                    // 继续添加其他定义，不中断流程
                  }
                );
              });
            } else {
              resolve(wordId);
            }
          },
          (_, error) => {
            reject(error);
          }
        );
      });
    });
  },

  // 获取所有收藏单词
  getAllFavoriteWords: (userId) => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM favorite_words WHERE user_id = ? ORDER BY created_at DESC',
          [userId],
          (_, result) => {
            const words = [];
            for (let i = 0; i < result.rows.length; i++) {
              words.push(result.rows.item(i));
            }
            resolve(words);
          },
          (_, error) => {
            reject(error);
          }
        );
      });
    });
  },

  // 获取单词的所有定义
  getWordDefinitions: (wordId) => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM word_definitions WHERE word_id = ?',
          [wordId],
          (_, result) => {
            const definitions = [];
            for (let i = 0; i < result.rows.length; i++) {
              definitions.push(result.rows.item(i));
            }
            resolve(definitions);
          },
          (_, error) => {
            reject(error);
          }
        );
      });
    });
  },

  // 获取单词详情（包括所有定义）
  getWordDetails: (wordId) => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        // 先获取单词基本信息
        tx.executeSql(
          'SELECT * FROM favorite_words WHERE id = ?',
          [wordId],
          (_, wordResult) => {
            if (wordResult.rows.length === 0) {
              resolve(null);
              return;
            }
            
            const wordInfo = wordResult.rows.item(0);
            
            // 获取单词的所有定义
            tx.executeSql(
              'SELECT * FROM word_definitions WHERE word_id = ?',
              [wordId],
              (_, defResult) => {
                const definitions = [];
                for (let i = 0; i < defResult.rows.length; i++) {
                  definitions.push(defResult.rows.item(i));
                }
                
                // 合并单词信息和定义
                resolve({
                  ...wordInfo,
                  definitions
                });
              },
              (_, error) => {
                reject(error);
              }
            );
          },
          (_, error) => {
            reject(error);
          }
        );
      });
    });
  },

  // 删除收藏单词
  removeFavoriteWord: (wordId) => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        // 删除单词时，关联的定义会因为外键级联删除而自动删除
        tx.executeSql(
          'DELETE FROM favorite_words WHERE id = ?',
          [wordId],
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
  
  // 检查单词是否已收藏
  isFavoriteWord: (userId, word) => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM favorite_words WHERE user_id = ? AND word = ?',
          [userId, word],
          (_, result) => {
            if (result.rows.length > 0) {
              resolve({
                isFavorite: true,
                wordId: result.rows.item(0).id
              });
            } else {
              resolve({
                isFavorite: false,
                wordId: null
              });
            }
          },
          (_, error) => {
            reject(error);
          }
        );
      });
    });
  },

  // 搜索收藏单词
  searchFavoriteWords: (userId, searchTerm) => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM favorite_words WHERE user_id = ? AND word LIKE ? ORDER BY created_at DESC',
          [userId, `%${searchTerm}%`],
          (_, result) => {
            const words = [];
            for (let i = 0; i < result.rows.length; i++) {
              words.push(result.rows.item(i));
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
            // 如果有定义和音标信息，可能需要考虑保存到单词表
            if (definitions && definitions.length > 0) {
              // 可以选择将单词添加到收藏单词表，但这里只是提供搜索记录
              resolve(result.insertId);
            } else {
              resolve(result.insertId);
            }
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
  
  // 将搜索单词添加到收藏
  addSearchToFavorites: (userId, word, phonetic, definitions) => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        // 首先插入单词到收藏表
        tx.executeSql(
          'INSERT INTO favorite_words (user_id, word, phonetic) VALUES (?, ?, ?)',
          [userId, word, phonetic],
          (_, wordResult) => {
            const wordId = wordResult.insertId;
            
            // 如果有定义，则添加定义
            if (definitions && definitions.length > 0) {
              let completed = 0;
              
              definitions.forEach(def => {
                tx.executeSql(
                  'INSERT INTO word_definitions (word_id, part_of_speech, definition, example) VALUES (?, ?, ?, ?)',
                  [wordId, def.partOfSpeech, def.definition, def.example || null],
                  () => {
                    completed++;
                    if (completed === definitions.length) {
                      resolve(wordId);
                    }
                  },
                  (_, definitionError) => {
                    reject(definitionError);
                  }
                );
              });
            } else {
              resolve(wordId);
            }
          },
          (_, wordError) => {
            reject(wordError);
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
           (SELECT word FROM favorite_words WHERE word LIKE ? 
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

// 对象识别历史相关操作
export const objectDetectionHistoryOperations = {
  // 添加对象识别历史
  addObjectDetectionHistory: (userId, objectName, imageUri, confidence, boundingBox = null) => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'INSERT INTO detected_objects (user_id, object_name, image_uri, confidence, bounding_box) VALUES (?, ?, ?, ?, ?)',
          [userId, objectName, imageUri, confidence, boundingBox ? JSON.stringify(boundingBox) : null],
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

  // 批量添加对象识别记录（用于处理一张图片中的多个对象）
  addMultipleObjects: (userId, objects, imageUri) => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        const results = [];
        let completed = 0;
        
        objects.forEach(obj => {
          tx.executeSql(
            'INSERT INTO detected_objects (user_id, object_name, image_uri, confidence, bounding_box) VALUES (?, ?, ?, ?, ?)',
            [userId, obj.name, imageUri, obj.value, JSON.stringify(obj.boundingBox)],
            (_, result) => {
              results.push(result.insertId);
              completed++;
              if (completed === objects.length) {
                resolve(results);
              }
            },
            (_, error) => {
              reject(error);
            }
          );
        });
      });
    });
  },

  // 获取对象识别历史
  getObjectDetectionHistory: (userId, limit = 50) => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM detected_objects WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
          [userId, limit],
          (_, result) => {
            const history = [];
            for (let i = 0; i < result.rows.length; i++) {
              const item = result.rows.item(i);
              // 解析边界框JSON
              if (item.bounding_box) {
                try {
                  item.bounding_box = JSON.parse(item.bounding_box);
                } catch (e) {
                  console.error('Error parsing bounding box', e);
                }
              }
              history.push(item);
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

  // 根据对象名称搜索检测历史
  searchObjectsByName: (userId, searchTerm) => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM detected_objects WHERE user_id = ? AND object_name LIKE ? ORDER BY created_at DESC',
          [userId, `%${searchTerm}%`],
          (_, result) => {
            const objects = [];
            for (let i = 0; i < result.rows.length; i++) {
              const item = result.rows.item(i);
              if (item.bounding_box) {
                try {
                  item.bounding_box = JSON.parse(item.bounding_box);
                } catch (e) {
                  console.error('Error parsing bounding box', e);
                }
              }
              objects.push(item);
            }
            resolve(objects);
          },
          (_, error) => {
            reject(error);
          }
        );
      });
    });
  },

  // 清除对象识别历史
  clearObjectDetectionHistory: (userId) => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'DELETE FROM detected_objects WHERE user_id = ?',
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
  
  // 设置/取消收藏对象
  toggleFavoriteObject: (objectId, isFavorite) => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'UPDATE detected_objects SET is_favorite = ? WHERE id = ?',
          [isFavorite ? 1 : 0, objectId],
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
  
  // 获取收藏的对象
  getFavoriteObjects: (userId) => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM detected_objects WHERE user_id = ? AND is_favorite = 1 ORDER BY created_at DESC',
          [userId],
          (_, result) => {
            const objects = [];
            for (let i = 0; i < result.rows.length; i++) {
              const item = result.rows.item(i);
              if (item.bounding_box) {
                try {
                  item.bounding_box = JSON.parse(item.bounding_box);
                } catch (e) {
                  console.error('Error parsing bounding box', e);
                }
              }
              objects.push(item);
            }
            resolve(objects);
          },
          (_, error) => {
            reject(error);
          }
        );
      });
    });
  },
  
  // 获取对象详情
  getObjectById: (objectId) => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM detected_objects WHERE id = ?',
          [objectId],
          (_, result) => {
            if (result.rows.length > 0) {
              const item = result.rows.item(0);
              if (item.bounding_box) {
                try {
                  item.bounding_box = JSON.parse(item.bounding_box);
                } catch (e) {
                  console.error('Error parsing bounding box', e);
                }
              }
              resolve(item);
            } else {
              resolve(null);
            }
          },
          (_, error) => {
            reject(error);
          }
        );
      });
    });
  },
  
  // 更新对象的翻译
  updateObjectTranslation: (objectId, translation) => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'UPDATE detected_objects SET translation = ? WHERE id = ?',
          [translation, objectId],
          (_, result) => {
            resolve(result.rowsAffected);
          },
          (_, error) => {
            reject(error);
          }
        );
      });
    });
  }
}; 