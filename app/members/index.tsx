// app/members/index.tsx
import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useGymContext } from "../(context)/GymContext";
import { useRouter } from "expo-router";
import * as Notifications from "expo-notifications";
import Logo from "../components/Logo";


type FilterType = "all" | "paid" | "unpaid";

export default function MembersList() {
  const { people, setPeople, isExpired } = useGymContext();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const router = useRouter();

  const deletePerson = async (id: string) => {
    Alert.alert("Delete Member", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const person = people.find((p) => p.id === id);
          if (person?.notificationId) {
            await Notifications.cancelScheduledNotificationAsync(person.notificationId);
          }
          setPeople(people.filter((p) => p.id !== id));
        },
      },
    ]);
  };

  const filtered = people
    .filter((p) =>
      `${p.name} ${p.surname}`.toLowerCase().includes(search.toLowerCase())
    )
    .filter((p) => {
      if (filter === "paid") return p.paid;
      if (filter === "unpaid") return !p.paid;
      return true;
    });

  const stats = {
    total: people.length,
    paid: people.filter((p) => p.paid).length,
    unpaid: people.filter((p) => !p.paid).length,
    expired: people.filter((p) => isExpired(p.endDate)).length,
  };

  return (
    <View style={styles.container}>
      {/* Your real logo from assets */}
    <Logo size="large" />


      {/* Stats Bar */}
      <View style={styles.statsBar}>
        <Text style={styles.statsText}>Total: {stats.total}</Text>
        <Text style={styles.statsText}>Paid: {stats.paid}</Text>
        <Text style={styles.statsText}>Unpaid: {stats.unpaid}</Text>
        <Text style={[styles.statsText, stats.expired > 0 && { color: "#ff4444" }]}>
          Expired: {stats.expired}
        </Text>
      </View>

      {/* Search */}
      <TextInput
        placeholder="Search members..."
        placeholderTextColor="#888"
        style={styles.searchInput}
        value={search}
        onChangeText={setSearch}
      />

      {/* Filter Buttons – FIXED */}
      <View style={styles.filterContainer}>
        {(["all", "paid", "unpaid"] as const).map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.filterBtn,
              filter === type && styles.filterBtnActive,
            ]}
            onPress={() => setFilter(type)}
          >
            <Text
              style={[
                styles.filterText,
                filter === type && styles.filterTextActive,
              ]}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Add Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push("/members/new")}
      >
        <Ionicons name="add" size={28} color="white" />
        <Text style={styles.addButtonText}>Add New Member</Text>
      </TouchableOpacity>

      {/* Members List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const expired = isExpired(item.endDate);
          return (
            <View
              style={[
                styles.card,
                expired && styles.expiredCard,
                !item.paid && styles.unpaidCard,
              ]}
            >
              <Ionicons
                name="person-circle"
                size={56}
                color={item.paid ? "#00d4aa" : "#ff6b6b"}
              />

              <TouchableOpacity
  style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
  onPress={() => router.push(`/members/profile/${item.id}`)}
>
  <Ionicons name="person-circle" size={56} color={item.paid ? "#00d4aa" : "#ff6b6b"} />
  <View style={styles.cardInfo}>
    <Text style={styles.name}>{item.name} {item.surname}</Text>
    <Text style={styles.detail}>{item.age} years old</Text>
    <Text style={styles.detail}>{item.startDate} → {item.endDate}{expired && " (Expired)"}</Text>
  </View>
</TouchableOpacity>

              <View style={styles.cardInfo}>
                <Text style={styles.name}>
                  {item.name} {item.surname}
                </Text>
                <Text style={styles.detail}>{item.age} years old</Text>
                <Text style={styles.detail}>
                  {item.startDate} → {item.endDate}
                  {expired && " (Expired)"}
                </Text>
              </View>

              <View style={styles.actions}>
                <Ionicons
                  name={item.paid ? "checkmark-circle" : "close-circle"}
                  size={32}
                  color={item.paid ? "#00d4aa" : "#ff6b6b"}
                />
                <TouchableOpacity
                  onPress={() => router.push(`/members/${item.id}`)}
                  style={styles.icon}
                >
                  <Ionicons name="pencil" size={24} color="#1e90ff" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => deletePerson(item.id)}
                  style={styles.icon}
                >
                  <Ionicons name="trash" size={24} color="#ff4444" />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <Text style={styles.empty}>No members found</Text>
        }
      />
    </View>
  );
}

/* ====================== STYLES ====================== */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
    paddingTop: 50,
  },
  logo: {
    width: 180,
    height: 100,
    alignSelf: "center",
    marginBottom: 10,
  },
  statsBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 14,
    backgroundColor: "#111",
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  statsText: {
    color: "#aaa",
    fontSize: 15,
    fontWeight: "600",
  },
  searchInput: {
    backgroundColor: "#1a1a1a",
    color: "white",
    padding: 16,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#333",
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginBottom: 20,
  },
  filterBtn: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 30,
    backgroundColor: "#222",
  },
  filterBtnActive: {
    backgroundColor: "#1e90ff",
  },
  filterText: {
    color: "#ccc",
    fontWeight: "600",
    fontSize: 15,
  },
  filterTextActive: {
    color: "white",
  },
  addButton: {
    flexDirection: "row",
    backgroundColor: "#1e90ff",
    marginHorizontal: 16,
    padding: 18,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    marginBottom: 24,
  },
  addButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  card: {
    backgroundColor: "#1a1a1a",
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 18,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 12,
  },
  expiredCard: {
    borderLeftWidth: 6,
    borderLeftColor: "#ff4444",
  },
  unpaidCard: {
    opacity: 0.85,
  },
  cardInfo: {
    flex: 1,
    marginLeft: 14,
  },
  name: {
    color: "white",
    fontSize: 19,
    fontWeight: "bold",
  },
  detail: {
    color: "#aaa",
    fontSize: 14,
    marginTop: 4,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  icon: {
    padding: 6,
  },
  empty: {
    color: "#666",
    textAlign: "center",
    marginTop: 60,
    fontSize: 18,
  },
});