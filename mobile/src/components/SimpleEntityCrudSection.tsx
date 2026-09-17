import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export interface EntityField {
  key: string;
  label: string;
  multiline?: boolean;
}

interface Props<T extends { id: number }> {
  title: string;
  items: T[];
  fields: EntityField[];
  titleField: keyof T & string;
  subtitleField?: keyof T & string;
  loading: boolean;
  error: string;
  onSave: (id: number | null, values: Record<string, string>) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onRefresh: () => void;
}

export default function SimpleEntityCrudSection<T extends { id: number }>({
  title,
  items,
  fields,
  titleField,
  subtitleField,
  loading,
  error,
  onSave,
  onDelete,
  onRefresh,
}: Props<T>) {
  const [editingId, setEditingId] = useState<number | null | undefined>(undefined);
  const [values, setValues] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState("");

  function openCreate() {
    const empty: Record<string, string> = {};
    fields.forEach((f) => (empty[f.key] = ""));
    setValues(empty);
    setEditingId(null);
    setFormError("");
  }

  function openEdit(item: T) {
    const initial: Record<string, string> = {};
    fields.forEach((f) => {
      const raw = item[f.key as keyof T];
      initial[f.key] = raw == null ? "" : String(raw);
    });
    setValues(initial);
    setEditingId(item.id);
    setFormError("");
  }

  function closeForm() {
    setEditingId(undefined);
  }

  async function handleSave() {
    const requiredField = fields[0];
    if (!values[requiredField.key]?.trim()) {
      setFormError(`Vui lòng nhập ${requiredField.label.toLowerCase()}.`);
      return;
    }
    setIsSaving(true);
    setFormError("");
    try {
      await onSave(editingId ?? null, values);
      closeForm();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Không thể lưu.");
    } finally {
      setIsSaving(false);
    }
  }

  function confirmDelete(item: T) {
    Alert.alert("Xóa", `Xóa "${String(item[titleField])}"?`, [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: () => onDelete(item.id).catch((err) => Alert.alert("Lỗi", err instanceof Error ? err.message : "Không thể xóa.")),
      },
    ]);
  }

  const isFormOpen = editingId !== undefined;

  return (
    <View style={styles.container}>
      {!isFormOpen && (
        <Pressable style={styles.addButton} onPress={openCreate}>
          <Text style={styles.addButtonText}>+ Thêm {title.toLowerCase()}</Text>
        </Pressable>
      )}

      {isFormOpen && (
        <View style={styles.form}>
          <Text style={styles.formHeading}>{editingId ? `Sửa ${title.toLowerCase()}` : `Thêm ${title.toLowerCase()}`}</Text>
          {fields.map((f) => (
            <View key={f.key}>
              <Text style={styles.label}>{f.label}</Text>
              <TextInput
                style={[styles.input, f.multiline && styles.inputMultiline]}
                value={values[f.key] ?? ""}
                onChangeText={(text) => setValues((prev) => ({ ...prev, [f.key]: text }))}
                multiline={f.multiline}
              />
            </View>
          ))}
          {formError ? <Text style={styles.error}>{formError}</Text> : null}
          <View style={styles.formActions}>
            <Pressable style={styles.cancelButton} onPress={closeForm} disabled={isSaving}>
              <Text style={styles.cancelText}>Hủy</Text>
            </Pressable>
            <Pressable style={styles.saveButton} onPress={handleSave} disabled={isSaving}>
              {isSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Lưu</Text>}
            </Pressable>
          </View>
        </View>
      )}

      {loading && items.length === 0 && <ActivityIndicator style={styles.spinner} />}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <Pressable style={styles.row} onPress={() => openEdit(item)}>
            <View style={styles.rowInfo}>
              <Text style={styles.rowTitle}>{String(item[titleField])}</Text>
              {subtitleField && item[subtitleField] ? (
                <Text style={styles.rowSubtitle}>{String(item[subtitleField])}</Text>
              ) : null}
            </View>
            <Pressable onPress={() => confirmDelete(item)} hitSlop={8}>
              <Text style={styles.deleteText}>Xóa</Text>
            </Pressable>
          </Pressable>
        )}
        ListEmptyComponent={
          !loading ? <Text style={styles.empty}>Chưa có dữ liệu.</Text> : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  form: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    gap: 4,
  },
  formHeading: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
  },
  label: {
    fontSize: 12,
    color: "#374151",
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 2,
  },
  inputMultiline: {
    minHeight: 60,
    textAlignVertical: "top",
  },
  formActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 12,
  },
  cancelButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  cancelText: {
    color: "#374151",
    fontWeight: "500",
  },
  saveButton: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#2563eb",
    minWidth: 64,
    alignItems: "center",
  },
  saveText: {
    color: "#fff",
    fontWeight: "600",
  },
  spinner: {
    marginTop: 12,
  },
  error: {
    color: "#dc2626",
    marginBottom: 8,
    fontSize: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  rowInfo: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: "500",
  },
  rowSubtitle: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
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
