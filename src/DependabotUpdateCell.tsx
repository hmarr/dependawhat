import { IconContext } from "react-icons";
import { DependabotUpdate } from "./dependabot-update";
import EcosystemIcon from "./EcosystemIcon";

interface Props {
  update: DependabotUpdate;
  newest: boolean;
  opacity: number;
}

export default function DependabotUpdateCell({
  update,
  newest,
  opacity,
}: Props) {
  return (
    <a
      href={update.prUrl}
      target="_blank"
      className={`cell dependabot-update ${update.ecosystem} ${
        newest ? "newest" : ""
      }`}
      style={{ opacity }}
    >
      <IconContext.Provider
        value={{
          color: "#1b2834",
          className: "ecosystem-icon",
        }}
      >
        <EcosystemIcon ecosystem={update.ecosystem} />
      </IconContext.Provider>
      <div>
        <div className="dependency">{update.dependency}</div>
        <div className="versions">
          {update.fromVersion} → {update.toVersion}
        </div>
      </div>
      <div className="avatar">
        <img src={update.repoOwnerAvatarUrl} />
      </div>
    </a>
  );
}
