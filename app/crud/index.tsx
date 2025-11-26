import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  FlatList,
  Alert,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

// ✅ Type for a gym member
type Person = {
  id: string;
  name: string;
  surname: string;
  age: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  paid: boolean;
};

export default function GymApp() {
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [age, setAge] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [paid, setPaid] = useState(false);
  const [people, setPeople] = useState<Person[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const STORAGE_KEY = "@people_list";

  // Load people from storage
  useEffect(() => {
    const loadPeople = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) setPeople(JSON.parse(stored));
      } catch (e) {
        console.log("Failed to load people", e);
      }
    };
    loadPeople();
  }, []);

  // Save people to storage whenever it changes
  useEffect(() => {
    const savePeople = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(people));
      } catch (e) {
        console.log("Failed to save people", e);
      }
    };
    savePeople();
  }, [people]);

  // Check if subscription expired
  const isExpired = (end: string) => {
    return new Date(end) < new Date();
  };

  // Add or update person
  const savePerson = () => {
    if (!name || !surname || !age || !startDate || !endDate)
      return alert("Please fill all fields");

    if (editingId) {
      setPeople(
        people.map((p) =>
          p.id === editingId ? { ...p, name, surname, age, startDate, endDate, paid } : p
        )
      );
      setEditingId(null);
    } else {
      const newPerson: Person = {
        id: Date.now().toString(),
        name,
        surname,
        age,
        startDate,
        endDate,
        paid,
      };
      setPeople([...people, newPerson]);
    }

    setName("");
    setSurname("");
    setAge("");
    setStartDate("");
    setEndDate("");
    setPaid(false);
  };

  const deletePerson = (id: string) => {
    Alert.alert("Delete Member", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => setPeople(people.filter((p) => p.id !== id)),
      },
    ]);
  };

  const editPerson = (person: Person) => {
    setName(person.name);
    setSurname(person.surname);
    setAge(person.age);
    setStartDate(person.startDate);
    setEndDate(person.endDate);
    setPaid(person.paid);
    setEditingId(person.id);
  };

  const filteredPeople = people.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.surname.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{editingId ? "Edit Member" : "Add Member"}</Text>

      <TextInput
        placeholder="First Name"
        placeholderTextColor="#aaa"
        style={styles.input}
        value={name}
        onChangeText={setName}
      />
      <TextInput
        placeholder="Last Name"
        placeholderTextColor="#aaa"
        style={styles.input}
        value={surname}
        onChangeText={setSurname}
      />
      <TextInput
        placeholder="Age"
        placeholderTextColor="#aaa"
        style={styles.input}
        keyboardType="numeric"
        value={age}
        onChangeText={setAge}
      />
      <TextInput
        placeholder="Start Date (YYYY-MM-DD)"
        placeholderTextColor="#aaa"
        style={styles.input}
        value={startDate}
        onChangeText={setStartDate}
      />
      <TextInput
        placeholder="End Date (YYYY-MM-DD)"
        placeholderTextColor="#aaa"
        style={styles.input}
        value={endDate}
        onChangeText={setEndDate}
      />

      <Pressable style={styles.checkboxContainer} onPress={() => setPaid(!paid)}>
        <Text style={{ color: "white" }}>Paid: {paid ? "Yes" : "No"}</Text>
      </Pressable>

      <Pressable style={styles.button} onPress={savePerson}>
        <Text style={styles.buttonText}>
          {editingId ? "Update Member" : "Add Member"}
        </Text>
      </Pressable>

      <TextInput
        placeholder="Search by name or surname"
        placeholderTextColor="#aaa"
        style={styles.input}
        value={search}
        onChangeText={setSearch}
      />

      <Text style={styles.listTitle}>Members List</Text>

      <FlatList
        data={filteredPeople}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={[
              styles.card,
              isExpired(item.endDate) && { borderLeftWidth: 5, borderLeftColor: "red" },
            ]}
          >
            <View style={{ flex: 1 }}>
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
              <Pressable onPress={() => editPerson(item)} style={styles.iconBtn}>
                <Ionicons name="pencil" size={24} color="#1e90ff" />
              </Pressable>
              <Pressable onPress={() => deletePerson(item.id)} style={styles.iconBtn}>
                <Ionicons name="trash" size={24} color="red" />
              </Pressable>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No members found.</Text>}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111", padding: 20 },
  title: { color: "white", fontSize: 26, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  input: { backgroundColor: "#222", color: "white", padding: 12, borderRadius: 8, marginBottom: 10 },
  button: { backgroundColor: "#1e90ff", padding: 15, borderRadius: 10, marginTop: 10, marginBottom: 20 },
  buttonText: { color: "white", textAlign: "center", fontSize: 18, fontWeight: "bold" },
  listTitle: { color: "white", fontSize: 22, marginBottom: 10 },
  card: {
    backgroundColor: "#222",
    padding: 15,
    marginVertical: 6,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  cardText: { color: "white", fontSize: 16, fontWeight: "bold" },
  ageText: { color: "#aaa", fontSize: 14 },
  dateText: { color: "#ccc", fontSize: 12, marginTop: 2 },
  iconContainer: { flexDirection: "row", alignItems: "center", marginLeft: 10 },
  iconBtn: { marginLeft: 10 },
  checkboxContainer: { marginVertical: 5 },
  emptyText: { color: "#aaa", textAlign: "center", marginTop: 20 },
});
