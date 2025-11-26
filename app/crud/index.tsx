import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  Alert,
  TextInput,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Notifications from "expo-notifications";

// ✅ Type for a gym member
type Person = {
  id: string;
  name: string;
  surname: string;
  age: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  paid: boolean;
  notificationId?: string;
  notified?: boolean;
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
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const STORAGE_KEY = "@people_list";

  // Request notification permissions
  useEffect(() => {
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted")
        alert(
          "Enable notifications to get alerts for expired subscriptions!"
        );
    })();
  }, []);

  // Load people from storage and verify/fix notifications
  useEffect(() => {
    loadPeople();
  }, []);

  const loadPeople = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        let parsed = JSON.parse(stored);
        const fixed = await verifyAndFixNotifications(parsed);
        setPeople(fixed);
      }
    } catch (e) {
      console.log("Failed to load people", e);
    }
  };

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

  const isExpired = (end: string) => new Date(end) < new Date();

  const scheduleExpirationNotification = async (person: Person) => {
    const end = new Date(person.endDate);
    const triggerDate = new Date(end.getTime() + 86400000); // next day
    triggerDate.setHours(9, 0, 0, 0); // 9 AM
    const now = new Date();
    if (triggerDate <= now) return null;
    const seconds = Math.floor((triggerDate.getTime() - now.getTime()) / 1000);
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Subscription Expired!",
        body: `${person.name} ${person.surname}'s subscription has expired.`,
      },
      trigger: { seconds, repeats: false },
    });
    return identifier;
  };

  const verifyAndFixNotifications = async (loadedPeople: Person[]) => {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const scheduledIds = scheduled.map((n) => n.identifier);
    const updatedPeople = [...loadedPeople];
    for (let i = 0; i < updatedPeople.length; i++) {
      const p = updatedPeople[i];
      if (p.notificationId && !scheduledIds.includes(p.notificationId)) {
        delete p.notificationId;
      }
      const expired = isExpired(p.endDate);
      if (expired) {
        if (!p.notified) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: "Subscription Expired!",
              body: `${p.name} ${p.surname}'s subscription ended on ${p.endDate}!`,
            },
            trigger: null,
          });
          p.notified = true;
        }
        if (p.notificationId) delete p.notificationId;
      } else {
        if (!p.notificationId) {
          const newId = await scheduleExpirationNotification(p);
          if (newId) p.notificationId = newId;
        }
      }
    }
    return updatedPeople;
  };

  // Add or update person
  const savePerson = async () => {
    if (!name || !surname || !age || !startDate || !endDate)
      return alert("Please fill all fields");

    let updatedPeople: Person[];
    let updatedPerson: Person;

    if (editingId) {
      updatedPeople = people.map((p) =>
        p.id === editingId
          ? { ...p, name, surname, age, startDate, endDate, paid }
          : p
      );
      updatedPerson = updatedPeople.find((p) => p.id === editingId)!;
    } else {
      updatedPerson = {
        id: Date.now().toString(),
        name,
        surname,
        age,
        startDate,
        endDate,
        paid,
        notified: false,
      };
      updatedPeople = [...people, updatedPerson];
    }

    // Handle notification for the updated/added person
    const expired = isExpired(updatedPerson.endDate);
    if (updatedPerson.notificationId) {
      await Notifications.cancelScheduledNotificationAsync(
        updatedPerson.notificationId
      );
      delete updatedPerson.notificationId;
    }
    if (expired) {
      if (!updatedPerson.notified) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Subscription Expired!",
            body: `${updatedPerson.name} ${updatedPerson.surname}'s subscription ended on ${updatedPerson.endDate}!`,
          },
          trigger: null,
        });
        updatedPerson.notified = true;
      }
    } else {
      const newId = await scheduleExpirationNotification(updatedPerson);
      if (newId) updatedPerson.notificationId = newId;
      updatedPerson.notified = false;
    }

    setPeople(updatedPeople);
    setEditingId(null);

    // Clear inputs
    setName("");
    setSurname("");
    setAge("");
    setStartDate("");
    setEndDate("");
    setPaid(false);
  };

  const deletePerson = async (id: string) => {
    Alert.alert("Delete Member", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const person = people.find((p) => p.id === id);
          if (person && person.notificationId) {
            await Notifications.cancelScheduledNotificationAsync(
              person.notificationId
            );
          }
          setPeople(people.filter((p) => p.id !== id));
        },
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

  const renderHeader = () => (
    <View>
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
      {/* DatePickers */}
      <Pressable style={styles.input} onPress={() => setShowStartPicker(true)}>
        <Text style={{ color: startDate ? "white" : "#aaa" }}>
          {startDate || "Select Start Date"}
        </Text>
      </Pressable>
      {showStartPicker && (
        <DateTimePicker
          value={startDate ? new Date(startDate) : new Date()}
          mode="date"
          display="default"
          onChange={(e, d) => {
            setShowStartPicker(false);
            if (d) setStartDate(d.toISOString().split("T")[0]);
          }}
        />
      )}
      <Pressable style={styles.input} onPress={() => setShowEndPicker(true)}>
        <Text style={{ color: endDate ? "white" : "#aaa" }}>
          {endDate || "Select End Date"}
        </Text>
      </Pressable>
      {showEndPicker && (
        <DateTimePicker
          value={endDate ? new Date(endDate) : new Date()}
          mode="date"
          display="default"
          onChange={(e, d) => {
            setShowEndPicker(false);
            if (d) setEndDate(d.toISOString().split("T")[0]);
          }}
        />
      )}
      {/* Paid toggle */}
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
    </View>
  );

return (
  <View style={styles.container}>
    {/* Form */}
    <View>
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
      <Pressable style={styles.input} onPress={() => setShowStartPicker(true)}>
        <Text style={{ color: startDate ? "white" : "#aaa" }}>
          {startDate || "Select Start Date"}
        </Text>
      </Pressable>
      <Pressable style={styles.input} onPress={() => setShowEndPicker(true)}>
        <Text style={{ color: endDate ? "white" : "#aaa" }}>
          {endDate || "Select End Date"}
        </Text>
      </Pressable>
      <Pressable
        style={styles.checkboxContainer}
        onPress={() => setPaid(!paid)}
      >
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
    </View>

    {/* FlatList */}
    <FlatList
      data={filteredPeople}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View
          style={[
            styles.card,
            isExpired(item.endDate) && {
              borderLeftWidth: 5,
              borderLeftColor: "red",
            },
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
      ListEmptyComponent={
        <Text style={styles.emptyText}>No members found.</Text>
      }
    />
  </View>
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