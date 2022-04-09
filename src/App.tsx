import { useEffect, useLayoutEffect, useRef, useState } from "react";
import "./App.css";
import { subscribe } from "./events";
import { DependabotUpdate } from "./dependabot-update";
import DependabotUpdateCell from "./DependabotUpdateCell";
import EmptyCell from "./EmptyCell";
import { searchDependabotPrs } from "./search";

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
    // Load initial results from the GitHub search API
    (async () => {
      const initialUpdates = await searchDependabotPrs();
      for (const update of initialUpdates) {
        await preloadImage(update.repoOwnerAvatarUrl);
        setState((prevState) => {
          if (prevState.updates.find((u) => u?.id === update.id)) {
            return prevState;
          }

          return {
            ...prevState,
            updates: [...prevState.updates, update].slice(-100),
            totalCount: prevState.totalCount + 1,
          };
        });
      }
    })();

    // Subscribe to the SSE feed of all public GitHub events to get
    // live data
    subscribe(async (update) => {
      await preloadImage(update.repoOwnerAvatarUrl);

      setState((prevState) => {
        if (prevState.updates.find((u) => u?.id === update.id)) {
          return prevState;
        }

        return {
          ...prevState,
          updates: [...prevState.updates, update].slice(-100),
          totalCount: prevState.totalCount + 1,
        };
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
