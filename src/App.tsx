import { useEffect, useState } from 'react';
import { makeVar, ReactiveVar, useReactiveVar } from '@apollo/client';
import './App.css';

const variable = makeVar(0);
const variable2 = makeVar(0);

function demo(rv: ReactiveVar<number>) {
  rv(rv() + 1);
  rv(rv() + 1);
  setTimeout(() => {
    console.log("time's up!");
    rv(rv() - 1);
    rv(rv() - 1);
  }, 1000);
}

function App() {
  const count = useReactiveVar(variable);
  const count2 = useFixedReactiveVar(variable2);

  return (
    <div className="App">
      <h3>Example of untracking reactive variable :-(</h3>
      <div className="card">
        <button onClick={() => demo(variable)}>Broken count is {count}</button>{' '}
        <button onClick={() => demo(variable2)}>Fixed count is {count2}</button>
        <p>
          Click on a button. And after one second, count should return to 0.
        </p>
      </div>
    </div>
  );
}

function useFixedReactiveVar<T>(rv: ReactiveVar<T>): T {
  const value = rv();

  const [, setValue] = useState(value);

  useEffect(() => {
    setValue(rv());

    return rv.onNextChange(function onNext(v: T) {
      setValue(v);
      rv.onNextChange(onNext);
    });
  }, [rv]);

  return value;
}

export default App;
