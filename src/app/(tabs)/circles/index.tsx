// app/(tabs)/circles/index.tsx
import { CircleList } from "@/components/circles/CircleList";
import Header from "@/components/smt/smt-header";
import { apiService } from "@/services/api.service";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { Feather } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import {
  Alert,
  Modal,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import CreateCircleModal from "./create"; // our creation component

export default function CirclesScreen() {
  const [circles, setCircles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

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

  useEffect(() => {
    loadCircles();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadCircles();
    setIsRefreshing(false);
  };

  return (
    <>
      <SafeAreaView style={styles.safeArea}>
        <Header
          title="Circles"
          rightButtons={[
            {
              icon: <Feather name="plus" size={24} color={colors.textPrimary} />,
              onPress: () => setShowCreateModal(true),
            },
          ]}
          headerStyle={styles.header}
        />
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
        >
          <CircleList
            circles={circles}
            emptyMessage="You haven't joined or created any circles yet."
          />
        </ScrollView>
      </SafeAreaView>

      {/* Create Circle Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <CreateCircleModal onClose={() => setShowCreateModal(false)} />
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.md,
    backgroundColor: "transparent",
  },
  scrollContent: {
    padding: spacing.md,
    paddingTop: spacing.sm,
  },
});