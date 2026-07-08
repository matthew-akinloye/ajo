import { Stack } from "expo-router";

export default function CirclesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="invites" />
      <Stack.Screen name="create" />
      <Stack.Screen name="join" />
      <Stack.Screen name="payouts" />
      <Stack.Screen name="requests" />
      <Stack.Screen name="id" />
    </Stack>
  );
}
