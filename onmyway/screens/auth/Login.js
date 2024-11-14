import { AuthContext } from "@/context/authContext";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import React, { useContext, useState } from "react";
import {
  Alert,
  Appearance,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const Login = ({ navigation }) => {
  Appearance.setColorScheme("dark");
  const [state, setState] = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      if (!email || !password) {
        Alert.alert("Please fill all required fields");
        setLoading(false);
        return;
      }
      setLoading(true);
      const { data } = await axios.post(`/auth/login`, { email, password });
      setState(data);
      Alert.alert(data && data.message);
      await AsyncStorage.setItem("@auth", JSON.stringify(data));

      // Check user role and navigate accordingly
      if (data?.user?.role === "rider") {
        navigation.navigate("RiderDashboard"); // Redirect to admin home
      } else if (data?.user?.role === "user") {
        navigation.navigate("UserHome"); // Redirect to user home
      }

      setLoading(false);
    } catch (error) {
      Alert.alert(error?.response?.data?.message);
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["rgba(0,0,0,0.6)", "transparent"]}
      style={styles.overlay}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.content}>
          <Text style={styles.pageTitle}>Welcome Back!</Text>
          <Text style={styles.subtitle}>Login to continue</Text>

          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail" size={24} color="white" />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
                placeholderTextColor="#dcdcdc"
                style={styles.inputBox}
                keyboardType="email-address"
                autoComplete="email"
              />
            </View>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed" size={24} color="white" />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                placeholderTextColor="#dcdcdc"
                style={styles.inputBox}
                secureTextEntry
              />
            </View>
          </View>

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.buttonText}>
              {loading ? "Loading..." : "Login"}
            </Text>
          </TouchableOpacity>

          <Text style={styles.linkText}>
            Not a member?{" "}
            <Text
              onPress={() => navigation.navigate("Register")}
              style={styles.registerText}
            >
              Register
            </Text>
          </Text>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: "cover",
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: 20,
    borderRadius: 15,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    borderColor: "#3A86FF",
    borderWidth: 1,
  },
  pageTitle: {
    fontSize: 36,
    fontWeight: "bold",
    textAlign: "center",
    color: "#fff",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#dcdcdc",
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 0,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    borderColor: "#3A86FF",
    borderWidth: 1,
  },
  inputBox: {
    flex: 1,
    color: "#fff",
    marginLeft: 10,
    fontSize: 16,
  },
  submitButton: {
    marginVertical: 20,
    borderRadius: 25,
    overflow: "hidden",
    backgroundColor: "#3A86FF",
    elevation: 5,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  buttonText: {
    textAlign: "center",
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  linkText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
  },
  registerText: {
    color: "#3A86FF",
    fontWeight: "bold",
  },
});

export default Login;
