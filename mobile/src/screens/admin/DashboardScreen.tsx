import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { booksApi } from "../../api/booksApi";
import { bookCopiesApi } from "../../api/bookCopiesApi";
import { borrowRecordsApi } from "../../api/borrowRecordsApi";
import { getErrorMessage } from "../../api/axiosClient";
import { usersApi } from "../../api/usersApi";

interface Stats {
  totalBooks: number;
  availableCopies: number;
  totalCopies: number;
  activeBorrows: number;
  overdueBorrows: number;
  totalUsers: number;
}

export default function DashboardScreen() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      Promise.all([booksApi.getAll(), bookCopiesApi.getAll(), borrowRecordsApi.getAll(), usersApi.getAll()])
        .then(([books, copies, borrows, users]) => {
          if (!active) return;
          const now = Date.now();
          setStats({
            totalBooks: books.length,
            totalCopies: copies.length,
            availableCopies: copies.filter((c) => c.status === "Available").length,
            activeBorrows: borrows.filter((b) => b.status === "Borrowing").length,
            overdueBorrows: borrows.filter(
              (b) => b.status === "Borrowing" && new Date(b.dueDate).getTime() < now,
            ).length,
            totalUsers: users.length,
          });
        })
        .catch((err) => active && setError(getErrorMessage(err)))
        .finally(() => active && setLoading(false));
      return () => {
        active = false;
      };
    }, []),
  );

  if (loading) return <ActivityIndicator style={styles.spinner} />;
  if (error) return <Text style={styles.error}>{error}</Text>;
  if (!stats) return null;

  const tiles = [
    { label: "Tổng số sách", value: stats.totalBooks },
    { label: "Bản sao sẵn sàng", value: `${stats.availableCopies}/${stats.totalCopies}` },
    { label: "Đang được mượn", value: stats.activeBorrows },
    { label: "Quá hạn", value: stats.overdueBorrows, danger: stats.overdueBorrows > 0 },
    { label: "Tổng người dùng", value: stats.totalUsers },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {tiles.map((tile) => (
        <View key={tile.label} style={styles.tile}>
          <Text style={[styles.tileValue, tile.danger && styles.tileValueDanger]}>{tile.value}</Text>
          <Text style={styles.tileLabel}>{tile.label}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    padding: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  spinner: {
    marginTop: 40,
  },
  error: {
    color: "#dc2626",
    textAlign: "center",
    marginTop: 40,
  },
  tile: {
    width: "47%",
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 16,
  },
  tileValue: {
    fontSize: 26,
    fontWeight: "700",
    color: "#2563eb",
  },
  tileValueDanger: {
    color: "#dc2626",
  },
  tileLabel: {
    marginTop: 4,
    color: "#6b7280",
    fontSize: 12,
  },
});
