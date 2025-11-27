// app/(context)/GymContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import * as Notifications from "expo-notifications";
import { db } from "../firebase/firebase";
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot,
  query,
  orderBy 
} from "firebase/firestore";
import { Alert } from "react-native";

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

type Payment = {
  id: string;
  date: string;
  amount: number;
  paidUntil: string;
  method?: string;
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
  payments: Payment[];
};

type GymContextType = {
  people: Person[];
  setPeople: (people: Person[]) => void;
  addPerson: (person: Omit<Person, "id">) => Promise<void>;
  updatePerson: (id: string, person: Partial<Person>) => Promise<void>;
  deletePerson: (id: string) => Promise<void>;
  renewSubscription: (personId: string, months?: number, amount?: number) => Promise<void>;
  addPayment: (personId: string, payment: Omit<Payment, "id">) => Promise<void>;
  isExpired: (endDate: string) => boolean;
  daysUntilExpiration: (endDate: string) => number;
  scheduleExpirationNotification: (person: Person) => Promise<string | null>;
  testNotification: (person: Person) => Promise<void>;
  loading: boolean;
};

const GymContext = createContext<GymContextType | undefined>(undefined);

export function GymProvider({ children }: { children: ReactNode }) {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);

  // Real-time listener for Firestore
useEffect(() => {
  const q = query(collection(db, "members")); // ← removed orderBy("name")

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const members: Person[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      members.push({
        id: doc.id,
        ...data,
        payments: data.payments || [],
      } as Person);
    });

    // Sort in JavaScript (super fast and works offline)
    members.sort((a, b) =>
      `${a.name} ${a.surname}`.localeCompare(`${b.name} ${b.surname}`)
    );

    setPeople(members);
    setLoading(false);
  }, (error) => {
    console.error("Error fetching members:", error);
    setLoading(false);
  });

  return () => unsubscribe();
}, []);

  // Request notification permissions
  useEffect(() => {
    (async () => {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== "granted") {
        console.log("Notification permissions not granted");
      }
    })();
  }, []);

  const isExpired = (endDate: string) => {
    return new Date(endDate) < new Date();
  };

  const daysUntilExpiration = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const scheduleExpirationNotification = async (person: Person): Promise<string | null> => {
    try {
      const end = new Date(person.endDate);
      const now = new Date();
      
      // Cancel existing notification if any
      if (person.notificationId) {
        await Notifications.cancelScheduledNotificationAsync(person.notificationId);
      }
      
      // Don't schedule if already expired
      if (end <= now) {
        console.log(`Subscription already expired for ${person.name}`);
        return null;
      }
      
      // Schedule notification for the day AFTER expiration at 9 AM
      const triggerDate = new Date(end.getTime() + 86400000); // +1 day
      triggerDate.setHours(9, 0, 0, 0);
      
      // If trigger date is in the past, don't schedule
      if (triggerDate <= now) {
        console.log(`Trigger date in past for ${person.name}`);
        return null;
      }
      
      const seconds = Math.floor((triggerDate.getTime() - now.getTime()) / 1000);
      
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: "⚠️ Subscription Expired",
          body: `${person.name} ${person.surname}'s subscription expired on ${person.endDate}. Please renew!`,
          data: { personId: person.id },
        },
        trigger: { seconds, repeats: false },
      });
      
      console.log(`Notification scheduled for ${person.name} in ${seconds} seconds`);
      return identifier;
    } catch (error) {
      console.error("Error scheduling notification:", error);
      return null;
    }
  };

  // Test notification (fires in 5 seconds)
  const testNotification = async (person: Person) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "🔔 Test Notification",
          body: `This is a test for ${person.name} ${person.surname}. Your actual notification will arrive the day after expiration.`,
          data: { personId: person.id, test: true },
        },
        trigger: { seconds: 5 },
      });
      console.log("Test notification scheduled for 5 seconds");
    } catch (error) {
      console.error("Error scheduling test notification:", error);
    }
  };

  // Add person to Firebase
const addPerson = async (personData: Omit<Person, "id">) => {
  // Add a 15-second timeout
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Timeout: Too slow – check your internet connection")), 15000)
  );

  try {
    const addPromise = addDoc(collection(db, "members"), {
      ...personData,
      payments: personData.payments || [],
      createdAt: new Date().toISOString(),
    });

    const docRef = await Promise.race([addPromise, timeoutPromise]) as any;

    const newPerson = { id: docRef.id, ...personData };

    // Schedule notification (only if internet is actually working)
    if (!isExpired(newPerson.endDate)) {
      const notifId = await scheduleExpirationNotification(newPerson);
      if (notifId) {
        await updateDoc(doc(db, "members", docRef.id), { notificationId: notifId });
      }
    }

    console.log("Member added successfully!");
  } catch (error: any) {
    console.error("FAILED to add member:", error.message);
    Alert.alert(
      "Cannot add member",
      error.message.includes("Timeout")
        ? "No internet connection or very slow network. Member will be saved when connection returns."
        : "Permission denied or network error. Check your Firestore rules."
    );
    throw error;
  }
};

  // Update person in Firebase
  const updatePerson = async (id: string, updates: Partial<Person>) => {
    try {
      const personRef = doc(db, "members", id);
      await updateDoc(personRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });

      const person = people.find(p => p.id === id);
      if (person) {
        const updatedPerson = { ...person, ...updates };
        
        // Reschedule notification
        if (!isExpired(updatedPerson.endDate)) {
          const notifId = await scheduleExpirationNotification(updatedPerson);
          if (notifId) {
            await updateDoc(personRef, { notificationId: notifId });
          }
        }
      }
    } catch (error) {
      console.error("Error updating member:", error);
      throw error;
    }
  };

  // Add payment to a member
  const addPayment = async (personId: string, payment: Omit<Payment, "id">) => {
    try {
      const person = people.find(p => p.id === personId);
      if (!person) throw new Error("Person not found");

      const newPayment: Payment = {
        ...payment,
        id: Date.now().toString(),
      };

      const updatedPayments = [...(person.payments || []), newPayment];
      
      await updatePerson(personId, {
        payments: updatedPayments,
        paid: true,
        endDate: payment.paidUntil,
      });
    } catch (error) {
      console.error("Error adding payment:", error);
      throw error;
    }
  };
// Add this function inside GymProvider, after addPayment or before return
const renewSubscription = async (
  personId: string,
  months: number = 1,
  amount: number = 0 // you can make it required later
) => {
  const person = people.find(p => p.id === personId);
  if (!person) throw new Error("Member not found");

  const today = new Date();
  const newEndDate = new Date();
  newEndDate.setMonth(today.getMonth() + months);
  newEndDate.setHours(23, 59, 59, 999); // end of day

  const newPayment: Payment = {
    id: Date.now().toString(),
    date: today.toISOString().split("T")[0],
    amount: amount,
    paidUntil: newEndDate.toISOString().split("T")[0],
    method: "Cash", // you can make this dynamic later
  };

  const updatedPayments = [...(person.payments || []), newPayment];

  await updatePerson(personId, {
    endDate: newEndDate.toISOString().split("T")[0],
    paid: true,
    payments: updatedPayments,
  });
};
  // Delete person from Firebase
  const deletePerson = async (id: string) => {
    try {
      const person = people.find(p => p.id === id);
      if (person?.notificationId) {
        await Notifications.cancelScheduledNotificationAsync(person.notificationId);
      }

      await deleteDoc(doc(db, "members", id));
    } catch (error) {
      console.error("Error deleting member:", error);
      throw error;
    }
  };

  return (
    <GymContext.Provider
      value={{
        people,
        setPeople,
        addPerson,
        updatePerson,
        deletePerson,
        addPayment,
        renewSubscription,
        isExpired,
        daysUntilExpiration,
        scheduleExpirationNotification,
        testNotification,
        loading,
      }}
    >
      {children}
    </GymContext.Provider>
  );
}

export function useGymContext() {
  const context = useContext(GymContext);
  if (!context) {
    throw new Error("useGymContext must be used within GymProvider");
  }
  return context;
}