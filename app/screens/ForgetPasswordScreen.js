import { View, Text, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import Logo from "../../components/Logo";
import { Input } from "react-native-elements";

const ForgetPasswordScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState(""); // State to hold email input

  // Handle password reset
  const handleResetPassword = () => {
    // Logic for resetting password
    console.log("Reset password for:", email);
  };

  return (
    <View className="flex-1 bg-background text-textPrimary px-5">
      {/* Back Button */}
      <TouchableOpacity onPress={() => router.back()} className="mt-14">
        <Text className="text-blue-600 text-lg">← Back</Text>
      </TouchableOpacity>

      {/* Display logo at the top */}
      <View className="items-center mt-5">
        <Logo imageSize={80} fontSize={30} />
      </View>

      {/* Content */}
      <View className="flex-1 justify-center items-center">
        <Text className="text-4xl text-center mb-5">Forget Password</Text>
        <Text className="text-1xl text-center mb-5 text-textSecondary">
          Enter your email address and we will send you a link to reset your
          password.
        </Text>

        {/* Email Input */}
        <Input
          placeholder="Email"
          inputContainerStyle={{
            borderWidth: 1,
            borderColor: "#d1d5db",
            borderRadius: 999,
            paddingHorizontal: 15,
            height: 50,
          }}
          inputStyle={{ fontSize: 16 }}
          containerStyle={{ marginBottom: 15 }}
          value={email}
          onChangeText={setEmail}
        />

        {/* Reset Password Button */}
        <TouchableOpacity
          onPress={handleResetPassword}
          className="bg-primary rounded-full py-3 px-6 w-full"
          style={{ maxWidth: 400 }}
        >
          <Text className="text-white text-lg text-center">Reset Password</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ForgetPasswordScreen;
