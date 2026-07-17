import { useState } from "react";
import { Outlet } from "react-router-dom";

import Header from "../../components/layout/Header/Header";
import Sidebar from "../../components/layout/Sidebar/Sidebar";

import styles from "./DashboardLayout.module.css";

export default function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  function handleToggleSidebar() {
    setIsSidebarOpen((currentState) => !currentState);
  }

  function handleCloseSidebar() {
    setIsSidebarOpen(false);
  }

  return (
    <div className={styles.layout}>
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
      />

      {isSidebarOpen && (
        <button
          type="button"
          className={styles.overlay}
          aria-label="Fechar menu lateral"
          onClick={handleCloseSidebar}
        />
      )}

      <div className={styles.mainArea}>
        <Header onToggleSidebar={handleToggleSidebar} />

        <main className={styles.content}>
          <div className={styles.contentContainer}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}