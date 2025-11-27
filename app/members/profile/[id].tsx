// app/members/profile/[id].tsx
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useGymContext } from "../../(context)/GymContext";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import Logo from "../../components/Logo";
import RenewButton from "../components/RenewButton";

export default function MemberProfile() {
  const { people, isExpired, daysUntilExpiration, testNotification } = useGymContext();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [testing, setTesting] = useState(false);

  const member = people.find(p => p.id === id);
  if (!member) return (
    <View style={styles.container}>
      <Text style={styles.errorText}>Member not found</Text>
    </View>
  );

  const payments = useMemo(() => {
    return (member.payments || []).sort((a: any, b: any) => b.date.localeCompare(a.date));
  }, [member.payments]);

  const expired = isExpired(member.endDate);
  const daysLeft = daysUntilExpiration(member.endDate);

  const handleTestNotification = async () => {
    setTesting(true);
    try {
      await testNotification(member);
      Alert.alert(
        "Test Notification Sent! 🔔",
        "You will receive a test notification in 5 seconds. Check your notification center!",
        [{ text: "OK" }]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to send test notification");
    } finally {
      setTesting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Logo size="large" />

      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatarCircle}>
          <Ionicons name="person" size={60} color="#1e90ff" />
        </View>
        
        <Text style={styles.name}>{member.name} {member.surname}</Text>
        <Text style={styles.age}>{member.age} years old</Text>

        {/* Status Badge */}
        <View style={[
          styles.statusBadge,
          expired ? styles.expiredBadge : styles.activeBadge
        ]}>
          <Ionicons 
            name={expired ? "alert-circle" : "checkmark-circle"} 
            size={24} 
            color="white" 
          />
          <Text style={styles.statusText}>
            {expired ? "EXPIRED" : "ACTIVE"}
          </Text>
        </View>

        {/* Days Counter */}
        {!expired && (
          <View style={styles.daysCard}>
            <Text style={styles.daysNumber}>{daysLeft}</Text>
            <Text style={styles.daysLabel}>days remaining</Text>
          </View>
        )}
      </View>

      {/* Current Subscription Card */}
      <View style={styles.subscriptionCard}>
        <View style={styles.cardHeader}>
          <Ionicons name="calendar" size={24} color="#1e90ff" />
          <Text style={styles.cardTitle}>Current Subscription</Text>
        </View>
        
        <View style={styles.dateRow}>
          <View style={styles.dateItem}>
            <Text style={styles.dateLabel}>Start Date</Text>
            <Text style={styles.dateValue}>{member.startDate}</Text>
          </View>
          <Ionicons name="arrow-forward" size={20} color="#666" />
          <View style={styles.dateItem}>
            <Text style={styles.dateLabel}>End Date</Text>
            <Text style={[styles.dateValue, expired && styles.expiredDate]}>
              {member.endDate}
            </Text>
          </View>
        </View>

        {expired && (
          <View style={styles.warningBox}>
            <Ionicons name="warning" size={20} color="#ff4444" />
            <Text style={styles.warningText}>
              Subscription expired {Math.abs(daysLeft)} days ago
            </Text>
          </View>
        )}
      </View>
          {member && <RenewButton person={member} />}
      {/* Test Notification Button */}
      <TouchableOpacity 
        style={styles.testButton}
        onPress={handleTestNotification}
        disabled={testing}
      >
        <Ionicons name="notifications" size={20} color="white" />
        <Text style={styles.testButtonText}>
          {testing ? "Sending..." : "Test Notification (5 sec)"}
        </Text>
      </TouchableOpacity>

      {/* Payment History */}
      <View style={styles.historySection}>
        <View style={styles.sectionHeader}>
          <Ionicons name="receipt" size={28} color="#00d4aa" />
          <Text style={styles.sectionTitle}>Payment History</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{payments.length}</Text>
          </View>
        </View>

        {payments.length === 0 ? (
          <View style={styles.emptyHistory}>
            <Ionicons name="wallet-outline" size={60} color="#333" />
            <Text style={styles.emptyText}>No payment history</Text>
            <Text style={styles.emptySubtext}>Payments will appear here</Text>
          </View>
        ) : (
          <View style={styles.paymentsList}>
            {payments.map((payment: any, index: number) => (
              <View key={payment.id} style={styles.paymentCard}>
                <View style={styles.paymentIcon}>
                  <Ionicons name="cash" size={28} color="#00d4aa" />
                </View>
                
                <View style={styles.paymentInfo}>
                  <Text style={styles.paymentAmount}>
                    {payment.amount ? `${payment.amount} TND` : "Payment Recorded"}
                  </Text>
                  <Text style={styles.paymentDate}>Paid on {payment.date}</Text>
                  <Text style={styles.paymentPeriod}>
                    Valid until {payment.paidUntil}
                  </Text>
                  {payment.method && (
                    <Text style={styles.paymentMethod}>
                      Method: {payment.method}
                    </Text>
                  )}
                </View>

                <View style={styles.paymentNumber}>
                  <Text style={styles.paymentNumberText}>#{payments.length - index}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => router.push(`/members/${id}`)}
        >
          <Ionicons name="create" size={20} color="white" />
          <Text style={styles.editButtonText}>Edit Member</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={20} color="#888" />
          <Text style={styles.backButtonText}>Back to List</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
    paddingTop: 50,
  },
  errorText: {
    color: "#ff4444",
    fontSize: 18,
    textAlign: "center",
    marginTop: 100,
  },
  header: {
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  avatarCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#1e90ff20",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 3,
    borderColor: "#1e90ff",
  },
  name: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    marginBottom: 6,
  },
  age: {
    fontSize: 16,
    color: "#888",
    marginBottom: 20,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  activeBadge: {
    backgroundColor: "#00d4aa",
  },
  expiredBadge: {
    backgroundColor: "#ff4444",
  },
  statusText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  daysCard: {
    marginTop: 20,
    backgroundColor: "#1a1a1a",
    paddingHorizontal: 30,
    paddingVertical: 20,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#333",
  },
  daysNumber: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#1e90ff",
  },
  daysLabel: {
    fontSize: 14,
    color: "#888",
    marginTop: 4,
  },
  subscriptionCard: {
    backgroundColor: "#1a1a1a",
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#333",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateItem: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    color: "#888",
    marginBottom: 6,
  },
  dateValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e90ff",
  },
  expiredDate: {
    color: "#ff4444",
  },
  warningBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ff444420",
    padding: 12,
    borderRadius: 10,
    marginTop: 16,
    gap: 10,
  },
  warningText: {
    color: "#ff4444",
    fontSize: 14,
    fontWeight: "600",
  },
  testButton: {
    flexDirection: "row",
    backgroundColor: "#9b59b6",
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    marginBottom: 30,
  },
  testButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  historySection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
    flex: 1,
  },
  badge: {
    backgroundColor: "#00d4aa",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  emptyHistory: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    color: "#666",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
  },
  emptySubtext: {
    color: "#444",
    fontSize: 14,
    marginTop: 8,
  },
  paymentsList: {
    gap: 12,
  },
  paymentCard: {
    backgroundColor: "#1a1a1a",
    padding: 16,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#222",
  },
  paymentIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#00d4aa20",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentAmount: {
    color: "white",
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 4,
  },
  paymentDate: {
    color: "#888",
    fontSize: 13,
    marginBottom: 2,
  },
  paymentPeriod: {
    color: "#00d4aa",
    fontSize: 13,
    fontWeight: "600",
  },
  paymentMethod: {
    color: "#666",
    fontSize: 12,
    marginTop: 4,
  },
  paymentNumber: {
    backgroundColor: "#111",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  paymentNumberText: {
    color: "#888",
    fontSize: 12,
    fontWeight: "600",
  },
  actions: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 12,
  },
  editButton: {
    flexDirection: "row",
    backgroundColor: "#1e90ff",
    padding: 18,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  editButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  backButton: {
    flexDirection: "row",
    backgroundColor: "#1a1a1a",
    padding: 18,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "#333",
  },
  backButtonText: {
    color: "#888",
    fontSize: 16,
    fontWeight: "600",
  },
});