import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { auth } from "../api/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
const LoginScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false); // Toggle state

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace("/(tabs)/Home");
    } catch (err) {
      console.warn("Login error:", err); // for debugging
      setError("Invalid email or password. Please try again.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            paddingHorizontal: 45,
            paddingBottom: 60 

          }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="items-center mb-10">
            <Text className="text-4xl font-extrabold text-blue-600">
              Study Buddy
            </Text>
            <Text className="text-lg text-gray-500 mt-2">
              Welcome back! Please login
            </Text>
          </View>

          {error ? (
            <Text className="text-red-600 text-center mb-4">{error}</Text>
          ) : null}

          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            className="bg-gray-100 text-gray-800 rounded-xl px-4 py-3 mb-4 border border-gray-300"
          />

          {/* 🔐 Password field with eye icon */}
          <View className="relative mb-6">
            <TextInput
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              className="bg-gray-100 text-gray-800 rounded-xl px-4 py-3 border border-gray-300 pr-12"
            />
            <TouchableOpacity
              className="absolute right-4 top-3"
              onPress={() => setShowPassword(!showPassword)}
            >
              <Feather
                name={showPassword ? "eye" : "eye-off"}
                size={22}
                color="gray"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={handleLogin}
            className="bg-blue-600 py-3 rounded-xl shadow-md mb-4"
          >
            <Text className="text-white font-semibold text-center text-lg">
              Login
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/RegisterScreen")}>
            <Text className="text-center text-blue-600 underline">
              Don't have an account? Register
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;
