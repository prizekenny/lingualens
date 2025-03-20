import SQLite from 'react-native-sqlite-storage';

// 初始化 SQLite
SQLite.enablePromise(true); // 启用 Promise 接口

// 初始化数据库
let db;

// Initialize database tables
export const initDB = async () => {
  try {
    db = await SQLite.openDatabase({
      name: 'linguaLens.db',
      location: 'default'
    });
    
    // Create users table
    await db.executeSql(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      email TEXT UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`);
    console.log("Users table created");

    // Create favorite words table - with user_id association
    await db.executeSql(`CREATE TABLE IF NOT EXISTS words (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      word TEXT NOT NULL,
      phonetic TEXT,
      is_favorite INTEGER DEFAULT 0,
      image_id INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (image_id) REFERENCES images(id)
    );`);
    await db.executeSql('CREATE INDEX IF NOT EXISTS idx_words_user_id ON words(user_id);');
    await db.executeSql('CREATE INDEX IF NOT EXISTS idx_words_word ON words(word);');
    await db.executeSql('CREATE INDEX IF NOT EXISTS idx_words_is_favorite ON words(is_favorite);');

    // 为未来功能预留的单词详情表（当前不使用）
    await db.executeSql(`CREATE TABLE IF NOT EXISTS word_details (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      word_id INTEGER NOT NULL,
      phonetic TEXT,
      translation TEXT,
      definitions TEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (word_id) REFERENCES words(id) ON DELETE CASCADE
    );`);

    // Create word definitions table - to store multiple definitions per word
    await db.executeSql(`CREATE TABLE IF NOT EXISTS word_definitions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      word_id INTEGER NOT NULL,
      part_of_speech TEXT,
      definition TEXT,
      translation TEXT,
      example TEXT,
      example_translation TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (word_id) REFERENCES words(id) ON DELETE CASCADE
    );`);
    await db.executeSql('CREATE INDEX IF NOT EXISTS idx_word_definitions_word_id ON word_definitions(word_id);');

    // Create detected objects table - for storing objects detected in images
    await db.executeSql(`CREATE TABLE IF NOT EXISTS detected_objects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      word_id INTEGER,
      image_id INTEGER NOT NULL,
      object_name TEXT NOT NULL,
      translation TEXT,
      confidence REAL,
      bounding_box TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (word_id) REFERENCES words(id),
      FOREIGN KEY (image_id) REFERENCES images(id) ON DELETE CASCADE
    );`);
    await db.executeSql('CREATE INDEX IF NOT EXISTS idx_detected_objects_user_id ON detected_objects(user_id);');
    await db.executeSql('CREATE INDEX IF NOT EXISTS idx_detected_objects_image_id ON detected_objects(image_id);');
    await db.executeSql('CREATE INDEX IF NOT EXISTS idx_detected_objects_word_id ON detected_objects(word_id);');

    // Create search history table - with user_id association
    await db.executeSql(`CREATE TABLE IF NOT EXISTS search_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      word TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );`);

    // Create object detection history table - with user_id association
    await db.executeSql(`CREATE TABLE IF NOT EXISTS object_detection_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      object_name TEXT NOT NULL,
      image_uri TEXT,
      confidence REAL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );`);

    // Create word review cards table - according to implementation plan
    await db.executeSql(`CREATE TABLE IF NOT EXISTS review_cards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      word_id INTEGER NOT NULL,
      repetitions INTEGER DEFAULT 0,
      ease_factor FLOAT DEFAULT 2.5,
      interval INTEGER DEFAULT 0,
      next_review_date TIMESTAMP,
      last_review_date TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (word_id) REFERENCES words(id)
    );`);
    await db.executeSql('CREATE INDEX IF NOT EXISTS idx_review_cards_user_id ON review_cards(user_id);');
    await db.executeSql('CREATE INDEX IF NOT EXISTS idx_review_cards_word_id ON review_cards(word_id);');
    await db.executeSql('CREATE INDEX IF NOT EXISTS idx_review_cards_next_review_date ON review_cards(next_review_date);');

    // Create user language preferences table
    await db.executeSql(`CREATE TABLE IF NOT EXISTS user_preferences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL UNIQUE,
      preferred_language TEXT DEFAULT 'en',
      target_language TEXT DEFAULT 'zh',
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );`);

    // Create images table - for storing detailed image information
    await db.executeSql(`CREATE TABLE IF NOT EXISTS images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      image_uri TEXT NOT NULL,
      filename TEXT,
      file_size INTEGER,
      width INTEGER,
      height INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      is_deleted INTEGER DEFAULT 0,
      metadata TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );`);
    await db.executeSql('CREATE INDEX IF NOT EXISTS idx_images_user_id ON images(user_id);');
    await db.executeSql('CREATE INDEX IF NOT EXISTS idx_images_created_at ON images(created_at);');

    // Create a default user if not exists
    await db.executeSql(
      `INSERT OR IGNORE INTO users (id, username, password, email) 
       VALUES (1, 'default', 'password', 'default@example.com')`
    );
    console.log("Default user created or exists");
    
    console.log("Database initialized successfully");
    return db;
  } catch (e) {
    console.error("Database init error:", e);
    return null;
  }
};

// 导出数据库对象的获取方法
export const getDatabase = () => {
  return db;
};

export default { getDatabase, initDB };
