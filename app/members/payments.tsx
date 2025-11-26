// app/members/payments.tsx
import { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useGymContext } from "../(context)/GymContext";
import { Link } from "expo-router";
import Logo from "../components/Logo";
export default function PaymentHistory() {
  const { people } = useGymContext();

  // Build payment history from people who have paid = true
  const payments = useMemo(() => {
    const history: Array<{
      id: string;
      personId: string;
      name: string;
      surname: string;
      date: string; // We'll use endDate as "payment received for this period"
      amount?: string; // optional – you can add real amounts later
    }> = [];

    people.forEach((p) => {
      if (p.paid) {
        history.push({
          id: `${p.id}-payment`,
          personId: p.id,
          name: p.name,
          surname: p.surname,
          date: p.endDate, // This is when their current subscription ends → payment covers until this date
        });
      }
    });

    // Sort newest first
    return history.sort((a, b) => b.date.localeCompare(a.date));
  }, [people]);

  return (
    <View style={styles.container}>
      {/* Logo */}
    <Logo size="large" />

      <Text style={styles.title}>Payment History</Text>

      <View style={styles.summary}>
        <Text style={styles.summaryText}>
          Total Payments Received: <Text style={styles.highlight}>{payments.length}</Text>
        </Text>
      </View>

      <FlatList
        data={payments}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        renderItem={({ item }) => (
          <View style={styles.paymentCard}>
            <View style={styles.avatar}>
              <Ionicons name="person-circle" size={50} color="#00d4aa" />
            </View>

            <View style={styles.info}>
              <Text style={styles.name}>
                {item.name} {item.surname}
              </Text>
              <Text style={styles.date}>
                Paid until: {item.date}
              </Text>
            </View>

            <View style={styles.check}>
              <Ionicons name="checkmark-circle" size={40} color="#00d4aa" />
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No payments recorded yet</Text>
        }
      />

      {/* Back button */}
      <Link href="/members" asChild>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
          <Text style={styles.backText}>Back to Members</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

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
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 10,
  },
  summary: {
    backgroundColor: "#111",
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  summaryText: {
    color: "#aaa",
    fontSize: 16,
    textAlign: "center",
  },
  highlight: {
    color: "#00d4aa",
    fontWeight: "bold",
    fontSize: 18,
  },
  paymentCard: {
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
  avatar: {
    marginRight: 16,
  },
  info: {
    flex: 1,
  },
  name: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  date: {
    color: "#00d4aa",
    fontSize: 14,
    marginTop: 4,
  },
  check: {
    opacity: 0.9,
  },
  empty: {
    color: "#666",
    textAlign: "center",
    marginTop: 60,
    fontSize: 18,
  },
  backButton: {
    flexDirection: "row",
    backgroundColor: "#1e90ff",
    marginHorizontal: 16,
    marginTop: 20,
    padding: 16,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  backText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});