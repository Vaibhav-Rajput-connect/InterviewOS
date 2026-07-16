import { create } from "zustand";
import { persist } from "zustand/middleware";

export type NotificationType = 
  | "Interview Scheduled"
  | "Candidate Status Changed"
  | "AI Evaluation Ready"
  | "New Candidate"
  | "Reminder";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  link?: string;
}

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, "id" | "isRead" | "createdAt">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

// Initial mock data to demonstrate realtime updates and the requested types
const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    type: "AI Evaluation Ready",
    title: "AI Evaluation Ready",
    message: "Aarav Sharma's technical interview has been evaluated by AI Coach.",
    isRead: false,
    createdAt: new Date().toISOString(),
    link: "/recruiter/candidates/c1/report",
  },
  {
    id: "n2",
    type: "New Candidate",
    title: "New Candidate Applied",
    message: "Priya Patel applied for Full Stack Developer.",
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
    link: "/recruiter/pipeline",
  },
  {
    id: "n3",
    type: "Interview Scheduled",
    title: "Interview Scheduled",
    message: "Behavioral interview with Sneha Kumar is scheduled for tomorrow at 10:00 AM.",
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
  },
  {
    id: "n4",
    type: "Candidate Status Changed",
    title: "Candidate Moved to Offer",
    message: "Vikram Singh was moved to the Offer stage.",
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    link: "/recruiter/pipeline",
  },
  {
    id: "n5",
    type: "Reminder",
    title: "Follow-up Reminder",
    message: "Don't forget to send the offer letter to Rahul Mehta.",
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
  }
];

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      notifications: INITIAL_NOTIFICATIONS,
      unreadCount: INITIAL_NOTIFICATIONS.filter((n) => !n.isRead).length,

      addNotification: (notification) => set((state) => {
        const newNotif: Notification = {
          ...notification,
          id: Math.random().toString(36).substring(2, 9),
          isRead: false,
          createdAt: new Date().toISOString(),
        };
        const updatedNotifs = [newNotif, ...state.notifications];
        return {
          notifications: updatedNotifs,
          unreadCount: updatedNotifs.filter((n) => !n.isRead).length,
        };
      }),

      markAsRead: (id) => set((state) => {
        const updatedNotifs = state.notifications.map((n) => 
          n.id === id ? { ...n, isRead: true } : n
        );
        return {
          notifications: updatedNotifs,
          unreadCount: updatedNotifs.filter((n) => !n.isRead).length,
        };
      }),

      markAllAsRead: () => set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      })),

      clearAll: () => set({ notifications: [], unreadCount: 0 }),

      toasts: [],
      addToast: (toast) => set((state) => ({
        toasts: [...state.toasts, { ...toast, id: Math.random().toString(36).substring(2, 9) }],
      })),
      removeToast: (id) => set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      })),
    }),
    {
      name: "interviewos-notifications",
      partialize: (state) => ({ notifications: state.notifications, unreadCount: state.unreadCount }),
    }
  )
);
