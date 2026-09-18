import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { borrowRecordsApi } from "../../api/borrowRecordsApi";
import { borrowRequestsApi } from "../../api/borrowRequestsApi";
import { finesApi } from "../../api/finesApi";
import { getErrorMessage } from "../../api/axiosClient";
import { borrowStatusMeta } from "../../utils/statusMeta";
import type { BorrowRecord } from "../../types/borrowRecord";
import type { BorrowRequest } from "../../types/borrowRequest";
import type { Fine } from "../../types/fine";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("vi-VN");
}

function formatCurrency(amount: number) {
  return amount.toLocaleString("vi-VN") + " đ";
}

export default function MyBorrowsScreen() {
  const [records, setRecords] = useState<BorrowRecord[]>([]);
  const [pendingRequests, setPendingRequests] = useState<BorrowRequest[]>([]);
  const [unpaidFines, setUnpaidFines] = useState<Fine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [renewingId, setRenewingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  function load() {
    setLoading(true);
    setError("");
    Promise.all([borrowRecordsApi.getMy(), borrowRequestsApi.getMy(), finesApi.getMy()])
      .then(([recordsRes, requestsRes, finesRes]) => {
        setRecords(recordsRes);
        setPendingRequests(requestsRes.filter((r) => r.status === "Pending"));
        setUnpaidFines(finesRes.filter((f) => f.status === "Unpaid"));
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  useFocusEffect(useCallback(load, []));

  async function handleRenew(record: BorrowRecord) {
    setRenewingId(record.id);
    setMessage("");
    try {
      await borrowRecordsApi.renew(record.id);
      setMessage(`Đã gia hạn "${record.bookTitle}".`);
      load();
    } catch (err) {
      setMessage(getErrorMessage(err));
    } finally {
      setRenewingId(null);
    }
  }

  return (
    <View style={styles.container}>
      {loading && records.length === 0 && <ActivityIndicator style={styles.spinner} />}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {message ? <Text style={styles.message}>{message}</Text> : null}

      {pendingRequests.length > 0 && (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>
            Có {pendingRequests.length} yêu cầu mượn đang chờ duyệt: {pendingRequests.map((r) => r.bookTitle).join(", ")}
          </Text>
        </View>
      )}

      {unpaidFines.length > 0 && (
        <View style={[styles.banner, styles.bannerDanger]}>
          <Text style={[styles.bannerText, styles.bannerTextDanger]}>
            Bạn có {unpaidFines.length} khoản phạt chưa thanh toán, tổng {formatCurrency(unpaidFines.reduce((s, f) => s + f.amount, 0))}.
          </Text>
        </View>
      )}

      <FlatList
        data={records}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        renderItem={({ item }) => {
          const meta = borrowStatusMeta(item.status, item.dueDate);
          const canRenew = item.status === "Borrowing" && meta.label !== "Quá hạn";
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
              {canRenew && (
                <Pressable
                  style={styles.renewButton}
                  disabled={renewingId === item.id}
                  onPress={() => handleRenew(item)}
                >
                  <Text style={styles.renewButtonText}>
                    {renewingId === item.id ? "Đang gia hạn..." : `Gia hạn (${item.renewalCount} lần)`}
                  </Text>
                </Pressable>
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
  message: {
    color: "#4338ca",
    marginBottom: 12,
    fontSize: 13,
  },
  banner: {
    backgroundColor: "#fef3c7",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  bannerDanger: {
    backgroundColor: "#fee2e2",
  },
  bannerText: {
    color: "#92400e",
    fontSize: 12,
  },
  bannerTextDanger: {
    color: "#991b1b",
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
  renewButton: {
    alignSelf: "flex-start",
    marginTop: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#2563eb",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  renewButtonText: {
    color: "#2563eb",
    fontSize: 12,
    fontWeight: "600",
  },
  empty: {
    textAlign: "center",
    color: "#666",
    marginTop: 24,
  },
});
