import { useEffect, useState } from "react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { booksApi } from "../../api/booksApi";
import { bookCopiesApi } from "../../api/bookCopiesApi";
import { getErrorMessage } from "../../api/axiosClient";
import type { Book } from "../../types/book";
import type { CatalogStackParamList } from "../../navigation/MemberNavigator";

type Props = NativeStackScreenProps<CatalogStackParamList, "BookDetail">;

export default function BookDetailScreen({ route }: Props) {
  const { bookId } = route.params;
  const [book, setBook] = useState<Book | null>(null);
  const [availableCount, setAvailableCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([booksApi.getAll(), bookCopiesApi.getAll()])
      .then(([books, copies]) => {
        setBook(books.find((b) => b.id === bookId) ?? null);
        const ofBook = copies.filter((c) => c.bookId === bookId);
        setTotalCount(ofBook.length);
        setAvailableCount(ofBook.filter((c) => c.status === "Available").length);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [bookId]);

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
        {availableCount > 0
          ? `Còn ${availableCount}/${totalCount} bản sẵn sàng`
          : totalCount > 0
            ? "Hiện đã hết bản có sẵn"
            : "Chưa có bản sao nào"}
      </Text>

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
