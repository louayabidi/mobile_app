// app/members/new.tsx
import { useState } from "react";
import { View, Text, StyleSheet, Pressable, TextInput, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useGymContext } from "../(context)/GymContext";
import { useRouter } from "expo-router";
import * as Notifications from "expo-notifications";

export default function AddMember() {
  const { people, setPeople, scheduleExpirationNotification, isExpired } = useGymContext();
  const [name, setName] = useState(""); const [surname, setSurname] = useState("");
  const [age, setAge] = useState(""); const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState(""); const [paid, setPaid] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const router = useRouter();

  const isFormComplete = name && surname && age && startDate && endDate;

  const savePerson = async () => {
    if (!isFormComplete) return alert("Please fill all fields");

    const newPerson: any = {
      id: Date.now().toString(),
      name, surname, age, startDate, endDate, paid,
      payments: [],
      notified: false,
    };

    // Record payment if marked as paid
    if (paid) {
      newPerson.payments.push({
        id: Date.now().toString(),
        date: new Date().toISOString().split("T")[0],
        paidUntil: endDate,
      });
    }

    const expired = isExpired(newPerson.endDate);
    if (!expired && !newPerson.notificationId) {
      const notifId = await scheduleExpirationNotification(newPerson);
      if (notifId) newPerson.notificationId = notifId;
    }

    setPeople([...people, newPerson]);
    router.back();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Member</Text>
      <TextInput placeholder="First Name" placeholderTextColor="#aaa" style={styles.input} value={name} onChangeText={setName} />
      <TextInput placeholder="Last Name" placeholderTextColor="#aaa" style={styles.input} value={surname} onChangeText={setSurname} />
      <TextInput placeholder="Age" placeholderTextColor="#aaa" style={styles.input} keyboardType="numeric" value={age} onChangeText={setAge} />

      <Pressable style={styles.input} onPress={() => setShowStartPicker(true)}>
        <Text style={{ color: startDate ? "white" : "#aaa" }}>{startDate || "Select Start Date"}</Text>
      </Pressable>
      {showStartPicker && (
        <DateTimePicker value={startDate ? new Date(startDate) : new Date()} mode="date"
          onChange={(e, d) => { setShowStartPicker(false); if (d) setStartDate(d.toISOString().split("T")[0]); }} />
      )}

      <Pressable style={styles.input} onPress={() => setShowEndPicker(true)}>
        <Text style={{ color: endDate ? "white" : "#aaa" }}>{endDate || "Select End Date"}</Text>
      </Pressable>
      {showEndPicker && (
        <DateTimePicker value={endDate ? new Date(endDate) : new Date()} mode="date"
          onChange={(e, d) => { setShowEndPicker(false); if (d) setEndDate(d.toISOString().split("T")[0]); }} />
      )}

      <Pressable style={styles.checkbox} onPress={() => setPaid(!paid)}>
        <Text style={{ color: "white" }}>Paid: {paid ? "Yes" : "No"}</Text>
      </Pressable>

      <Pressable style={[styles.button, !isFormComplete && styles.disabled]} onPress={savePerson} disabled={!isFormComplete}>
        <Text style={styles.buttonText}>Add Member</Text>
      </Pressable>
      <Pressable style={styles.cancel} onPress={() => router.back()}>
        <Text style={styles.cancelText}>Cancel</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111", padding: 20 },
  title: { color: "white", fontSize: 28, fontWeight: "bold", textAlign: "center", marginBottom: 25 },
  input: { backgroundColor: "#222", color: "white", padding: 15, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: "#333" },
  checkbox: { marginVertical: 15 },
  button: { backgroundColor: "#1e90ff", padding: 18, borderRadius: 12, marginBottom: 15 },
  disabled: { backgroundColor: "#666" },
  buttonText: { color: "white", textAlign: "center", fontSize: 18, fontWeight: "bold" },
  cancel: { backgroundColor: "#555", padding: 18, borderRadius: 12 },
  cancelText: { color: "white", textAlign: "center", fontSize: 18 },
});