import { getDatabase } from './db';
import { wordOperations } from './wordRepository';

// 对象识别历史相关操作
export const objectDetectionOperations = {
  // 添加对象识别历史
  addObjectDetectionHistory: async (userId, objectName, imageUri, confidence, boundingBox = null) => {
    try {
      const db = getDatabase();
      const [result] = await db.executeSql(
        'INSERT INTO detected_objects (user_id, object_name, image_uri, confidence, bounding_box) VALUES (?, ?, ?, ?, ?)',
        [userId, objectName, imageUri, confidence, boundingBox ? JSON.stringify(boundingBox) : null]
      );
      return result.insertId;
    } catch (error) {
      console.error("Error adding object detection history:", error);
      throw error;
    }
  },

  // 批量添加对象识别记录（用于处理一张图片中的多个对象）
  addMultipleObjects: async (userId, objects, imageUri) => {
    try {
      const db = getDatabase();
      const results = [];
      
      // 使用 Promise.all 替代嵌套回调
      await Promise.all(objects.map(async (obj) => {
        const [result] = await db.executeSql(
          'INSERT INTO detected_objects (user_id, object_name, image_uri, confidence, bounding_box) VALUES (?, ?, ?, ?, ?)',
          [userId, obj.name, imageUri, obj.value, JSON.stringify(obj.boundingBox)]
        );
        results.push(result.insertId);
      }));
      
      return results;
    } catch (error) {
      console.error("Error adding multiple objects:", error);
      throw error;
    }
  },

  // 获取对象识别历史
  getObjectDetectionHistory: async (userId, limit = 50) => {
    try {
      const db = getDatabase();
      const [result] = await db.executeSql(
        'SELECT * FROM detected_objects WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
        [userId, limit]
      );
      
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
      return history;
    } catch (error) {
      console.error("Error getting object detection history:", error);
      throw error;
    }
  },

  // 根据对象名称搜索检测历史
  searchObjectsByName: async (userId, searchTerm) => {
    try {
      const db = getDatabase();
      const [result] = await db.executeSql(
        'SELECT * FROM detected_objects WHERE user_id = ? AND object_name LIKE ? ORDER BY created_at DESC',
        [userId, `%${searchTerm}%`]
      );
      
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
      return objects;
    } catch (error) {
      console.error("Error searching objects by name:", error);
      throw error;
    }
  },

  // 清除对象识别历史
  clearObjectDetectionHistory: async (userId) => {
    try {
      const db = getDatabase();
      const [result] = await db.executeSql(
        'DELETE FROM detected_objects WHERE user_id = ?',
        [userId]
      );
      return result.rowsAffected;
    } catch (error) {
      console.error("Error clearing object detection history:", error);
      throw error;
    }
  },
  
  // 替换收藏对象方法，转为收藏单词
  saveObjectAsWord: async (userId, objectId) => {
    try {
      const db = getDatabase();
      
      // 先获取对象信息
      const [objResult] = await db.executeSql(
        'SELECT object_name, translation FROM detected_objects WHERE id = ?',
        [objectId]
      );
      
      if (objResult.rows.length === 0) {
        throw new Error('Object not found');
      }
      
      const obj = objResult.rows.item(0);
      const word = obj.object_name;
      const translation = obj.translation;
      
      // 检查单词是否已存在
      const [wordResult] = await db.executeSql(
        'SELECT id FROM words WHERE user_id = ? AND word = ?',
        [userId, word]
      );
      
      if (wordResult.rows.length > 0) {
        // 单词已存在，返回ID
        return wordResult.rows.item(0).id;
      } else {
        // 单词不存在，添加到收藏单词表
        const [insertResult] = await db.executeSql(
          'INSERT INTO words (user_id, word, phonetic, is_favorite) VALUES (?, ?, ?, 1)',
          [userId, word, ""]
        );
        
        const wordId = insertResult.insertId;
        
        // 如果有翻译，添加为定义
        if (translation) {
          try {
            await db.executeSql(
              'INSERT INTO word_definitions (word_id, definition) VALUES (?, ?)',
              [wordId, translation]
            );
          } catch (defError) {
            // 即使定义添加失败，也返回单词ID
            console.error('Error adding definition:', defError);
          }
        }
        
        return wordId;
      }
    } catch (error) {
      console.error("Error saving object as word:", error);
      throw error;
    }
  },
  
  // 获取检测到的物体中可能适合收藏为单词的项目
  getObjectsForWordCollection: async (userId, limit = 20) => {
    try {
      const db = getDatabase();
      const [result] = await db.executeSql(
        `SELECT do.*, 
         CASE WHEN fw.id IS NOT NULL THEN 1 ELSE 0 END as is_word_favorite
         FROM detected_objects do
         LEFT JOIN words fw ON fw.word = do.object_name AND fw.user_id = ?
         WHERE do.user_id = ?
         ORDER BY do.created_at DESC LIMIT ?`,
        [userId, userId, limit]
      );
      
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
      return objects;
    } catch (error) {
      console.error("Error getting objects for word collection:", error);
      throw error;
    }
  },

  // 从对象检测历史中获取单词信息
  getWordInfoFromDetection: async (objectName) => {
    try {
      const db = getDatabase();
      const [result] = await db.executeSql(
        'SELECT object_name, translation FROM detected_objects WHERE object_name = ? ORDER BY created_at DESC LIMIT 1',
        [objectName]
      );
      
      if (result.rows.length > 0) {
        return result.rows.item(0);
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error getting word info from detection:", error);
      throw error;
    }
  },

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
        const result = await objectDetectionOperations.saveDetectedObject(
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

export default objectDetectionOperations;
