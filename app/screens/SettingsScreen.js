import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useLanguage } from "../context/LanguageProvider";
import { useRouter } from "expo-router";

// DeepL 语言代码映射（后面可以用来传到 API）
export const languageCodeMap = {
  "en-US": "EN",
  "en-UK": "EN-GB", // DeepL 支持 英式英文
  fr: "FR",
  de: "DE",
  ja: "JA",
  ko: "KO",
  es: "ES",
  "zh-CN": "ZH",
};

const languages = [
  { code: "zh-CN", label: "Chinese" },
  // { code: "en-US", label: "United States [US]" },
  // { code: "en-UK", label: "English [UK]" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "ja", label: "Japanese" },
  { code: "ko", label: "Korean" },
  { code: "es", label: "Spanish" },
];

export default function SettingsScreen() {
  const { language, setLanguage } = useLanguage();
  const router = useRouter();

  return (
    <View className="flex-1 px-4 pt-14 bg-white">
      <Text className="text-2xl font-bold mb-4">Settings</Text>
      <Text className="text-xl font-semibold mb-2">Language</Text>
      <ScrollView>
        {languages.map((item) => (
          <TouchableOpacity
            key={item.code}
            onPress={() => {
              setLanguage(item.code);
              router.back(); // 选完语言自动返回
            }}
            className={`p-3 border rounded-xl my-1 ${
              language === item.code ? "border-orange-500" : "border-gray-300"
            }`}
          >
            <Text>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
