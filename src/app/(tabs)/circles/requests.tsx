/**
 * àjó Join Requests Management Screen
 * Manage join requests for circles you administer
 */

import Header from "@/components/smt/smt-header";
import AjoButton from "@/components/ui/AjoButton";
import { AjoCard } from "@/components/ui/AjoCard";
import { AjoTypography } from "@/components/ui/AjoTypography";
import { apiService } from "@/services/api.service";
import { CircleOut, MembershipOut } from "@/services/api.types";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View
} from "react-native";

export default function JoinRequestsScreen() {
  const [circles, setCircles] = useState<CircleOut[]>([]);
  const [requests, setRequests] = useState<MembershipOut[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const circlesData = await apiService.listCircles();
      setCircles(circlesData);

      // Get all circles where user is the creator (admin)
      // For now, we'll just load all circles and their memberships
      // In a real app, you'd filter by circles where user is creator
      const allRequests: MembershipOut[] = [];
      for (const circle of circlesData) {
        try {
          const memberships = await apiService.listMembers(circle.id);
          const pendingRequests = memberships.filter(
            (m: MembershipOut) => m.status === "pending",
          );
          allRequests.push(...pendingRequests);
        } catch (error) {
          console.error(
            `Failed to load memberships for circle ${circle.id}:`,
            error,
          );
        }
      }
      setRequests(allRequests);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  const handleApprove = async (request: MembershipOut) => {
    Alert.alert(
      "Approve Request",
      "Do you want to approve this join request?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Approve",
          onPress: async () => {
            try {
              // Note: API endpoint for approving membership may not exist yet
              // This is a placeholder for when the backend supports it
              Alert.alert(
                "Coming Soon",
                "Membership approval will be available when the backend supports it.",
              );
              // await apiService.approveMembership(request.id);
              // Alert.alert("Success", "Join request approved");
              // await loadData();
            } catch (error: any) {
              Alert.alert(
                "Error",
                error.message || "Failed to approve request",
              );
            }
          },
        },
      ],
    );
  };

  const handleReject = async (request: MembershipOut) => {
    Alert.alert("Reject Request", "Do you want to reject this join request?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reject",
        style: "destructive",
        onPress: async () => {
          try {
            // Note: API endpoint for rejecting membership may not exist yet
            // This is a placeholder for when the backend supports it
            Alert.alert(
              "Coming Soon",
              "Membership rejection will be available when the backend supports it.",
            );
            // await apiService.rejectMembership(request.id);
            // Alert.alert("Success", "Join request rejected");
            // await loadData();
          } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to reject request");
          }
        },
      },
    ]);
  };

  const getCircleName = (circleId: number) => {
    const circle = circles.find((c) => c.id === circleId);
    return circle?.name || "Unknown Circle";
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        <Header
          title="Join Requests"
          rightButtons={[
            {
              icon: (
                <MaterialIcons
                  name="add-circle-outline"
                  size={24}
                  color={colors.textPrimary}
                />
              ),
              onPress: () => router.push("/circles/create"),
            },
          ]}
        />

        {isLoading ? (
          <View style={styles.loadingState}>
            <AjoTypography variant="body" color={colors.textTertiary}>
              Loading requests...
            </AjoTypography>
          </View>
        ) : requests.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="inbox" size={48} color={colors.textTertiary} />
            <AjoTypography
              variant="body"
              color={colors.textTertiary}
              style={styles.emptyText}
            >
              No pending join requests
            </AjoTypography>
            <AjoTypography
              variant="bodySmall"
              color={colors.textSecondary}
              style={styles.emptySubtext}
            >
              Requests from users wanting to join your circles will appear here.
            </AjoTypography>
          </View>
        ) : (
          <View style={styles.requestsList}>
            {requests.map((request) => (
              <AjoCard key={request.id} style={styles.requestCard}>
                <View style={styles.requestHeader}>
                  <View style={styles.requestInfo}>
                    <View style={styles.avatar}>
                      <MaterialIcons
                        name="person"
                        size={24}
                        color={colors.primary}
                      />
                    </View>
                    <View style={styles.requestDetails}>
                      <AjoTypography variant="cardTitle">
                        User {request.user_id}
                      </AjoTypography>
                      <AjoTypography
                        variant="bodySmall"
                        color={colors.textTertiary}
                      >
                        wants to join {getCircleName(request.circle_id)}
                      </AjoTypography>
                      <AjoTypography
                        variant="bodySmall"
                        color={colors.textSecondary}
                        style={styles.requestDate}
                      >
                        Requested{" "}
                        {new Date(request.joined_at).toLocaleDateString()}
                      </AjoTypography>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: colors.warning + "20",
                      },
                    ]}
                  >
                    <AjoTypography
                      variant="label"
                      color={colors.warning}
                      style={{ fontSize: 11 }}
                    >
                      PENDING
                    </AjoTypography>
                  </View>
                </View>

                <View style={styles.requestActions}>
                  <AjoButton
                    title="Reject"
                    variant="outline"
                    style={styles.rejectButton}
                    onPress={() => handleReject(request)}
                  />
                  <AjoButton
                    title="Approve"
                    style={styles.approveButton}
                    onPress={() => handleApprove(request)}
                  />
                </View>
              </AjoCard>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  loadingState: {
    paddingVertical: spacing.xl,
    alignItems: "center",
  },
  emptyState: {
    paddingVertical: spacing.xl,
    alignItems: "center",
  },
  emptyText: {
    marginTop: spacing.md,
  },
  emptySubtext: {
    marginTop: spacing.sm,
    textAlign: "center",
    paddingHorizontal: spacing.lg,
  },
  requestsList: {
    gap: spacing.md,
  },
  requestCard: {
    marginBottom: 0,
  },
  requestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  requestInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: colors.primary + "20",
    justifyContent: "center",
    alignItems: "center",
  },
  requestDetails: {
    flex: 1,
  },
  requestDate: {
    marginTop: spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  requestActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  rejectButton: {
    flex: 1,
  },
  approveButton: {
    flex: 1,
  },
});
