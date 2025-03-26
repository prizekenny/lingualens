import { useContext } from 'react';
import { LanguageContext } from '../context/LanguageProvider';
import { getTranslations } from './translations';

export function useTranslation() {
  const { language } = useContext(LanguageContext);
  const translations = getTranslations(language);
  
  // t 函数用于获取指定路径的翻译文本
  const t = (path) => {
    const keys = path.split('.');
    let result = translations;
    
    for (const key of keys) {
      if (result && result[key]) {
        result = result[key];
      } else {
        // 如果找不到翻译，返回路径本身作为回退
        return path;
      }
    }
    
    return result;
  };
  
  return { t, language };
}
