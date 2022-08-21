import type { NextPage } from "next";
import { signIn, signOut, useSession } from "next-auth/react";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { trpc } from "../utils/trpc";
import { Session } from "next-auth";

type NavBarProps = {
  session: Session | null;
  status: "authenticated" | "loading" | "unauthenticated";
};

function getRandom(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

const Home: NextPage = () => {
  const { data: session, status } = useSession();
  const utils = trpc.useContext();
  const hello = trpc.useQuery(["example.hello", { text: "from tRPC" }]);
  const allLifts = trpc.useQuery(["lifts.getAll"]);
  const allLiftsMutation = trpc.useMutation(["lifts.addLifts"], {
    onSuccess() {
      utils.invalidateQueries(["lifts.getAll"]);
    },
  });

  ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
  );

  return (
    <div className="h-screen max-h-screen">
      <header>
        <NavBar session={session} status={status} />
      </header>
      <main className="relative container mx-auto flex flex-col items-center justify-center max-h-[95%] p-4">
        <div className="flex ">
          {hello.data ? <p>{hello.data.greeting}</p> : <p>Loading..</p>}
        </div>
        <div className="flex ">
          {status === "authenticated" && (
            <div>
              <p>
                {session.user?.name} <img src={session.user?.image || ""} />
              </p>
              <button
                onClick={async () => {
                  allLiftsMutation.mutate({
                    deadlift: getRandom(40.0, 100.0),
                    benchpress: getRandom(30.0, 40.0),
                    squat: getRandom(60.0, 80.0),
                    overhead: getRandom(20.0, 25.0),
                  });
                }}
              >
                Add Lifts
              </button>
              {allLifts.status === "success" && (
                <p>
                  {allLiftsMutation.isLoading ? (
                    "Loading..."
                  ) : (
                    <Bar
                      data={{
                        labels: Object.keys(
                          JSON.parse(JSON.stringify(allLifts.data))
                        ),
                        datasets: [
                          {
                            label: "Personal Records",
                            data: Object.values(
                              JSON.parse(JSON.stringify(allLifts.data))
                            ),
                          },
                        ],
                      }}
                    />
                  )}
                </p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Home;

function NavBar({ session, status }: NavBarProps) {
  return (
    <nav className="sticky top-0 flex bg-gray-600 min-w-screen p-4 h-[5%] justify-between items-center shadow">
      <p className="font-bold text-gray-100 select-none text-lg">MaxTrack</p>
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
    </nav>
  );
}
