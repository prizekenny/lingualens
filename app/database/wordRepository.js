import { getDatabase } from './db';

// 默认用户ID，与 FavoritesProvider 保持一致
const DEFAULT_USER_ID = "1";

// 收藏单词相关操作
export const favoriteWordOperations = {
  // 添加收藏单词
  addFavoriteWord: async (userId, word, phonetic = null) => {
    try {
      const db = getDatabase();
      
      // 先检查单词是否已存在
      const [existResult] = await db.executeSql(
        'SELECT id FROM words WHERE user_id = ? AND word = ?',
        [userId, word]
      );
      
      if (existResult.rows.length > 0) {
        // 单词已存在，更新为收藏状态
        const wordId = existResult.rows.item(0).id;
        await db.executeSql(
          'UPDATE words SET is_favorite = 1 WHERE id = ?',
          [wordId]
        );
        return wordId;
      } else {
        // 单词不存在，插入新记录
        const [insertResult] = await db.executeSql(
          'INSERT INTO words (user_id, word, phonetic, is_favorite) VALUES (?, ?, ?, 1)',
          [userId, word, phonetic]
        );
        return insertResult.insertId;
      }
    } catch (error) {
      console.error("Error adding favorite word:", error);
      throw error;
    }
  },

  // 添加带定义的收藏单词
  addFavoriteWordWithDefinitions: async (userId, word, phonetic, definitions) => {
    try {
      const db = getDatabase();
      
      // 先检查单词是否已存在
      const [existResult] = await db.executeSql(
        'SELECT id FROM words WHERE user_id = ? AND word = ?',
        [userId, word]
      );
      
      let wordId;
      
      if (existResult.rows.length > 0) {
        // 单词已存在，更新为收藏状态
        wordId = existResult.rows.item(0).id;
        await db.executeSql(
          'UPDATE words SET is_favorite = 1, phonetic = ? WHERE id = ?',
          [phonetic, wordId]
        );
      } else {
        // 单词不存在，插入新记录
        const [insertResult] = await db.executeSql(
          'INSERT INTO words (user_id, word, phonetic, is_favorite) VALUES (?, ?, ?, 1)',
          [userId, word, phonetic]
        );
        wordId = insertResult.insertId;
      }
      
      // 处理定义...
      if (definitions && definitions.length > 0) {
        // 使用 Promise.all 处理多个定义
        const promises = definitions.map(def => 
          db.executeSql(
            'INSERT INTO word_definitions (word_id, part_of_speech, definition, example, translation) VALUES (?, ?, ?, ?, ?)',
            [
              wordId, 
              def.partOfSpeech || null, 
              def.definition || def.original, 
              def.example || null,
              def.translated || null
            ]
          ).catch(error => {
            console.error('Error adding definition:', error);
            // 继续添加其他定义，不中断流程
            return null;
          })
        );
        
        await Promise.all(promises);
      }
      
      return wordId;
    } catch (error) {
      console.error("Error adding favorite word with definitions:", error);
      throw error;
    }
  },

  // 获取所有收藏单词
  getAllFavoriteWords: async (userId) => {
    try {
      const db = getDatabase();
      const [result] = await db.executeSql(
        'SELECT * FROM words WHERE user_id = ? AND is_favorite = 1 ORDER BY created_at DESC',
        [userId]
      );
      
      const words = [];
      for (let i = 0; i < result.rows.length; i++) {
        words.push(result.rows.item(i));
      }
      return words;
    } catch (error) {
      console.error("Error getting all favorite words:", error);
      throw error;
    }
  },

  // 获取单词的所有定义
  getWordDefinitions: async (wordId) => {
    try {
      const db = getDatabase();
      const [result] = await db.executeSql(
        'SELECT * FROM word_definitions WHERE word_id = ?',
        [wordId]
      );
      
      const definitions = [];
      for (let i = 0; i < result.rows.length; i++) {
        definitions.push(result.rows.item(i));
      }
      return definitions;
    } catch (error) {
      console.error("Error getting word definitions:", error);
      throw error;
    }
  },

  // 获取单词详情（包括所有定义）
  getWordDetails: async (wordId) => {
    try {
      const db = getDatabase();
      
      // 先获取单词基本信息
      const [wordResult] = await db.executeSql(
        'SELECT * FROM words WHERE id = ?',
        [wordId]
      );
      
      if (wordResult.rows.length === 0) {
        return null;
      }
      
      const wordInfo = wordResult.rows.item(0);
      
      // 获取单词的所有定义
      const [defResult] = await db.executeSql(
        'SELECT * FROM word_definitions WHERE word_id = ?',
        [wordId]
      );
      
      const definitions = [];
      for (let i = 0; i < defResult.rows.length; i++) {
        definitions.push(defResult.rows.item(i));
      }
      
      // 合并单词信息和定义
      return {
        ...wordInfo,
        definitions
      };
    } catch (error) {
      console.error("Error getting word details:", error);
      throw error;
    }
  },

  // 删除收藏单词
  removeFavoriteWord: async (wordId) => {
    try {
      const db = getDatabase();
      // 取消收藏状态，而不是删除记录
      const [result] = await db.executeSql(
        'UPDATE words SET is_favorite = 0 WHERE id = ?',
        [wordId]
      );
      return result.rowsAffected;
    } catch (error) {
      console.error("Error removing favorite word:", error);
      throw error;
    }
  },
  
  // 检查单词是否已收藏
  isFavoriteWord: async (userId, word) => {
    try {
      const db = getDatabase();
      const [result] = await db.executeSql(
        'SELECT id, is_favorite FROM words WHERE user_id = ? AND word = ?',
        [userId, word]
      );
      
      if (result.rows.length > 0) {
        const item = result.rows.item(0);
        return {
          isFavorite: item.is_favorite === 1,
          wordId: item.id
        };
      } else {
        return {
          isFavorite: false,
          wordId: null
        };
      }
    } catch (error) {
      console.error("Error checking if word is favorite:", error);
      throw error;
    }
  },

  // 搜索收藏单词
  searchFavoriteWords: async (userId, searchTerm) => {
    try {
      const db = getDatabase();
      const [result] = await db.executeSql(
        'SELECT * FROM words WHERE user_id = ? AND word LIKE ? ORDER BY created_at DESC',
        [userId, `%${searchTerm}%`]
      );
      
      const words = [];
      for (let i = 0; i < result.rows.length; i++) {
        words.push(result.rows.item(i));
      }
      return words;
    } catch (error) {
      console.error("Error searching favorite words:", error);
      throw error;
    }
  }
};

// 为 WordCard 组件添加获取单词详情的方法
export const getWordDetailForCard = async (word, userId = DEFAULT_USER_ID) => {
  try {
    const db = getDatabase();
    
    // 先检查单词是否在收藏表中存在
    const [wordResult] = await db.executeSql(
      'SELECT id, phonetic, is_favorite FROM words WHERE word = ? AND user_id = ?',
      [word, userId]
    );
    
    if (wordResult.rows.length > 0) {
      // 单词存在于收藏表中，获取其所有定义
      const wordId = wordResult.rows.item(0).id;
      const phonetic = wordResult.rows.item(0).phonetic || "";
      const isFavorite = wordResult.rows.item(0).is_favorite === 1;
      
      const [defResult] = await db.executeSql(
        'SELECT definition, example, translation, example_translation FROM word_definitions WHERE word_id = ?',
        [wordId]
      );
      
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
      
      return {
        word: word,
        phonetic,
        definitions,
        isFavorite: isFavorite,
        wordId: wordId
      };
    } else {
      // 单词不在数据库中，查找在 detected_objects 表中是否存在
      const [objResult] = await db.executeSql(
        'SELECT translation FROM detected_objects WHERE object_name = ? LIMIT 1',
        [word]
      );
      
      if (objResult.rows.length > 0 && objResult.rows.item(0).translation) {
        // 如果在检测对象表中找到单词的翻译
        return {
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
        };
      } else {
        // 返回空详情对象
        return {
          word: word,
          phonetic: "",
          definitions: [{
            definition: "",
            example: ""
          }],
          isFavorite: false,
          wordId: null
        };
      }
    }
  } catch (error) {
    console.error("Error getting word detail for card:", error);
    throw error;
  }
};

// 从WordCard中收藏单词
export const favoriteWordFromCard = async (userId, word, wordDetail) => {
  try {
    // 如果已经收藏过，直接返回
    if (wordDetail.isFavorite && wordDetail.wordId) {
      return { wordId: wordDetail.wordId, isNew: false };
    }
    
    // 准备定义数据
    const definitions = wordDetail.definitions.map(def => ({
      definition: def.definition,
      example: def.example || null
    }));
    
    // 添加到收藏
    const wordId = await favoriteWordOperations.addFavoriteWordWithDefinitions(
      userId, 
      word, 
      wordDetail.phonetic || "", 
      definitions
    );
    
    return { wordId, isNew: true };
  } catch (error) {
    console.error("Error favoriting word from card:", error);
    throw error;
  }
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
export const getDetectedObjectWord = async (objectName) => {
  try {
    const db = getDatabase();
    const [result] = await db.executeSql(
      'SELECT object_name, translation, confidence FROM detected_objects WHERE object_name = ? ORDER BY created_at DESC LIMIT 1',
      [objectName]
    );
    
    if (result.rows.length > 0) {
      return result.rows.item(0);
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting detected object word:", error);
    throw error;
  }
};

// 添加一个便捷方法：把检测到的对象直接保存为收藏单词
export const saveDetectedObjectAsWord = async (userId, objectName, translation = null) => {
  try {
    // 先检查单词是否存在
    const { isFavorite, wordId } = await favoriteWordOperations.isFavoriteWord(userId, objectName);
    
    if (isFavorite) {
      // 单词已收藏
      return { wordId, isNew: false };
    } else {
      // 添加为新收藏单词
      const definitions = translation ? [{ definition: translation }] : [];
      const newWordId = await favoriteWordOperations.addFavoriteWordWithDefinitions(userId, objectName, "", definitions);
      return { wordId: newWordId, isNew: true };
    }
  } catch (error) {
    console.error("Error saving detected object as word:", error);
    throw error;
  }
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
  addWord: async (userId = DEFAULT_USER_ID, word) => {
    try {
      const db = getDatabase();
      
      // 检查单词是否已存在
      const [existResult] = await db.executeSql(
        'SELECT id, is_favorite FROM words WHERE user_id = ? AND word = ?',
        [userId, word]
      );
      
      if (existResult.rows.length > 0) {
        // 单词已存在，返回现有ID
        return {
          wordId: existResult.rows.item(0).id,
          isFavorite: existResult.rows.item(0).is_favorite === 1,
          isNew: false
        };
      } else {
        // 单词不存在，插入新记录
        const [insertResult] = await db.executeSql(
          'INSERT INTO words (user_id, word) VALUES (?, ?)',
          [userId, word]
        );
        
        return {
          wordId: insertResult.insertId,
          isFavorite: false,
          isNew: true
        };
      }
    } catch (error) {
      console.error("Error adding word:", error);
      throw error;
    }
  },

  // 切换收藏状态
  toggleFavorite: async (wordId, isFavorite) => {
    try {
      const db = getDatabase();
      const [result] = await db.executeSql(
        'UPDATE words SET is_favorite = ? WHERE id = ?',
        [isFavorite ? 1 : 0, wordId]
      );
      return result.rowsAffected > 0;
    } catch (error) {
      console.error("Error toggling favorite:", error);
      throw error;
    }
  },

  // 获取用户的所有收藏单词
  getFavoriteWords: async (userId) => {
    try {
      const db = getDatabase();
      const [result] = await db.executeSql(
        'SELECT id, word, is_favorite FROM words WHERE user_id = ? AND is_favorite = 1 ORDER BY created_at DESC',
        [userId]
      );
      
      const words = [];
      for (let i = 0; i < result.rows.length; i++) {
        words.push(result.rows.item(i));
      }
      return words;
    } catch (error) {
      console.error("Error getting favorite words:", error);
      throw error;
    }
  },

  // 检查单词是否已收藏
  checkWordFavoriteStatus: async (userId, word) => {
    try {
      const db = getDatabase();
      const [result] = await db.executeSql(
        'SELECT id, is_favorite FROM words WHERE user_id = ? AND word = ?',
        [userId, word]
      );
      
      if (result.rows.length > 0) {
        return {
          exists: true,
          wordId: result.rows.item(0).id,
          isFavorite: result.rows.item(0).is_favorite === 1
        };
      } else {
        return {
          exists: false,
          wordId: null,
          isFavorite: false
        };
      }
    } catch (error) {
      console.error("Error checking word favorite status:", error);
      throw error;
    }
  }
};

// 检测对象操作
export const detectionOperations = {
  // 保存检测到的对象
  saveDetectedObject: async (userId, objectName, imageId, confidence, boundingBox = null, translation = null) => {
    try {
      // 先添加或获取单词
      const { wordId } = await wordOperations.addWord(userId, objectName);
      
      // 然后保存检测对象记录
      const db = getDatabase();
      const [insertResult] = await db.executeSql(
        'INSERT INTO detected_objects (user_id, word_id, image_id, object_name, translation, confidence, bounding_box) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [userId, wordId, imageId, objectName, translation, confidence, boundingBox ? JSON.stringify(boundingBox) : null]
      );
      
      return {
        detectionId: insertResult.insertId,
        wordId
      };
    } catch (error) {
      console.error("Error saving detected object:", error);
      throw error;
    }
  },
  
  // 批量保存检测到的对象
  saveMultipleDetections: async (userId, imageId, detections) => {
    try {
      const results = [];
      
      // 顺序处理每个检测对象
      for (let i = 0; i < detections.length; i++) {
        const obj = detections[i];
        const result = await detectionOperations.saveDetectedObject(
          userId, 
          obj.name, 
          imageId, 
          obj.value, 
          obj.boundingBox, 
          obj.translation
        );
        results.push(result);
      }
      
      return results;
    } catch (error) {
      console.error("Error saving multiple detections:", error);
      throw error;
    }
  },
  
  // 获取图片中的所有检测对象
  getDetectionsForImage: async (imageId) => {
    try {
      const db = getDatabase();
      const [result] = await db.executeSql(
        `SELECT do.*, w.word, w.is_favorite 
         FROM detected_objects do
         LEFT JOIN words w ON do.word_id = w.id
         WHERE do.image_id = ?`,
        [imageId]
      );
      
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
      return detections;
    } catch (error) {
      console.error("Error getting detections for image:", error);
      throw error;
    }
  }
};

// WordCard 相关便捷方法
export const wordCardOperations = {
  // 获取用于 WordCard 显示的单词详情
  getWordDetails: async (wordOrId, userId = DEFAULT_USER_ID) => {
    try {
      const db = getDatabase();
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
      
      const [wordResult] = await db.executeSql(query, params);
      
      if (wordResult.rows.length > 0) {
        // 单词存在于收藏表中
        const wordInfo = wordResult.rows.item(0);
        
        // 获取单词的定义
        const [defResult] = await db.executeSql(
          'SELECT * FROM word_definitions WHERE word_id = ?',
          [wordInfo.id]
        );
        
        const definitions = [];
        for (let i = 0; i < defResult.rows.length; i++) {
          definitions.push(defResult.rows.item(i));
        }
        
        return {
          id: wordInfo.id,
          word: wordInfo.word,
          phonetic: wordInfo.phonetic || "",
          definitions: definitions,
          isFavorite: wordInfo.is_favorite === 1,
          imageUri: wordInfo.image_uri
        };
      } else if (typeof wordOrId === 'string') {
        // 检查是否在 detected_objects 表中存在
        const [objResult] = await db.executeSql(
          'SELECT translation FROM detected_objects WHERE object_name = ? LIMIT 1',
          [wordOrId]
        );
        
        if (objResult.rows.length > 0 && objResult.rows.item(0).translation) {
          // 如果在检测对象表中找到单词的翻译
          return {
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
          };
        } else {
          // 返回空详情对象
          return {
            word: wordOrId,
            phonetic: "",
            definitions: [],
            isFavorite: false,
            wordId: null
          };
        }
      } else {
        // ID不存在的情况
        return {
          word: null,
          phonetic: "",
          definitions: [],
          isFavorite: false,
          wordId: null
        };
      }
    } catch (error) {
      console.error("Error getting word details:", error);
      throw error;
    }
  },
  
  // 从WordCard收藏单词
  addWordToFavorite: async (userId = DEFAULT_USER_ID, word, wordDetail, translatedExample = "") => {
    try {
      // 如果已经收藏过，直接返回
      if (wordDetail.isFavorite && wordDetail.id) {
        return { wordId: wordDetail.id, isNew: false };
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
      return await favoritesOperations.addFavorite(userId, favorite);
    } catch (error) {
      console.error("Error adding word to favorite:", error);
      throw error;
    }
  }
};

// 简化的收藏单词操作，作为唯一的收藏操作接口
export const favoritesOperations = {
  // 获取用户的所有收藏单词
  getFavorites: async (userId = DEFAULT_USER_ID) => {
    try {
      const db = getDatabase();
      const [result] = await db.executeSql(
        `SELECT w.id, w.word, w.phonetic, w.created_at FROM words 
         WHERE w.user_id = ? AND w.is_favorite = 1 
         ORDER BY w.created_at DESC`,
        [userId]
      );
      
      const favorites = [];
      
      // 获取每个单词的定义
      for (let i = 0; i < result.rows.length; i++) {
        const word = result.rows.item(i);
        
        // 获取定义
        const [defResult] = await db.executeSql(
          'SELECT * FROM word_definitions WHERE word_id = ?',
          [word.id]
        );
        
        const definitions = [];
        for (let j = 0; j < defResult.rows.length; j++) {
          definitions.push(defResult.rows.item(j));
        }
        
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
      
      return favorites;
    } catch (error) {
      console.error("Error getting favorites:", error);
      throw error;
    }
  },
  
  // 添加收藏（简化版，包含翻译）
  addFavorite: async (userId = DEFAULT_USER_ID, favorite) => {
    try {
      const { word, phonetic = "", translation = null, example = null, exampleTranslation = null } = favorite;
      const db = getDatabase();
      
      // 检查单词是否已存在
      const [existResult] = await db.executeSql(
        'SELECT id, is_favorite FROM words WHERE user_id = ? AND word = ?',
        [userId, word]
      );
      
      if (existResult.rows.length > 0) {
        // 单词已存在，获取ID并更新收藏状态
        const wordId = existResult.rows.item(0).id;
        const isFavorite = existResult.rows.item(0).is_favorite === 1;
        
        if (isFavorite) {
          // 已经是收藏状态
          return { id: wordId, isNew: false };
        }
        
        // 更新为收藏状态
        await db.executeSql(
          'UPDATE words SET is_favorite = 1, phonetic = ? WHERE id = ?',
          [phonetic, wordId]
        );
        
        // 添加定义
        if (translation) {
          await db.executeSql(
            'INSERT INTO word_definitions (word_id, definition, example, translation, example_translation) VALUES (?, ?, ?, ?, ?)',
            [wordId, null, example, translation, exampleTranslation]
          );
        }
        
        return { id: wordId, isNew: false };
      } else {
        // 新增单词
        const [insertResult] = await db.executeSql(
          'INSERT INTO words (user_id, word, phonetic, is_favorite) VALUES (?, ?, ?, 1)',
          [userId, word, phonetic]
        );
        
        const wordId = insertResult.insertId;
        
        // 添加定义
        if (translation) {
          await db.executeSql(
            'INSERT INTO word_definitions (word_id, definition, example, translation, example_translation) VALUES (?, ?, ?, ?, ?)',
            [wordId, null, example, translation, exampleTranslation]
          );
        }
        
        return { id: wordId, isNew: true };
      }
    } catch (error) {
      console.error("Error adding favorite:", error);
      throw error;
    }
  },
  
  // 删除收藏
  deleteFavorite: async (wordId) => {
    try {
      const db = getDatabase();
      const [result] = await db.executeSql(
        'UPDATE words SET is_favorite = 0 WHERE id = ?',
        [wordId]
      );
      return result.rowsAffected > 0;
    } catch (error) {
      console.error("Error deleting favorite:", error);
      throw error;
    }
  },
  
  // 检查是否收藏
  isFavoriteExist: async (userId = DEFAULT_USER_ID, word) => {
    try {
      const db = getDatabase();
      const [result] = await db.executeSql(
        'SELECT id, is_favorite FROM words WHERE user_id = ? AND word = ?',
        [userId, word]
      );
      
      if (result.rows.length > 0) {
        const item = result.rows.item(0);
        return {
          exists: true,
          isFavorite: item.is_favorite === 1,
          id: item.id
        };
      } else {
        return {
          exists: false,
          isFavorite: false,
          id: null
        };
      }
    } catch (error) {
      console.error("Error checking if favorite exists:", error);
      throw error;
    }
  },
  
  // 切换收藏状态
  toggleFavorite: async (userId = DEFAULT_USER_ID, favorite) => {
    try {
      const { word, phonetic = "", translation = null, example = null, exampleTranslation = null } = favorite;
      
      // 先检查词是否存在且是否收藏
      const { exists, isFavorite, id } = await favoritesOperations.isFavoriteExist(userId, word);
      
      if (exists && isFavorite) {
        // 取消收藏
        await favoritesOperations.deleteFavorite(id);
        return { id, isFavorite: false };
      } else if (exists && !isFavorite) {
        // 已存在但未收藏，将其收藏
        const db = getDatabase();
        await db.executeSql(
          'UPDATE words SET is_favorite = 1 WHERE id = ?',
          [id]
        );
        return { id, isFavorite: true };
      } else {
        // 不存在，添加新收藏
        const result = await favoritesOperations.addFavorite(userId, favorite);
        return { id: result.id, isFavorite: true };
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      throw error;
    }
  },

  // 搜索收藏单词 
  searchFavoriteWords: async (userId = DEFAULT_USER_ID, searchTerm) => {
    try {
      const db = getDatabase();
      const [result] = await db.executeSql(
        'SELECT * FROM words WHERE user_id = ? AND is_favorite = 1 AND word LIKE ? ORDER BY created_at DESC',
        [userId, `%${searchTerm}%`]
      );
      
      const words = [];
      for (let i = 0; i < result.rows.length; i++) {
        words.push(result.rows.item(i));
      }
      return words;
    } catch (error) {
      console.error("Error searching favorite words:", error);
      throw error;
    }
  }
};

// 导出默认对象
export default {
  wordOperations,
  wordCardOperations,
  favoritesOperations
}; 