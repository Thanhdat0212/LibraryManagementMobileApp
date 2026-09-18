import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
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
import { borrowRecordsApi } from "../../api/borrowRecordsApi";
import { getErrorMessage } from "../../api/axiosClient";
import { borrowStatusMeta } from "../../utils/statusMeta";
import BorrowRecordFormModal from "../../components/BorrowRecordFormModal";
import type { BorrowRecord, CreateBorrowRecordRequest } from "../../types/borrowRecord";
import type { BorrowOperationsStackParamList } from "../../navigation/AdminNavigator";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("vi-VN");
}

type Props = NativeStackScreenProps<BorrowOperationsStackParamList, "BorrowRecordsList">;

export default function BorrowRecordsScreen({ navigation }: Props) {
  const [records, setRecords] = useState<BorrowRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFormVisible, setIsFormVisible] = useState(false);

  function load() {
    setLoading(true);
    borrowRecordsApi
      .getAll()
      .then(setRecords)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  useFocusEffect(
    useCallback(() => {
      load();
    }, []),
  );

  async function handleCreate(payload: CreateBorrowRecordRequest) {
    await borrowRecordsApi.borrow(payload);
    setIsFormVisible(false);
    load();
  }

  async function handleReturn(record: BorrowRecord) {
    try {
      await borrowRecordsApi.return(record.id);
      load();
    } catch (err) {
      Alert.alert("Lỗi", getErrorMessage(err, "Không thể xác nhận trả sách."));
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Pressable style={styles.addButton} onPress={() => setIsFormVisible(true)}>
          <Text style={styles.addButtonText}>+ Tạo phiếu mượn</Text>
        </Pressable>
        <Pressable style={styles.linkButton} onPress={() => navigation.navigate("BorrowRequests")}>
          <Text style={styles.linkButtonText}>Yêu cầu mượn</Text>
        </Pressable>
        <Pressable style={styles.linkButton} onPress={() => navigation.navigate("Fines")}>
          <Text style={styles.linkButtonText}>Phạt</Text>
        </Pressable>
      </View>

      {loading && records.length === 0 && <ActivityIndicator style={styles.spinner} />}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FlatList
        data={records}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        renderItem={({ item }) => {
          const meta = borrowStatusMeta(item.status, item.dueDate);
          return (
            <View style={styles.item}>
              <View style={styles.itemHeader}>
                <Text style={styles.bookTitle}>{item.bookTitle}</Text>
                <Text style={[styles.badge, { color: meta.color, borderColor: meta.color }]}>
                  {meta.label}
                </Text>
              </View>
              <Text style={styles.meta}>Người mượn: {item.userName}</Text>
              <Text style={styles.meta}>
                Mượn {formatDate(item.borrowDate)} · Hạn {formatDate(item.dueDate)}
              </Text>
              {item.status === "Borrowing" && (
                <Pressable style={styles.returnButton} onPress={() => handleReturn(item)}>
                  <Text style={styles.returnButtonText}>Xác nhận trả sách</Text>
                </Pressable>
              )}
            </View>
          );
        }}
        ListEmptyComponent={
          !loading ? <Text style={styles.empty}>Chưa có phiếu mượn nào.</Text> : null
        }
      />

      <BorrowRecordFormModal
        visible={isFormVisible}
        onClose={() => setIsFormVisible(false)}
        onSubmit={handleCreate}
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
  topRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  addButton: {
    backgroundColor: "#2563eb",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },
  linkButton: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  linkButtonText: {
    color: "#374151",
    fontWeight: "600",
    fontSize: 13,
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
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bookTitle: {
    fontSize: 15,
    fontWeight: "600",
    flexShrink: 1,
  },
  badge: {
    fontSize: 11,
    fontWeight: "600",
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  meta: {
    color: "#6b7280",
    fontSize: 12,
    marginTop: 4,
  },
  returnButton: {
    marginTop: 8,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#16a34a",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  returnButtonText: {
    color: "#16a34a",
    fontSize: 12,
    fontWeight: "600",
  },
  empty: {
    textAlign: "center",
    color: "#666",
    marginTop: 24,
  },
});
