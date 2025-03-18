import { View, Text, TouchableOpacity, Image, Pressable } from "react-native";
import React, { useState, useEffect } from "react";

import Logo from "../../components/Logo";
import * as ImagePicker from "expo-image-picker"; // Import ImagePicker
import * as FileSystem from "expo-file-system"; // Import FileSystem
import { detectObjects } from "../api/detection"; // Import detectObjects api
import WordCard from "../../components/WordCard"; // 引入 WordCard 组件

import { useRouter } from "expo-router";

const MainScreen = () => {
  const router = useRouter();

  const [imageUri, setImageUri] = useState(null); // State to store the image URI
  const [detectedObjects, setDetectedObjects] = useState([]); // 存储检测到的物体
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
  const [selectedWord, setSelectedWord] = useState(null); // 用于存储选中的单词

  // 上传图片
  const handleUpload = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert("Permission to access camera roll is required!");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync();
    console.log("Image picker result:", result);
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedAsset = result.assets[0];
      console.log("Selected image URI:", selectedAsset.uri);
      setImageUri(selectedAsset.uri);
      // 获取图像宽高
      const { width, height } = await new Promise((resolve) => {
        Image.getSize(selectedAsset.uri, (width, height) =>
          resolve({ width, height })
        );
      });

      // 根据容器尺寸和原图宽高计算显示尺寸
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

      // 调用检测 API
      if (selectedAsset.uri.startsWith("file://")) {
        const base64 = await FileSystem.readAsStringAsync(selectedAsset.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        const objects = await detectObjects(null, base64);
        setDetectedObjects(objects);
      } else {
        const objects = await detectObjects(selectedAsset.uri);
        setDetectedObjects(objects);
      }
    } else {
      console.log("Image selection was cancelled or no assets found.");
    }
  };

  // 拍照
  const handleTakePhoto = async () => {
    // 请求相机权限
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
      console.log("Captured image URI:", capturedAsset.uri);
      setImageUri(capturedAsset.uri);

      // 获取图像宽高
      const { width, height } = await new Promise((resolve) => {
        Image.getSize(capturedAsset.uri, (width, height) =>
          resolve({ width, height })
        );
      });

      // 根据容器尺寸和原图宽高计算显示尺寸
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

      // 调用检测 API
      try {
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
      } catch (error) {
        console.error("Object detection error:", error);
        alert("Failed to detect objects in the image");
      }
    }
  };

  // 筛选同名物体中值最大的三个
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
      {/* 图片容器 */}
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
          // 计算绿框位置和尺寸（基于归一化坐标）
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

          // 这里示例中暂时将 label 放在绿框正上方（posY - 30）；
          // 后续可根据文字动态尺寸和边界进行调整
          let labelTop = posY - 30;
          let labelLeft = posX;

          // 可在此处加入更多判断（例如：超出右边界、上边界等）动态调整 labelTop/labelLeft

          return (
            <React.Fragment key={index}>
              {/* 绿框 */}
              <View
                className="absolute border-2 border-green-500 z-20"
                style={{
                  top: posY,
                  left: posX,
                  width: boxWidth,
                  height: boxHeight,
                }}
              />
              {/* 文字容器 */}
              <TouchableOpacity
                className="absolute bg-[#FF914D] rounded p-1.5 z-30 py-1"
                style={{ top: labelTop, left: labelLeft }}
                onPress={() => setSelectedWord(obj.name)} // 点击单词时设置选中的单词
              >
                <Text className="text-white">{obj.name}</Text>
              </TouchableOpacity>
            </React.Fragment>
          );
        })}
      </View>

      {/* 按钮区域 */}
      <View className="flex-row justify-around pb-5">
        <TouchableOpacity
          onPress={handleUpload}
          className="p-2.5 bg-[#FF914D] rounded"
        >
          <Text className="text-white">Upload</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleTakePhoto}
          className="p-2.5 bg-[#FF914D] rounded"
        >
          <Text className="text-white">Take Photo</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {}}
          className="p-2.5 bg-[#FF914D] rounded"
        >
          <Text className="text-white">❤️</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push("/screens/SettingsScreen")}
          className="p-2.5 bg-[#FF914D] rounded" //
        >
          <Text className="text-white">⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* 显示 WordCard 弹窗 */}
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
            wordName={selectedWord}
            wordDetail={{
              phonetic: "/example/",
              definitions: [
                {
                  definition: "Example definition 1",
                  example: "Example usage 1",
                },
                {
                  definition: "Example definition 2",
                  example: "Example usage 2",
                },
              ],
            }}
            onClose={() => setSelectedWord(null)}
          />
        </View>
      )}
    </View>
  );
};

export default MainScreen;
