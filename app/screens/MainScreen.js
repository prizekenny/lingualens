import { View, Text, TouchableOpacity, Image } from "react-native";
import React, { useState, useEffect } from "react";
import Logo from "../../components/Logo";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { detectObjects } from "../api/detection";
import WordCard from "../../components/WordCard";
import { useRouter } from "expo-router";
import { StyleSheet, ActivityIndicator } from "react-native";

const MainScreen = () => {
  const router = useRouter();
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
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert("Permission to access camera roll is required!");
      setLoading(false);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync();
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedAsset = result.assets[0];
      setImageUri(selectedAsset.uri);

      // 计算图片尺寸与位置
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

      setLoading(true); // 开始加载
      setDetectedObjects([]); // 清除已识别单词

      let objects;
      if (selectedAsset.uri.startsWith("file://")) {
        const base64 = await FileSystem.readAsStringAsync(selectedAsset.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        objects = await detectObjects(null, base64);
      } else {
        objects = await detectObjects(selectedAsset.uri);
      }

      setLoading(false); // 加载完成
      setDetectedObjects(objects);
    }
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      alert("Permission to access camera is required!");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 1,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
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

      setLoading(true);
      setDetectedObjects([]);

      // 下面的代码替换了！
      let objects;
      if (capturedAsset.uri.startsWith("file://")) {
        const base64 = await FileSystem.readAsStringAsync(capturedAsset.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        objects = await detectObjects(null, base64);
      } else {
        objects = await detectObjects(capturedAsset.uri);
      }

      setLoading(false);
      setDetectedObjects(objects);
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

      {loading && (
        <View
          style={{
            ...StyleSheet.absoluteFillObject,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <ActivityIndicator size="large" color="#FF914D" />
          <Text style={{ color: "white", marginTop: 10 }}>Processing...</Text>
        </View>
      )}

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
                onPress={() => setSelectedWord(obj)}
              >
                <Text className="text-white">{obj.name}</Text>
              </TouchableOpacity>
            </React.Fragment>
          );
        })}
      </View>

      <View className="flex-row justify-around pb-5">
        <TouchableOpacity
          onPress={handleUpload}
          className="p-2.5 bg-[#FF914D] rounded-full px-5"
        >
          <Text className="text-white">Upload</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleTakePhoto}
          className="p-2.5 bg-[#FF914D] rounded-full px-5"
        >
          <Text className="text-white">Take Photo</Text>
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
            onClose={() => setSelectedWord(null)}
          />
        </View>
      )}
    </View>
  );
};

export default MainScreen;
