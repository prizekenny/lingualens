import { View, Text, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { useRouter, Link } from "expo-router";
import Logo from "../../components/Logo";
import { Input, Icon } from "react-native-elements";

const LoginScreen = () => {
  const router = useRouter();
  const [username, setUsername] = useState("admin"); // Default username
  const [password, setPassword] = useState(""); // Empty password
  const [passwordVisible, setPasswordVisible] = useState(false); // Control password visibility

  // Handle login action
  const handleLogin = () => {
    if (username == "" || password == "") {
      alert("Please enter username and password");
      return;
    }
    router.push("/[tabs]"); // Navigate to the main screen
  };

  return (
    <View className="flex-1 bg-background text-textPrimary px-5">
      {/* Display logo at the top */}
      <View className="items-center mt-10">
        <Logo imageSize={100} fontSize={40} />
      </View>

      {/* Main content in the center */}
      <View className="flex-1 justify-center items-center">
        <View className="mb-5">
          {/* Title and support text */}
          <Text className="text-4xl text-center mb-5">Sign In</Text>
          <Text className="text-1xl text-center mb-5 text-textSecondary">
            If you need any support, please contact us.
          </Text>
        </View>

        {/* Input fields for username and password */}
        <View className="w-full">
          {/* Username input field */}
          <Input
            placeholder="Username"
            inputContainerStyle={{
              borderWidth: 1,
              borderColor: "#d1d5db", // Set gray border
              borderRadius: 999, // Make full rounded edges
              paddingHorizontal: 15,
              height: 50,
            }}
            inputStyle={{ fontSize: 16 }}
            containerStyle={{ marginBottom: 15 }}
            value={username} // Bind username state
            onChangeText={setUsername} // Update username when changed
          />

          {/* Password input field */}
          <Input
            placeholder="Password"
            secureTextEntry={!passwordVisible} // Hide password by default
            rightIcon={
              <Icon
                name={passwordVisible ? "eye" : "eye-off"} // Toggle icon for visibility
                type="feather"
                onPress={() => setPasswordVisible(!passwordVisible)} // Change visibility
              />
            }
            inputContainerStyle={{
              borderWidth: 1,
              borderColor: "#d1d5db", // Set gray border
              borderRadius: 999, // Make full rounded edges
              paddingHorizontal: 15,
              height: 50,
            }}
            inputStyle={{ fontSize: 16 }}
            value={password} // Bind password state
            onChangeText={setPassword} // Update password when changed
          />

          {/* Forget password link */}
          <Link
            href="/screens/ForgetPasswordScreen"
            className="text-blue-600 text-right mt-2"
          >
            Forget Password?
          </Link>
        </View>
      </View>

      {/* Footer section */}
      <View className="items-center mb-10">
        {/* Button to sign in */}
        <TouchableOpacity
          onPress={handleLogin}
          className="bg-primary rounded-full py-3 px-6 w-full mb-10"
          style={{ maxWidth: 400 }} // Limit maximum width
        >
          <Text className="text-white text-lg text-center">Sign In</Text>
        </TouchableOpacity>

        {/* Link to register page */}
        <View className="mt-5">
          <Text className="text-textPrimary text-1xl">
            Don't have an account?
          </Text>
          <Link href="/screens/RegisterScreen">
            <Text className="text-blue-600 text-1xl mt-2">Register Now</Text>
          </Link>
        </View>
      </View>
    </View>
  );
};

export default LoginScreen;
