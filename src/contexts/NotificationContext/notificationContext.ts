import {
  createContext,
} from "react";

export type NotificationType =
  | "success"
  | "error"
  | "warning"
  | "info";

export interface AppNotification {
  id: number;
  type: NotificationType;

  title: string;
  message?: string;
}

export interface NotifyInput {
  type: NotificationType;

  title: string;
  message?: string;

  duration?: number;
}

export interface NotificationContextValue {
  notifications:
    AppNotification[];

  notify: (
    input: NotifyInput,
  ) => number;

  dismiss: (
    notificationId: number,
  ) => void;

  success: (
    title: string,
    message?: string,
  ) => number;

  error: (
    title: string,
    message?: string,
  ) => number;

  warning: (
    title: string,
    message?: string,
  ) => number;

  info: (
    title: string,
    message?: string,
  ) => number;
}

export const NotificationContext =
  createContext<
    NotificationContextValue |
    null
  >(null);