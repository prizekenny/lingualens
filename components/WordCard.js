import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

const WordCard = ({ wordName, wordDetail = {}, onClose }) => {
  // 设置默认值，防止 wordDetail 为空时出错
  const { phonetic = "", definitions = [] } = wordDetail;
  
  return (
    <View
      style={{
        width: '90%', // 屏幕宽度的90%
        backgroundColor: '#1F2937',
        borderRadius: 12,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
      }}
    >
      <Text className="text-white text-2xl font-bold mb-2">{wordName}</Text>
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
