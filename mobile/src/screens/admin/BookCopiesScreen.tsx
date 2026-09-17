import { useEffect, useState } from "react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { bookCopiesApi } from "../../api/bookCopiesApi";
import { getErrorMessage } from "../../api/axiosClient";
import { bookCopyStatusMeta } from "../../utils/statusMeta";
import type { BookCopy, BookCopyStatus } from "../../types/bookCopy";
import type { BooksStackParamList } from "../../navigation/AdminNavigator";

type Props = NativeStackScreenProps<BooksStackParamList, "BookCopies">;

const STATUS_OPTIONS: BookCopyStatus[] = ["Available", "Borrowed", "Lost", "Damaged"];

export default function BookCopiesScreen({ route }: Props) {
  const { bookId, bookTitle } = route.params;
  const [copies, setCopies] = useState<BookCopy[]>([]);
  const [newCode, setNewCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function load() {
    setLoading(true);
    bookCopiesApi
      .getAll()
      .then((all) => setCopies(all.filter((c) => c.bookId === bookId)))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  useEffect(load, [bookId]);

  async function handleAdd() {
    if (!newCode.trim()) return;
    try {
      await bookCopiesApi.create({ copyCode: newCode.trim(), bookId });
      setNewCode("");
      load();
    } catch (err) {
      Alert.alert("Lỗi", getErrorMessage(err, "Không thể thêm bản sao."));
    }
  }

  async function cycleStatus(copy: BookCopy) {
    const currentIndex = STATUS_OPTIONS.indexOf(copy.status);
    const nextStatus = STATUS_OPTIONS[(currentIndex + 1) % STATUS_OPTIONS.length];
    try {
      await bookCopiesApi.update(copy.id, { copyCode: copy.copyCode, status: nextStatus });
      load();
    } catch (err) {
      Alert.alert("Lỗi", getErrorMessage(err, "Không thể cập nhật trạng thái."));
    }
  }

  function confirmDelete(copy: BookCopy) {
    Alert.alert("Xóa bản sao", `Xóa bản sao "${copy.copyCode}"?`, [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            await bookCopiesApi.remove(copy.id);
            load();
          } catch (err) {
            Alert.alert("Lỗi", getErrorMessage(err, "Không thể xóa (có thể đang được mượn)."));
          }
        },
      },
    ]);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>{bookTitle}</Text>

      <View style={styles.addRow}>
        <TextInput
          style={styles.input}
          placeholder="Mã bản sao (VD: B001-C1)"
          value={newCode}
          onChangeText={setNewCode}
        />
        <Pressable style={styles.addButton} onPress={handleAdd}>
          <Text style={styles.addButtonText}>Thêm</Text>
        </Pressable>
      </View>

      {loading && copies.length === 0 && <ActivityIndicator style={styles.spinner} />}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FlatList
        data={copies}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        renderItem={({ item }) => {
          const meta = bookCopyStatusMeta[item.status];
          return (
            <View style={styles.row}>
              <Text style={styles.code}>{item.copyCode}</Text>
              <Pressable
                style={[styles.statusBadge, { borderColor: meta.color }]}
                onPress={() => cycleStatus(item)}
              >
                <Text style={[styles.statusText, { color: meta.color }]}>{meta.label}</Text>
              </Pressable>
              <Pressable onPress={() => confirmDelete(item)} hitSlop={8}>
                <Text style={styles.deleteText}>Xóa</Text>
              </Pressable>
            </View>
          );
        }}
        ListEmptyComponent={
          !loading ? <Text style={styles.empty}>Chưa có bản sao nào.</Text> : null
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
  heading: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  addRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  addButton: {
    backgroundColor: "#2563eb",
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  spinner: {
    marginTop: 24,
  },
  error: {
    color: "#dc2626",
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  code: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
  },
  statusBadge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  deleteText: {
    color: "#dc2626",
    fontSize: 13,
  },
  empty: {
    textAlign: "center",
    color: "#666",
    marginTop: 24,
  },
});
