import db from './db';
import { wordOperations } from './wordRepository';

// 对象识别历史相关操作
export const objectDetectionOperations = {
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
              'SELECT id FROM words WHERE user_id = ? AND word = ?',
              [userId, word],
              (_, wordResult) => {
                if (wordResult.rows.length > 0) {
                  // 单词已存在，返回ID
                  resolve(wordResult.rows.item(0).id);
                } else {
                  // 单词不存在，添加到收藏单词表
                  tx.executeSql(
                    'INSERT INTO words (user_id, word, phonetic, is_favorite) VALUES (?, ?, ?, 1)',
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
           LEFT JOIN words fw ON fw.word = do.object_name AND fw.user_id = ?
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
  },

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
        objectDetectionOperations.saveDetectedObject(
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

export default objectDetectionOperations;
