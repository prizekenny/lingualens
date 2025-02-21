import { View, Text, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import Logo from "../../components/Logo";
import { Input } from "react-native-elements";

const RegisterScreen = () => {
  const router = useRouter();
  const [name, setName] = useState(""); // State for name input
  const [email, setEmail] = useState(""); // State for email input
  const [password, setPassword] = useState(""); // State for password input

  // Handle registration
  const handleRegister = () => {
    console.log("Register with:", { name, email, password });
    router.push("/[tabs]"); // Navigate to main screen after registration
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
        <Text className="text-4xl text-center mb-5">Register</Text>
        <Text className="text-1xl text-center mb-5 text-textSecondary">
          Create a new account to get started.
        </Text>

        {/* Name Input */}
        <Input
          placeholder="Name"
          inputContainerStyle={{
            borderWidth: 1,
            borderColor: "#d1d5db",
            borderRadius: 999,
            paddingHorizontal: 15,
            height: 50,
          }}
          inputStyle={{ fontSize: 16 }}
          containerStyle={{ marginBottom: 15 }}
          value={name}
          onChangeText={setName}
        />

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

        {/* Password Input */}
        <Input
          placeholder="Password"
          secureTextEntry={true} // Keep password hidden
          inputContainerStyle={{
            borderWidth: 1,
            borderColor: "#d1d5db",
            borderRadius: 999,
            paddingHorizontal: 15,
            height: 50,
          }}
          inputStyle={{ fontSize: 16 }}
          value={password}
          onChangeText={setPassword}
        />

        {/* Register Button */}
        <TouchableOpacity
          onPress={handleRegister}
          className="bg-primary rounded-full py-3 px-6 w-full mt-5"
          style={{ maxWidth: 400 }}
        >
          <Text className="text-white text-lg text-center">Register</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default RegisterScreen;
