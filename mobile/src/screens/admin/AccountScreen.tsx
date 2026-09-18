import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { getErrorMessage } from "../../api/axiosClient";
import { usersApi } from "../../api/usersApi";
import type { LibraryUser } from "../../types/user";

export default function AccountScreen() {
  const { user, logout } = useAuth();
  const [users, setUsers] = useState<LibraryUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState<number | null>(null);

  function load() {
    setLoading(true);
    setError("");
    usersApi
      .getAll()
      .then(setUsers)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleToggleLock(target: LibraryUser) {
    setProcessingId(target.id);
    try {
      if (target.isLocked) {
        await usersApi.unlock(target.id);
      } else {
        await usersApi.lock(target.id);
      }
      load();
    } catch (err) {
      Alert.alert("Lỗi", getErrorMessage(err, "Không cập nhật được trạng thái tài khoản."));
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.name}>{user?.fullName}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <Text style={styles.role}>Quản trị viên</Text>
      </View>

      <Pressable style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </Pressable>

      <Text style={styles.heading}>Danh sách người dùng ({users.length})</Text>
      {loading && <ActivityIndicator style={styles.spinner} />}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FlatList
        data={users}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        renderItem={({ item }) => (
          <View style={styles.userRow}>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{item.fullName}</Text>
              <Text style={styles.userEmail}>{item.email}</Text>
              <Text style={[styles.userStatus, item.isLocked && styles.userStatusLocked]}>
                {item.isLocked ? "Đã khóa" : "Hoạt động"}
              </Text>
            </View>
            <Text style={styles.userRole}>{item.role === "Admin" ? "Admin" : "Member"}</Text>
            {item.role === "Member" && (
              <Pressable
                style={[styles.lockButton, item.isLocked && styles.unlockButton]}
                disabled={processingId === item.id}
                onPress={() => handleToggleLock(item)}
              >
                <Text style={[styles.lockButtonText, item.isLocked && styles.unlockButtonText]}>
                  {item.isLocked ? "Mở khóa" : "Khóa"}
                </Text>
              </Pressable>
            )}
          </View>
        )}
      />
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
    marginBottom: 16,
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
    marginBottom: 20,
  },
  logoutText: {
    color: "#dc2626",
    fontWeight: "600",
  },
  heading: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  spinner: {
    marginTop: 12,
  },
  error: {
    color: "#dc2626",
    marginBottom: 8,
  },
  userRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: "500",
  },
  userEmail: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  userRole: {
    fontSize: 12,
    color: "#374151",
    fontWeight: "600",
    marginRight: 8,
  },
  userStatus: {
    fontSize: 11,
    color: "#16a34a",
    marginTop: 2,
  },
  userStatusLocked: {
    color: "#dc2626",
  },
  lockButton: {
    borderWidth: 1,
    borderColor: "#dc2626",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  lockButtonText: {
    color: "#dc2626",
    fontSize: 11,
    fontWeight: "600",
  },
  unlockButton: {
    borderColor: "#16a34a",
  },
  unlockButtonText: {
    color: "#16a34a",
  },
});
