import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
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
import { getErrorMessage } from "../../api/axiosClient";
import type { Book } from "../../types/book";
import type { CatalogStackParamList } from "../../navigation/MemberNavigator";

type Props = NativeStackScreenProps<CatalogStackParamList, "CatalogList">;

export default function CatalogScreen({ navigation }: Props) {
  const [books, setBooks] = useState<Book[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function load() {
    setLoading(true);
    setError("");
    booksApi
      .getAll()
      .then(setBooks)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  useFocusEffect(useCallback(load, []));

  const filtered = books.filter((b) => b.title.toLowerCase().includes(query.toLowerCase()));

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

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        renderItem={({ item }) => (
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
            </View>
          </Pressable>
        )}
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
  empty: {
    textAlign: "center",
    color: "#666",
    marginTop: 24,
  },
});
