// app/members/[id].tsx
import { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  Pressable, 
  TextInput, 
  Alert,
  ActivityIndicator,
  ScrollView 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useGymContext } from "../(context)/GymContext";
import { useRouter, useLocalSearchParams } from "expo-router";

export default function EditMember() {
  const { people, updatePerson } = useGymContext();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [age, setAge] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [paid, setPaid] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const person = people.find((p) => p.id === id);
    if (person) {
      setName(person.name);
      setSurname(person.surname);
      setAge(person.age);
      setStartDate(person.startDate);
      setEndDate(person.endDate);
      setPaid(person.paid);
      setLoading(false);
    }
  }, [id, people]);

  const isFormComplete = name && surname && age && startDate && endDate;

  const savePerson = async () => {
    if (!isFormComplete) {
      Alert.alert("Incomplete Form", "Please fill all fields");
      return;
    }

    setSaving(true);
    try {
      const previous = people.find(p => p.id === id);
      const wasPaidBefore = previous?.paid;

      const updates: any = {
        name: name.trim(),
        surname: surname.trim(),
        age,
        startDate,
        endDate,
        paid,
      };

      // Record payment only when changing from unpaid → paid
      if (paid && !wasPaidBefore && previous) {
        updates.payments = [
          ...(previous.payments || []),
          {
            id: Date.now().toString(),
            date: new Date().toISOString().split("T")[0],
            paidUntil: endDate,
          }
        ];
      }

      await updatePerson(id, updates);

      Alert.alert("Success", "Member updated successfully!", [
        { text: "OK", onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to update member. Please try again.");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#1e90ff" />
        <Text style={styles.loadingText}>Loading member...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="create" size={48} color="#1e90ff" />
        <Text style={styles.title}>Edit Member</Text>
        <Text style={styles.subtitle}>Update member details</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>First Name *</Text>
          <TextInput
            placeholder="Enter first name"
            placeholderTextColor="#666"
            style={styles.input}
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Last Name *</Text>
          <TextInput
            placeholder="Enter last name"
            placeholderTextColor="#666"
            style={styles.input}
            value={surname}
            onChangeText={setSurname}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Age *</Text>
          <TextInput
            placeholder="Enter age"
            placeholderTextColor="#666"
            style={styles.input}
            keyboardType="numeric"
            value={age}
            onChangeText={setAge}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Start Date *</Text>
          <Pressable 
            style={styles.dateInput} 
            onPress={() => setShowStartPicker(true)}
          >
            <Ionicons name="calendar-outline" size={20} color="#888" />
            <Text style={[styles.dateText, startDate && styles.dateTextFilled]}>
              {startDate || "Select start date"}
            </Text>
          </Pressable>
          {showStartPicker && (
            <DateTimePicker
              value={startDate ? new Date(startDate) : new Date()}
              mode="date"
              onChange={(e, d) => {
                setShowStartPicker(false);
                if (d) setStartDate(d.toISOString().split("T")[0]);
              }}
            />
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>End Date *</Text>
          <Pressable 
            style={styles.dateInput} 
            onPress={() => setShowEndPicker(true)}
          >
            <Ionicons name="calendar-outline" size={20} color="#888" />
            <Text style={[styles.dateText, endDate && styles.dateTextFilled]}>
              {endDate || "Select end date"}
            </Text>
          </Pressable>
          {showEndPicker && (
            <DateTimePicker
              value={endDate ? new Date(endDate) : new Date()}
              mode="date"
              onChange={(e, d) => {
                setShowEndPicker(false);
                if (d) setEndDate(d.toISOString().split("T")[0]);
              }}
            />
          )}
        </View>

        <Pressable 
          style={styles.paymentToggle} 
          onPress={() => setPaid(!paid)}
        >
          <View style={styles.paymentLeft}>
            <Ionicons 
              name={paid ? "checkmark-circle" : "close-circle"} 
              size={28} 
              color={paid ? "#00d4aa" : "#ff6b6b"} 
            />
            <View style={styles.paymentTextContainer}>
              <Text style={styles.paymentLabel}>Payment Status</Text>
              <Text style={styles.paymentStatus}>
                {paid ? "Paid" : "Unpaid"}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#666" />
        </Pressable>

        <Pressable
          style={[styles.saveButton, !isFormComplete && styles.disabledButton]}
          onPress={savePerson}
          disabled={!isFormComplete || saving}
        >
          {saving ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={24} color="white" />
              <Text style={styles.saveButtonText}>Update Member</Text>
            </>
          )}
        </Pressable>

        <Pressable 
          style={styles.cancelButton} 
          onPress={() => router.back()}
          disabled={saving}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#888",
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 30,
  },
  title: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 16,
  },
  subtitle: {
    color: "#888",
    fontSize: 14,
    marginTop: 8,
  },
  form: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: "#aaa",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#1a1a1a",
    color: "white",
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#333",
  },
  dateInput: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#333",
    gap: 12,
  },
  dateText: {
    color: "#666",
    fontSize: 16,
  },
  dateTextFilled: {
    color: "white",
  },
  paymentToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1a1a1a",
    padding: 16,
    borderRadius: 12,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: "#333",
  },
  paymentLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  paymentTextContainer: {
    gap: 4,
  },
  paymentLabel: {
    color: "#888",
    fontSize: 12,
  },
  paymentStatus: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  saveButton: {
    flexDirection: "row",
    backgroundColor: "#1e90ff",
    padding: 18,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  disabledButton: {
    backgroundColor: "#666",
    opacity: 0.5,
  },
  saveButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  cancelButton: {
    backgroundColor: "#1a1a1a",
    padding: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#333",
  },
  cancelButtonText: {
    color: "#888",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
});