import { trpc } from "../utils/trpc";
import React, { useState } from "react";
import _ from "lodash";
import { DashboardProps, LiftsInputFormProps } from "../pages/index";
import { Line } from "react-chartjs-2";

export function Dashboard({ session, status }: DashboardProps) {
  const utils = trpc.useContext();
  const allLiftsMutation = trpc.useMutation(["lifts.addLifts"], {
    onSuccess() {
      utils.invalidateQueries(["lifts.getHistories"]);
      setInputLifts({
        deadlift: 0,
        benchpress: 0,
        squat: 0,
        overhead: 0,
      });
    },
  });

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
      <div className="flex flex-row flex-wrap h-fit bg-gray-100 border border-gray-900 shadow rounded m-4 p-4 justify-between items-center">
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
      <div className="flex flex-row flex-wrap justify-around max-h-fit bg-green-200 border border-gray-900 shadow rounded m-4 p-4">
        <HistoricalPlots />
      </div>
    </div>
  );
}

function LiftsInputForm({ setInputLifts, inputLifts }: LiftsInputFormProps) {
  return (
    <form className="flex flex-auto flex-wrap">
      {_.map(inputLifts, (liftValue, lift) => {
        return (
          <label key={lift} className="p-4 select-none">
            {`${_.capitalize(lift)}:`}
            <input
              className="form-input ml-4"
              name={lift}
              type="number"
              min={0}
              value={liftValue || 0}
              required={true}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                let prevLifts = {
                  ...inputLifts,
                };
                prevLifts[lift] = e.currentTarget.valueAsNumber;
                console.log(prevLifts);
                setInputLifts(prevLifts);
              }}
            />
          </label>
        );
      })}
    </form>
  );
}

function HistoricalPlots() {
  const histories = trpc.useQuery(["lifts.getHistories"]);

  if (histories.isLoading || !histories.data) {
    return <p>Loading...</p>;
  }

  return (
    <>
      {_.map(histories.data, (liftHistory, name) => {
        return (
          <div key={name} className="border-4">
            <Line
              height="256px"
              options={{
                responsive: true,
                aspectRatio: 1,
                maintainAspectRatio: false,
                plugins: {
                  title: {
                    display: true,
                    text: name.charAt(0).toUpperCase() + name.slice(1, -7),
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
        );
      })}
    </>
  );
}