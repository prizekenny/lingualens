import { getDatabase } from './db';

// 图片相关操作
export const imageOperations = {
  // 保存图片信息
  saveImage: async (userId, imageUri, filename = null, fileSize = null, width = null, height = null, metadata = null) => {
    try {
      const db = getDatabase();
      const [result] = await db.executeSql(
        'INSERT INTO images (user_id, image_uri, filename, file_size, width, height, metadata) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [userId, imageUri, filename, fileSize, width, height, metadata ? JSON.stringify(metadata) : null]
      );
      return result.insertId;
    } catch (error) {
      console.error("Error saving image:", error);
      throw error;
    }
  },
  
  // 获取图片信息
  getImage: async (imageId) => {
    try {
      const db = getDatabase();
      const [result] = await db.executeSql(
        'SELECT * FROM images WHERE id = ?',
        [imageId]
      );
      
      if (result.rows.length > 0) {
        const image = result.rows.item(0);
        if (image.metadata) {
          try {
            image.metadata = JSON.parse(image.metadata);
          } catch (e) {
            console.error('Error parsing image metadata', e);
          }
        }
        return image;
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error getting image:", error);
      throw error;
    }
  },
  
  // 获取用户所有图片
  getUserImages: async (userId, limit = 50) => {
    try {
      const db = getDatabase();
      const [result] = await db.executeSql(
        'SELECT * FROM images WHERE user_id = ? AND is_deleted = 0 ORDER BY created_at DESC LIMIT ?',
        [userId, limit]
      );
      
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
      return images;
    } catch (error) {
      console.error("Error getting user images:", error);
      throw error;
    }
  }
};

export default imageOperations;
