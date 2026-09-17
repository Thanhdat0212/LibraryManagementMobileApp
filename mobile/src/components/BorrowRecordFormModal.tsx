import { useEffect, useState } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";
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
import { bookCopiesApi } from "../api/bookCopiesApi";
import { getErrorMessage } from "../api/axiosClient";
import { usersApi } from "../api/usersApi";
import FullWindowOverlayIOS from "./FullWindowOverlayIOS";
import type { BookCopy } from "../types/bookCopy";
import type { CreateBorrowRecordRequest } from "../types/borrowRecord";
import type { LibraryUser } from "../types/user";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateBorrowRecordRequest) => Promise<void>;
}

function defaultDueDate() {
  const date = new Date();
  date.setDate(date.getDate() + 14);
  return date;
}

export default function BorrowRecordFormModal({ visible, onClose, onSubmit }: Props) {
  const [users, setUsers] = useState<LibraryUser[]>([]);
  const [copies, setCopies] = useState<BookCopy[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [userQuery, setUserQuery] = useState("");
  const [copyQuery, setCopyQuery] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedCopyId, setSelectedCopyId] = useState<number | null>(null);
  const [dueDate, setDueDate] = useState(defaultDueDate());
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setError("");
    setSelectedUserId(null);
    setSelectedCopyId(null);
    setDueDate(defaultDueDate());
    setLoadingOptions(true);
    Promise.all([usersApi.getAll(), bookCopiesApi.getAll()])
      .then(([u, c]) => {
        setUsers(u);
        setCopies(c.filter((copy) => copy.status === "Available"));
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoadingOptions(false));
  }, [visible]);

  const filteredUsers = users.filter((u) =>
    `${u.fullName} ${u.email}`.toLowerCase().includes(userQuery.toLowerCase()),
  );
  const filteredCopies = copies.filter((c) =>
    `${c.copyCode} ${c.bookTitle}`.toLowerCase().includes(copyQuery.toLowerCase()),
  );

  async function handleSave() {
    if (!selectedUserId || !selectedCopyId) {
      setError("Vui lòng chọn người mượn và bản sao sách.");
      return;
    }
    setIsSaving(true);
    setError("");
    try {
      await onSubmit({ userId: selectedUserId, bookCopyId: selectedCopyId, dueDate: dueDate.toISOString() });
    } catch (err) {
      setError(getErrorMessage(err, "Không thể tạo phiếu mượn."));
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
            <Text style={styles.heading}>Tạo phiếu mượn</Text>

            {loadingOptions ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2563eb" />
                <Text style={styles.loadingText}>Đang tải danh sách người dùng và sách...</Text>
              </View>
            ) : (
              <ScrollView
                style={styles.formScroll}
                contentContainerStyle={styles.form}
                keyboardShouldPersistTaps="handled"
              >
                <Text style={styles.label}>Người mượn</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Tìm theo tên hoặc email"
                  value={userQuery}
                  onChangeText={setUserQuery}
                />
                <ScrollView style={styles.optionList} keyboardShouldPersistTaps="handled" nestedScrollEnabled>
                  {filteredUsers.map((u) => (
                    <Pressable
                      key={u.id}
                      style={[styles.optionRow, selectedUserId === u.id && styles.optionRowSelected]}
                      onPress={() => {
                        setSelectedUserId(u.id);
                        Keyboard.dismiss();
                      }}
                    >
                      <Text style={styles.optionText}>
                        {u.fullName} · {u.email}
                      </Text>
                    </Pressable>
                  ))}
                  {filteredUsers.length === 0 && (
                    <Text style={styles.emptyText}>Không tìm thấy user.</Text>
                  )}
                </ScrollView>

                <Text style={styles.label}>Bản sao sách (đang sẵn sàng)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Tìm theo mã bản sao hoặc tên sách"
                  value={copyQuery}
                  onChangeText={setCopyQuery}
                />
                <ScrollView style={styles.optionList} keyboardShouldPersistTaps="handled" nestedScrollEnabled>
                  {filteredCopies.map((c) => (
                    <Pressable
                      key={c.id}
                      style={[styles.optionRow, selectedCopyId === c.id && styles.optionRowSelected]}
                      onPress={() => {
                        setSelectedCopyId(c.id);
                        Keyboard.dismiss();
                      }}
                    >
                      <Text style={styles.optionText}>
                        {c.copyCode} · {c.bookTitle}
                      </Text>
                    </Pressable>
                  ))}
                  {filteredCopies.length === 0 && (
                    <Text style={styles.emptyText}>Không còn bản sao nào sẵn sàng.</Text>
                  )}
                </ScrollView>

                <Text style={styles.label}>Hạn trả</Text>
                <Pressable
                  style={styles.input}
                  onPress={() => {
                    Keyboard.dismiss();
                    setShowDatePicker(true);
                  }}
                >
                  <Text>{dueDate.toLocaleDateString("vi-VN")}</Text>
                </Pressable>
                {showDatePicker && (
                  <>
                    <DateTimePicker
                      value={dueDate}
                      mode="date"
                      minimumDate={new Date()}
                      onChange={(_event, selected) => {
                        setShowDatePicker(Platform.OS === "ios");
                        if (selected) setDueDate(selected);
                      }}
                    />
                    {Platform.OS === "ios" && (
                      <Pressable style={styles.doneButton} onPress={() => setShowDatePicker(false)}>
                        <Text style={styles.doneButtonText}>Xong</Text>
                      </Pressable>
                    )}
                  </>
                )}

                {error ? <Text style={styles.error}>{error}</Text> : null}
              </ScrollView>
            )}

            <View style={styles.actions}>
              <Pressable style={styles.cancelButton} onPress={onClose} disabled={isSaving}>
                <Text style={styles.cancelText}>Hủy</Text>
              </Pressable>
              <Pressable style={styles.saveButton} onPress={handleSave} disabled={isSaving || loadingOptions}>
                {isSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Tạo phiếu</Text>}
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
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6b7280",
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
  optionList: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    maxHeight: 130,
    marginTop: 6,
  },
  optionRow: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  optionRowSelected: {
    backgroundColor: "#eff6ff",
  },
  optionText: {
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
  doneButton: {
    alignSelf: "flex-end",
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  doneButtonText: {
    color: "#2563eb",
    fontWeight: "600",
    fontSize: 14,
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
    minWidth: 96,
    alignItems: "center",
  },
  saveText: {
    color: "#fff",
    fontWeight: "600",
  },
});
