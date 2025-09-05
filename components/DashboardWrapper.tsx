"use client";

import dynamic from "next/dynamic";
// import { Header } from "../components/Header";
import DashboardDemo from "./DynamicVisualizer"
// import ExpandableChatbot from "./ExpandableChatUI";
import { Footer } from "./Footer";
import CSVAnalyzerDashboard from "./DropCSV";


// Dynamically import the Dashboard component with client-side rendering only
const Dashboard = dynamic(() => import("./DashboardDemo"), { ssr: false });

export default function DashboardWrapper() {
  return (
    <>
      {/* <Header /> */}
      <Dashboard />
      <DashboardDemo/>
      {/* <ExpandableChatbot /> */}
      <CSVAnalyzerDashboard/>
      <Footer/>
      
        
    </>
  );
}
