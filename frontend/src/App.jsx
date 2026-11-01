import React, { useState } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { MobileHeader } from './components/mobile/MobileHeader';
import { MobileBottomNav } from './components/mobile/MobileBottomNav';
import { ProgressSummary } from './components/dashboard/ProgressSummary';
import { TodaySchedule } from './components/dashboard/TodaySchedule';
import { TaskList } from './components/dashboard/TaskList';
import { HabitTracker } from './components/dashboard/HabitTracker';
import { AIAssistantWidget } from './components/dashboard/AIAssistantWidget';
import { TelegramSyncWidget } from './components/dashboard/TelegramSyncWidget';
import { QuickAddTaskModal } from './components/dashboard/QuickAddTaskModal';
import { EditScheduleModal } from './components/dashboard/EditScheduleModal';
import { InstallPwaModal } from './components/pwa/InstallPwaModal';
import { OfflineBanner } from './components/pwa/OfflineBanner';
import { AuthModal } from './components/auth/AuthModal';
import { useTask } from './context/TaskContext';
import { useAuth } from './context/AuthContext';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [installModalOpen, setInstallModalOpen] = useState(false);
  const { activeTab } = useTask();
  const { setIsAuthModalOpen } = useAuth();

  return (
    <div className="min-h-screen bg-dark-900 text-slate-100 flex flex-col font-sans">
      {/* Offline Status & Sync Alert Banner */}
      <OfflineBanner />

      <div className="flex-1 flex w-full">
        {/* Desktop Sidebar Navigation */}
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

        {/* Main Workspace Area */}
        <div className="flex-1 lg:pl-72 flex flex-col min-h-screen w-full">
          {/* Mobile Top App Bar (PWA Mobile) */}
          <MobileHeader 
            onOpenInstall={() => setInstallModalOpen(true)}
            onOpenAuth={() => setIsAuthModalOpen(true)}
          />

          {/* Desktop Header (Approved Desktop View) */}
          <div className="hidden lg:block">
            <Header 
              onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
              onOpenInstall={() => setInstallModalOpen(true)}
              onOpenAuth={() => setIsAuthModalOpen(true)}
            />
          </div>

          {/* Main Dashboard Content (Responsive for mobile, tablet, and desktop) */}
          <main className="flex-1 p-3.5 sm:p-6 lg:p-8 space-y-5 sm:space-y-6 max-w-7xl mx-auto w-full pb-28 lg:pb-8">
            {/* Universal Progress Bar & Metrics */}
            <ProgressSummary />

            {/* View Switcher based on activeTab */}
            {activeTab === 'dashboard' && (
              <div className="space-y-5 sm:space-y-6">
                {/* Primary Dual-Column Layout: Schedule & Tasks */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
                  <div className="lg:col-span-5 space-y-5 sm:space-y-6">
                    <TodaySchedule />
                  </div>
                  <div className="lg:col-span-7 space-y-5 sm:space-y-6">
                    <TaskList />
                  </div>
                </div>

                {/* Habit Streak Tracker */}
                <HabitTracker />

                {/* AI Assistant Banner */}
                <AIAssistantWidget />

                {/* Telegram Bot Sync preview */}
                <TelegramSyncWidget />
              </div>
            )}

            {activeTab === 'schedule' && (
              <div className="space-y-6">
                <TodaySchedule />
              </div>
            )}

            {activeTab === 'tasks' && (
              <div className="space-y-6">
                <TaskList />
              </div>
            )}

            {activeTab === 'habits' && (
              <div className="space-y-6">
                <HabitTracker />
              </div>
            )}

            {activeTab === 'telegram' && (
              <div className="space-y-6">
                <TelegramSyncWidget />
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="space-y-6">
                <AIAssistantWidget />
              </div>
            )}
          </main>

          {/* Desktop Footer */}
          <footer className="hidden lg:block border-t border-dark-750/60 py-4 px-6 text-center text-xs text-slate-500">
            LifeOS Daily Planner PWA • Offline-First Sync with Supabase, SQLite, Telegram Bot & OpenAI
          </footer>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar (Fixed for PWA mobile app experience) */}
      <MobileBottomNav />

      {/* Dialog Modals */}
      <QuickAddTaskModal />
      <EditScheduleModal />
      <InstallPwaModal isOpen={installModalOpen} onClose={() => setInstallModalOpen(false)} />
      <AuthModal />
    </div>
  );
}

export default App;
