const cache = new Map();

export const fetchWordDetails = async (word) => {
  const trimmedWord = word.trim().toLowerCase();

  // 检查缓存，避免重复请求
  if (cache.has(trimmedWord)) {
    return cache.get(trimmedWord);
  }

  try {
    const response = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(
        trimmedWord
      )}`
    );

    if (!response.ok) {
      throw new Error("Word not found");
    }

    const data = await response.json();

    if (data && data[0]) {
      const wordData = data[0];

      const definitions = wordData.meanings.flatMap((meaning) =>
        meaning.definitions.map((def) => ({
          partOfSpeech: meaning.partOfSpeech,
          definition: def.definition || "No definition available.",
          example: def.example || "",
        }))
      );

      const phonetic =
        wordData.phonetic ||
        wordData.phonetics?.find((p) => p.text)?.text ||
        "";

      const result = {
        word: wordData.word,
        phonetic,
        definitions:
          definitions.length > 0
            ? definitions
            : [{ definition: "No definitions found.", example: "" }],
      };

      // 缓存结果
      cache.set(trimmedWord, result);

      return result;
    } else {
      throw new Error("No data found for word");
    }
  } catch (error) {
    console.error("Dictionary fetch error:", error);
    return {
      word: trimmedWord,
      phonetic: "",
      definitions: [{ definition: "No definition available.", example: "" }],
    }; // 返回默认对象避免崩溃
  }
};
