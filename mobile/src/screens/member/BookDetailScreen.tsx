import { useEffect, useState } from "react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { booksApi } from "../../api/booksApi";
import { borrowRequestsApi } from "../../api/borrowRequestsApi";
import { getErrorMessage } from "../../api/axiosClient";
import type { Book } from "../../types/book";
import type { CatalogStackParamList } from "../../navigation/MemberNavigator";

type Props = NativeStackScreenProps<CatalogStackParamList, "BookDetail">;

export default function BookDetailScreen({ route }: Props) {
  const { bookId } = route.params;
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requesting, setRequesting] = useState(false);
  const [requested, setRequested] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    booksApi
      .getById(bookId)
      .then(setBook)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [bookId]);

  async function handleRequestBorrow() {
    if (!book) return;
    setRequesting(true);
    setMessage("");
    try {
      await borrowRequestsApi.create({ bookId: book.id });
      setRequested(true);
      setMessage("Đã gửi yêu cầu mượn, vui lòng chờ thủ thư duyệt.");
    } catch (err) {
      setMessage(getErrorMessage(err));
    } finally {
      setRequesting(false);
    }
  }

  if (loading) return <ActivityIndicator style={styles.spinner} />;
  if (error) return <Text style={styles.error}>{error}</Text>;
  if (!book) return <Text style={styles.error}>Không tìm thấy sách.</Text>;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {book.coverImageUrl ? (
        <Image source={{ uri: book.coverImageUrl }} style={styles.cover} />
      ) : (
        <View style={[styles.cover, styles.coverPlaceholder]} />
      )}

      <Text style={styles.title}>{book.title}</Text>
      <Text style={styles.availability}>
        {book.availableCopies > 0
          ? `Còn ${book.availableCopies}/${book.totalCopies} bản sẵn sàng`
          : book.totalCopies > 0
            ? "Hiện đã hết bản có sẵn"
            : "Chưa có bản sao nào"}
      </Text>

      <Pressable
        style={[styles.requestButton, (book.availableCopies === 0 || requested) && styles.requestButtonDisabled]}
        disabled={book.availableCopies === 0 || requested || requesting}
        onPress={handleRequestBorrow}
      >
        <Text style={styles.requestButtonText}>{requested ? "Đã gửi yêu cầu" : requesting ? "Đang gửi..." : "Yêu cầu mượn"}</Text>
      </Pressable>
      {message ? <Text style={styles.message}>{message}</Text> : null}

      <View style={styles.row}>
        <Text style={styles.label}>ISBN</Text>
        <Text style={styles.value}>{book.isbn}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Năm xuất bản</Text>
        <Text style={styles.value}>{book.publishedYear}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Nhà xuất bản</Text>
        <Text style={styles.value}>{book.publisherName}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Thể loại</Text>
        <Text style={styles.value}>{book.categoryName}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Tác giả</Text>
        <Text style={styles.value}>{book.authorNames.join(", ") || "—"}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    padding: 20,
    alignItems: "center",
  },
  spinner: {
    marginTop: 40,
  },
  error: {
    color: "#dc2626",
    textAlign: "center",
    marginTop: 40,
  },
  cover: {
    width: 140,
    height: 140,
    borderRadius: 10,
    marginBottom: 16,
  },
  coverPlaceholder: {
    backgroundColor: "#f3f4f6",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 6,
  },
  availability: {
    fontSize: 13,
    color: "#2563eb",
    marginBottom: 16,
  },
  requestButton: {
    backgroundColor: "#2563eb",
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 12,
  },
  requestButtonDisabled: {
    backgroundColor: "#cbd5e1",
  },
  requestButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  message: {
    fontSize: 12,
    color: "#4338ca",
    marginBottom: 12,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  label: {
    color: "#6b7280",
    fontSize: 13,
  },
  value: {
    fontSize: 13,
    fontWeight: "500",
    flexShrink: 1,
    textAlign: "right",
  },
});
