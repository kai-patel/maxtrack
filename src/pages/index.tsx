import type { NextPage } from "next";
import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import { Mutation } from "react-query";
import { trpc } from "../utils/trpc";

type TechnologyCardProps = {
  name: string;
  description: string;
  documentation: string;
};

function getRandom(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

const Home: NextPage = () => {
  const { data: session, status } = useSession();
  const hello = trpc.useQuery(["example.hello", { text: "from tRPC" }]);
  const allLifts = trpc.useQuery(["lifts.getAll"]);
  const allLiftsMutation = trpc.useMutation(["lifts.addLifts"]);

  return (
    <div className="h-screen max-h-screen">
      <header>
        <nav className="sticky top-0 flex bg-gray-600 min-w-screen p-4 h-[5%] justify-between items-center shadow">
          <p className="font-bold text-gray-100 select-none text-lg">
            MaxTrack
          </p>
          <div className="flex">
            {status === "authenticated" ? (
              <>
                <button className="flex text-gray-100 justify-end items-center hover:underline">
                  <p className="text-gray-100">{session.user?.name}</p>
                  <img
                    className="aspect-square object-scale-down mr-4 ml-4 rounded-full"
                    src={session.user?.image || ""}
                    height="32"
                    width="32"
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
              <p>{JSON.stringify(allLifts.data)}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Home;
