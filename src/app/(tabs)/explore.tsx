/**
 * àjó Explore/Discover Screen
 * Browse and filter available circles to join
 */

import Header from "@/components/smt/smt-header";
import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { apiService } from "@/services/api.service";
import { CircleOut } from "@/services/api.types";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";
import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

export default function ExploreScreen() {
  const [circles, setCircles] = useState<CircleOut[]>([]);
  const [filteredCircles, setFilteredCircles] = useState<CircleOut[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

  const filters = [
    { id: "weekly", label: "Weekly" },
    { id: "biweekly", label: "Bi-weekly" },
    { id: "monthly", label: "Monthly" },
  ];

  useEffect(() => {
    loadCircles();
  }, []);

  useEffect(() => {
    filterCircles();
  }, [searchQuery, selectedFilter, circles]);

  const loadCircles = async () => {
    try {
      const data = await apiService.listCircles();
      setCircles(data);
    } catch (error) {
      console.error("Failed to load circles:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterCircles = () => {
    let filtered = [...circles];

    if (searchQuery) {
      filtered = filtered.filter((circle) =>
        circle.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    if (selectedFilter) {
      filtered = filtered.filter(
        (circle) => circle.frequency === selectedFilter,
      );
    }

    setFilteredCircles(filtered);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadCircles();
    setIsRefreshing(false);
  };

  const handleCirclePress = (circle: CircleOut) => {
    // TODO: Navigate to circle detail screen when created
    // router.push(`/circles/${circle.id}` as any);
    Alert.alert(
      "Circle Details",
      `Navigate to circle ${circle.id} (coming soon)`,
    );
  };

  const handleJoinRequest = async (circle: CircleOut) => {
    try {
      await apiService.requestToJoin(circle.id);
      Alert.alert(
        "Success",
        "Your join request has been sent to the circle creator.",
      );
      await loadCircles();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to request to join.");
    }
  };

  const getProgress = (circle: CircleOut) => {
    return circle.cycle_goal > 0
      ? (circle.total_saved / circle.cycle_goal) * 100
      : 0;
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
        <Header title="Explore Circles" />

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <MaterialIcons
              name="search"
              size={20}
              color={colors.textTertiary}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search circles..."
              placeholderTextColor={colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery && (
              <Pressable onPress={() => setSearchQuery("")}>
                <MaterialIcons
                  name="close"
                  size={20}
                  color={colors.textTertiary}
                />
              </Pressable>
            )}
          </View>
        </View>

        {/* Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
        >
          <Pressable
            style={[
              styles.filterChip,
              !selectedFilter && styles.filterChipActive,
            ]}
            onPress={() => setSelectedFilter(null)}
          >
            <Text
              variant="label"
              color={!selectedFilter ? colors.textInverted : colors.textPrimary}
            >
              All
            </Text>
          </Pressable>
          {filters.map((filter) => (
            <Pressable
              key={filter.id}
              style={[
                styles.filterChip,
                selectedFilter === filter.id && styles.filterChipActive,
              ]}
              onPress={() => setSelectedFilter(filter.id)}
            >
              <Text
                variant="label"
                color={
                  selectedFilter === filter.id
                    ? colors.textInverted
                    : colors.textPrimary
                }
              >
                {filter.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Circles List */}
        {isLoading ? (
          <View style={styles.loadingState}>
            <Text variant="body" color={colors.textTertiary}>
              Loading circles...
            </Text>
          </View>
        ) : filteredCircles.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons
              name="search-off"
              size={48}
              color={colors.textTertiary}
            />
            <Text
              variant="body"
              color={colors.textTertiary}
              style={styles.emptyText}
            >
              {searchQuery || selectedFilter
                ? "No circles match your search"
                : "No circles available"}
            </Text>
          </View>
        ) : (
          <View style={styles.circlesList}>
            {filteredCircles.map((circle) => (
              <Card
                key={circle.id}
                variant="default"
                padding={spacing.lg}
                style={styles.circleCard}
              >
                <Pressable onPress={() => handleCirclePress(circle)}>
                  <View style={styles.circleHeader}>
                    <View style={styles.circleInfo}>
                      <Text variant="h3" style={styles.circleName}>
                        {circle.name}
                      </Text>
                      <View style={styles.circleMeta}>
                        <View style={styles.metaItem}>
                          <MaterialIcons
                            name="calendar-today"
                            size={14}
                            color={colors.textTertiary}
                          />
                          <Text
                            variant="label"
                            color={colors.textTertiary}
                            style={styles.metaText}
                          >
                            {circle.frequency}
                          </Text>
                        </View>
                        <View style={styles.metaItem}>
                          <MaterialIcons
                            name="people"
                            size={14}
                            color={colors.textTertiary}
                          />
                          <Text
                            variant="label"
                            color={colors.textTertiary}
                            style={styles.metaText}
                          >
                            {circle.member_capacity} members
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor:
                            circle.status === "active"
                              ? colors.success + "20"
                              : circle.status === "forming"
                                ? colors.warning + "20"
                                : colors.textTertiary + "20",
                        },
                      ]}
                    >
                      <Text
                        variant="label"
                        color={
                          circle.status === "active"
                            ? colors.success
                            : circle.status === "forming"
                              ? colors.warning
                              : colors.textTertiary
                        }
                        weight="600"
                      >
                        {circle.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  {/* Progress */}
                  <View style={styles.progressSection}>
                    <View style={styles.progressHeader}>
                      <Text variant="label" color={colors.textTertiary}>
                        Progress
                      </Text>
                      <Text variant="label" color={colors.primary}>
                        {getProgress(circle).toFixed(0)}%
                      </Text>
                    </View>
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          { width: `${getProgress(circle)}%` },
                        ]}
                      />
                    </View>
                    <View style={styles.progressLabels}>
                      <Text variant="label" color={colors.textTertiary}>
                        ₦{circle.total_saved.toLocaleString()}
                      </Text>
                      <Text variant="label" color={colors.textTertiary}>
                        of ₦{circle.cycle_goal.toLocaleString()}
                      </Text>
                    </View>
                  </View>

                  {/* Contribution Info */}
                  <View style={styles.contributionInfo}>
                    <View style={styles.contributionItem}>
                      <Text variant="label" color={colors.textTertiary}>
                        Contribution
                      </Text>
                      <Text variant="body" weight="600">
                        ₦{circle.contribution_amount.toLocaleString()}
                      </Text>
                    </View>
                    <View style={styles.contributionDivider} />
                    <View style={styles.contributionItem}>
                      <Text variant="label" color={colors.textTertiary}>
                        Payout Order
                      </Text>
                      <Text variant="body" weight="600">
                        {circle.payout_order}
                      </Text>
                    </View>
                  </View>

                  {/* Join Button */}
                  {circle.open_join ? (
                    <Pressable
                      style={styles.joinButton}
                      onPress={() => handleJoinRequest(circle)}
                    >
                      <Text
                        variant="label"
                        color={colors.textInverted}
                        weight="600"
                      >
                        Join Circle
                      </Text>
                    </Pressable>
                  ) : (
                    <View style={styles.inviteOnlyBadge}>
                      <MaterialIcons
                        name="lock"
                        size={14}
                        color={colors.textTertiary}
                      />
                      <Text variant="label" color={colors.textTertiary}>
                        Invite only
                      </Text>
                    </View>
                  )}
                </Pressable>
              </Card>
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
  searchContainer: {
    marginBottom: spacing.md,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  searchIcon: {},
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
  },
  filterContainer: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  loadingState: {
    paddingVertical: spacing.lg,
    alignItems: "center",
  },
  emptyState: {
    paddingVertical: spacing.xl,
    alignItems: "center",
  },
  emptyText: {
    marginTop: spacing.sm,
  },
  circlesList: {
    gap: spacing.md,
  },
  circleCard: {
    marginBottom: 0,
  },
  circleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  circleInfo: {
    flex: 1,
  },
  circleName: {
    marginBottom: spacing.xs,
  },
  circleMeta: {
    flexDirection: "row",
    gap: spacing.md,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  metaText: {
    fontSize: 12,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  progressSection: {
    marginBottom: spacing.md,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.surface,
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: spacing.xs,
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  contributionInfo: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  contributionItem: {
    alignItems: "center",
  },
  contributionDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
  joinButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    alignItems: "center",
  },
  inviteOnlyBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
  },
});
