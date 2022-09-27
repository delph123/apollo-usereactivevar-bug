import React, { useEffect, useState } from 'react';
import { makeVar, ReactiveVar, useReactiveVar } from '@apollo/client';
import './App.css';

const variable = makeVar(-2);
const variable2 = makeVar(-2);
const variable3 = makeVar(-2);

function demo(rv: ReactiveVar<number>) {
  rv(rv() + 1);
  rv(rv() + 1);
  setTimeout(() => {
    console.log("time's up!");
    rv(rv() - 1);
    rv(rv() - 1);
  }, 1000);
}

const Counter = React.memo(function Counter({ rv, useRv, name }) {
  const count = useRv(rv);

  if (rv() < 0) {
    // This checks the case of value in effect != value in initial state
    rv(rv() + 1);
  }

  return (
    <button onClick={() => demo(rv)}>
      {name} count is {count}
    </button>
  );
});

function App() {
  return (
    <div className="App">
      <h3>Example of untracking reactive variable :-(</h3>
      <div className="card">
        <Counter rv={variable} useRv={useReactiveVar} name="Broken" />{' '}
        <Counter rv={variable2} useRv={useFixedReactiveVar} name="Fixed" />{' '}
        <Counter
          rv={variable3}
          useRv={useAlternativeReactiveVar}
          name="Alternative"
        />
      </div>
      <p>
        Click on a button. Counter is increased. After one second, count
        decrease back to previous value. You can also try to click multiple
        times!
      </p>
    </div>
  );
}

function useFixedReactiveVar<T>(rv: ReactiveVar<T>): T {
  const value = rv();

  const [, setValue] = useState(value);

  useEffect(() => {
    // Uncomments this code to break

    // const probablySameValue  = rv();
    // if (probablySameValue  !== value) {
    //   setValue(probablySameValue);
    //   return; // breaks because this effect is called once
    // }

    setValue(rv());

    return rv.onNextChange(function onNext(v: T) {
      console.log('fixed');
      setValue(v);
      rv.onNextChange(onNext);
    });
  }, [rv]);

  return value;
}

function useAlternativeReactiveVar<T>(rv: ReactiveVar<T>): T {
  const value = rv();

  // Let's go full abstract, this should save a few setCount calls
  // while preserving number of rendering
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (rv() !== value) {
      // cause a re-render
      setCount((c) => c + 1);
      // this time it is ok
      return;
    }

    // otherwise register for next change
    return rv.onNextChange(() => {
      console.log('alternative');
      setCount((c) => c + 1);
    });
  }, [count]);

  return value;
}

export default App;
