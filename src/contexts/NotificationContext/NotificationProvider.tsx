import {
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";

import type {
  ReactNode,
} from "react";

import NotificationCenter from "../../components/common/NotificationCenter/NotificationCenter";

import {
  NotificationContext,
} from "./notificationContext";

import type {
  AppNotification,
  NotificationType,
  NotifyInput,
} from "./notificationContext";

interface NotificationProviderProps {
  children: ReactNode;
}

const DEFAULT_DURATION = 4500;
const ERROR_DURATION = 7000;
const MAX_NOTIFICATIONS = 4;

export default function NotificationProvider({
  children,
}: NotificationProviderProps) {
  const [
    notifications,
    setNotifications,
  ] = useState<
    AppNotification[]
  >([]);

  const nextIdRef =
    useRef(1);

  const dismiss = useCallback(
    (
      notificationId:
        number,
    ) => {
      setNotifications(
        (current) =>
          current.filter(
            (notification) =>
              notification.id !==
              notificationId,
          ),
      );
    },
    [],
  );

  const notify = useCallback(
    (input: NotifyInput) => {
      const id =
        nextIdRef.current++;

      const notification:
        AppNotification = {
        id,
        type: input.type,
        title: input.title,
        message:
          input.message,
      };

      setNotifications(
        (current) => [
          ...current.slice(
            -(
              MAX_NOTIFICATIONS -
              1
            ),
          ),

          notification,
        ],
      );

      const duration =
        input.duration ??
        (
          input.type ===
          "error"
            ? ERROR_DURATION
            : DEFAULT_DURATION
        );

      if (duration > 0) {
        window.setTimeout(
          () => {
            dismiss(id);
          },
          duration,
        );
      }

      return id;
    },
    [dismiss],
  );

  const createTypeNotifier =
    useCallback(
      (
        type:
          NotificationType,
      ) =>
        (
          title: string,
          message?: string,
        ) =>
          notify({
            type,
            title,
            message,
          }),
      [notify],
    );

  const value = useMemo(
    () => ({
      notifications,
      notify,
      dismiss,

      success:
        createTypeNotifier(
          "success",
        ),

      error:
        createTypeNotifier(
          "error",
        ),

      warning:
        createTypeNotifier(
          "warning",
        ),

      info:
        createTypeNotifier(
          "info",
        ),
    }),
    [
      notifications,
      notify,
      dismiss,
      createTypeNotifier,
    ],
  );

  return (
    <NotificationContext.Provider
      value={value}
    >
      {children}

      <NotificationCenter
        notifications={
          notifications
        }
        onDismiss={dismiss}
      />
    </NotificationContext.Provider>
  );
}