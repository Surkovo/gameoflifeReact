import React, { useState, useCallback, useRef } from 'react';
import produce from 'immer';
import logo from './logo.svg';
import './App.css';

const numRow = 50;
const numCol = 50;

const operations = [
  [0, 1],
  [0, -1],
  [1, -1],
  [-1, 1],
  [1, 1],
  [-1, -1],
  [1, 0],
  [-1, 0],
];
const generateEmptyGrid = () => {
  const rows = [];
  for (let i = 0; i < numRow; i++) {
    //Array.from arg 1 is length, arg 2 is a function to fill the array
    rows.push(Array.from(Array(numCol), () => 0));
  }
  return rows;
};

const App: React.FC = () => {
  const [grid, setGrid] = useState(() => {
    return generateEmptyGrid();
  });
  const [running, setRunning] = useState(false);

  const runningRef = useRef(running);
  //using a ref makes sure that our callback is using the most recent value. this is need since runSim is only created once do to it using useCallback.
  runningRef.current = running;
  //useCallback prevents the function from being recreated every render. only does it on the first. as noted byt he empty arry arg
  const runSim = useCallback(() => {
    if (!runningRef.current) {
      return;
    }
    // simulate
    setGrid((g) => {
      //current grid is g, newCopy being returned in gridCopy
      return produce(g, (gridCopy) => {
        for (let i = 0; i < numRow; i++) {
          for (let k = 0; k < numCol; k++) {
            //neighbors is equal to the live neighbors
            let neighbors = 0;
            operations.forEach(([x, y]) => {
              const newI = i + x;
              const newK = k + y;
              //make sure we are within th egrid
              if (newI >= 0 && newI < numRow && newK >= 0 && newK < numCol) {
                //checking the current grids value;
                neighbors += g[newI][newK];
              }
            });
            if (neighbors < 2 || neighbors > 3) {
              gridCopy[i][k] = 0;
            } else if (neighbors === 3 && g[i][k] === 0) {
              gridCopy[i][k] = 1;
            }
          }
        }
      });
    });

    setTimeout(runSim, 10);
  }, []);
  //inline style must use double braces in react
  return (
    //this is shorthand for a React.Fragment
    <>
      <button
        onClick={() => {
          setRunning(!running);
          if (!running) {
            //this is needed in case the state above does run into time. this just ensures that is does run
            runningRef.current = true;
            runSim();
          }
        }}
      >
        {running ? 'stop' : 'start'}
      </button>
      <button
        onClick={() => {
          setGrid(generateEmptyGrid());
        }}
      >
        Clear
      </button>
      <button
        onClick={() => {
          const rows = [];
          for (let i = 0; i < numRow; i++) {
            //Array.from arg 1 is length, arg 2 is a function to fill the array
            rows.push(
              Array.from(Array(numCol), () => (Math.random() > 0.5 ? 1 : 0))
            );
          }
          setGrid(rows);
        }}
      >
        Random
      </button>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${numCol}, 20px)`,
        }}
      >
        {grid.map((rows, i) =>
          rows.map((col, k) => (
            <div
              key={`${i}-${k}`}
              onClick={() => {
                //produce comes from immer. pass in the state, then run function to mutate the state, then it returns a new state
                const newGrid = produce(grid, (gridCopy) => {
                  gridCopy[i][k] = grid[i][k] ? 0 : 1;
                });
                //here we use that new return state and use it to set the state.
                setGrid(newGrid);
              }}
              style={{
                width: 20,
                height: 20,
                backgroundColor: grid[i][k] ? 'pink' : undefined,
                border: 'solid 1px black',
              }}
            />
          ))
        )}
      </div>
    </>
  );
};

export default App;
