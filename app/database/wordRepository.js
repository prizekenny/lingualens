import db from './db';

// 默认用户ID，与 FavoritesProvider 保持一致
const DEFAULT_USER_ID = "1";

// 收藏单词相关操作
export const favoriteWordOperations = {
  // 添加收藏单词
  addFavoriteWord: (userId, word, phonetic = null) => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        // 先检查单词是否已存在
        tx.executeSql(
          'SELECT id FROM words WHERE user_id = ? AND word = ?',
          [userId, word],
          (_, existResult) => {
            if (existResult.rows.length > 0) {
              // 单词已存在，更新为收藏状态
              const wordId = existResult.rows.item(0).id;
              tx.executeSql(
                'UPDATE words SET is_favorite = 1 WHERE id = ?',
                [wordId],
                (_, updateResult) => {
                  resolve(wordId);
                },
                (_, error) => reject(error)
              );
            } else {
              // 单词不存在，插入新记录
              tx.executeSql(
                'INSERT INTO words (user_id, word, phonetic, is_favorite) VALUES (?, ?, ?, 1)',
                [userId, word, phonetic],
                (_, insertResult) => {
                  resolve(insertResult.insertId);
                },
                (_, error) => reject(error)
              );
            }
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
        // 先检查单词是否已存在
        tx.executeSql(
          'SELECT id FROM words WHERE user_id = ? AND word = ?',
          [userId, word],
          (_, existResult) => {
            if (existResult.rows.length > 0) {
              // 单词已存在，更新为收藏状态
              const wordId = existResult.rows.item(0).id;
              tx.executeSql(
                'UPDATE words SET is_favorite = 1, phonetic = ? WHERE id = ?',
                [phonetic, wordId],
                (_, updateResult) => {
                  // 处理定义...
                  if (definitions && definitions.length > 0) {
                    // 可以考虑先删除旧定义
                    processDefs(tx, wordId, definitions, resolve);
                  } else {
                    resolve(wordId);
                  }
                },
                (_, error) => reject(error)
              );
            } else {
              // 单词不存在，插入新记录
              tx.executeSql(
                'INSERT INTO words (user_id, word, phonetic, is_favorite) VALUES (?, ?, ?, 1)',
                [userId, word, phonetic],
                (_, insertResult) => {
                  const wordId = insertResult.insertId;
                  if (definitions && definitions.length > 0) {
                    processDefs(tx, wordId, definitions, resolve);
                  } else {
                    resolve(wordId);
                  }
                },
                (_, error) => reject(error)
              );
            }
          },
          (_, error) => reject(error)
        );
      });
    });

    // 辅助函数处理定义添加
    function processDefs(tx, wordId, definitions, resolve) {
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
    }
  },

  // 获取所有收藏单词
  getAllFavoriteWords: (userId) => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM words WHERE user_id = ? AND is_favorite = 1 ORDER BY created_at DESC',
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
          'SELECT * FROM words WHERE id = ?',
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
        // 取消收藏状态，而不是删除记录
        tx.executeSql(
          'UPDATE words SET is_favorite = 0 WHERE id = ?',
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
          'SELECT id, is_favorite FROM words WHERE user_id = ? AND word = ?',
          [userId, word],
          (_, result) => {
            if (result.rows.length > 0) {
              const item = result.rows.item(0);
              resolve({
                isFavorite: item.is_favorite === 1,
                wordId: item.id
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
          'SELECT * FROM words WHERE user_id = ? AND word LIKE ? ORDER BY created_at DESC',
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

// 为 WordCard 组件添加获取单词详情的方法
export const getWordDetailForCard = (word, userId = DEFAULT_USER_ID) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      // 先检查单词是否在收藏表中存在
      tx.executeSql(
        'SELECT id, phonetic, is_favorite FROM words WHERE word = ? AND user_id = ?',
        [word, userId],
        (_, wordResult) => {
          if (wordResult.rows.length > 0) {
            // 单词存在于收藏表中，获取其所有定义
            const wordId = wordResult.rows.item(0).id;
            const phonetic = wordResult.rows.item(0).phonetic || "";
            const isFavorite = wordResult.rows.item(0).is_favorite === 1;
            
            tx.executeSql(
              'SELECT definition, example, translation, example_translation FROM word_definitions WHERE word_id = ?',
              [wordId],
              (_, defResult) => {
                const definitions = [];
                for (let i = 0; i < defResult.rows.length; i++) {
                  const item = defResult.rows.item(i);
                  definitions.push({
                    definition: item.definition || item.translation || "",
                    example: item.example || "",
                    example_translation: item.example_translation || ""
                  });
                }
                
                // 如果没有定义，添加一个空定义
                if (definitions.length === 0) {
                  definitions.push({
                    definition: "",
                    example: ""
                  });
                }
                
                resolve({
                  word: word,
                  phonetic,
                  definitions,
                  isFavorite: isFavorite,
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
                    word: word,
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
                    word: word,
                    phonetic: "",
                    definitions: [{
                      definition: "",
                      example: ""
                    }],
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
export const saveDetectedWordWithDefinition = (userId = DEFAULT_USER_ID, word, definition = "", phonetic = "", exampleTranslation = "") => {
  const favorite = {
    word,
    phonetic,
    translation: definition,
    example: "",
    exampleTranslation
  };
  
  return favoritesOperations.addFavorite(userId, favorite);
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
  addWord: (userId = DEFAULT_USER_ID, word) => {
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
  getWordDetails: (wordOrId, userId = DEFAULT_USER_ID) => {
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
            if (wordResult.rows.length > 0) {
              // 单词存在于收藏表中
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
                (_, error) => reject(error)
              );
            } else if (typeof wordOrId === 'string') {
              // 检查是否在 detected_objects 表中存在
              tx.executeSql(
                'SELECT translation FROM detected_objects WHERE object_name = ? LIMIT 1',
                [wordOrId],
                (_, objResult) => {
                  if (objResult.rows.length > 0 && objResult.rows.item(0).translation) {
                    // 如果在检测对象表中找到单词的翻译
                    resolve({
                      word: wordOrId,
                      phonetic: "",
                      definitions: [
                        {
                          definition: objResult.rows.item(0).translation,
                          example: ""
                        }
                      ],
                      isFavorite: false,
                      wordId: null
                    });
                  } else {
                    // 返回空详情对象
                    resolve({
                      word: wordOrId,
                      phonetic: "",
                      definitions: [],
                      isFavorite: false,
                      wordId: null
                    });
                  }
                },
                (_, error) => reject(error)
              );
            } else {
              // ID不存在的情况
              resolve({
                word: null,
                phonetic: "",
                definitions: [],
                isFavorite: false,
                wordId: null
              });
            }
          },
          (_, error) => reject(error)
        );
      });
    });
  },
  
  // 从WordCard收藏单词
  addWordToFavorite: (userId = DEFAULT_USER_ID, word, wordDetail, translatedExample = "") => {
    return new Promise((resolve, reject) => {
      // 如果已经收藏过，直接返回
      if (wordDetail.isFavorite && wordDetail.id) {
        resolve({ wordId: wordDetail.id, isNew: false });
        return;
      }
      
      // 准备添加到收藏的参数
      const favorite = {
        word,
        phonetic: wordDetail.phonetic || "",
        translation: wordDetail.definitions.length > 0 ? wordDetail.definitions[0].definition : null,
        example: wordDetail.definitions.length > 0 ? wordDetail.definitions[0].example : null,
        exampleTranslation: translatedExample // 添加翻译后的例句
      };
      
      // 使用 favoritesOperations 添加收藏
      favoritesOperations.addFavorite(userId, favorite)
        .then(result => resolve(result))
        .catch(error => reject(error));
    });
  }
};

// 简化的收藏单词操作，作为唯一的收藏操作接口
export const favoritesOperations = {
  // 获取用户的所有收藏单词
  getFavorites: (userId = DEFAULT_USER_ID) => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `SELECT w.id, w.word, w.phonetic, w.created_at FROM words 
           WHERE w.user_id = ? AND w.is_favorite = 1 
           ORDER BY w.created_at DESC`,
          [userId],
          async (_, result) => {
            try {
              const favorites = [];
              
              // 获取每个单词的定义
              for (let i = 0; i < result.rows.length; i++) {
                const word = result.rows.item(i);
                
                // 获取定义
                const definitions = await new Promise((resolveDefinitions, rejectDefinitions) => {
                  tx.executeSql(
                    'SELECT * FROM word_definitions WHERE word_id = ?',
                    [word.id],
                    (_, defResult) => {
                      const defs = [];
                      for (let j = 0; j < defResult.rows.length; j++) {
                        defs.push(defResult.rows.item(j));
                      }
                      resolveDefinitions(defs);
                    },
                    (_, error) => rejectDefinitions(error)
                  );
                });
                
                // 构建完整的收藏对象
                favorites.push({
                  id: word.id,
                  word: word.word,
                  phonetic: word.phonetic || "",
                  // 使用第一个定义作为主要定义和示例
                  translation: definitions.length > 0 ? definitions[0].translation : "",
                  example: definitions.length > 0 ? definitions[0].example : "",
                  exampleTranslation: definitions.length > 0 ? definitions[0].example_translation : "",
                  created_at: word.created_at,
                  definitions: definitions
                });
              }
              
              resolve(favorites);
            } catch (error) {
              reject(error);
            }
          },
          (_, error) => reject(error)
        );
      });
    });
  },
  
  // 添加收藏（简化版，包含翻译）
  addFavorite: (userId = DEFAULT_USER_ID, favorite) => {
    const { word, phonetic = "", translation = null, example = null, exampleTranslation = null } = favorite;
    
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT id, is_favorite FROM words WHERE user_id = ? AND word = ?',
          [userId, word],
          (_, existResult) => {
            if (existResult.rows.length > 0) {
              // 单词已存在，获取ID并更新收藏状态
              const wordId = existResult.rows.item(0).id;
              const isFavorite = existResult.rows.item(0).is_favorite === 1;
              
              if (isFavorite) {
                // 已经是收藏状态
                resolve({ id: wordId, isNew: false });
                return;
              }
              
              // 更新为收藏状态
              tx.executeSql(
                'UPDATE words SET is_favorite = 1, phonetic = ? WHERE id = ?',
                [phonetic, wordId],
                () => {
                  // 添加定义
                  if (translation) {
                    tx.executeSql(
                      'INSERT INTO word_definitions (word_id, definition, example, translation, example_translation) VALUES (?, ?, ?, ?, ?)',
                      [wordId, null, example, translation, exampleTranslation],
                      () => resolve({ id: wordId, isNew: false }),
                      (_, defError) => reject(defError)
                    );
                  } else {
                    resolve({ id: wordId, isNew: false });
                  }
                },
                (_, updateError) => reject(updateError)
              );
            } else {
              // 新增单词
              tx.executeSql(
                'INSERT INTO words (user_id, word, phonetic, is_favorite) VALUES (?, ?, ?, 1)',
                [userId, word, phonetic],
                (_, insertResult) => {
                  const wordId = insertResult.insertId;
                  
                  // 添加定义
                  if (translation) {
                    tx.executeSql(
                      'INSERT INTO word_definitions (word_id, definition, example, translation, example_translation) VALUES (?, ?, ?, ?, ?)',
                      [wordId, null, example, translation, exampleTranslation],
                      () => resolve({ id: wordId, isNew: true }),
                      (_, defError) => reject(defError)
                    );
                  } else {
                    resolve({ id: wordId, isNew: true });
                  }
                },
                (_, insertError) => reject(insertError)
              );
            }
          },
          (_, checkError) => reject(checkError)
        );
      });
    });
  },
  
  // 删除收藏
  deleteFavorite: (wordId) => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'UPDATE words SET is_favorite = 0 WHERE id = ?',
          [wordId],
          (_, result) => resolve(result.rowsAffected > 0),
          (_, error) => reject(error)
        );
      });
    });
  },
  
  // 检查是否收藏
  isFavoriteExist: (userId = DEFAULT_USER_ID, word) => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT id, is_favorite FROM words WHERE user_id = ? AND word = ?',
          [userId, word],
          (_, result) => {
            if (result.rows.length > 0) {
              const item = result.rows.item(0);
              resolve({
                exists: true,
                isFavorite: item.is_favorite === 1,
                id: item.id
              });
            } else {
              resolve({
                exists: false,
                isFavorite: false,
                id: null
              });
            }
          },
          (_, error) => reject(error)
        );
      });
    });
  },
  
  // 切换收藏状态
  toggleFavorite: (userId = DEFAULT_USER_ID, favorite) => {
    const { word, phonetic = "", translation = null, example = null, exampleTranslation = null } = favorite;
    
    return new Promise((resolve, reject) => {
      // 先检查词是否存在且是否收藏
      favoritesOperations.isFavoriteExist(userId, word)
        .then(({ exists, isFavorite, id }) => {
          if (exists && isFavorite) {
            // 取消收藏
            favoritesOperations.deleteFavorite(id)
              .then(() => resolve({ id, isFavorite: false }))
              .catch(error => reject(error));
          } else if (exists && !isFavorite) {
            // 已存在但未收藏，将其收藏
            db.transaction(tx => {
              tx.executeSql(
                'UPDATE words SET is_favorite = 1 WHERE id = ?',
                [id],
                () => resolve({ id, isFavorite: true }),
                (_, error) => reject(error)
              );
            });
          } else {
            // 不存在，添加新收藏
            favoritesOperations.addFavorite(userId, favorite)
              .then(result => resolve({ id: result.id, isFavorite: true }))
              .catch(error => reject(error));
          }
        })
        .catch(error => reject(error));
    });
  },

  // 搜索收藏单词 
  searchFavoriteWords: (userId = DEFAULT_USER_ID, searchTerm) => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM words WHERE user_id = ? AND is_favorite = 1 AND word LIKE ? ORDER BY created_at DESC',
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

// 导出默认对象
export default {
  wordOperations,
  wordCardOperations,
  favoritesOperations
}; 