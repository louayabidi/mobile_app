// app/members/profile/[id].tsx
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useGymContext } from "../../(context)/GymContext";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
import Logo from "../../components/Logo";
export default function MemberProfile() {
  const { people, isExpired } = useGymContext();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const member = people.find(p => p.id === id);
  if (!member) return <Text style={{ color: "white", padding: 20 }}>Member not found</Text>;

  const payments = useMemo(() => {
    return (member.payments || []).sort((a: any, b: any) => b.date.localeCompare(a.date));
  }, [member.payments]);

  const expired = isExpired(member.endDate);

  return (
    <View style={styles.container}>
     <Logo size="large" />

      <View style={styles.header}>
        <Ionicons name="person-circle" size={110} color="#1e90ff" />
        <Text style={styles.name}>{member.name} {member.surname}</Text>
        <Text style={styles.age}>{member.age} years old</Text>

        <View style={styles.statusRow}>
          <Ionicons name={member.paid ? "checkmark-circle" : "close-circle"} size={40} color={member.paid ? "#00d4aa" : "#ff4444"} />
          <Text style={[styles.status, { color: member.paid ? "#00d4aa" : "#ff4444" }]}>
            {member.paid ? "Active Member" : "Payment Due"}
          </Text>
        </View>

        <View style={styles.subscription}>
          <Text style={styles.subLabel}>Current Subscription</Text>
          <Text style={styles.subDates}>{member.startDate} → {member.endDate}</Text>
          {expired && <Text style={styles.expiredText}>EXPIRED</Text>}
        </View>
      </View>

      <Text style={styles.sectionTitle}>Payment History</Text>

      <FlatList
        data={payments}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
        renderItem={({ item }: any) => (
          <View style={styles.paymentCard}>
            <Ionicons name="calendar-outline" size={28} color="#00d4aa" />
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={styles.paymentDate}>Paid on {item.date}</Text>
              <Text style={styles.paymentDetail}>Valid until {item.paidUntil}</Text>
            </View>
            <Ionicons name="checkmark-circle" size={36} color="#00d4aa" />
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No payments recorded</Text>}
      />

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={26} color="white" />
        <Text style={styles.backText}>Back to List</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0a", paddingTop: 50 },
  logo: { width: 180, height: 100, alignSelf: "center", marginBottom: 20 },
  header: { alignItems: "center", marginBottom: 30 },
  name: { fontSize: 30, fontWeight: "bold", color: "white", marginTop: 12 },
  age: { fontSize: 18, color: "#aaa", marginTop: 6 },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 16 },
  status: { fontSize: 20, fontWeight: "600" },
  subscription: { marginTop: 24, padding: 20, backgroundColor: "#111", borderRadius: 20, width: "85%", alignItems: "center" },
  subLabel: { color: "#888", fontSize: 15 },
  subDates: { color: "#1e90ff", fontSize: 20, fontWeight: "bold", marginTop: 6 },
  expiredText: { color: "#ff4444", fontSize: 16, fontWeight: "bold", marginTop: 8 },
  sectionTitle: { fontSize: 26, fontWeight: "bold", color: "white", textAlign: "center", marginBottom: 10 },
  paymentCard: { backgroundColor: "#1a1a1a", padding: 18, borderRadius: 18, flexDirection: "row", alignItems: "center", marginVertical: 6,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 12 },
  paymentDate: { color: "white", fontSize: 17, fontWeight: "600" },
  paymentDetail: { color: "#00d4aa", fontSize: 15, marginTop: 4 },
  empty: { color: "#666", textAlign: "center", marginTop: 50, fontSize: 18 },
  backButton: { flexDirection: "row", backgroundColor: "#1e90ff", margin: 20, padding: 18, borderRadius: 18, justifyContent: "center", alignItems: "center", gap: 12 },
  backText: { color: "white", fontSize: 18, fontWeight: "bold" },
});