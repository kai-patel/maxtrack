import _ from "lodash";
import { NextPage } from "next";
import { useSession } from "next-auth/react";
import { NavBar } from "../components/NavBar";
import { trpc } from "../utils/trpc";

const Profile: NextPage = () => {
  const utils = trpc.useContext();
  const { data: session, status } = useSession();
  const removeLiftsMutation = trpc.useMutation(["lifts.removeLifts"], {
    onSuccess() {
      utils.invalidateQueries(["lifts.getHistories"]);
    },
  });

  if (status !== "authenticated" || !session || !session.user) return null;

  return (
    <div className="h-screen max-h-screen overflow-hidden m-0 p-0">
      <header className="sticky top-0">
        <NavBar session={session} status={status} />
      </header>
      <main className="relative flex flex-col items-center h-[95%] bg-gray-200">
        <div className="flex flex-col w-full h-full bg-gray-800">
          <div className="flex flex-row flex-shrink h-fit bg-gray-100 border border-gray-900 shadow rounded m-4 p-4 justify-evenly items-center">
            <p>{`Name: ${session.user.name}`}</p>
            <img src={session.user.image || ""} height="128px" width="128px" />
            <button onClick={() => removeLiftsMutation.mutate()}>
              Reset Lift History
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
