import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Image,
} from "react-native";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../../api/firebase";
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from "@env";

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false); // 👈 NEW state for uploading

  // Cloudinary Config
  const CLOUD_NAME = CLOUDINARY_CLOUD_NAME;
  const UPLOAD_PRESET = CLOUDINARY_UPLOAD_PRESET;

  // Check if user is authenticated and fetch profile data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const docRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            setUser({ uid: currentUser.uid, ...docSnap.data() });
          } else {
            setUser({ uid: currentUser.uid, email: currentUser.email });
          }
        } catch (error) {
          console.log("Error fetching user data:", error);
        }
      } else {
        router.replace("/LoginScreen");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  // Pick and upload profile image (Cloudinary)
  const pickImage = async () => {
    if (!user?.uid) return;

    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        setUploading(true); // 👈 start spinner
        const imageUri = result.assets[0].uri;

        const formData = new FormData();
        formData.append("file", {
          uri: imageUri,
          type: "image/jpeg",
          name: `${user.uid}.jpg`,
        });
        formData.append("upload_preset", UPLOAD_PRESET);
        formData.append("folder", "ProfilePictures");

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        const data = await response.json();
        if (data.secure_url) {
          await updateDoc(doc(db, "users", user.uid), {
            profilePhotoURL: data.secure_url,
          });

          setUser((prev) => ({ ...prev, profilePhotoURL: data.secure_url }));
        }
      }
    } catch (error) {
      console.log("Error uploading profile picture:", error);
    } finally {
      setUploading(false); // 👈 stop spinner
    }
  };

  // Logout handler
  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/");
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text className="mt-4 text-gray-500">Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white px-6 pt-16">
      <View className="flex-1 items-center bg-white p-6">
        <TouchableOpacity onPress={pickImage} disabled={uploading}>
          <Image
            source={{
              uri:
                user?.profilePhotoURL ||
                "https://www.pngkey.com/png/full/73-730477_first-name-profile-image-placeholder-png.png",
            }}
            className="w-28 h-28 rounded-full border-2 border-blue-500"
          />
        </TouchableOpacity>

        {/* 👇 Show spinner when uploading */}
        {uploading && (
          <ActivityIndicator size="small" color="#4F46E5" className="mt-2" />
        )}

        <Text className="text-2xl font-bold mt-4 text-black dark:text-blue-600">
          {user?.fullname || "User Name"}
        </Text>
      </View>

      {/* Logout Button */}
      <TouchableOpacity
        onPress={handleLogout}
        className="bg-blue-600 py-3 rounded-xl mt-6 shadow-md"
      >
        <Text className="text-white text-center font-semibold text-lg">
          Logout
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
