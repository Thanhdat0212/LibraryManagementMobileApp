import { useState } from "react";
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { mediaApi, type UploadedMedia } from "../api/mediaApi";

interface Props {
  label?: string;
  imageUrl?: string | null;
  folder?: string;
  onUploaded: (result: UploadedMedia) => void;
  onRemove?: () => void;
}

export default function ImageUploadField({ label, imageUrl, folder, onUploaded, onRemove }: Props) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  async function handlePick() {
    setError("");
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError("Cần cấp quyền truy cập thư viện ảnh.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });
    if (result.canceled || result.assets.length === 0) return;

    const asset = result.assets[0];
    const name = asset.fileName ?? asset.uri.split("/").pop() ?? `photo_${Date.now()}.jpg`;
    const type = asset.mimeType ?? "image/jpeg";

    setIsUploading(true);
    try {
      const uploaded = await mediaApi.uploadImage({ uri: asset.uri, name, type }, folder);
      onUploaded(uploaded);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload ảnh thất bại.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.row}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.preview} />
        ) : (
          <View style={[styles.preview, styles.placeholder]}>
            <Text style={styles.placeholderText}>Chưa có ảnh</Text>
          </View>
        )}
        <View style={styles.actions}>
          <Pressable style={styles.pickButton} onPress={handlePick} disabled={isUploading}>
            {isUploading ? (
              <ActivityIndicator color="#2563eb" />
            ) : (
              <Text style={styles.pickButtonText}>{imageUrl ? "Đổi ảnh" : "Chọn ảnh"}</Text>
            )}
          </Pressable>
          {imageUrl && onRemove && !isUploading && (
            <Pressable onPress={onRemove}>
              <Text style={styles.removeText}>Xóa ảnh</Text>
            </Pressable>
          )}
        </View>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 6 },
  label: { fontSize: 14, fontWeight: "500", color: "#374151" },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  preview: { width: 72, height: 72, borderRadius: 8 },
  placeholder: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#d1d5db",
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: { fontSize: 11, color: "#9ca3af", textAlign: "center" },
  actions: { gap: 6 },
  pickButton: {
    borderWidth: 1,
    borderColor: "#2563eb",
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  pickButtonText: { color: "#2563eb", fontWeight: "500", fontSize: 13 },
  removeText: { color: "#dc2626", fontSize: 12 },
  error: { color: "#dc2626", fontSize: 12 },
});
