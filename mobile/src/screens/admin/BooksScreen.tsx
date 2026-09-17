import { useEffect, useState } from "react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { authorsApi } from "../../api/authorsApi";
import { booksApi } from "../../api/booksApi";
import { getErrorMessage } from "../../api/axiosClient";
import { categoriesApi } from "../../api/categoriesApi";
import { mediaApi } from "../../api/mediaApi";
import { publishersApi } from "../../api/publishersApi";
import BookFormModal from "../../components/BookFormModal";
import type { Author } from "../../types/author";
import type { Book, CreateBookRequest } from "../../types/book";
import type { Category } from "../../types/category";
import type { Publisher } from "../../types/publisher";
import type { BooksStackParamList } from "../../navigation/AdminNavigator";

type Props = NativeStackScreenProps<BooksStackParamList, "BooksList">;

export default function BooksScreen({ navigation }: Props) {
  const [books, setBooks] = useState<Book[]>([]);
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);

  function load() {
    setLoading(true);
    setError("");
    Promise.all([booksApi.getAll(), publishersApi.getAll(), categoriesApi.getAll(), authorsApi.getAll()])
      .then(([b, p, c, a]) => {
        setBooks(b);
        setPublishers(p);
        setCategories(c);
        setAuthors(a);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function openCreate() {
    setEditingBook(null);
    setIsFormVisible(true);
  }

  function openEdit(book: Book) {
    setEditingBook(book);
    setIsFormVisible(true);
  }

  async function handleFormSubmit(payload: CreateBookRequest) {
    if (editingBook) {
      await booksApi.update(editingBook.id, payload);
    } else {
      await booksApi.create(payload);
    }
    setIsFormVisible(false);
    load();
  }

  function confirmDelete(book: Book) {
    Alert.alert("Xóa sách", `Bạn có chắc muốn xóa "${book.title}"?`, [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            await booksApi.remove(book.id);
            if (book.coverImagePublicId) {
              mediaApi.remove(book.coverImagePublicId).catch(() => {});
            }
            load();
          } catch (err) {
            Alert.alert("Lỗi", getErrorMessage(err, "Không thể xóa sách này."));
          }
        },
      },
    ]);
  }

  return (
    <View style={styles.container}>
      <Pressable style={styles.addButton} onPress={openCreate}>
        <Text style={styles.addButtonText}>+ Thêm sách</Text>
      </Pressable>

      {loading && books.length === 0 && <ActivityIndicator style={styles.spinner} />}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FlatList
        data={books}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        renderItem={({ item }) => (
          <View style={styles.bookItem}>
            <Pressable style={styles.bookMain} onPress={() => openEdit(item)}>
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
              </View>
            </Pressable>
            <View style={styles.actions}>
              <Pressable onPress={() => navigation.navigate("BookCopies", { bookId: item.id, bookTitle: item.title })}>
                <Text style={styles.copiesText}>Bản sao</Text>
              </Pressable>
              <Pressable onPress={() => confirmDelete(item)} hitSlop={8}>
                <Text style={styles.deleteText}>Xóa</Text>
              </Pressable>
            </View>
          </View>
        )}
        ListEmptyComponent={
          !loading ? <Text style={styles.empty}>Chưa có sách nào.</Text> : null
        }
      />

      <BookFormModal
        visible={isFormVisible}
        book={editingBook}
        publishers={publishers}
        categories={categories}
        authors={authors}
        onClose={() => setIsFormVisible(false)}
        onSubmit={handleFormSubmit}
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
  addButton: {
    alignSelf: "flex-start",
    backgroundColor: "#2563eb",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 12,
  },
  addButtonText: {
    color: "#fff",
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
  bookItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  bookMain: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  cover: {
    width: 44,
    height: 44,
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
    marginTop: 4,
  },
  actions: {
    alignItems: "flex-end",
    gap: 8,
    marginLeft: 8,
  },
  copiesText: {
    color: "#2563eb",
    fontSize: 13,
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
