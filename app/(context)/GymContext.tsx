// app/(context)/GymContext.tsx
import { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";

type Payment = {
  id: string;
  date: string;        // YYYY-MM-DD when they paid
  paidUntil: string;   // Their endDate at time of payment
};

type Person = {
  id: string;
  name: string;
  surname: string;
  age: string;
  startDate: string;
  endDate: string;
  paid: boolean;
  notificationId?: string;
  notified?: boolean;
  payments: Payment[];  // ← NEW: Full payment history
};

type GymContextType = {
  people: Person[];
  setPeople: React.Dispatch<React.SetStateAction<Person[]>>;
  loadPeople: () => Promise<void>;
  savePeople: () => Promise<void>;
  isExpired: (end: string) => boolean;
  scheduleExpirationNotification: (person: Person) => Promise<string | null>;
  verifyAndFixNotifications: (loadedPeople: Person[]) => Promise<Person[]>;
};

const GymContext = createContext<GymContextType | undefined>(undefined);

export function GymProvider({ children }: { children: React.ReactNode }) {
  const [people, setPeople] = useState<Person[]>([]);
  const STORAGE_KEY = "@people_list";

  const loadPeople = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        let parsed = JSON.parse(stored);
        // Migrate old data to include payments array
        parsed = parsed.map((p: any) => ({ ...p, payments: p.payments || [] }));
        const fixed = await verifyAndFixNotifications(parsed);
        setPeople(fixed);
      }
    } catch (e) {
      console.log("Failed to load people", e);
    }
  };

  const savePeople = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(people));
    } catch (e) {
      console.log("Failed to save people", e);
    }
  };

  const isExpired = (end: string) => new Date(end) < new Date();

  const scheduleExpirationNotification = async (person: Person) => {
    const end = new Date(person.endDate);
    const triggerDate = new Date(end.getTime() + 86400000);
    triggerDate.setHours(9, 0, 0, 0);
    const now = new Date();
    if (triggerDate <= now) return null;
    const seconds = Math.floor((triggerDate.getTime() - now.getTime()) / 1000);
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Subscription Expired!",
        body: `${person.name} ${person.surname}'s subscription has expired.`,
      },
      trigger: { seconds, repeats: false },
    });
    return identifier;
  };

  const verifyAndFixNotifications = async (loadedPeople: Person[]) => {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const scheduledIds = scheduled.map((n) => n.identifier);
    const updatedPeople = [...loadedPeople];
    for (let i = 0; i < updatedPeople.length; i++) {
      const p = updatedPeople[i];
      if (p.notificationId && !scheduledIds.includes(p.notificationId)) {
        delete p.notificationId;
      }
      const expired = isExpired(p.endDate);
      if (expired) {
        if (!p.notified) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: "Subscription Expired!",
              body: `${p.name} ${p.surname}'s subscription ended on ${p.endDate}!`,
            },
            trigger: null,
          });
          p.notified = true;
        }
        if (p.notificationId) delete p.notificationId;
      } else {
        if (!p.notificationId) {
          const newId = await scheduleExpirationNotification(p);
          if (newId) p.notificationId = newId;
        }
      }
    }
    return updatedPeople;
  };

  useEffect(() => { loadPeople(); }, []);
  useEffect(() => { savePeople(); }, [people]);

  return (
    <GymContext.Provider value={{
      people,
      setPeople,
      loadPeople,
      savePeople,
      isExpired,
      scheduleExpirationNotification,
      verifyAndFixNotifications,
    }}>
      {children}
    </GymContext.Provider>
  );
}

export const useGymContext = () => {
  const context = useContext(GymContext);
  if (!context) throw new Error("useGymContext must be inside GymProvider");
  return context;
};