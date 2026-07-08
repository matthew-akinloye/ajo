// app/(tabs)/circles/index.tsx
import { CircleList } from "@/components/circles/CircleList";
import ReusableBottomSheet, {
  ReusableBottomSheetRef,
} from "@/components/smt/smt-bottom-sheet";
import Header from "@/components/smt/smt-header";
import AjoButton from "@/components/ui/AjoButton";
import { AjoTypography } from "@/components/ui/AjoTypography";
import { apiService } from "@/services/api.service";
import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { spacing } from "@/theme/spacing";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Modal,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import CreateCircleModal from "./create";

export default function CirclesScreen() {
  const [circles, setCircles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Bottom sheet for errors
  const messageSheetRef = useRef<ReusableBottomSheetRef>(null);
  const [messageData, setMessageData] = useState<{
    title: string;
    message: string;
    isSuccess: boolean;
  }>({ title: "", message: "", isSuccess: false });

  const showMessage = (title: string, message: string, isSuccess: boolean) => {
    setMessageData({ title, message, isSuccess });
    messageSheetRef.current?.snapToIndex(0);
  };

  const loadCircles = async () => {
    try {
      const data = await apiService.listCircles();
      setCircles(data);
    } catch (error) {
      console.error("Failed to load circles:", error);
      showMessage("Error", "Could not load your circles.", false);
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
              icon: (
                <Feather name="plus" size={24} color={colors.textPrimary} />
              ),
              onPress: () => setShowCreateModal(true),
            },
            {
              icon: (
                <Feather name="mail" size={24} color={colors.textPrimary} />
              ),
              onPress: () => {
                router.push("/circles/invites");
              },
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
          {isLoading ? (
            <View style={styles.loadingState}>
              <AjoTypography variant="body" color={colors.textTertiary}>
                Loading circles...
              </AjoTypography>
            </View>
          ) : (
            <CircleList
              circles={circles} // CircleOut[]
              onPress={(circle) => router.push(`/circles/${circle.id}`)}
              showJoinButton={false}
              // onJoin={(circle) => handleJoin(circle.id)}
              emptyMessage="You haven't joined or created any circles yet."
            />
          )}
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

      {/* Error Message Sheet */}
      <ReusableBottomSheet
        ref={messageSheetRef}
        snapPoints={["40%"]}
        initialIndex={-1}
        enablePanDownToClose
      >
        {({ close }) => (
          <View style={styles.messageSheetContent}>
            <Feather
              name={messageData.isSuccess ? "check-circle" : "alert-circle"}
              size={48}
              color={messageData.isSuccess ? colors.success : colors.error}
            />
            <AjoTypography variant="body" style={styles.messageTitle}>
              {messageData.title}
            </AjoTypography>
            <AjoTypography
              variant="mono"
              color={colors.textSecondary}
              style={styles.messageBody}
            >
              {messageData.message}
            </AjoTypography>
            <AjoButton
              style={styles.messageButton}
              onPress={() => {
                close();
              }}
            >
              <AjoTypography variant="button" color={colors.buttonText}>
                OK
              </AjoTypography>
            </AjoButton>
          </View>
        )}
      </ReusableBottomSheet>
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
  loadingState: {
    paddingVertical: spacing.xl,
    alignItems: "center",
  },
  // Message sheet styles
  messageSheetContent: {
    padding: spacing.lg,
    alignItems: "center",
  },
  messageTitle: {
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    textAlign: "center",
  },
  messageBody: {
    textAlign: "center",
    marginBottom: spacing.lg,
    lineHeight: 22,
    paddingHorizontal: spacing.md,
  },
  messageButton: {
    width: "100%",
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
});
