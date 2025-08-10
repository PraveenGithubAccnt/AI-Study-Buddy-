import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter } from 'expo-router';
import { auth, db } from '../../api/firebase';
import { doc, getDoc } from "firebase/firestore";

const DashboardScreen = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is authenticated
    useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
    if (currentUser) {
      try {
        const docRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setUser({ uid: currentUser.uid, ...docSnap.data() });
        } else {
          setUser({ uid: currentUser.uid, email: currentUser.email });
        }
      } catch (error) {
        console.log('Error fetching user data:', error);
      }
    } else {
      // Not logged in? Redirect them
      router.replace('/LoginScreen');
    }
    setLoading(false);
  });

  return () => unsubscribe();
}, [router]);



  const handleLogout = async () => {
    await signOut(auth);
    router.replace('/');
  };

  // Loading state
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text className="mt-4 text-gray-500">Checking authentication...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white px-6 pt-16">
      <Text className="text-3xl font-bold text-blue-600 mb-2">Dashboard</Text>
      
      <Text className="text-lg text-gray-700 mb-6">
        Welcome, {user?.fullname || user?.email}!
      </Text>

      {/* Placeholder for upcoming AI tools */}
      <View className="bg-gray-100 p-4 rounded-xl shadow-sm mb-4">
        <Text className="text-lg font-semibold text-gray-800 mb-2">
          Coming Soon:
        </Text>
        <Text className="text-gray-600">🧠 AI-Powered Study Assistant</Text>
        <Text className="text-gray-600">📅 Smart Scheduling</Text>
        <Text className="text-gray-600">📚 Personalized Learning Paths</Text>
      </View>

      {/* Logout Button */}
      <TouchableOpacity
        onPress={handleLogout}
        className="bg-red-500 py-3 rounded-xl mt-6 shadow-md"
      >
        <Text className="text-white text-center font-semibold text-lg">
          Logout
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default DashboardScreen;
