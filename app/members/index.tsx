// app/members/index.tsx
import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  TextInput,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useGymContext } from "../(context)/GymContext"; // ✅ Updated import
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import * as Notifications from "expo-notifications";

export default function MembersList() {
  const { people, setPeople, isExpired } = useGymContext();
  const [search, setSearch] = useState("");
  const router = useRouter();

  const deletePerson = async (id: string) => {
    Alert.alert("Delete Member", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const person = people.find((p: Person) => p.id === id);
          if (person && person.notificationId) {
            await Notifications.cancelScheduledNotificationAsync(
              person.notificationId
            );
          }
          setPeople(people.filter((p: Person) => p.id !== id));
        },
      },
    ]);
  };

  const filteredPeople = people.filter(
    (p: Person) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.surname.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* ✅ Added: Gym Logo */}
      <Image
        source={{ uri: "https://thumbs.dreamstime.com/b/fitness-gym-logo-label-sport-bodybuilding-concept-vector-illustration-gym-fitness-logo-label-sport-bodybuilding-concept-121785818.jpg" }}
        style={styles.logo}
      />
      <TextInput
        placeholder="Search by name or surname"
        placeholderTextColor="#aaa"
        style={styles.input}
        value={search}
        onChangeText={setSearch}
      />
      <Pressable
        style={styles.addButton}
        onPress={() => router.push("/members/new")}
      >
        <Text style={styles.buttonText}>Add New Member</Text>
      </Pressable>
      <Text style={styles.listTitle}>Members List</Text>
      <FlatList
        data={filteredPeople}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={[
              styles.card,
              isExpired(item.endDate) && styles.expiredCard,
            ]}
          >
            {/* ✅ Improved: Avatar placeholder */}
            <Ionicons name="person-circle-outline" size={50} color="#1e90ff" style={styles.avatar} />
            <View style={styles.cardContent}>
              <Text style={styles.cardText}>
                {item.name} {item.surname}
              </Text>
              <Text style={styles.ageText}>{item.age} years old</Text>
              <Text style={styles.dateText}>
                {item.startDate} → {item.endDate}
              </Text>
            </View>
            <View style={styles.iconContainer}>
              <Ionicons
                name={item.paid ? "checkmark-circle" : "close-circle"}
                size={24}
                color={item.paid ? "green" : "red"}
              />
              <Pressable onPress={() => router.push(`/members/${item.id}`)} style={styles.iconBtn}>
                <Ionicons name="pencil" size={24} color="#1e90ff" />
              </Pressable>
              <Pressable onPress={() => deletePerson(item.id)} style={styles.iconBtn}>
                <Ionicons name="trash" size={24} color="red" />
              </Pressable>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No members found.</Text>
        }
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111", padding: 20 },
  // ✅ Added: Logo styles
  logo: {
    width: 150,
    height: 80,
    alignSelf: "center",
    marginBottom: 20,
    resizeMode: "contain",
  },
  input: { backgroundColor: "#222", color: "white", padding: 15, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: "#333" },
  addButton: { backgroundColor: "#1e90ff", padding: 18, borderRadius: 12, marginBottom: 20 },
  buttonText: { color: "white", textAlign: "center", fontSize: 18, fontWeight: "bold" },
  listTitle: { color: "white", fontSize: 24, marginBottom: 15 },
  card: {
    backgroundColor: "#222",
    padding: 18,
    marginVertical: 8,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5, // ✅ Improved: Shadows for depth
  },
  expiredCard: { borderLeftWidth: 5, borderLeftColor: "red" },
  avatar: { marginRight: 15 }, // ✅ Added: Icon for visual appeal
  cardContent: { flex: 1 },
  cardText: { color: "white", fontSize: 18, fontWeight: "bold" },
  ageText: { color: "#aaa", fontSize: 15 },
  dateText: { color: "#ccc", fontSize: 13, marginTop: 4 },
  iconContainer: { flexDirection: "row", alignItems: "center", marginLeft: 15 },
  iconBtn: { marginLeft: 15 },
  emptyText: { color: "#aaa", textAlign: "center", marginTop: 25, fontSize: 16 },
});