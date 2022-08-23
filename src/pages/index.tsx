import type { NextPage } from "next";
import { signIn, signOut, useSession } from "next-auth/react";
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
import { Bar, Line } from "react-chartjs-2";
import { trpc } from "../utils/trpc";
import { Session } from "next-auth";
import React, { SetStateAction, useEffect, useState } from "react";

type NavBarProps = {
  session: Session | null;
  status: "authenticated" | "loading" | "unauthenticated";
};

type DashboardProps = {
  session: Session | null;
  status: "authenticated" | "loading" | "unauthenticated";
};

type LiftsInputFormProps = {
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

function getRandom(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

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

function NavBar({ session, status }: NavBarProps) {
  return (
    <nav className="flex bg-gray-600 min-w-screen m-0 p-4 h-[5%] justify-between items-center shadow">
      <p className="font-bold text-gray-100 select-none text-lg">MaxTrack</p>
      <NavBarProfileButton session={session} status={status} />
    </nav>
  );
}

function NavBarProfileButton({ session, status }: NavBarProps) {
  return (
    <div className="flex">
      {status === "authenticated" && session ? (
        <>
          <button className="flex text-gray-100 justify-end items-center hover:underline">
            <p className="text-gray-100">{session.user?.name}</p>
            <img
              className="aspect-square object-scale-down mr-4 ml-4 rounded-full"
              src={session.user?.image || ""}
              height="32"
              width="32"
              referrerPolicy="no-referrer"
            />
          </button>
          <button
            className="text-gray-100 justify-end hover:underline"
            onClick={() => signOut()}
          >
            Sign Out
          </button>
        </>
      ) : (
        <button
          className="text-gray-100 justify-end hover:underline"
          onClick={() => signIn()}
        >
          Login
        </button>
      )}
    </div>
  );
}

function Dashboard({ session, status }: DashboardProps) {
  const utils = trpc.useContext();
  const allLifts = trpc.useQuery(["lifts.getAll"]);
  const histories = trpc.useQuery(["lifts.getHistories"]);
  const allLiftsMutation = trpc.useMutation(["lifts.addLifts"], {
    onSuccess() {
      utils.invalidateQueries(["lifts.getAll"]);
      utils.invalidateQueries(["lifts.getHistories"]);
      setInputLifts({
        deadlift: 0,
        benchpress: 0,
        squat: 0,
        overhead: 0,
      });
    },
  });

  histories && histories.data && console.log(new Object(histories.data));

  const [inputLifts, setInputLifts] = useState({
    deadlift: 0,
    benchpress: 0,
    squat: 0,
    overhead: 0,
  });

  if (status !== "authenticated" || !session) {
    utils.cancelQuery(["lifts.getAll"]);
    utils.cancelQuery(["lifts.getHistories"]);
    return (
      <p className="font-bold text-2xl text-center w-full h-full p-10 bg-gray-100">
        You are not logged in. Whether you are a new or an existing user, please
        sign in to use this website.
      </p>
    );
  }

  return (
    <div className="flex flex-col w-full h-full bg-gray-800">
      <div className="flex h-fit bg-gray-100 border border-gray-900 shadow rounded m-4 p-4 justify-between items-center">
        <p className="border rounded h-fit p-4 shadow">
          {session.user?.name} <img src={session.user?.image || ""} />
        </p>
        <LiftsInputForm setInputLifts={setInputLifts} inputLifts={inputLifts} />
        <button
          className="bg-blue-600 rounded shadow text-gray-100 h-fit p-2 items-center"
          onClick={async () => {
            allLiftsMutation.mutate(inputLifts);
          }}
        >
          Add Lifts
        </button>
      </div>
      <div className="flex flex-wrap max-h-fit bg-green-200 border border-gray-900 shadow rounded m-4 p-4">
        {histories.isLoading ? (
          <p>Loading...</p>
        ) : (
          histories.status === "success" &&
          histories.data && (
            <div className="flex flex-row flex-1 flex-wrap justify-around p-0 m-0">
              {Object.entries(histories.data).map(([liftName, liftHistory]) => (
                <div key={liftName} className="">
                  <Line
                    height="256px"
                    options={{
                      responsive: true,
                      aspectRatio: 1,
                      maintainAspectRatio: false,
                      plugins: {
                        title: {
                          display: true,
                          text:
                            liftName.charAt(0).toUpperCase() +
                            liftName.slice(1, -7),
                        },
                      },
                      scales: {
                        y: {
                          title: {
                            display: true,
                            text: "Weight/kg",
                          },
                        },
                      },
                    }}
                    data={{
                      labels: Object.keys(liftHistory),
                      datasets: [
                        {
                          label: "Weight",
                          data: Object.values(liftHistory),
                        },
                      ],
                    }}
                  />
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}

function LiftsInputForm({ setInputLifts, inputLifts }: LiftsInputFormProps) {
  return (
    <form>
      <label className="p-4 select-none">
        Deadlift:
        <input
          className="form-input ml-4"
          name="deadlift"
          type="number"
          min={0}
          value={inputLifts.deadlift}
          required={true}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setInputLifts({
              ...inputLifts,
              deadlift: e.currentTarget.valueAsNumber,
            });
          }}
        />
      </label>
      <label className="p-4 select-none">
        Benchpress:
        <input
          className="form-input ml-4"
          name="benchpress"
          type="number"
          min={0}
          value={inputLifts.benchpress}
          required={true}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setInputLifts({
              ...inputLifts,
              benchpress: e.currentTarget.valueAsNumber,
            });
          }}
        />
      </label>
      <label className="p-4 select-none">
        Squat:
        <input
          className="form-input ml-4"
          name="squat"
          type="number"
          min={0}
          value={inputLifts.squat}
          required={true}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setInputLifts({
              ...inputLifts,
              squat: e.currentTarget.valueAsNumber,
            });
          }}
        />
      </label>
      <label className="p-4 select-none">
        Overhead:
        <input
          className="form-input ml-4"
          name="overhead"
          type="number"
          min={0}
          value={inputLifts.overhead}
          required={true}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setInputLifts({
              ...inputLifts,
              overhead: e.currentTarget.valueAsNumber,
            });
          }}
        />
      </label>
    </form>
  );
}
