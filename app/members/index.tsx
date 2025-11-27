// app/members/index.tsx
import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useGymContext } from "../(context)/GymContext";
import { useRouter } from "expo-router";
import { LinearGradient } from 'expo-linear-gradient';

type FilterType = "all" | "paid" | "unpaid" | "expired";

export default function MembersList() {
  const { people, deletePerson, isExpired, daysUntilExpiration, loading } = useGymContext();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const router = useRouter();

  const handleDelete = async (id: string) => {
    Alert.alert("Delete Member", "Are you sure you want to delete this member?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deletePerson(id);
          } catch (error) {
            Alert.alert("Error", "Failed to delete member. Please try again.");
          }
        },
      },
    ]);
  };

  const filtered = people
    .filter((p) =>
      `${p.name} ${p.surname}`.toLowerCase().includes(search.toLowerCase())
    )
    .filter((p) => {
      if (filter === "paid") return p.paid && !isExpired(p.endDate);
      if (filter === "unpaid") return !p.paid;
      if (filter === "expired") return isExpired(p.endDate);
      return true;
    });

  const stats = {
    total: people.length,
    paid: people.filter((p) => p.paid && !isExpired(p.endDate)).length,
    unpaid: people.filter((p) => !p.paid).length,
    expired: people.filter((p) => isExpired(p.endDate)).length,
    expiringSoon: people.filter((p) => {
      const days = daysUntilExpiration(p.endDate);
      return days > 0 && days <= 7;
    }).length,
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#1e90ff" />
        <Text style={styles.loadingText}>Loading members...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Enhanced Header with Gradient */}
      <LinearGradient
        colors={['#1e3a8a', '#1e90ff', '#0a0a0a']}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitle}>THe team</Text>
              <Text style={styles.headerSubtitle}>Member Management System</Text>
            </View>
            <View style={styles.headerIcon}>
              <Ionicons name="fitness" size={40} color="white" />
            </View>
          </View>

          {/* Quick Stats */}
          <View style={styles.quickStats}>
            <View style={styles.quickStatItem}>
              <Text style={styles.quickStatNumber}>{stats.total}</Text>
              <Text style={styles.quickStatLabel}>Members</Text>
            </View>
            <View style={styles.quickStatDivider} />
            <View style={styles.quickStatItem}>
              <Text style={[styles.quickStatNumber, { color: "#00d4aa" }]}>
                {stats.paid}
              </Text>
              <Text style={styles.quickStatLabel}>Active</Text>
            </View>
            <View style={styles.quickStatDivider} />
            <View style={styles.quickStatItem}>
              <Text style={[styles.quickStatNumber, { color: "#ff6b6b" }]}>
                {stats.unpaid}
              </Text>
              <Text style={styles.quickStatLabel}>Unpaid</Text>
            </View>
            {stats.expiringSoon > 0 && (
              <>
                <View style={styles.quickStatDivider} />
                <View style={styles.quickStatItem}>
                  <Text style={[styles.quickStatNumber, { color: "#ffa500" }]}>
                    {stats.expiringSoon}
                  </Text>
                  <Text style={styles.quickStatLabel}>Expiring</Text>
                </View>
              </>
            )}
          </View>
        </View>
      </LinearGradient>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <TouchableOpacity 
          style={[styles.statCard, filter === "all" && styles.statCardActive]}
          onPress={() => setFilter("all")}
        >
          <Ionicons name="people" size={24} color="#1e90ff" />
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.statCard, styles.paidCard, filter === "paid" && styles.statCardActive]}
          onPress={() => setFilter("paid")}
        >
          <Ionicons name="checkmark-circle" size={24} color="#00d4aa" />
          <Text style={styles.statNumber}>{stats.paid}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.statCard, styles.unpaidCard, filter === "unpaid" && styles.statCardActive]}
          onPress={() => setFilter("unpaid")}
        >
          <Ionicons name="close-circle" size={24} color="#ff6b6b" />
          <Text style={styles.statNumber}>{stats.unpaid}</Text>
          <Text style={styles.statLabel}>Unpaid</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.statCard, styles.expiredCard, filter === "expired" && styles.statCardActive]}
          onPress={() => setFilter("expired")}
        >
          <Ionicons name="alert-circle" size={24} color="#ff4444" />
          <Text style={[styles.statNumber, stats.expired > 0 && { color: "#ff4444" }]}>
            {stats.expired}
          </Text>
          <Text style={styles.statLabel}>Expired</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          placeholder="Search members..."
          placeholderTextColor="#666"
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={20} color="#888" />
          </TouchableOpacity>
        )}
      </View>

      {/* Add Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push("/members/new")}
      >
        <Ionicons name="add-circle" size={24} color="white" />
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
          const daysLeft = daysUntilExpiration(item.endDate);
          const expiringSoon = daysLeft > 0 && daysLeft <= 7;
          
          return (
            <TouchableOpacity
              style={[
                styles.memberCard,
                expired && styles.expiredMemberCard,
                expiringSoon && styles.expiringSoonCard,
              ]}
              onPress={() => router.push(`/members/profile/${item.id}`)}
              activeOpacity={0.7}
            >
              <View style={styles.memberLeft}>
                <View style={[
                  styles.avatarContainer,
                  { backgroundColor: expired ? '#ff444420' : item.paid ? '#00d4aa20' : '#ff6b6b20' }
                ]}>
                  <Ionicons
                    name="person"
                    size={32}
                    color={expired ? "#ff4444" : item.paid ? "#00d4aa" : "#ff6b6b"}
                  />
                </View>

                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>
                    {item.name} {item.surname}
                  </Text>
                  <Text style={styles.memberDetail}>
                    <Ionicons name="calendar-outline" size={12} color="#888" /> {item.age} years old
                  </Text>
                  <Text style={[styles.memberDetail, expired && styles.expiredText]}>
                    <Ionicons name="time-outline" size={12} color={expired ? "#ff4444" : expiringSoon ? "#ffa500" : "#888"} /> 
                    {" "}{expired ? `Expired ${Math.abs(daysLeft)} days ago` : expiringSoon ? `${daysLeft} days left` : item.endDate}
                  </Text>
                  {expired && (
                    <View style={styles.expiredBadge}>
                      <Text style={styles.expiredBadgeText}>EXPIRED</Text>
                    </View>
                  )}
                  {expiringSoon && !expired && (
                    <View style={styles.warningSoon}>
                      <Text style={styles.warningBadgeText}>EXPIRING SOON</Text>
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.memberRight}>
                <View style={[
                  styles.statusBadge,
                  expired ? styles.expiredStatusBadge : item.paid ? styles.paidBadge : styles.unpaidBadge
                ]}>
                  <Text style={styles.statusText}>
                    {expired ? "EXPIRED" : item.paid ? "PAID" : "UNPAID"}
                  </Text>
                </View>

                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      router.push(`/members/${item.id}`);
                    }}
                    style={styles.actionBtn}
                  >
                    <Ionicons name="create-outline" size={20} color="#1e90ff" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      handleDelete(item.id);
                    }}
                    style={styles.actionBtn}
                  >
                    <Ionicons name="trash-outline" size={20} color="#ff4444" />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={80} color="#333" />
            <Text style={styles.emptyText}>No members found</Text>
            <Text style={styles.emptySubtext}>
              {search ? "Try a different search term" : "Add your first member to get started"}
            </Text>
          </View>
        }
      />
    </View>
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
  headerGradient: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    gap: 20,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#e0e0e0",
    marginTop: 4,
  },
  headerIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  quickStats: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 16,
    padding: 16,
    justifyContent: "space-around",
    alignItems: "center",
  },
  quickStatItem: {
    alignItems: "center",
  },
  quickStatNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  quickStatLabel: {
    fontSize: 12,
    color: "#e0e0e0",
    marginTop: 4,
  },
  quickStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 20,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#222",
  },
  statCardActive: {
    borderColor: "#1e90ff",
    borderWidth: 2,
  },
  paidCard: {
    borderColor: "#00d4aa30",
  },
  unpaidCard: {
    borderColor: "#ff6b6b30",
  },
  expiredCard: {
    borderColor: "#ff444430",
  },
  statNumber: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 8,
  },
  statLabel: {
    color: "#888",
    fontSize: 12,
    marginTop: 4,
    fontWeight: "600",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    marginHorizontal: 16,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#333",
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: "white",
    paddingVertical: 16,
    fontSize: 16,
  },
  addButton: {
    flexDirection: "row",
    backgroundColor: "#1e90ff",
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
    shadowColor: "#1e90ff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  memberCard: {
    backgroundColor: "#1a1a1a",
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#222",
  },
  expiredMemberCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#ff4444",
  },
  expiringSoonCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#ffa500",
  },
  memberLeft: {
    flexDirection: "row",
    flex: 1,
    alignItems: "center",
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  memberInfo: {
    marginLeft: 14,
    flex: 1,
  },
  memberName: {
    color: "white",
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 4,
  },
  memberDetail: {
    color: "#888",
    fontSize: 13,
    marginTop: 2,
  },
  expiredText: {
    color: "#ff4444",
  },
  expiredBadge: {
    backgroundColor: "#ff444420",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginTop: 6,
  },
  expiredBadgeText: {
    color: "#ff4444",
    fontSize: 10,
    fontWeight: "bold",
  },
  warningSoon: {
    backgroundColor: "#ffa50020",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginTop: 6,
  },
  warningBadgeText: {
    color: "#ffa500",
    fontSize: 10,
    fontWeight: "bold",
  },
  memberRight: {
    alignItems: "flex-end",
    gap: 10,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  paidBadge: {
    backgroundColor: "#00d4aa20",
  },
  unpaidBadge: {
    backgroundColor: "#ff6b6b20",
  },
  expiredStatusBadge: {
    backgroundColor: "#ff444420",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "white",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 10,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#111",
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 80,
    paddingHorizontal: 40,
  },
  emptyText: {
    color: "#666",
    fontSize: 20,
    fontWeight: "600",
    marginTop: 20,
  },
  emptySubtext: {
    color: "#444",
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
});