import { openDatabaseAsync } from "expo-sqlite";
import * as FileSystem from 'expo-file-system';

let db = null;

// 获取数据库实例
const getDatabase = async () => {
  if (!db) {
    console.log("数据库未初始化，正在初始化...");
    db = await openDatabaseAsync("lingualens.db");

    if (!db) {
      throw new Error("数据库初始化失败，db 为空！");
    }

    try {
      // 创建 favorites 表
      await db.runAsync(`
      CREATE TABLE IF NOT EXISTS favorites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        word TEXT NOT NULL UNIQUE,
        phonetic TEXT,
        translation TEXT,
        timestamp INTEGER,
        language TEXT
      );
    `);

      // 创建 definitions 表
      await db.runAsync(`
      CREATE TABLE IF NOT EXISTS definitions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        favorite_id INTEGER NOT NULL ,
        definition TEXT NOT NULL,
        translation TEXT,
        example TEXT,
        exampleTranslation TEXT,
        FOREIGN KEY (favorite_id) REFERENCES favorites(id) ON DELETE CASCADE
      );
    `);

      const tables = await db.getAllAsync(
        "SELECT name FROM sqlite_master WHERE type='table'"
      );
      console.log("数据库初始化成功, ", db);
    } catch (error) {
      console.error("❌ 数据库初始化失败:", error);
      db = null;
    }
    console.log("📌 [DEBUG]数据库, ", db);
    return db;
  }
  return db;
};

export const addFavorite = async (favorite) => {
  if (
    !favorite.word ||
    typeof favorite.word !== "string" ||
    favorite.word.trim() === ""
  ) {
    console.error("❌ Error: 无效的单词对象", favorite);
    return;
  }

  const { word, phonetic = "", definitions = [], language } = favorite;
  const timestamp = Date.now();
  const db = await getDatabase();
  if (!db) {
    console.error("❌ 数据库连接丢失");
    return;
  }

  try {
    console.log(`📌 处理收藏: ${JSON.stringify(favorite, null, 2)}`);

    const wordName = word.trim();
    // 1️⃣ 检查是否已存在 word
    const existingEntry = await db.getFirstAsync(
      "SELECT id FROM favorites WHERE word = ?",
      [wordName]
    );

    console.log(
      "📌 [DEBUG] 插入前的 word:",
      typeof wordName,
      `'${wordName}'`,
      "长度:",
      wordName.length
    );

    let favoriteId;
    if (existingEntry) {
      // 2️⃣ 如果 word 存在，执行 UPDATE
      await db.runAsync(
        "UPDATE favorites SET phonetic = ?, translation = ?, timestamp = ?, language = ? WHERE word = ?",
        [phonetic.trim(), favorite.translation || "", timestamp, language, wordName]
      );
      favoriteId = existingEntry.id;
      console.log("✅ 现有单词已更新:", wordName);
    } else {
      // 3️⃣ 如果 word 不存在，执行 INSERT
      await db.runAsync(
        "INSERT INTO favorites (word, phonetic, translation, timestamp, language) VALUES (?, ?, ?, ?, ?)",
        [wordName, phonetic.trim(), favorite.translation || "", timestamp, language]
      );

      // 获取新插入的 id
      const newEntry = await db.getFirstAsync(
        "SELECT last_insert_rowid() AS id"
      );
      if (!newEntry || !newEntry.id) {
        throw new Error("⚠️ 插入收藏失败，未能获取收藏 ID");
      }
      favoriteId = newEntry.id;
      console.log("🎉 添加收藏成功:", word);
    }

    console.log("📌 [DEBUG] 处理 definitions 数量:", definitions.length);
    // 4️⃣ 处理 definitions
    for (const def of definitions) {
      console.log("📌 [DEBUG] 处理 definition:", def);

      if (!def.definition) continue; // 确保定义不为空

      // 检查 definition 是否已存在
      const existingDef = await db.getFirstAsync(
        "SELECT id FROM definitions WHERE favorite_id = ? AND definition = ?",
        [favoriteId, def.definition.trim()] // 统一使用 definition 字段名
      );

      console.log("📌 [DEBUG] 处理 definition exist?:", existingDef);

      if (!existingDef) {
        // 插入 definition
        await db.runAsync(
          "INSERT INTO definitions (favorite_id, definition, translation, example, exampleTranslation) VALUES (?, ?, ?, ?, ?)",
          [
            favoriteId,
            def.definition.trim() || "", // 统一使用 definition
            def.translation.trim() || "", // 统一使用 translation
            def.example?.trim() || "",
            def.exampleTranslation?.trim() || "",
          ]
        );
        console.log(`✅ 新定义插入: ${def.definition.substring(0, 30)}...`);
      } else {
        console.log(`⚠️ 定义已存在，跳过: ${def.definition.substring(0, 30)}...`);
      }
    }
  } catch (error) {
    console.error("❌ 添加/更新收藏失败:", error.message);
  }
};

// ✅ 移除收藏单词
export const removeFavorite = async (word) => {
  const db = await getDatabase();
  if (!db) {
    console.error("❌ 数据库连接丢失");
    return;
  }

  try {
    await db.runAsync("DELETE FROM favorites WHERE word = ?", [word]);
    console.log("移除收藏成功:", word);
  } catch (error) {
    console.error("移除收藏失败:", error);
  }
};

// ✅ 检查单词是否已收藏
export const isFavorite = async (word) => {
  const db = await getDatabase();
  if (!db) {
    console.error("❌ 数据库连接丢失");
    return;
  }

  console.log("检查收藏状态:", word);
  try {
    const result = await db.getFirstAsync(
      "SELECT word FROM favorites WHERE word = ?",
      [word.trim()]
    );

    console.log("检查收藏状态:", result);

    return result !== undefined && result !== null;
  } catch (error) {
    console.error("检查收藏状态失败:", error);
    return false;
  }
};

// ✅ 获取所有收藏单词（包含定义）
export const getAllFavorites = async () => {
  const db = await getDatabase();
  if (!db) {
    console.error("❌ 数据库连接丢失");
    return;
  }

  try {
    const favorites = await db.getAllAsync(
      "SELECT id, word, phonetic, translation, timestamp FROM favorites ORDER BY timestamp DESC"
    );

    for (let i = 0; i < favorites.length; i++) {
      const definitions = await db.getAllAsync(
        "SELECT definition, translation, example, exampleTranslation FROM definitions WHERE favorite_id = ?",
        [favorites[i].id]
      );
      favorites[i].definitions = definitions.length > 0 ? definitions : [];
    }

    return favorites;
  } catch (error) {
    console.error("获取收藏列表失败:", error);
    return [];
  }
};

export const getFavoriteByWord = async (word) => {
  const db = await getDatabase();
  try {
    const favorite = await db.getFirstAsync(
      "SELECT * FROM favorites WHERE word = ?",
      [word]
    );
    if (!favorite) return null;

    // 获取所有定义
    const definitions = await db.getAllAsync(
      "SELECT definition, translation, example, exampleTranslation FROM definitions WHERE favorite_id = ?",
      [favorite.id]
    );

    return { ...favorite, definitions };
  } catch (error) {
    console.error("❌ 获取收藏数据失败:", error);
    return null;
  }
};

// 重置数据库
export const resetDatabase = async () => {
  try {
    if (db) {
      await db.closeAsync();
      db = null;
    }
    
    // 删除数据库文件
    const dbDir = `${FileSystem.documentDirectory}SQLite/`;
    const dbPath = `${dbDir}lingualens.db`;
    
    // 检查文件是否存在
    const fileInfo = await FileSystem.getInfoAsync(dbPath);
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(dbPath);
      console.log("数据库文件已删除");
    }
    
    // 重新初始化数据库
    db = await getDatabase();
    return true;
  } catch (error) {
    console.error("重置数据库失败:", error);
    return false;
  }
};

// ✅ 默认导出
export default {
  addFavorite,
  removeFavorite,
  isFavorite,
  getAllFavorites,
  getFavoriteByWord,
  resetDatabase,
};
