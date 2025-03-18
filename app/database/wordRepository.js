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
  
  // 替换收藏对象方法，转为收藏单词
  saveObjectAsWord: (userId, objectId) => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        // 先获取对象信息
        tx.executeSql(
          'SELECT object_name, translation FROM detected_objects WHERE id = ?',
          [objectId],
          (_, objResult) => {
            if (objResult.rows.length === 0) {
              reject(new Error('Object not found'));
              return;
            }
            
            const obj = objResult.rows.item(0);
            const word = obj.object_name;
            const translation = obj.translation;
            
            // 检查单词是否已存在
            tx.executeSql(
              'SELECT id FROM favorite_words WHERE user_id = ? AND word = ?',
              [userId, word],
              (_, wordResult) => {
                if (wordResult.rows.length > 0) {
                  // 单词已存在，返回ID
                  resolve(wordResult.rows.item(0).id);
                } else {
                  // 单词不存在，添加到收藏单词表
                  tx.executeSql(
                    'INSERT INTO favorite_words (user_id, word, phonetic) VALUES (?, ?, ?)',
                    [userId, word, ""],
                    (_, insertResult) => {
                      const wordId = insertResult.insertId;
                      
                      // 如果有翻译，添加为定义
                      if (translation) {
                        tx.executeSql(
                          'INSERT INTO word_definitions (word_id, definition) VALUES (?, ?)',
                          [wordId, translation],
                          () => {
                            resolve(wordId);
                          },
                          (_, defError) => {
                            // 即使定义添加失败，也返回单词ID
                            console.error('Error adding definition:', defError);
                            resolve(wordId);
                          }
                        );
                      } else {
                        resolve(wordId);
                      }
                    },
                    (_, insertError) => {
                      reject(insertError);
                    }
                  );
                }
              },
              (_, checkError) => {
                reject(checkError);
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
  
  // 获取检测到的物体中可能适合收藏为单词的项目
  getObjectsForWordCollection: (userId, limit = 20) => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `SELECT do.*, 
           CASE WHEN fw.id IS NOT NULL THEN 1 ELSE 0 END as is_word_favorite
           FROM detected_objects do
           LEFT JOIN favorite_words fw ON fw.word = do.object_name AND fw.user_id = ?
           WHERE do.user_id = ?
           ORDER BY do.created_at DESC LIMIT ?`,
          [userId, userId, limit],
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

  // 从对象检测历史中获取单词信息
  getWordInfoFromDetection: (objectName) => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT object_name, translation FROM detected_objects WHERE object_name = ? ORDER BY created_at DESC LIMIT 1',
          [objectName],
          (_, result) => {
            if (result.rows.length > 0) {
              resolve(result.rows.item(0));
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
  }
};

// 为 WordCard 组件添加获取单词详情的方法
export const getWordDetailForCard = (word) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      // 先检查单词是否在收藏表中存在
      tx.executeSql(
        'SELECT id, phonetic FROM favorite_words WHERE word = ?',
        [word],
        (_, wordResult) => {
          if (wordResult.rows.length > 0) {
            // 单词存在于收藏表中，获取其所有定义
            const wordId = wordResult.rows.item(0).id;
            const phonetic = wordResult.rows.item(0).phonetic || "";
            
            tx.executeSql(
              'SELECT definition, example FROM word_definitions WHERE word_id = ?',
              [wordId],
              (_, defResult) => {
                const definitions = [];
                for (let i = 0; i < defResult.rows.length; i++) {
                  const item = defResult.rows.item(i);
                  definitions.push({
                    definition: item.definition,
                    example: item.example || ""
                  });
                }
                
                resolve({
                  phonetic,
                  definitions,
                  isFavorite: true, // 已在收藏表中
                  wordId: wordId
                });
              },
              (_, error) => {
                reject(error);
              }
            );
          } else {
            // 单词不在数据库中，查找在 detected_objects 表中是否存在
            tx.executeSql(
              'SELECT translation FROM detected_objects WHERE object_name = ? LIMIT 1',
              [word],
              (_, objResult) => {
                if (objResult.rows.length > 0 && objResult.rows.item(0).translation) {
                  // 如果在检测对象表中找到单词的翻译
                  resolve({
                    phonetic: "",
                    definitions: [
                      {
                        definition: objResult.rows.item(0).translation,
                        example: ""
                      }
                    ],
                    isFavorite: false, // 未收藏
                    wordId: null
                  });
                } else {
                  // 返回空详情对象
                  resolve({
                    phonetic: "",
                    definitions: [],
                    isFavorite: false,
                    wordId: null
                  });
                }
              },
              (_, error) => {
                reject(error);
              }
            );
          }
        },
        (_, error) => {
          reject(error);
        }
      );
    });
  });
};

// 从WordCard中收藏单词
export const favoriteWordFromCard = (userId, word, wordDetail) => {
  return new Promise((resolve, reject) => {
    // 如果已经收藏过，直接返回
    if (wordDetail.isFavorite && wordDetail.wordId) {
      resolve({ wordId: wordDetail.wordId, isNew: false });
      return;
    }
    
    // 准备定义数据
    const definitions = wordDetail.definitions.map(def => ({
      definition: def.definition,
      example: def.example || null
    }));
    
    // 添加到收藏
    favoriteWordOperations.addFavoriteWordWithDefinitions(
      userId, 
      word, 
      wordDetail.phonetic || "", 
      definitions
    )
    .then(wordId => {
      resolve({ wordId, isNew: true });
    })
    .catch(error => {
      reject(error);
    });
  });
};

// 检查单词是否收藏
export const checkWordFavoriteStatus = (userId, word) => {
  return favoriteWordOperations.isFavoriteWord(userId, word);
};

// 保存 MainScreen 检测到的对象作为单词（可用于添加词汇）
export const saveDetectedWordWithDefinition = (userId, word, definition = "", phonetic = "") => {
  return new Promise((resolve, reject) => {
    // 先检查单词是否已存在
    favoriteWordOperations.isFavoriteWord(userId, word)
      .then(({ isFavorite, wordId }) => {
        if (isFavorite) {
          // 单词已存在，返回ID
          resolve(wordId);
        } else {
          // 单词不存在，添加它
          const definitions = definition ? [{ definition, example: "" }] : [];
          favoriteWordOperations.addFavoriteWordWithDefinitions(userId, word, phonetic, definitions)
            .then(newWordId => resolve(newWordId))
            .catch(error => reject(error));
        }
      })
      .catch(error => reject(error));
  });
};

// 从检测对象表中获取单词详情
export const getDetectedObjectWord = (objectName) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT object_name, translation, confidence FROM detected_objects WHERE object_name = ? ORDER BY created_at DESC LIMIT 1',
        [objectName],
        (_, result) => {
          if (result.rows.length > 0) {
            resolve(result.rows.item(0));
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
};

// 添加一个便捷方法：把检测到的对象直接保存为收藏单词
export const saveDetectedObjectAsWord = (userId, objectName, translation = null) => {
  return new Promise((resolve, reject) => {
    // 先检查单词是否存在
    favoriteWordOperations.isFavoriteWord(userId, objectName)
      .then(({ isFavorite, wordId }) => {
        if (isFavorite) {
          // 单词已收藏
          resolve({ wordId, isNew: false });
        } else {
          // 添加为新收藏单词
          const definitions = translation ? [{ definition: translation }] : [];
          favoriteWordOperations.addFavoriteWordWithDefinitions(userId, objectName, "", definitions)
            .then(newWordId => {
              resolve({ wordId: newWordId, isNew: true });
            })
            .catch(error => reject(error));
        }
      })
      .catch(error => reject(error));
  });
};

// 图片相关操作
export const imageOperations = {
  // 保存图片信息
  saveImage: (userId, imageUri, filename = null, fileSize = null, width = null, height = null, metadata = null) => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'INSERT INTO images (user_id, image_uri, filename, file_size, width, height, metadata) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [userId, imageUri, filename, fileSize, width, height, metadata ? JSON.stringify(metadata) : null],
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
  
  // 获取图片信息
  getImage: (imageId) => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM images WHERE id = ?',
          [imageId],
          (_, result) => {
            if (result.rows.length > 0) {
              const image = result.rows.item(0);
              if (image.metadata) {
                try {
                  image.metadata = JSON.parse(image.metadata);
                } catch (e) {
                  console.error('Error parsing image metadata', e);
                }
              }
              resolve(image);
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
  
  // 获取用户所有图片
  getUserImages: (userId, limit = 50) => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM images WHERE user_id = ? AND is_deleted = 0 ORDER BY created_at DESC LIMIT ?',
          [userId, limit],
          (_, result) => {
            const images = [];
            for (let i = 0; i < result.rows.length; i++) {
              const image = result.rows.item(i);
              if (image.metadata) {
                try {
                  image.metadata = JSON.parse(image.metadata);
                } catch (e) {
                  console.error('Error parsing image metadata', e);
                }
              }
              images.push(image);
            }
            resolve(images);
          },
          (_, error) => {
            reject(error);
          }
        );
      });
    });
  }
};

// 简化的单词操作
export const wordOperations = {
  // 添加单词
  addWord: (userId, word) => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        // 检查单词是否已存在
        tx.executeSql(
          'SELECT id, is_favorite FROM words WHERE user_id = ? AND word = ?',
          [userId, word],
          (_, existResult) => {
            if (existResult.rows.length > 0) {
              // 单词已存在，返回现有ID
              resolve({
                wordId: existResult.rows.item(0).id,
                isFavorite: existResult.rows.item(0).is_favorite === 1,
                isNew: false
              });
            } else {
              // 单词不存在，插入新记录
              tx.executeSql(
                'INSERT INTO words (user_id, word) VALUES (?, ?)',
                [userId, word],
                (_, insertResult) => {
                  resolve({
                    wordId: insertResult.insertId,
                    isFavorite: false,
                    isNew: true
                  });
                },
                (_, error) => reject(error)
              );
            }
          },
          (_, error) => reject(error)
        );
      });
    });
  },

  // 切换收藏状态
  toggleFavorite: (wordId, isFavorite) => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'UPDATE words SET is_favorite = ? WHERE id = ?',
          [isFavorite ? 1 : 0, wordId],
          (_, result) => resolve(result.rowsAffected > 0),
          (_, error) => reject(error)
        );
      });
    });
  },

  // 获取用户的所有收藏单词
  getFavoriteWords: (userId) => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT id, word, is_favorite FROM words WHERE user_id = ? AND is_favorite = 1 ORDER BY created_at DESC',
          [userId],
          (_, result) => {
            const words = [];
            for (let i = 0; i < result.rows.length; i++) {
              words.push(result.rows.item(i));
            }
            resolve(words);
          },
          (_, error) => reject(error)
        );
      });
    });
  },

  // 检查单词是否已收藏
  checkWordFavoriteStatus: (userId, word) => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT id, is_favorite FROM words WHERE user_id = ? AND word = ?',
          [userId, word],
          (_, result) => {
            if (result.rows.length > 0) {
              resolve({
                exists: true,
                wordId: result.rows.item(0).id,
                isFavorite: result.rows.item(0).is_favorite === 1
              });
            } else {
              resolve({
                exists: false,
                wordId: null,
                isFavorite: false
              });
            }
          },
          (_, error) => reject(error)
        );
      });
    });
  }
};

// 检测对象操作
export const detectionOperations = {
  // 保存检测到的对象
  saveDetectedObject: (userId, objectName, imageId, confidence, boundingBox = null, translation = null) => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        // 先添加或获取单词
        wordOperations.addWord(userId, objectName)
          .then(({ wordId }) => {
            // 然后保存检测对象记录
            tx.executeSql(
              'INSERT INTO detected_objects (user_id, word_id, image_id, object_name, translation, confidence, bounding_box) VALUES (?, ?, ?, ?, ?, ?, ?)',
              [userId, wordId, imageId, objectName, translation, confidence, boundingBox ? JSON.stringify(boundingBox) : null],
              (_, insertResult) => {
                resolve({
                  detectionId: insertResult.insertId,
                  wordId
                });
              },
              (_, insertError) => {
                reject(insertError);
              }
            );
          })
          .catch(error => reject(error));
      });
    });
  },
  
  // 批量保存检测到的对象
  saveMultipleDetections: (userId, imageId, detections) => {
    return new Promise((resolve, reject) => {
      const results = [];
      
      // 使用顺序处理确保事务完整性
      const processDetection = (index) => {
        if (index >= detections.length) {
          resolve(results);
          return;
        }
        
        const obj = detections[index];
        detectionOperations.saveDetectedObject(
          userId, 
          obj.name, 
          imageId, 
          obj.value, 
          obj.boundingBox, 
          obj.translation
        )
        .then(result => {
          results.push(result);
          processDetection(index + 1);
        })
        .catch(error => {
          reject(error);
        });
      };
      
      processDetection(0);
    });
  },
  
  // 获取图片中的所有检测对象
  getDetectionsForImage: (imageId) => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `SELECT do.*, w.word, w.is_favorite 
           FROM detected_objects do
           LEFT JOIN words w ON do.word_id = w.id
           WHERE do.image_id = ?`,
          [imageId],
          (_, result) => {
            const detections = [];
            for (let i = 0; i < result.rows.length; i++) {
              const item = result.rows.item(i);
              if (item.bounding_box) {
                try {
                  item.bounding_box = JSON.parse(item.bounding_box);
                } catch (e) {
                  console.error('Error parsing bounding box', e);
                }
              }
              detections.push(item);
            }
            resolve(detections);
          },
          (_, error) => {
            reject(error);
          }
        );
      });
    });
  }
};

// WordCard 相关便捷方法
export const wordCardOperations = {
  // 获取用于 WordCard 显示的单词详情
  getWordDetailsForCard: (wordOrId, userId = null) => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        let query;
        let params;
        
        // 根据传入的是单词ID还是单词文本决定查询方式
        if (typeof wordOrId === 'number') {
          query = `SELECT w.*, i.image_uri 
                   FROM words w
                   LEFT JOIN images i ON w.image_id = i.id
                   WHERE w.id = ?`;
          params = [wordOrId];
        } else {
          // 必须提供userId来区分是哪个用户的单词
          if (!userId) {
            reject(new Error('userId is required when searching by word text'));
            return;
          }
          query = `SELECT w.*, i.image_uri 
                   FROM words w
                   LEFT JOIN images i ON w.image_id = i.id
                   WHERE w.word = ? AND w.user_id = ?`;
          params = [wordOrId, userId];
        }
        
        tx.executeSql(
          query,
          params,
          (_, wordResult) => {
            if (wordResult.rows.length === 0) {
              // 单词不存在，返回空信息
              resolve({
                word: typeof wordOrId === 'string' ? wordOrId : null,
                phonetic: "",
                definitions: [],
                isFavorite: false,
                imageUri: null
              });
              return;
            }
            
            const wordInfo = wordResult.rows.item(0);
            
            // 获取单词的定义
            tx.executeSql(
              'SELECT * FROM word_definitions WHERE word_id = ?',
              [wordInfo.id],
              (_, defResult) => {
                const definitions = [];
                for (let i = 0; i < defResult.rows.length; i++) {
                  definitions.push(defResult.rows.item(i));
                }
                
                resolve({
                  id: wordInfo.id,
                  word: wordInfo.word,
                  phonetic: wordInfo.phonetic || "",
                  definitions: definitions,
                  isFavorite: wordInfo.is_favorite === 1,
                  imageUri: wordInfo.image_uri
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
  
  // 从WordCard收藏单词
  toggleWordFavorite: (wordId, setFavorite) => {
    return wordOperations.toggleFavorite(wordId, setFavorite);
  }
};

// 导出简化后的操作
export default {
  wordOperations
}; 