import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { IconContext } from "react-icons";
import { SiDependabot } from "react-icons/si";
import "./App.css";
import EcosystemIcon from "./EcosystemIcon";
import { DependabotEvent, subscribe } from "./events";

interface AppState {
  events: DependabotEvent[];
  totalEvents: number;
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
    events: [],
    totalEvents: 0,
    cols: 1,
    rows: 1,
  });

  useEffect(() => {
    subscribe(async (event) => {
      await preloadImage(event.repoOwnerAvatarUrl);

      setState((oldState) => {
        const { events, totalEvents } = oldState;
        if (events.find((e) => e?.id === event.id)) {
          return oldState;
        }

        const newEvents = [...events, event];
        if (newEvents.length > 100) {
          newEvents.shift();
        }

        return { ...oldState, events: newEvents, totalEvents: totalEvents + 1 };
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

  const numEvents =
    state.rows * (state.cols - 1) + (state.totalEvents % state.rows);
  const events = numEvents > 0 ? state.events.slice(-numEvents) : [];
  const nullEvents = Array(state.rows * state.cols - events.length).fill(null);

  return (
    <div className="App" ref={appRef}>
      {events.map((e, i) => (
        <span
          key={e.id}
          style={{
            opacity: ((i + 1) / events.length) * 0.8 + 0.2,
          }}
        >
          <Event event={e} />
        </span>
      ))}
      {nullEvents.map((_, i) => (
        <NullEvent key={i} loader={i === 0} />
      ))}
    </div>
  );
}

function NullEvent({ loader }: { loader: boolean }) {
  return (
    <div className={`null-event ${loader ? "loader" : null}`}>
      <IconContext.Provider
        value={{
          color: "#1b2834",
          className: "dependabot-loader",
        }}
      >
        {loader ? <SiDependabot /> : null}
      </IconContext.Provider>
    </div>
  );
}

function Event({ event }: { event: DependabotEvent }) {
  return (
    <a
      href={event.prUrl}
      target="_blank"
      className={`pull-request ${event.ecosystem}`}
    >
      <IconContext.Provider
        value={{
          color: "#1b2834",
          className: "ecosystem-icon",
        }}
      >
        <EcosystemIcon ecosystem={event.ecosystem} />
      </IconContext.Provider>
      <div>
        <div className="dependency">{event.dependency}</div>
        <div className="versions">
          {event.fromVersion} → {event.toVersion}
        </div>
      </div>
      <div className="avatar">
        <img src={event.repoOwnerAvatarUrl} />
      </div>
    </a>
  );
}

export default App;
