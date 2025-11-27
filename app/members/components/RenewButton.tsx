// app/members/components/RenewButton.tsx
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useGymContext } from "../../(context)/GymContext";
import { useState } from "react";

export default function RenewButton({ person }: { person: any }) {
  const { renewSubscription, isExpired } = useGymContext();
  const [loading, setLoading] = useState(false);

  const expired = isExpired(person.endDate);

  const handleRenew = () => {
    Alert.alert(
      "Renew Subscription",
      `Renew ${person.name} ${person.surname} for 1 month?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Renew Now",
          onPress: async () => {
            setLoading(true);
            try {
              await renewSubscription(person.id, 1, 30); 
              Alert.alert("Success", "Subscription renewed for 1 month!");
            } catch (err) {
              Alert.alert("Error", "Failed to renew. Check internet connection.");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  // Show button only if expired or unpaid
  if (person.paid && !expired) return null;

  return (
    <TouchableOpacity
      style={{
        backgroundColor: "#00d4aa",
        marginHorizontal: 20,
        marginVertical: 16,
        padding: 18,
        borderRadius: 16,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 12,
        shadowColor: "#00d4aa",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 10,
      }}
      onPress={handleRenew}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color="white" />
      ) : (
        <>
          <Ionicons name="refresh-circle" size={28} color="white" />
          <Text style={{ color: "white", fontSize: 18, fontWeight: "bold" }}>
            Renew Subscription (1 Month)
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}