import { trpc } from "../utils/trpc";
import React, { useState } from "react";
import _ from "lodash";
import { DashboardProps, LiftsInputFormProps } from "../pages/index";
import { Line } from "react-chartjs-2";

export function Dashboard({ session, status }: DashboardProps) {
  const utils = trpc.useContext();
  const { data: maxes } = trpc.useQuery(["lifts.getAll"]);

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
      <p className="w-full font-bold text-2xl text-center h-fit p-10 bg-gray-100">
        You are not logged in. Whether you are a new or an existing user, please
        sign in to use this website.
      </p>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex flex-row flex-shrink h-fit bg-gray-100 shadow rounded m-6 p-4 justify-evenly items-center space-x-4">
        <div className="hidden xl:flex flex-row flex-shrink-0 border-r border-r-gray-800 h-fit w-fit p-2 pr-4 items-center">
          <div className="p-2">
            {/* <p className="text-center font-bold">{`User: ${session.user?.name}`}</p> */}
            <img className="rounded shadow" src={session.user?.image || ""} height="64" width="64" />
          </div>
          {maxes && (
            <div className="p-2 font-semibold ring-2 ring-gray-800 rounded">
              <p>Records:</p>
              <ul>
                {_.map(maxes, (value, lift) => (
                  <li>{`${_.capitalize(lift)}: ${value}kg`}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <LiftsInputForm setInputLifts={setInputLifts} inputLifts={inputLifts} />
      </div>
      <div className="flex flex-row flex-shrink flex-wrap justify-around max-h-fit bg-green-200 shadow rounded m-6 p-4">
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
    <form className="flex flex-shrink place-content-center space-x-2">
      <div className="flex flex-wrap place-content-left">
        {_.map(
          inputLifts as { [key: string]: number },
          (liftValue, lift, inputLiftsCast) => {
            return (
              <div className="flex-shrink p-2" key={lift}>
                <label className="flex justify-evenly pb-2 select-none">
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
        <button
          className="bg-blue-600 rounded shadow text-gray-100 h-fit p-2 mb-2 ml-2 self-end"
          onClick={async (e) => {
            e.preventDefault();
            allLiftsMutation.mutate(inputLifts);
          }}
        >
          Add
        </button>
      </div>
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
