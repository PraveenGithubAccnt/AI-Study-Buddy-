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
  Image,
} from "react-native";
import { auth, db } from "../api/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { doc, setDoc } from "firebase/firestore";
import * as ImagePicker from "expo-image-picker";
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from "@env";

const RegisterScreen = () => {
  const router = useRouter();
  const [name, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [profileImage, setProfileImage] = useState(null);

  const CLOUD_NAME = CLOUDINARY_CLOUD_NAME;
  const UPLOAD_PRESET = CLOUDINARY_UPLOAD_PRESET;

  // 📌 Error Mapper
  const getFriendlyErrorMessage = (errorCode) => {
    switch (errorCode) {
      case "auth/invalid-email":
        return "Invalid email address.";
      case "auth/user-not-found":
        return "No account found with this email.";
      case "auth/wrong-password":
        return "Wrong password.";
      case "auth/email-already-in-use":
        return "This email is already registered.";
      case "auth/weak-password":
        return "Password should be at least 6 characters.";
      default:
        return "Something went wrong. Please try again.";
    }
  };

  // 📌 Pick image from gallery
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  // 📌 Upload image to Cloudinary
  const uploadToCloudinary = async (imageUri) => {
    const data = new FormData();
    data.append("file", {
      uri: imageUri,
      type: "image/jpeg",
      name: "profile.jpg",
    });
    data.append("upload_preset", UPLOAD_PRESET);
    data.append("folder", "ProfilePictures");

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: data,
      }
    );

    const result = await res.json();
    return result.secure_url;
  };

  // 📌 Handle Register
  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      return setError("Please fill in all fields.");
    }
    if (password !== confirmPassword) {
      return setError("Passwords don't match.");
    }

    try {
      // Upload profile image first (if selected)
      let uploadedImageUrl = null;
      if (profileImage) {
        uploadedImageUrl = await uploadToCloudinary(profileImage);
      }

      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Save additional info to Firestore
      await setDoc(doc(db, "users", user.uid), {
        fullname: name,
        email,
        profilePhotoURL:
          uploadedImageUrl ||
          "https://www.pngkey.com/png/full/73-730477_first-name-profile-image-placeholder-png.png",
      });

      // Redirect to login
      router.replace("/LoginScreen");
    } catch (err) {
      const errorMessage = getFriendlyErrorMessage(err.code);
      setError(errorMessage);
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
            paddingBottom: 150,
          }}
          keyboardShouldPersistTaps="handled"
        >
          {/* App Header */}
          <View className="items-center mb-8">
            <Text className="text-4xl font-extrabold text-blue-600">
              Study Buddy
            </Text>
            <Text className="text-lg text-gray-500 mt-2">
              Create a new account
            </Text>
          </View>

          {error ? (
            <Text className="text-red-600 text-center mb-4">{error}</Text>
          ) : null}

          {/* 📌 Profile Picture Picker */}
          <TouchableOpacity onPress={pickImage} className="items-center mb-6">
            <Image
              source={{
                uri:
                  profileImage ||
                  "https://www.pngkey.com/png/full/73-730477_first-name-profile-image-placeholder-png.png",
              }}
              style={{ width: 100, height: 100, borderRadius: 50 }}
            />
            <Text className="text-blue-600 mt-2">Choose Profile Picture</Text>
          </TouchableOpacity>

          {/* Full Name */}
          <TextInput
            placeholder="Full Name"
            value={name}
            onChangeText={setFullname}
            className="bg-gray-100 text-gray-800 rounded-xl px-4 py-3 mb-4 border border-gray-300"
          />

          {/* Email */}
          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            className="bg-gray-100 text-gray-800 rounded-xl px-4 py-3 mb-4 border border-gray-300"
          />

          {/* Password */}
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

          {/* Confirm Password */}
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

          {/* Register Button */}
          <TouchableOpacity
            onPress={handleRegister}
            className="bg-blue-600 py-3 rounded-xl shadow-md mb-4"
          >
            <Text className="text-white font-semibold text-center text-lg">
              Register
            </Text>
          </TouchableOpacity>

          {/* Already have account */}
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
