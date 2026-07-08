/**
 * àjó Invites Screen
 * View and manage invites for your circles
 */

import ReusableBottomSheet, {
  ReusableBottomSheetRef,
} from "@/components/smt/smt-bottom-sheet";
import Header from "@/components/smt/smt-header";
import AjoButton from "@/components/ui/AjoButton";
import { AjoCard } from "@/components/ui/AjoCard";
import { AjoTypography } from "@/components/ui/AjoTypography";
import { PinModal, PinModalRef } from "@/components/ui/PinModal";
import { apiService } from "@/services/api.service";
import { CircleOut } from "@/services/api.types";
import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { spacing } from "@/theme/spacing";
import { Feather } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  Clipboard,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Share,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

export default function InvitesScreen() {
  const [circles, setCircles] = useState<CircleOut[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // PIN modal ref
  const pinModalRef = useRef<PinModalRef>(null);

  // Bottom sheet refs
  const messageSheetRef = useRef<ReusableBottomSheetRef>(null);

  // State for the invite code generated
  const [generatedInvite, setGeneratedInvite] = useState<{
    code: string;
    circleName: string;
  } | null>(null);

  // Message sheet state
  const [messageData, setMessageData] = useState<{
    title: string;
    message: string;
    isSuccess: boolean;
    onOk?: () => void;
  }>({
    title: "",
    message: "",
    isSuccess: false,
  });

  const showMessage = (
    title: string,
    message: string,
    isSuccess: boolean,
    onOk?: () => void,
  ) => {
    setMessageData({ title, message, isSuccess, onOk });
    messageSheetRef.current?.snapToIndex(0);
  };

  // Load circles
  const loadData = async () => {
    try {
      const circlesData = await apiService.listCircles();
      setCircles(circlesData);
    } catch (error) {
      console.error("Failed to load circles:", error);
      showMessage("Error", "Could not load your circles.", false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  // Create invite flow
  const handleCreateInvite = (circleId: number, circleName: string) => {
    pinModalRef.current?.show({
      title: "Create Invite",
      subtitle: `Enter your PIN to generate an invite for "${circleName}"`,
      onConfirm: async (pin) => {
        try {
          await apiService.verifyPin({ pin });
          const invite = await apiService.createInvite(circleId, {
            invitee_contact: null,
          });
          // Store the generated invite for display
          setGeneratedInvite({ code: invite.code, circleName });
          // Show success message sheet with the code
          showMessage(
            "Invite Created",
            `Share this code: ${invite.code}`,
            true,
            () => {
              // Optionally navigate to circle detail or refresh
            },
          );
          // Optionally refresh data (though no invite list to update)
          // await loadData();
        } catch (error: any) {
          showMessage(
            "Error",
            error.message || "Failed to create invite.",
            false,
          );
        }
      },
    });
  };

  // Copy invite code to clipboard (using Clipboard from react-native)
  const copyToClipboard = async (code: string) => {
    try {
      await Clipboard.setString(code);
      showMessage("Copied", "Invite code copied to clipboard.", true);
    } catch (error) {
      showMessage("Error", "Could not copy code.", false);
    }
  };

  // Share invite code
  const shareInvite = async (code: string) => {
    try {
      await Share.share({
        message: `Join my circle with this invite code: ${code}`,
      });
    } catch (error) {
      console.error("Share failed:", error);
    }
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
        <Header title="Invites" />

        <AjoCard padding={spacing.lg} style={styles.infoCard}>
          <AjoTypography variant="body" color={colors.textSecondary}>
            Generate an invite code for any of your circles. Share the code with
            friends to let them join.
          </AjoTypography>
        </AjoCard>

        <View style={styles.circlesSection}>
          <AjoTypography variant="monoSmall" style={styles.sectionTitle}>
            Your Circles
          </AjoTypography>

          {isLoading ? (
            <View style={styles.loadingState}>
              <AjoTypography variant="body" color={colors.textTertiary}>
                Loading circles...
              </AjoTypography>
            </View>
          ) : circles.length === 0 ? (
            <View style={styles.emptyState}>
              <Feather name="users" size={48} color={colors.textTertiary} />
              <AjoTypography
                variant="body"
                color={colors.textTertiary}
                style={styles.emptyText}
              >
                You don't have any circles yet.
              </AjoTypography>
              <AjoTypography
                variant="bodySmall"
                color={colors.textSecondary}
                style={styles.emptySubtext}
              >
                Create or join a circle to start inviting others.
              </AjoTypography>
            </View>
          ) : (
            <View style={styles.circlesList}>
              {circles.map((circle) => (
                <TouchableOpacity
                  key={circle.id}
                  style={styles.circleItem}
                  onPress={() => handleCreateInvite(circle.id, circle.name)}
                >
                  <View style={styles.circleInfo}>
                    <View style={styles.circleIcon}>
                      <Feather name="users" size={20} color={colors.primary} />
                    </View>
                    <View style={styles.circleDetails}>
                      <AjoTypography variant="body">
                        {circle.name}
                      </AjoTypography>
                      <AjoTypography variant="chip" color={colors.textTertiary}>
                        {circle.status.toUpperCase()} · {circle.member_capacity}{" "}
                        members
                      </AjoTypography>
                    </View>
                  </View>
                  <Feather
                    name="chevron-right"
                    size={20}
                    color={colors.textTertiary}
                  />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Note about invites */}

        {/* Message Sheet for created invite */}
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

              {/* Show invite code with copy/share if success and we have a generated invite */}
              {messageData.isSuccess && generatedInvite && (
                <View style={styles.inviteCodeContainer}>
                  <AjoTypography variant="amountHero" color={colors.primary}>
                    {generatedInvite.code}
                  </AjoTypography>
                  <View style={styles.inviteActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => copyToClipboard(generatedInvite.code)}
                    >
                      <Feather name="copy" size={16} color={colors.primary} />
                      <AjoTypography variant="chip" color={colors.primary}>
                        Copy
                      </AjoTypography>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => shareInvite(generatedInvite.code)}
                    >
                      <Feather
                        name="share-2"
                        size={16}
                        color={colors.primary}
                      />
                      <AjoTypography variant="chip" color={colors.primary}>
                        Share
                      </AjoTypography>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              <AjoButton
                style={styles.messageButton}
                onPress={() => {
                  close();
                  if (messageData.onOk) messageData.onOk();
                }}
              >
                <AjoTypography variant="button" color={colors.buttonText}>
                  OK
                </AjoTypography>
              </AjoButton>
            </View>
          )}
        </ReusableBottomSheet>
      </ScrollView>

      {/* PIN Modal */}
      <PinModal ref={pinModalRef} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
  infoCard: {
    marginBottom: spacing.md,
    borderRadius: radius.lg,
  },
  circlesSection: {
    marginTop: spacing.sm,
  },
  sectionTitle: {
    marginBottom: spacing.sm,
    color: colors.textSecondary,
  },
  loadingState: {
    paddingVertical: spacing.xl,
    alignItems: "center",
  },
  emptyState: {
    paddingVertical: spacing.xl,
    alignItems: "center",
    gap: spacing.sm,
  },
  emptyText: {
    marginTop: spacing.md,
  },
  emptySubtext: {
    textAlign: "center",
    paddingHorizontal: spacing.lg,
  },
  circlesList: {
    gap: spacing.sm,
  },
  circleItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  circleInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: spacing.sm,
  },
  circleIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.primary + "15",
    justifyContent: "center",
    alignItems: "center",
  },
  circleDetails: {
    flex: 1,
  },
  messageSheetContent: {
    padding: spacing.lg,
    alignItems: "center",
    color: colors.textInverted
  },
  messageTitle: {
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    textAlign: "center",
        color: colors.textInverted

  },
  messageBody: {
    textAlign: "center",
    marginBottom: spacing.lg,
    lineHeight: 22,
    paddingHorizontal: spacing.md,
        color: colors.textInverted

  },
  messageButton: {
    width: "100%",
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  inviteCodeContainer: {
    backgroundColor: colors.primary + "10",
    padding: spacing.md,
    borderRadius: radius.lg,
    alignItems: "center",
    width: "100%",
    marginBottom: spacing.lg,
  },
  inviteActions: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    backgroundColor: colors.background,
  },
});
