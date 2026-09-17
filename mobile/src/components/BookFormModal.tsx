import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import FullWindowOverlayIOS from "./FullWindowOverlayIOS";
import ImageUploadField from "./ImageUploadField";
import { mediaApi, type UploadedMedia } from "../api/mediaApi";
import type { Author } from "../types/author";
import type { Book, CreateBookRequest } from "../types/book";
import type { Category } from "../types/category";
import type { Publisher } from "../types/publisher";

interface Props {
  visible: boolean;
  book: Book | null;
  publishers: Publisher[];
  categories: Category[];
  authors: Author[];
  onClose: () => void;
  onSubmit: (payload: CreateBookRequest) => Promise<void>;
}

interface FormState {
  title: string;
  isbn: string;
  publishedYear: string;
  coverImageUrl?: string | null;
  coverImagePublicId?: string | null;
  publisherId: number | null;
  categoryId: number | null;
  authorIds: number[];
}

function toFormState(book: Book | null, publishers: Publisher[], categories: Category[]): FormState {
  if (book) {
    return {
      title: book.title,
      isbn: book.isbn,
      publishedYear: String(book.publishedYear),
      coverImageUrl: book.coverImageUrl,
      coverImagePublicId: book.coverImagePublicId,
      publisherId: book.publisherId,
      categoryId: book.categoryId,
      authorIds: [],
    };
  }
  return {
    title: "",
    isbn: "",
    publishedYear: String(new Date().getFullYear()),
    coverImageUrl: null,
    coverImagePublicId: null,
    publisherId: publishers[0]?.id ?? null,
    categoryId: categories[0]?.id ?? null,
    authorIds: [],
  };
}

export default function BookFormModal({
  visible,
  book,
  publishers,
  categories,
  authors,
  onClose,
  onSubmit,
}: Props) {
  const [form, setForm] = useState<FormState>(() => toFormState(book, publishers, categories));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (visible) {
      const initial = toFormState(book, publishers, categories);
      if (book) {
        initial.authorIds = authors.filter((a) => book.authorNames.includes(a.fullName)).map((a) => a.id);
      }
      setForm(initial);
      setError("");
    }
  }, [visible, book, publishers, categories, authors]);

  function toggleAuthor(id: number) {
    setForm((prev) => ({
      ...prev,
      authorIds: prev.authorIds.includes(id)
        ? prev.authorIds.filter((a) => a !== id)
        : [...prev.authorIds, id],
    }));
    Keyboard.dismiss();
  }

  function handleImageUploaded(result: UploadedMedia) {
    const previousPublicId = form.coverImagePublicId;
    setForm((prev) => ({ ...prev, coverImageUrl: result.url, coverImagePublicId: result.publicId }));
    if (previousPublicId) {
      mediaApi.remove(previousPublicId).catch(() => {});
    }
  }

  function handleImageRemove() {
    if (form.coverImagePublicId) {
      mediaApi.remove(form.coverImagePublicId).catch(() => {});
    }
    setForm((prev) => ({ ...prev, coverImageUrl: null, coverImagePublicId: null }));
  }

  async function handleSave() {
    setError("");
    if (!form.title.trim() || !form.isbn.trim() || !form.publisherId || !form.categoryId) {
      setError("Vui lòng nhập đủ tên sách, ISBN, nhà xuất bản và thể loại.");
      return;
    }

    const payload: CreateBookRequest = {
      title: form.title.trim(),
      isbn: form.isbn.trim(),
      publishedYear: Number(form.publishedYear) || new Date().getFullYear(),
      coverImageUrl: form.coverImageUrl,
      coverImagePublicId: form.coverImagePublicId,
      publisherId: form.publisherId,
      categoryId: form.categoryId,
      authorIds: form.authorIds,
    };

    setIsSaving(true);
    try {
      await onSubmit(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể lưu sách.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} transparent>
      <FullWindowOverlayIOS>
        <View style={styles.overlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
          <KeyboardAvoidingView
            style={styles.sheet}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <Text style={styles.heading}>{book ? "Sửa sách" : "Thêm sách"}</Text>

            <ScrollView
              style={styles.formScroll}
              contentContainerStyle={styles.form}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.label}>Tên sách</Text>
              <TextInput
                style={styles.input}
                value={form.title}
                onChangeText={(text) => setForm((p) => ({ ...p, title: text }))}
              />

              <Text style={styles.label}>ISBN</Text>
              <TextInput
                style={styles.input}
                value={form.isbn}
                onChangeText={(text) => setForm((p) => ({ ...p, isbn: text }))}
              />

              <Text style={styles.label}>Năm xuất bản</Text>
              <TextInput
                style={styles.input}
                keyboardType="number-pad"
                value={form.publishedYear}
                onChangeText={(text) => setForm((p) => ({ ...p, publishedYear: text }))}
              />

              <ImageUploadField
                label="Ảnh bìa"
                imageUrl={form.coverImageUrl}
                folder="library-management/books"
                onUploaded={handleImageUploaded}
                onRemove={handleImageRemove}
              />

              <Text style={styles.label}>Nhà xuất bản</Text>
              <View style={styles.chipRow}>
                {publishers.map((p) => (
                  <Pressable
                    key={p.id}
                    style={[styles.chip, form.publisherId === p.id && styles.chipSelected]}
                    onPress={() => {
                      setForm((prev) => ({ ...prev, publisherId: p.id }));
                      Keyboard.dismiss();
                    }}
                  >
                    <Text style={[styles.chipText, form.publisherId === p.id && styles.chipTextSelected]}>
                      {p.name}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.label}>Thể loại</Text>
              <View style={styles.chipRow}>
                {categories.map((c) => (
                  <Pressable
                    key={c.id}
                    style={[styles.chip, form.categoryId === c.id && styles.chipSelected]}
                    onPress={() => {
                      setForm((prev) => ({ ...prev, categoryId: c.id }));
                      Keyboard.dismiss();
                    }}
                  >
                    <Text style={[styles.chipText, form.categoryId === c.id && styles.chipTextSelected]}>
                      {c.name}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.label}>Tác giả</Text>
              <ScrollView style={styles.authorList} keyboardShouldPersistTaps="handled" nestedScrollEnabled>
                {authors.length === 0 ? (
                  <Text style={styles.emptyText}>Chưa có tác giả nào.</Text>
                ) : (
                  authors.map((a) => {
                    const selected = form.authorIds.includes(a.id);
                    return (
                      <Pressable key={a.id} style={styles.authorRow} onPress={() => toggleAuthor(a.id)}>
                        <View style={[styles.checkbox, selected && styles.checkboxSelected]} />
                        <Text style={styles.authorText}>{a.fullName}</Text>
                      </Pressable>
                    );
                  })
                )}
              </ScrollView>

              {error ? <Text style={styles.error}>{error}</Text> : null}
            </ScrollView>

            <View style={styles.actions}>
              <Pressable style={styles.cancelButton} onPress={onClose} disabled={isSaving}>
                <Text style={styles.cancelText}>Hủy</Text>
              </Pressable>
              <Pressable style={styles.saveButton} onPress={handleSave} disabled={isSaving}>
                {isSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Lưu</Text>}
              </Pressable>
            </View>
          </KeyboardAvoidingView>
        </View>
      </FullWindowOverlayIOS>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    height: "88%",
    paddingTop: 16,
  },
  heading: {
    fontSize: 18,
    fontWeight: "600",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  formScroll: {
    flex: 1,
  },
  form: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
    color: "#374151",
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipSelected: {
    borderColor: "#2563eb",
    backgroundColor: "#eff6ff",
  },
  chipText: {
    fontSize: 13,
    color: "#374151",
  },
  chipTextSelected: {
    color: "#2563eb",
    fontWeight: "600",
  },
  authorList: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    maxHeight: 140,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#9ca3af",
  },
  checkboxSelected: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  authorText: {
    fontSize: 13,
    color: "#374151",
  },
  emptyText: {
    padding: 12,
    fontSize: 12,
    color: "#9ca3af",
  },
  error: {
    color: "#dc2626",
    fontSize: 13,
    marginTop: 10,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  cancelText: {
    color: "#374151",
    fontWeight: "500",
  },
  saveButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#2563eb",
    minWidth: 72,
    alignItems: "center",
  },
  saveText: {
    color: "#fff",
    fontWeight: "600",
  },
});
