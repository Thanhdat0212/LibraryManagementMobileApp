import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { borrowRecordsApi } from "../../api/borrowRecordsApi";
import { getErrorMessage } from "../../api/axiosClient";
import { borrowStatusMeta } from "../../utils/statusMeta";
import type { BorrowRecord } from "../../types/borrowRecord";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("vi-VN");
}

export default function MyBorrowsScreen() {
  const [records, setRecords] = useState<BorrowRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function load() {
    setLoading(true);
    setError("");
    borrowRecordsApi
      .getMy()
      .then(setRecords)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  useFocusEffect(useCallback(load, []));

  return (
    <View style={styles.container}>
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
              <Text style={styles.meta}>Mượn: {formatDate(item.borrowDate)}</Text>
              <Text style={styles.meta}>Hạn trả: {formatDate(item.dueDate)}</Text>
              {item.returnDate && (
                <Text style={styles.meta}>Đã trả: {formatDate(item.returnDate)}</Text>
              )}
            </View>
          );
        }}
        ListEmptyComponent={
          !loading ? <Text style={styles.empty}>Bạn chưa mượn cuốn sách nào.</Text> : null
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
  empty: {
    textAlign: "center",
    color: "#666",
    marginTop: 24,
  },
});
