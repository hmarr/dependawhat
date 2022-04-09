import { useEffect, useLayoutEffect, useRef, useState } from "react";
import "./App.css";
import { subscribe } from "./events";
import { DependabotUpdate } from "./dependabot-update";
import DependabotUpdateCell from "./DependabotUpdateCell";
import EmptyCell from "./EmptyCell";

interface AppState {
  updates: DependabotUpdate[];
  totalCount: number;
  cols: number;
  rows: number;
}

async function preloadImage(src: string) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(null);
    img.onerror = () => reject();
    img.src = src;
  });
}

function App() {
  const appRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<AppState>({
    updates: [],
    totalCount: 0,
    cols: 1,
    rows: 1,
  });

  useEffect(() => {
    subscribe(async (event) => {
      await preloadImage(event.repoOwnerAvatarUrl);

      setState((oldState) => {
        const { updates, totalCount } = oldState;
        if (updates.find((e) => e?.id === event.id)) {
          return oldState;
        }

        const newUpdates = [...updates, event];
        if (newUpdates.length > 100) {
          newUpdates.shift();
        }

        return { ...oldState, updates: newUpdates, totalCount: totalCount + 1 };
      });
    });
  }, []);

  const updateGridSize = () => {
    if (appRef.current) {
      ((ref) => {
        const containerStyle = getComputedStyle(ref);
        const vPadding =
          parseInt(containerStyle.paddingTop) +
          parseInt(containerStyle.paddingBottom);
        const hPadding =
          parseInt(containerStyle.paddingLeft) +
          parseInt(containerStyle.paddingRight);
        setState((oldState) => ({
          ...oldState,
          rows: Math.floor((ref.offsetHeight - vPadding) / 90),
          cols: Math.floor((ref.offsetWidth - hPadding) / 360),
        }));
      })(appRef.current);
    }
  };
  useLayoutEffect(() => updateGridSize(), [appRef]);
  useEffect(() => window.addEventListener("resize", updateGridSize), []);

  const numUpdates =
    state.rows * (state.cols - 1) + (state.totalCount % state.rows);
  const updates = numUpdates > 0 ? state.updates.slice(-numUpdates) : [];
  const emptyCells = Array(state.rows * state.cols - updates.length).fill(null);

  return (
    <div className="App" ref={appRef}>
      {updates.map((update, i) => (
        <span key={update.id}>
          <DependabotUpdateCell
            update={update}
            newest={i === updates.length - 1}
            opacity={((i + 1) / updates.length) * 0.8 + 0.2}
          />
        </span>
      ))}
      {emptyCells.map((_, i) => (
        <EmptyCell key={i} loader={i === 0} />
      ))}
    </div>
  );
}

export default App;
