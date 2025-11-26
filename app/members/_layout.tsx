import { Stack } from "expo-router";

export default function MembersLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Members List" }} />
      <Stack.Screen name="new" options={{ title: "Add Member", presentation: "modal" }} /> {/* Modal for better UX */}
      <Stack.Screen name="[id]" options={{ title: "Edit Member", presentation: "modal" }} />
    </Stack>
  );
}