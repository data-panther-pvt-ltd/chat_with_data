"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import DashboardDemo from "../../components/DynamicVisualizer";
import CSVAnalyzerDashboard from "../../components/DropCSV";
import {
  ChartBarIcon,
  TableCellsIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";

// Lazy-load dashboard component
const Dashboard = dynamic(() => import("../../components/DashboardDemo"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  ),
});

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const navItems: NavItem[] = [
  { id: "csv", label: "CSV Analyzer", icon: TableCellsIcon, badge: "New" },
  { id: "visual", label: "Visual Insights", icon: EyeIcon },
  { id: "dashboard", label: "Dashboard", icon: ChartBarIcon },
];

const NavButton = ({
  item,
  active,
  onClick,
}: {
  item: NavItem;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`group relative px-6 py-3 rounded-2xl transition-all duration-300 ease-in-out ${
      active
        ? "bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg shadow-green-500/25 scale-105"
        : "bg-white/80 backdrop-blur-md text-gray-700 hover:text-blue-600 hover:bg-white hover:shadow-lg border border-gray-200/50 hover:border-blue-200 hover:scale-105"
    }`}
  >
    <div className="flex items-center space-x-3">
      <div className="text-left">
        <div
          className={`font-semibold text-sm ${
            active ? "text-white" : "text-gray-900 group-hover:text-blue-600"
          }`}
        >
          {item.label}
        </div>
      </div>
    </div>
    {active && (
      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full shadow-lg"></div>
    )}
  </button>
);

export default function InsightsPage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [activeTab, setActiveTab] = useState("csv");
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // 🔐 Redirect to login if not authenticated
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("auth") === "true";
    if (!isLoggedIn) {
      router.push("/login");
    } else {
      setAuthChecked(true);
    }
  }, []);

  // 🧼 Floating navbar hide on scroll
  useEffect(() => {
    const controlNavbar = () => {
      const currentScrollY = window.scrollY;
      setIsVisible(currentScrollY < lastScrollY || currentScrollY <= 100);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", controlNavbar);
    return () => window.removeEventListener("scroll", controlNavbar);
  }, [lastScrollY]);

  // ⌨️ Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "1":
            e.preventDefault();
            setActiveTab("dashboard");
            break;
          case "2":
            e.preventDefault();
            setActiveTab("csv");
            break;
          case "3":
            e.preventDefault();
            setActiveTab("visual");
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  // 🚪 Logout handler
  const handleLogout = () => {
    localStorage.removeItem("auth");
    router.push("/login");
  };

  // 🧩 Render the active tab component
  const renderActiveComponent = () => {
    switch (activeTab) {
      case "csv":
        return <CSVAnalyzerDashboard />;
      case "visual":
        return <DashboardDemo />;
      case "dashboard":
        return <Dashboard />;
      default:
        return <Dashboard />;
    }
  };

  const currentItem = navItems.find((item) => item.id === activeTab);

  // ⏳ Wait for auth check
  if (!authChecked) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Floating Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${
          isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mt-4 bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                {/* Brand */}
                <div className="flex items-center space-x-3">
                  <img src="/inConnect.png" alt="Logo" className="h-10 w-auto" />
                </div>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center space-x-2">
                  {navItems.map((item) => (
                    <NavButton
                      key={item.id}
                      item={item}
                      active={activeTab === item.id}
                      onClick={() => setActiveTab(item.id)}
                    />
                  ))}
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                  >
                    Logout
                  </button>
                </div>

                {/* Mobile View */}
                <div className="md:hidden">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
                      {currentItem && <currentItem.icon className="h-5 w-5 text-white" />}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">
                        {currentItem?.label}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile Nav */}
              <div className="md:hidden mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 gap-2">
                  {navItems.map((item) => (
                    <NavButton
                      key={item.id}
                      item={item}
                      active={activeTab === item.id}
                      onClick={() => setActiveTab(item.id)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-32 min-h-screen w-full">
        <div className="w-full h-full">{renderActiveComponent()}</div>
      </main>

      {/* Scroll to top */}
      {!isVisible && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-8 right-8 p-4 bg-gradient-to-r from-slate-50 to-slate-50 rounded-full shadow-2xl text-slate-950 hover:shadow-blue-500/25 transition-all duration-300 hover:scale-110 z-40"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
