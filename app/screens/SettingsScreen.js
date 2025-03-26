import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from "react-native";
import { useLanguage } from "../context/LanguageProvider";
import { useRouter, useNavigation } from "expo-router";
import { useTranslation } from "../i18n/useTranslation";
import { resetDatabase } from "../services/DatabaseService";

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
  { code: "en-US", label: "English (US)" },
  // { code: "en-UK", label: "English (UK)" },
  { code: "zh-CN", label: "Chinese / 中文" },
  { code: "fr", label: "French / Français" },
  { code: "de", label: "German / Deutsch" },
  { code: "ja", label: "Japanese / 日本語" },
  { code: "ko", label: "Korean / 한국어" },
  { code: "es", label: "Spanish / Español" },
];

const SettingsScreen = () => {
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();
  const router = useRouter();
  const navigation = useNavigation();

  return (
    <View className="flex-1 px-4 pt-14 bg-white">
      <Text className="text-2xl font-bold mb-4">{t('settings.title')}</Text>
      <Text className="text-xl font-semibold mb-2">{t('settings.language')}</Text>
      <View className="flex-1">
        <ScrollView className="flex-grow">
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
        
        {/* 版本号 - 移至滚动区域下方 */}
        <View className="pb-10 pt-4">
          <Text style={styles.version}>{t('settings.version')} 1.0.0</Text>
          
          {/* 重置数据库按钮 - 使用硬编码英文 */}
          <TouchableOpacity 
            onPress={async () => {
              Alert.alert(
                "Reset Database",
                "Are you sure you want to reset the database? This will delete all saved data.",
                [
                  { 
                    text: "Cancel", 
                    style: "cancel" 
                  },
                  {
                    text: "Reset",
                    style: "destructive",
                    onPress: async () => {
                      const success = await resetDatabase();
                      if (success) {
                        Alert.alert(
                          "Success", 
                          "Database has been reset successfully"
                        );
                      } else {
                        Alert.alert(
                          "Error", 
                          "Failed to reset database"
                        );
                      }
                    }
                  }
                ]
              );
            }} 
            style={styles.resetButton}
          >
            <Text style={styles.resetButtonText}>Reset Database</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  version: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#888',
    marginBottom: 16,
  },
  resetButton: {
    alignSelf: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#FF3B30",
    borderRadius: 8,
    marginTop: 10,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  resetButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },
});

export default SettingsScreen;
