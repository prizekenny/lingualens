import SQLite from 'react-native-sqlite-storage';

// Initialize database
const db = SQLite.openDatabase(
  {
    name: 'linguaLens.db',
    location: 'default',
  },
  () => console.log('Database connected'),
  error => console.error('Database error', error)
);

// Initialize database tables
export const initDB = () => {
  // Create users table
  db.transaction(tx => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        email TEXT UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`
    );
  });

  // Create favorite words table - with user_id association
  db.transaction(tx => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS words (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        word TEXT NOT NULL,
        is_favorite INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );`
    );
    tx.executeSql('CREATE INDEX IF NOT EXISTS idx_words_user_id ON words(user_id);');
    tx.executeSql('CREATE INDEX IF NOT EXISTS idx_words_word ON words(word);');
  });

  // 为未来功能预留的单词详情表（当前不使用）
  db.transaction(tx => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS word_details (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        word_id INTEGER NOT NULL,
        phonetic TEXT,
        translation TEXT,
        definitions TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (word_id) REFERENCES words(id) ON DELETE CASCADE
      );`
    );
  });

  // Create word definitions table - to store multiple definitions per word
  db.transaction(tx => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS word_definitions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        word_id INTEGER NOT NULL,
        part_of_speech TEXT,
        definition TEXT NOT NULL,
        translation TEXT,
        example TEXT,
        FOREIGN KEY (word_id) REFERENCES words(id) ON DELETE CASCADE
      );`
    );
    tx.executeSql('CREATE INDEX IF NOT EXISTS idx_word_definitions_word_id ON word_definitions(word_id);');
  });

  // Create detected objects table - for storing objects detected in images
  db.transaction(tx => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS detected_objects (
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
      );`
    );
    tx.executeSql('CREATE INDEX IF NOT EXISTS idx_detected_objects_user_id ON detected_objects(user_id);');
    tx.executeSql('CREATE INDEX IF NOT EXISTS idx_detected_objects_image_id ON detected_objects(image_id);');
    tx.executeSql('CREATE INDEX IF NOT EXISTS idx_detected_objects_word_id ON detected_objects(word_id);');
  });

  // Create search history table - with user_id association
  db.transaction(tx => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS search_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        word TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );`
    );
  });

  // Create object detection history table - with user_id association
  db.transaction(tx => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS object_detection_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        object_name TEXT NOT NULL,
        image_uri TEXT,
        confidence REAL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );`
    );
  });

  // Create word review cards table - according to implementation plan
  db.transaction(tx => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS review_cards (
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
      );`
    );
    tx.executeSql('CREATE INDEX IF NOT EXISTS idx_review_cards_user_id ON review_cards(user_id);');
    tx.executeSql('CREATE INDEX IF NOT EXISTS idx_review_cards_word_id ON review_cards(word_id);');
    tx.executeSql('CREATE INDEX IF NOT EXISTS idx_review_cards_next_review_date ON review_cards(next_review_date);');
  });

  // Create user language preferences table
  db.transaction(tx => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS user_preferences (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL UNIQUE,
        preferred_language TEXT DEFAULT 'en',
        target_language TEXT DEFAULT 'zh',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );`
    );
  });

  // Create images table - for storing detailed image information
  db.transaction(tx => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS images (
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
      );`
    );
    tx.executeSql('CREATE INDEX IF NOT EXISTS idx_images_user_id ON images(user_id);');
    tx.executeSql('CREATE INDEX IF NOT EXISTS idx_images_created_at ON images(created_at);');
  });
};

export default db;
