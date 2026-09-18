import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { ActivityIndicator, Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { borrowRequestsApi } from "../../api/borrowRequestsApi";
import { getErrorMessage } from "../../api/axiosClient";
import type { BorrowRequest } from "../../types/borrowRequest";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("vi-VN");
}

export default function BorrowRequestsScreen() {
  const [requests, setRequests] = useState<BorrowRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState<number | null>(null);

  function load() {
    setLoading(true);
    setError("");
    borrowRequestsApi
      .getAll("Pending")
      .then(setRequests)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  useFocusEffect(useCallback(load, []));

  async function handleApprove(request: BorrowRequest) {
    setProcessingId(request.id);
    try {
      await borrowRequestsApi.approve(request.id);
      load();
    } catch (err) {
      Alert.alert("Lỗi", getErrorMessage(err, "Không duyệt được yêu cầu này."));
    } finally {
      setProcessingId(null);
    }
  }

  async function handleReject(request: BorrowRequest) {
    setProcessingId(request.id);
    try {
      await borrowRequestsApi.reject(request.id, "Từ chối bởi thủ thư");
      load();
    } catch (err) {
      Alert.alert("Lỗi", getErrorMessage(err, "Không từ chối được yêu cầu này."));
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <View style={styles.container}>
      {loading && requests.length === 0 && <ActivityIndicator style={styles.spinner} />}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FlatList
        data={requests}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.bookTitle}>{item.bookTitle}</Text>
            <Text style={styles.meta}>Độc giả: {item.userName}</Text>
            <Text style={styles.meta}>Yêu cầu: {formatDate(item.requestedAt)}</Text>
            <View style={styles.actions}>
              <Pressable
                style={styles.rejectButton}
                disabled={processingId === item.id}
                onPress={() => handleReject(item)}
              >
                <Text style={styles.rejectButtonText}>Từ chối</Text>
              </Pressable>
              <Pressable
                style={styles.approveButton}
                disabled={processingId === item.id}
                onPress={() => handleApprove(item)}
              >
                <Text style={styles.approveButtonText}>Duyệt</Text>
              </Pressable>
            </View>
          </View>
        )}
        ListEmptyComponent={
          !loading ? <Text style={styles.empty}>Không có yêu cầu nào đang chờ duyệt.</Text> : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 12,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
  },
  spinner: {
    marginTop: 24,
  },
  error: {
    color: "#dc2626",
    marginBottom: 12,
  },
  item: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  bookTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  meta: {
    color: "#6b7280",
    fontSize: 12,
    marginTop: 4,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  approveButton: {
    backgroundColor: "#2563eb",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  approveButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  rejectButton: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  rejectButtonText: {
    color: "#374151",
    fontSize: 12,
    fontWeight: "600",
  },
  empty: {
    textAlign: "center",
    color: "#666",
    marginTop: 24,
  },
});
