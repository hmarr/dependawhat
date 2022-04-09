export type Ecosystem = "bundler"
  | "cargo"
  | "composer"
  | "docker"
  | "elm"
  | "github_actions"
  | "git_submodules"
  | "go_modules"
  | "gradle"
  | "hex"
  | "maven"
  | "npm_and_yarn"
  | "nuget"
  | "pub"
  | "pip"
  | "terraform"

export interface DependabotUpdate {
  id: string;
  repo: string;
  repoOwner: string;
  repoOwnerAvatarUrl: string;
  ecosystem: Ecosystem;
  dependency: string;
  fromVersion: string;
  toVersion: string;
  title: string;
  prUrl: string;
}