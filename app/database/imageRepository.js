import db from './db';

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

export default imageOperations;
