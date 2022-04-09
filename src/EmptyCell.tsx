import { IconContext } from "react-icons";
import { SiDependabot } from "react-icons/si";

interface Props {
  loader: boolean;
}

export default function EmptyCell({ loader }: Props) {
  return (
    <div className={`cell empty ${loader ? "loader" : null}`}>
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
