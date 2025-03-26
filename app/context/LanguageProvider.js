import React, { createContext, useState, useContext, useEffect } from "react";
import { languageCodeMap } from "../screens/SettingsScreen";

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState("en-US");
  
  // 当语言更改时，更新全局变量以便 translate.js 等非组件函数可以访问
  useEffect(() => {
    global.currentLanguage = language;
    // 添加调试信息
    console.log(`Language changed to: ${language}, DeepL code: ${languageCodeMap[language]}`);
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
