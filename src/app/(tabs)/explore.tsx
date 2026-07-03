/**
 * àjó Groups/Browse Screen
 * Based on index.tsx blueprint - typography-first, minimal design
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

type FilterType = "all" | "weekly" | "monthly" | "biweekly";

export default function GroupsScreen() {
  const [circles, setCircles] = useState<CircleOut[]>([]);
  const [filteredCircles, setFilteredCircles] = useState<CircleOut[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadCircles();
  }, []);

  useEffect(() => {
    filterCircles();
  }, [circles, searchQuery, activeFilter]);

  const loadCircles = async () => {
    try {
      const circlesData = await apiService.listCircles();
      setCircles(circlesData);
      setFilteredCircles(circlesData);
    } catch (error) {
      console.error("Failed to load circles:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadCircles();
    setIsRefreshing(false);
  };

  const filterCircles = () => {
    let filtered = circles;

    if (searchQuery) {
      filtered = filtered.filter((circle) =>
        circle.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    if (activeFilter === "weekly") {
      filtered = filtered.filter((circle) => circle.frequency === "weekly");
    } else if (activeFilter === "monthly") {
      filtered = filtered.filter((circle) => circle.frequency === "monthly");
    } else if (activeFilter === "biweekly") {
      filtered = filtered.filter((circle) => circle.frequency === "biweekly");
    }

    setFilteredCircles(filtered);
  };

  const handleCreateCircle = async () => {
    try {
      await apiService.createCircle({
        name: "New Circle",
        contribution_amount: 5000,
        frequency: "weekly",
        member_capacity: 5,
        payout_order: "random",
        open_join: true,
      });
      Alert.alert("Circle created", "Your savings circle is now live.");
      await loadCircles();
    } catch (error) {
      Alert.alert("Unable to create circle", error instanceof Error ? error.message : "Please try again.");
    }
  };

  const handleCirclePress = (circleId: number) => {
    Alert.alert("Circle selected", `Circle ${circleId} is ready for review.`);
  };

  const handleJoinPress = async (circleId: number) => {
    try {
      await apiService.requestToJoin(circleId);
      Alert.alert("Request sent", "Your join request has been submitted.");
    } catch (error) {
      Alert.alert("Unable to join", error instanceof Error ? error.message : "Please try again.");
    }
  };

  const filters: FilterType[] = ["all", "weekly", "monthly", "biweekly"];

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
          title="Browse"
          rightButtons={[
            {
              icon: (
                <MaterialIcons
                  name="add-circle"
                  size={24}
                  color={colors.textPrimary}
                />
              ),
              onPress: handleCreateCircle,
            },
          ]}
        />

        {/* Search Bar */}
        <View style={styles.searchContainer}>
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
        </View>

        {/* Filter Chips */}
        <View style={styles.filters}>
          {filters.map((filter) => (
            <Pressable
              key={filter}
              onPress={() => setActiveFilter(filter)}
              style={[
                styles.filterChip,
                activeFilter === filter && styles.filterChipActive,
              ]}
            >
              <Text
                variant="label"
                color={
                  activeFilter === filter
                    ? colors.textInverted
                    : colors.textTertiary
                }
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Circle List */}
        <View style={styles.circleList}>
          {isLoading ? (
            <View style={styles.loadingState}>
              <Text variant="body" color={colors.textTertiary}>
                Loading circles...
              </Text>
            </View>
          ) : filteredCircles.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons
                name="search"
                size={48}
                color={colors.textTertiary}
              />
              <Text
                variant="body"
                color={colors.textTertiary}
                style={styles.emptyText}
              >
                No circles found
              </Text>
            </View>
          ) : (
            filteredCircles.map((circle) => (
              <Card
                key={circle.id}
                variant="default"
                padding={spacing.lg}
                style={styles.circleCard}
              >
                <Pressable onPress={() => handleCirclePress(circle.id)}>
                  <View style={styles.circleHeader}>
                    <View style={styles.circleInfo}>
                      <Text variant="h3" style={styles.circleName}>
                        {circle.name}
                      </Text>
                      <Text
                        variant="label"
                        color={colors.textTertiary}
                        style={styles.circleDescription}
                      >
                        {circle.status === "active" ? "Active circle" : "Open to join"}
                      </Text>
                    </View>
                    <View style={styles.circleBadge}>
                      <Text variant="label" color={colors.primary} weight="600">
                        {circle.total_saved}/{circle.cycle_goal}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.circleDetails}>
                    <View style={styles.detailItem}>
                      <Text variant="label" color={colors.textTertiary}>
                        Amount
                      </Text>
                      <Text variant="body" weight="600">
                        ₦{circle.contribution_amount.toLocaleString()}
                      </Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text variant="label" color={colors.textTertiary}>
                        Frequency
                      </Text>
                      <Text variant="body" weight="600">
                        {circle.frequency}
                      </Text>
                    </View>
                  </View>

                  <Pressable
                    style={styles.joinButton}
                    onPress={() => handleJoinPress(circle.id)}
                  >
                    <Text variant="label" color={colors.primary} weight="600">
                      Join
                    </Text>
                  </Pressable>
                </Pressable>
              </Card>
            ))
          )}
        </View>
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
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
  },
  filters: {
    flexDirection: "row",
    gap: spacing.sm,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  filterChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
  },
  circleList: {
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  circleCard: {
    marginBottom: spacing.sm,
  },
  circleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.sm,
  },
  circleInfo: {
    flex: 1,
  },
  circleName: {
    marginBottom: spacing.xs,
  },
  circleDescription: {
    marginBottom: spacing.xs,
  },
  circleBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    backgroundColor: colors.primary + "20",
  },
  circleDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  detailItem: {
    gap: spacing.xs,
  },
  joinButton: {
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  loadingState: {
    paddingVertical: spacing.lg,
    alignItems: "center",
  },
  emptyState: {
    paddingVertical: spacing.lg,
    alignItems: "center",
  },
  emptyText: {
    marginTop: spacing.sm,
  },
});
