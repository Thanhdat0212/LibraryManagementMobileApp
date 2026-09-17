import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { authorsApi } from "../../api/authorsApi";
import { getErrorMessage } from "../../api/axiosClient";
import { categoriesApi } from "../../api/categoriesApi";
import { publishersApi } from "../../api/publishersApi";
import SimpleEntityCrudSection from "../../components/SimpleEntityCrudSection";
import type { Author } from "../../types/author";
import type { Category } from "../../types/category";
import type { Publisher } from "../../types/publisher";

type Tab = "authors" | "categories" | "publishers";

const TABS: { key: Tab; label: string }[] = [
  { key: "authors", label: "Tác giả" },
  { key: "categories", label: "Thể loại" },
  { key: "publishers", label: "NXB" },
];

export default function CatalogManagementScreen() {
  const [tab, setTab] = useState<Tab>("authors");

  const [authors, setAuthors] = useState<Author[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function load() {
    setLoading(true);
    setError("");
    Promise.all([authorsApi.getAll(), categoriesApi.getAll(), publishersApi.getAll()])
      .then(([a, c, p]) => {
        setAuthors(a);
        setCategories(c);
        setPublishers(p);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  return (
    <View style={styles.container}>
      <View style={styles.tabRow}>
        {TABS.map((t) => (
          <Pressable
            key={t.key}
            style={[styles.tabButton, tab === t.key && styles.tabButtonActive]}
            onPress={() => setTab(t.key)}
          >
            <Text style={[styles.tabText, tab === t.key && styles.tabTextActive]}>{t.label}</Text>
          </Pressable>
        ))}
      </View>

      {tab === "authors" && (
        <SimpleEntityCrudSection
          title="Tác giả"
          items={authors}
          fields={[
            { key: "fullName", label: "Họ tên" },
            { key: "nationality", label: "Quốc tịch" },
            { key: "bio", label: "Tiểu sử", multiline: true },
          ]}
          titleField="fullName"
          subtitleField="nationality"
          loading={loading}
          error={error}
          onRefresh={load}
          onSave={async (id, values) => {
            const payload = {
              fullName: values.fullName.trim(),
              nationality: values.nationality?.trim() || null,
              bio: values.bio?.trim() || null,
            };
            if (id) await authorsApi.update(id, payload);
            else await authorsApi.create(payload);
            load();
          }}
          onDelete={async (id) => {
            await authorsApi.remove(id);
            load();
          }}
        />
      )}

      {tab === "categories" && (
        <SimpleEntityCrudSection
          title="Thể loại"
          items={categories}
          fields={[
            { key: "name", label: "Tên thể loại" },
            { key: "description", label: "Mô tả", multiline: true },
          ]}
          titleField="name"
          subtitleField="description"
          loading={loading}
          error={error}
          onRefresh={load}
          onSave={async (id, values) => {
            const payload = {
              name: values.name.trim(),
              description: values.description?.trim() || null,
            };
            if (id) await categoriesApi.update(id, payload);
            else await categoriesApi.create(payload);
            load();
          }}
          onDelete={async (id) => {
            await categoriesApi.remove(id);
            load();
          }}
        />
      )}

      {tab === "publishers" && (
        <SimpleEntityCrudSection
          title="Nhà xuất bản"
          items={publishers}
          fields={[
            { key: "name", label: "Tên nhà xuất bản" },
            { key: "address", label: "Địa chỉ" },
            { key: "phone", label: "Số điện thoại" },
          ]}
          titleField="name"
          subtitleField="address"
          loading={loading}
          error={error}
          onRefresh={load}
          onSave={async (id, values) => {
            const payload = {
              name: values.name.trim(),
              address: values.address?.trim() || null,
              phone: values.phone?.trim() || null,
            };
            if (id) await publishersApi.update(id, payload);
            else await publishersApi.create(payload);
            load();
          }}
          onDelete={async (id) => {
            await publishersApi.remove(id);
            load();
          }}
        />
      )}
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
  tabRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  tabButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center",
  },
  tabButtonActive: {
    borderColor: "#2563eb",
    backgroundColor: "#eff6ff",
  },
  tabText: {
    fontSize: 13,
    color: "#374151",
  },
  tabTextActive: {
    color: "#2563eb",
    fontWeight: "600",
  },
});
