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
      `CREATE TABLE IF NOT EXISTS favorite_words (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        word TEXT NOT NULL,
        phonetic TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
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
        FOREIGN KEY (word_id) REFERENCES favorite_words(id) ON DELETE CASCADE
      );`
    );
  });

  // Create detected objects table - for storing objects detected in images
  db.transaction(tx => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS detected_objects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        object_name TEXT NOT NULL,
        translation TEXT,
        confidence REAL,
        image_uri TEXT,
        bounding_box TEXT,
        is_favorite INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );`
    );
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
        FOREIGN KEY (word_id) REFERENCES favorite_words(id)
      );`
    );
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
};
