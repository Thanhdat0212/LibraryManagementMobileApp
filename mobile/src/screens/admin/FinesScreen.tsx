import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { ActivityIndicator, Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { finesApi } from "../../api/finesApi";
import { getErrorMessage } from "../../api/axiosClient";
import type { Fine } from "../../types/fine";

const reasonLabel: Record<Fine["reason"], string> = {
  Overdue: "Trả trễ hạn",
  Lost: "Mất sách",
  Damaged: "Hư hỏng",
};

function formatCurrency(amount: number) {
  return amount.toLocaleString("vi-VN") + " đ";
}

export default function FinesScreen() {
  const [fines, setFines] = useState<Fine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [payingId, setPayingId] = useState<number | null>(null);

  function load() {
    setLoading(true);
    setError("");
    finesApi
      .getAll("Unpaid")
      .then(setFines)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  useFocusEffect(useCallback(load, []));

  async function handlePay(fine: Fine) {
    setPayingId(fine.id);
    try {
      await finesApi.pay(fine.id);
      load();
    } catch (err) {
      Alert.alert("Lỗi", getErrorMessage(err, "Không xác nhận được thanh toán."));
    } finally {
      setPayingId(null);
    }
  }

  return (
    <View style={styles.container}>
      {loading && fines.length === 0 && <ActivityIndicator style={styles.spinner} />}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FlatList
        data={fines}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.bookTitle}>{item.bookTitle}</Text>
            <Text style={styles.meta}>Độc giả: {item.userName}</Text>
            <Text style={styles.meta}>
              {reasonLabel[item.reason]} · {formatCurrency(item.amount)}
            </Text>
            <Pressable style={styles.payButton} disabled={payingId === item.id} onPress={() => handlePay(item)}>
              <Text style={styles.payButtonText}>Xác nhận đã thu</Text>
            </Pressable>
          </View>
        )}
        ListEmptyComponent={
          !loading ? <Text style={styles.empty}>Không có khoản phạt nào chưa thanh toán.</Text> : null
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
  payButton: {
    alignSelf: "flex-start",
    marginTop: 8,
    backgroundColor: "#2563eb",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  payButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  empty: {
    textAlign: "center",
    color: "#666",
    marginTop: 24,
  },
});
