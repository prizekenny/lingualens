import { View, Text, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import React, { useState, useEffect } from "react";
import Logo from "../../components/Logo";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { detectObjects } from "../api/detection";
import WordCard from "../../components/WordCard";
import { useRouter } from "expo-router";
import { objectDetectionOperations } from "../database/objectDetectionRepository";
import { imageOperations } from "../database/imageRepository";
import { useLanguage } from "../context/LanguageProvider";
import db, { initDB } from "../database/db";
import { languageCodeMap } from './SettingsScreen';

const MainScreen = () => {
  const router = useRouter();
  const { language } = useLanguage();
  const [imageUri, setImageUri] = useState(null);
  const [detectedObjects, setDetectedObjects] = useState([]);
  const [containerDimensions, setContainerDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [imagePosition, setImagePosition] = useState({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  });
  const [selectedWord, setSelectedWord] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // 默认用户ID - 与 FavoritesProvider 保持一致
  const DEFAULT_USER_ID = "1";
  
  // 确保数据库初始化
  useEffect(() => {
    const ensureDBInitialized = async () => {
      try {
        await initDB();
        console.log("Database initialized successfully");
      } catch (error) {
        console.error("Database initialization failed:", error);
      }
    };
    
    ensureDBInitialized();
  }, []);
  
  // 将图片和检测结果保存到数据库
  const saveImageAndObjects = async (imageUri, objects, width, height) => {
    try {
      // 添加元数据，包括当前语言设置 (使用完整的语言代码)
      const metadata = {
        detectionLanguage: language,
        detectionTime: new Date().toISOString(),
        targetLanguage: languageCodeMap[language] || "EN" // 使用 DeepL API 的语言代码
      };
      
      // 保存图片信息
      const imageId = await imageOperations.saveImage(
        DEFAULT_USER_ID,
        imageUri,
        null, // filename
        null, // fileSize
        width, 
        height,
        metadata // 添加元数据
      );
      
      // 保存检测到的对象，并传递当前语言信息
      await objectDetectionOperations.saveMultipleDetections(
        DEFAULT_USER_ID,
        imageId,
        objects.map(obj => ({
          ...obj,
          detectedLanguage: language
        }))
      );
      
      console.log("Image and detected objects saved to database, language:", language);
    } catch (error) {
      console.error("Failed to save image and detected objects:", error);
    }
  };

  // 本地化文字对象，使用与 SettingsScreen.js 一致的语言代码
  const localizedText = {
    "en-US": {
      upload: "Upload",
      takePhoto: "Take Photo",
      favorites: "Favorites",
      permissionCamera: "Permission to access camera is required!",
      permissionGallery: "Permission to access camera roll is required!",
      processing: "Processing...",
      error: "Error processing image. Please try again.",
      noObjectsDetected: "No objects detected in this image."
    },
    "zh-CN": {
      upload: "上传图片",
      takePhoto: "拍照",
      favorites: "收藏夹",
      permissionCamera: "需要相机访问权限！",
      permissionGallery: "需要相册访问权限！",
      processing: "正在处理...",
      error: "处理图片时出错，请重试。",
      noObjectsDetected: "未在图片中检测到任何对象。"
    },
    "fr": {
      upload: "Télécharger",
      takePhoto: "Prendre une photo",
      favorites: "Favoris",
      permissionCamera: "L'autorisation d'accéder à la caméra est requise !",
      permissionGallery: "L'autorisation d'accéder à la galerie est requise !",
      processing: "Traitement en cours...",
      error: "Erreur de traitement de l'image. Veuillez réessayer.",
      noObjectsDetected: "Aucun objet détecté dans cette image."
    },
    "de": {
      upload: "Hochladen",
      takePhoto: "Foto aufnehmen",
      favorites: "Favoriten",
      permissionCamera: "Berechtigung für Kamerazugriff erforderlich!",
      permissionGallery: "Berechtigung für Galeriezugriff erforderlich!",
      processing: "Verarbeitung...",
      error: "Fehler beim Verarbeiten der Bild. Bitte versuchen Sie es erneut.",
      noObjectsDetected: "Keine Objekte in diesem Bild erkannt."
    },
    "ja": {
      upload: "アップロード",
      takePhoto: "写真を撮る",
      favorites: "お気に入り",
      permissionCamera: "カメラへのアクセス許可が必要です！",
      permissionGallery: "ギャラリーへのアクセス許可が必要です！",
      processing: "処理中...",
      error: "画像処理中にエラーが発生しました。もう一度お試しください。",
      noObjectsDetected: "この画像に検出されたオブジェクトはありません。"
    },
    "ko": {
      upload: "업로드",
      takePhoto: "사진 찍기",
      favorites: "즐겨찾기",
      permissionCamera: "카메라 접근 권한이 필요합니다!",
      permissionGallery: "갤러리 접근 권한이 필요합니다!",
      processing: "처리 중...",
      error: "이미지 처리 중 오류가 발생했습니다. 다시 시도해주세요.",
      noObjectsDetected: "이 이미지에서 감지된 객체가 없습니다."
    },
    "es": {
      upload: "Subir",
      takePhoto: "Tomar foto",
      favorites: "Favoritos",
      permissionCamera: "¡Se requiere permiso para acceder a la cámara!",
      permissionGallery: "¡Se requiere permiso para acceder a la galería!",
      processing: "Procesando...",
      error: "Error procesando la imagen. Por favor, inténtelo de nuevo.",
      noObjectsDetected: "No se detectaron objetos en esta imagen."
    }
  };

  // 获取当前语言的文字，如果没有则回退到英文
  const getText = (key) => {
    // 检查当前语言是否有对应的翻译
    if (localizedText[language]?.[key]) {
      return localizedText[language][key];
    }
    // 如果是中文变体但找不到精确匹配，尝试使用 zh-CN
    if (language.startsWith("zh") && localizedText["zh-CN"]?.[key]) {
      return localizedText["zh-CN"][key];
    }
    // 默认回退到英文
    return localizedText["en-US"][key];
  };

  const handleUpload = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert(getText("permissionGallery"));
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync();
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setIsProcessing(true);
      try {
        const selectedAsset = result.assets[0];
        setImageUri(selectedAsset.uri);

        const { width, height } = await new Promise((resolve) => {
          Image.getSize(selectedAsset.uri, (width, height) =>
            resolve({ width, height })
          );
        });

        const containerWidth = containerDimensions.width;
        const containerHeight = containerDimensions.height;
        const aspectRatio = width / height;
        let newWidth, newHeight;
        if (containerWidth / containerHeight > aspectRatio) {
          newHeight = containerHeight;
          newWidth = containerHeight * aspectRatio;
        } else {
          newWidth = containerWidth;
          newHeight = containerWidth / aspectRatio;
        }
        const top = (containerHeight - newHeight) / 2;
        const left = (containerWidth - newWidth) / 2;
        setImagePosition({ top, left, width: newWidth, height: newHeight });

        // 检测对象
        let objects;
        if (selectedAsset.uri.startsWith("file://")) {
          const base64 = await FileSystem.readAsStringAsync(selectedAsset.uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          objects = await detectObjects(null, base64);
        } else {
          objects = await detectObjects(selectedAsset.uri);
        }

        setDetectedObjects(objects);
        
        // 检查是否检测到物体
        if (objects.length === 0) {
          alert(getText("noObjectsDetected"));
        }
        
        // 保存图片和检测结果到数据库
        await saveImageAndObjects(selectedAsset.uri, objects, width, height);
      } catch (error) {
        console.error("Error processing image:", error);
        alert(getText("error"));
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      alert(getText("permissionCamera"));
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 1,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setIsProcessing(true);
      try {
        const capturedAsset = result.assets[0];
        setImageUri(capturedAsset.uri);

        const { width, height } = await new Promise((resolve) => {
          Image.getSize(capturedAsset.uri, (width, height) =>
            resolve({ width, height })
          );
        });

        const containerWidth = containerDimensions.width;
        const containerHeight = containerDimensions.height;
        const aspectRatio = width / height;
        let newWidth, newHeight;
        if (containerWidth / containerHeight > aspectRatio) {
          newHeight = containerHeight;
          newWidth = containerHeight * aspectRatio;
        } else {
          newWidth = containerWidth;
          newHeight = containerWidth / aspectRatio;
        }
        const top = (containerHeight - newHeight) / 2;
        const left = (containerWidth - newWidth) / 2;
        setImagePosition({ top, left, width: newWidth, height: newHeight });

        // 检测对象
        let objects;
        if (capturedAsset.uri.startsWith("file://")) {
          const base64 = await FileSystem.readAsStringAsync(capturedAsset.uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          objects = await detectObjects(null, base64);
        } else {
          objects = await detectObjects(capturedAsset.uri);
        }

        setDetectedObjects(objects);
        
        // 检查是否检测到物体
        if (objects.length === 0) {
          alert(getText("noObjectsDetected"));
        }
        
        // 保存图片和检测结果到数据库
        await saveImageAndObjects(capturedAsset.uri, objects, width, height);
      } catch (error) {
        console.error("Error processing image:", error);
        alert(getText("error"));
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const getTopObjects = (objects) => {
    const objectMap = {};
    objects.forEach((obj) => {
      if (!objectMap[obj.name]) {
        objectMap[obj.name] = [];
      }
      objectMap[obj.name].push(obj);
    });
    const topObjects = [];
    for (const name in objectMap) {
      const sortedObjects = objectMap[name].sort((a, b) => b.value - a.value);
      topObjects.push(...sortedObjects.slice(0, 3));
    }
    return topObjects;
  };

  const topObjects = getTopObjects(detectedObjects);

  return (
    <View className="bg-background flex-1 flex-col mt-12">
      <View className="items-center">
        <Logo imageSize={80} fontSize={30} />
      </View>

      <View
        className="flex-1 bg-gray-500 justify-center items-center overflow-hidden relative mb-5"
        onLayout={(event) => {
          const { width, height } = event.nativeEvent.layout;
          setContainerDimensions({ width, height });
        }}
      >
        <Image
          source={
            imageUri ? { uri: imageUri } : require("../../assets/icon.png")
          }
          className="absolute"
          style={{
            top: imagePosition.top,
            left: imagePosition.left,
            width: imagePosition.width,
            height: imagePosition.height,
          }}
          resizeMode="contain"
        />

        {topObjects.map((obj, index) => {
          const posX =
            obj.boundingBox.left * imagePosition.width + imagePosition.left;
          const posY =
            obj.boundingBox.top * imagePosition.height + imagePosition.top;
          const boxWidth =
            (obj.boundingBox.right - obj.boundingBox.left) *
            imagePosition.width;
          const boxHeight =
            (obj.boundingBox.bottom - obj.boundingBox.top) *
            imagePosition.height;

          return (
            <React.Fragment key={index}>
              <View
                className="absolute border-2 border-green-500 z-20"
                style={{
                  top: posY,
                  left: posX,
                  width: boxWidth,
                  height: boxHeight,
                }}
              />
              <TouchableOpacity
                className="absolute bg-[#FF914D] rounded p-1.5 z-30 py-1"
                style={{ top: posY - 30, left: posX }}
                onPress={() => setSelectedWord({
                  name: obj.name,
                  translation: obj.translation || "",
                  confidence: obj.value
                })}
              >
                <Text className="text-white">{obj.name}</Text>
              </TouchableOpacity>
            </React.Fragment>
          );
        })}

        {isProcessing && (
          <View 
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.3)",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 50,
            }}
          >
            <ActivityIndicator size="large" color="#FF914D" />
            <Text className="text-white mt-2">{getText("processing")}</Text>
          </View>
        )}
      </View>

      <View className="flex-row justify-around pb-5">
        <TouchableOpacity
          onPress={handleUpload}
          className="p-2.5 bg-[#FF914D] rounded"
        >
          <Text className="text-white">{getText("upload")}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleTakePhoto}
          className="p-2.5 bg-[#FF914D] rounded"
        >
          <Text className="text-white">{getText("takePhoto")}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push("/favorites")}
          className="p-2.5 bg-[#FF914D] rounded"
        >
          <Text className="text-white">{getText("favorites")}</Text>
        </TouchableOpacity>
      </View>

      {selectedWord && (
        <View
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <WordCard
            wordName={selectedWord.name}
            initialTranslation={selectedWord.translation}
            onClose={() => setSelectedWord(null)}
          />
        </View>
      )}
    </View>
  );
};

export default MainScreen;
