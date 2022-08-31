import { trpc } from "../utils/trpc";
import React, { useState } from "react";
import _ from "lodash";
import { DashboardProps, LiftsInputFormProps } from "../pages/index";
import { Line } from "react-chartjs-2";

export function Dashboard({ session, status }: DashboardProps) {
  const utils = trpc.useContext();
  const { data: maxes } = trpc.useQuery(["lifts.getAll"]);
  console.log(maxes);

  const [inputLifts, setInputLifts] = useState({
    deadlift: 0,
    benchpress: 0,
    squat: 0,
    overhead: 0,
  });

  if (status !== "authenticated" || !session) {
    utils.cancelQuery(["lifts.getHistories"]);
    utils.cancelQuery(["lifts.getAll"]);
    return (
      <p className="font-bold text-2xl text-center w-full h-full p-10 bg-gray-100">
        You are not logged in. Whether you are a new or an existing user, please
        sign in to use this website.
      </p>
    );
  }

  return (
    <div className="flex flex-col w-full h-full bg-gray-800">
      <div className="flex flex-row flex-shrink h-fit bg-gray-100 border border-gray-900 shadow rounded m-4 p-4 justify-evenly items-center">
        <div className="hidden lg:flex flex-row border rounded h-fit w-fit p-2 shadow">
          <div className="p-2">
            <p className="text-center font-bold">{session.user?.name}</p>
            <img className="rounded" src={session.user?.image || ""} />
          </div>
          {maxes && (
            <div className="p-2">
              <p>Records:</p>
              <ul>
                {_.map(maxes, (value, lift) => (
                  <li>{`${_.capitalize(lift)}: ${value}`}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <LiftsInputForm setInputLifts={setInputLifts} inputLifts={inputLifts} />
      </div>
      <div className="flex flex-row flex-wrap justify-around max-h-fit bg-green-200 border border-gray-900 shadow rounded m-4 p-4">
        <HistoricalPlots />
      </div>
    </div>
  );
}

function LiftsInputForm({ setInputLifts, inputLifts }: LiftsInputFormProps) {
  const utils = trpc.useContext();
  const allLiftsMutation = trpc.useMutation(["lifts.addLifts"], {
    onSuccess() {
      utils.invalidateQueries(["lifts.getHistories"]);
      utils.invalidateQueries(["lifts.getAll"]);
      setInputLifts({
        deadlift: 0,
        benchpress: 0,
        squat: 0,
        overhead: 0,
      });
    },
  });

  return (
    <form className="flex flex-auto place-content-center space-x-2">
      <div className="flex flex-wrap place-content-left">
        {_.map(
          inputLifts as { [key: string]: number },
          (liftValue, lift, inputLiftsCast) => {
            return (
              <div key={lift}>
                <label className="flex justify-evenly p-2 select-none w-full max-w-1/4">
                  {`${_.capitalize(lift)}:`}
                </label>
                <input
                  className="form-input text-center"
                  name={lift}
                  type="number"
                  min={0}
                  value={liftValue || ""}
                  required={true}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const prevLifts = {
                      ...inputLiftsCast,
                    };
                    prevLifts[lift] = e.currentTarget.valueAsNumber;
                    setInputLifts(prevLifts as typeof inputLifts);
                  }}
                />
              </div>
            );
          }
        )}
      </div>
      <button
        className="bg-blue-600 rounded shadow text-gray-100 h-fit p-2 self-end"
        onClick={async (e) => {
          e.preventDefault();
          allLiftsMutation.mutate(inputLifts);
        }}
      >
        Add
      </button>
    </form>
  );
}

function HistoricalPlots() {
  const histories = trpc.useQuery(["lifts.getHistories"]);

  if (histories.isLoading) {
    return <p>Loading...</p>;
  }

  if (!histories.data) {
    return <p>No data</p>;
  }

  return (
    <>
      {_.map(histories.data, (liftHistory, name) => {
        return (
          <div key={name} className="">
            <Line
              height="256px"
              options={{
                responsive: true,
                aspectRatio: 1,
                maintainAspectRatio: false,
                plugins: {
                  title: {
                    display: true,
                    text: _.capitalize(name).slice(0, -7),
                    font: {
                      size: 14,
                    },
                  },
                },
                scales: {
                  y: {
                    title: {
                      display: true,
                      text: "Weight/kg",
                      font: {
                        size: 14,
                        weight: "bolder",
                      },
                    },
                    min: 0,
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
