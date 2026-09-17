import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../../context/AuthContext";

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.name}>{user?.fullName}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <Text style={styles.role}>Thành viên</Text>
      </View>

      <Pressable style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  card: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
  },
  email: {
    color: "#6b7280",
    marginTop: 4,
  },
  role: {
    marginTop: 8,
    color: "#2563eb",
    fontSize: 12,
    fontWeight: "600",
  },
  logoutButton: {
    borderWidth: 1,
    borderColor: "#dc2626",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  logoutText: {
    color: "#dc2626",
    fontWeight: "600",
  },
});
