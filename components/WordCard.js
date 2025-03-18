import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { useTranslate } from "../app/api/translate";

const WordCard = ({ wordName, wordDetail = {}, onClose }) => {
  const { phonetic = "", definitions = [] } = wordDetail;
  const { translateText } = useTranslate();
  const [translatedWord, setTranslatedWord] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const doTranslate = async () => {
      setLoading(true);
      const result = await translateText(wordName);
      setTranslatedWord(result);
      setLoading(false);
    };
    doTranslate();
  }, [wordName]);

  return (
    <View
      style={{
        width: "90%",
        backgroundColor: "#1F2937",
        borderRadius: 12,
        padding: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
      }}
    >
      <Text className="text-white text-2xl font-bold mb-2">{wordName}</Text>
      {loading ? (
        <ActivityIndicator color="#FF914D" />
      ) : (
        <Text className="text-orange-400 text-xl mb-2">{translatedWord}</Text>
      )}
      {phonetic && (
        <Text className="text-gray-400 text-lg mb-4">{phonetic}</Text>
      )}

      <View>
        {definitions.map((def, index) => (
          <View key={index} className="mb-4">
            <Text className="text-white text-base">
              {index + 1}. {def.definition}
            </Text>
            {def.example && (
              <Text className="text-gray-400 text-sm mt-1">
                Example: {def.example}
              </Text>
            )}
          </View>
        ))}
      </View>

      <TouchableOpacity
        onPress={onClose}
        className="mt-4 bg-red-500 rounded-full py-2 px-4 self-center"
      >
        <Text className="text-white text-center font-bold">Close</Text>
      </TouchableOpacity>
    </View>
  );
};

export default WordCard;
