export const fetchWordDetails = async (word) => {
  try {
    const response = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(
        word.trim()
      )}`
    );

    if (!response.ok) {
      throw new Error("未找到该单词的释义 Word not found");
    }

    const data = await response.json();

    console.log("Word data:", data);

    if (data && data[0]) {
      const wordData = data[0];
      let definitions = [];

      wordData.meanings.forEach((meaning) => {
        meaning.definitions.forEach((def) => {
          definitions.push({
            partOfSpeech: meaning.partOfSpeech,
            definition: def.definition,
            example: def.example,
          });
        });
      });

      return {
        word: wordData.word,
        phonetic: wordData.phonetic,
        definitions: definitions,
      };
    }
  } catch (error) {
    console.error("词典查询错误 Dictionary fetch error:", error);
    throw error;
  }
};
