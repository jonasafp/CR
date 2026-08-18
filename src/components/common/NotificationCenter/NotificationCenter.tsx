import {
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
  XCircle,
} from "lucide-react";

import type {
  AppNotification,
  NotificationType,
} from "../../../contexts/NotificationContext/notificationContext";

import styles from "./NotificationCenter.module.css";

interface NotificationCenterProps {
  notifications:
    AppNotification[];

  onDismiss: (
    notificationId: number,
  ) => void;
}

const icons: Record<
  NotificationType,
  typeof Info
> = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

export default function NotificationCenter({
  notifications,
  onDismiss,
}: NotificationCenterProps) {
  return (
    <div
      className={
        styles.container
      }
      aria-live="polite"
      aria-atomic="false"
    >
      {notifications.map(
        (notification) => {
          const Icon =
            icons[
              notification.type
            ];

          return (
            <article
              key={
                notification.id
              }
              className={`
                ${styles.notification}
                ${
                  styles[
                    notification
                      .type
                  ]
                }
              `}
              role={
                notification.type ===
                "error"
                  ? "alert"
                  : "status"
              }
            >
              <div
                className={
                  styles.icon
                }
              >
                <Icon size={20} />
              </div>

              <div
                className={
                  styles.content
                }
              >
                <strong>
                  {
                    notification
                      .title
                  }
                </strong>

                {notification.message && (
                  <span>
                    {
                      notification
                        .message
                    }
                  </span>
                )}
              </div>

              <button
                type="button"
                aria-label="Fechar notificação"
                onClick={() =>
                  onDismiss(
                    notification.id,
                  )
                }
              >
                <X size={17} />
              </button>
            </article>
          );
        },
      )}
    </div>
  );
}