import React, { useState } from "react";
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
import { auth, db } from "../api/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { doc, setDoc } from "firebase/firestore";

const RegisterScreen = () => {
  const router = useRouter();
  const [name, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      return setError("Please fill in all fields.");
    }
    if (password !== confirmPassword) {
      return setError("Passwords don't match.");
    }

    try {
      // ✅ Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // ✅ Save additional user info to Firestore
      await setDoc(doc(db, "users", user.uid), {
        fullname: name,
        email,
        profilePhotoURL: null, // Will update later
      });

      // ✅ Redirect to login after successful registration
      router.replace("/LoginScreen");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
    <KeyboardAvoidingView
      className="flex-1 bg-white justify-center px-6"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
       <ScrollView
                contentContainerStyle={{
                  flexGrow: 1,
                  justifyContent: "center",
                  paddingHorizontal: 25,
                  paddingBottom: 150 
      
                }}
                keyboardShouldPersistTaps="handled"
              >
      <View className="items-center mb-8">
        <Text className="text-4xl font-extrabold text-blue-600">
          Study Buddy
        </Text>
        <Text className="text-lg text-gray-500 mt-2">Create a new account</Text>
      </View>

      {error ? (
        <Text className="text-red-600 text-center mb-4">{error}</Text>
      ) : null}

      <TextInput
        placeholder="Full Name"
        value={name}
        onChangeText={setFullname}
        className="bg-gray-100 text-gray-800 rounded-xl px-4 py-3 mb-4 border border-gray-300"
      />

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        className="bg-gray-100 text-gray-800 rounded-xl px-4 py-3 mb-4 border border-gray-300"
      />

      {/* 🔐 Password with Eye Icon */}
      <View className="relative mb-4">
        <TextInput
          placeholder="Password"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
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

      {/* 🔐 Confirm Password with Eye Icon */}
      <View className="relative mb-6">
        <TextInput
          placeholder="Confirm Password"
          secureTextEntry={!showConfirm}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          className="bg-gray-100 text-gray-800 rounded-xl px-4 py-3 border border-gray-300 pr-12"
        />
        <TouchableOpacity
          className="absolute right-4 top-3"
          onPress={() => setShowConfirm(!showConfirm)}
        >
          <Feather
            name={showConfirm ? "eye" : "eye-off"}
            size={22}
            color="gray"
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={handleRegister}
        className="bg-blue-600 py-3 rounded-xl shadow-md mb-4"
      >
        <Text className="text-white font-semibold text-center text-lg">
          Register
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/LoginScreen")}>
        <Text className="text-center text-blue-600 underline">
          Already have an account? Login
        </Text>
      </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default RegisterScreen;
