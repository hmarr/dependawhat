import {
  SiApachemaven,
  SiDart,
  SiDependabot,
  SiDocker,
  SiElixir,
  SiElm,
  SiGit,
  SiGithubactions,
  SiGo,
  SiGradle,
  SiJavascript,
  SiNuget,
  SiPhp,
  SiPython,
  SiRubygems,
  SiRust,
  SiTerraform,
} from "react-icons/si";
import { Ecosystem } from "./events";

function EcosystemIcon({ ecosystem }: { ecosystem: Ecosystem }) {
  switch (ecosystem) {
    case "bundler":
      return <SiRubygems />;
    case "cargo":
      return <SiRust />;
    case "composer":
      return <SiPhp />;
    case "docker":
      return <SiDocker />;
    case "elm":
      return <SiElm />;
    case "github_actions":
      return <SiGithubactions />;
    case "git_submodules":
      return <SiGit />;
    case "go_modules":
      return <SiGo />;
    case "gradle":
      return <SiGradle />;
    case "hex":
      return <SiElixir />;
    case "maven":
      return <SiApachemaven />;
    case "npm_and_yarn":
      return <SiJavascript />;
    case "nuget":
      return <SiNuget />;
    case "pub":
      return <SiDart />;
    case "pip":
      return <SiPython />;
    case "terraform":
      return <SiTerraform />;
    default:
      return <SiDependabot />;
  }
}

export default EcosystemIcon;
