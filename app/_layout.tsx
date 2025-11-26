// app/_layout.tsx
import { Stack } from "expo-router";
import { GymProvider } from "./(context)/GymContext"; // ✅ Updated import
import * as Notifications from "expo-notifications";
import { useEffect } from "react";

export default function RootLayout() {
  useEffect(() => {
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        alert("Enable notifications to get alerts for expired subscriptions!");
      }
    })();
  }, []);

  return (
    <GymProvider>
      <Stack>
        <Stack.Screen name="index" options={{ title: "Home" }} />
        <Stack.Screen name="members" options={{ title: "Members" }} />
      </Stack>
    </GymProvider>
  );
}