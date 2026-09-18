import { useEffect, useState } from "react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { booksApi } from "../../api/booksApi";
import { borrowRequestsApi } from "../../api/borrowRequestsApi";
import { getErrorMessage } from "../../api/axiosClient";
import type { Book } from "../../types/book";
import type { CatalogStackParamList } from "../../navigation/MemberNavigator";

type Props = NativeStackScreenProps<CatalogStackParamList, "CatalogList">;

const PAGE_SIZE = 20;

export default function CatalogScreen({ navigation }: Props) {
  const [books, setBooks] = useState<Book[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requestingBookId, setRequestingBookId] = useState<number | null>(null);
  const [requestedBookIds, setRequestedBookIds] = useState<number[]>([]);
  const [message, setMessage] = useState("");

  function load() {
    setLoading(true);
    setError("");
    booksApi
      .getAll({ search: query || undefined, pageSize: PAGE_SIZE })
      .then((res) => setBooks(res.items))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    const handle = setTimeout(load, 300);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  async function handleRequestBorrow(book: Book) {
    setRequestingBookId(book.id);
    setMessage("");
    try {
      await borrowRequestsApi.create({ bookId: book.id });
      setRequestedBookIds((prev) => [...prev, book.id]);
      setMessage(`Đã gửi yêu cầu mượn "${book.title}". Vui lòng chờ thủ thư duyệt.`);
    } catch (err) {
      setMessage(getErrorMessage(err));
    } finally {
      setRequestingBookId(null);
    }
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        placeholder="Tìm sách theo tên..."
        value={query}
        onChangeText={setQuery}
      />

      {loading && books.length === 0 && <ActivityIndicator style={styles.spinner} />}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {message ? <Text style={styles.message}>{message}</Text> : null}

      <FlatList
        data={books}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        renderItem={({ item }) => {
          const alreadyRequested = requestedBookIds.includes(item.id);
          return (
            <Pressable
              style={styles.bookItem}
              onPress={() => navigation.navigate("BookDetail", { bookId: item.id })}
            >
              {item.coverImageUrl ? (
                <Image source={{ uri: item.coverImageUrl }} style={styles.cover} />
              ) : (
                <View style={[styles.cover, styles.coverPlaceholder]} />
              )}
              <View style={styles.bookInfo}>
                <Text style={styles.bookTitle}>{item.title}</Text>
                <Text style={styles.bookMeta}>
                  {item.categoryName} · {item.publishedYear}
                </Text>
                <Text style={styles.bookMeta}>{item.authorNames.join(", ")}</Text>
                <Text style={[styles.availability, item.availableCopies === 0 && styles.availabilityNone]}>
                  {item.availableCopies > 0 ? `Còn ${item.availableCopies}/${item.totalCopies} bản` : "Hết bản có sẵn"}
                </Text>
              </View>
              <Pressable
                style={[styles.requestButton, (item.availableCopies === 0 || alreadyRequested) && styles.requestButtonDisabled]}
                disabled={item.availableCopies === 0 || alreadyRequested || requestingBookId === item.id}
                onPress={() => handleRequestBorrow(item)}
              >
                <Text style={styles.requestButtonText}>
                  {alreadyRequested ? "Đã gửi" : requestingBookId === item.id ? "..." : "Mượn"}
                </Text>
              </Pressable>
            </Pressable>
          );
        }}
        ListEmptyComponent={
          !loading ? <Text style={styles.empty}>Không tìm thấy sách nào.</Text> : null
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
  search: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
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
  bookItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  cover: {
    width: 52,
    height: 52,
    borderRadius: 6,
  },
  coverPlaceholder: {
    backgroundColor: "#f3f4f6",
  },
  bookInfo: {
    flex: 1,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  bookMeta: {
    color: "#666",
    marginTop: 2,
    fontSize: 12,
  },
  availability: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: "600",
    color: "#16a34a",
  },
  availabilityNone: {
    color: "#dc2626",
  },
  requestButton: {
    backgroundColor: "#2563eb",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  requestButtonDisabled: {
    backgroundColor: "#cbd5e1",
  },
  requestButtonText: {
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
