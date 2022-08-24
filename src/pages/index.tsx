import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { Session } from "next-auth";
import React, { SetStateAction, useEffect } from "react";
import { NavBar } from "../components/NavBar";
import { Dashboard } from "../components/Dashboard";

export type NavBarProps = {
  session: Session | null;
  status: "authenticated" | "loading" | "unauthenticated";
};

export type DashboardProps = {
  session: Session | null;
  status: "authenticated" | "loading" | "unauthenticated";
};

export type LiftsInputFormProps = {
  inputLifts: {
    deadlift: number;
    benchpress: number;
    squat: number;
    overhead: number;
  };
  setInputLifts: React.Dispatch<
    SetStateAction<{
      deadlift: number;
      benchpress: number;
      squat: number;
      overhead: number;
    }>
  >;
};

const Home: NextPage = () => {
  const { data: session, status } = useSession();

  useEffect(() => {
    ChartJS.register(
      CategoryScale,
      LinearScale,
      BarElement,
      Title,
      Tooltip,
      Legend,
      PointElement,
      LineElement
    );

    ChartJS.defaults.backgroundColor = "#a5b8a7";
  }, []);

  return (
    <div className="h-screen max-h-screen overflow-hidden m-0 p-0">
      <header className="sticky top-0">
        <NavBar session={session} status={status} />
      </header>
      <main className="relative flex flex-col items-center h-[95%] bg-gray-200">
        <Dashboard session={session} status={status} />
      </main>
    </div>
  );
};

export default Home;
