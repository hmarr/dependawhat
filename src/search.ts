import { DependabotUpdate, Ecosystem } from "./dependabot-update";

interface SearchResult {
  items: SearchResultPullRequest[];
}
interface SearchResultPullRequest {
  id: string;
  body: string;
  title: string;
  html_url: string;
}

const SEARCH_URL = 'https://api.github.com/search/issues?q=author:app/dependabot&sort=created&order=desc&per_page=25';

export async function searchDependabotPrs(): Promise<DependabotUpdate[]> {
  const response = await fetch(SEARCH_URL);
  const data: SearchResult = await response.json();
  return data.items
    .map(pr => dependabotUpdateFromPR(pr))
    .filter((u): u is DependabotUpdate => u != null);
}

function dependabotUpdateFromPR(pr: SearchResultPullRequest): DependabotUpdate | null {
  // Hack to extract the ecosystem by looking in the query string of the compatibility
  // score badge url. Sometimes the badge is missing, so this means we miss a few events.
  const ecosystemMatch = pr.body.match(/package-manager=(\w+)/);
  if (!ecosystemMatch) {
    return null;
  }

  const dependencyMatch = pr.title.match(/bump ([^\s]+)/i);
  if (!dependencyMatch) {
    return null;
  }

  const versionsMatch = pr.title.match(/from ([^\s]+) to ([^\s]+)/i);
  if (!versionsMatch) {
    return null;
  }

  const [_, repoOwner, repoName] = new URL(pr.html_url).pathname.split('/');
  const nwo = [repoOwner, repoName].join('/');

  return {
    id: pr.id,
    repo: nwo,
    repoOwner,
    repoOwnerAvatarUrl: `https://github.com/${encodeURIComponent(
      repoOwner
    )}.png?s=50`,
    ecosystem: ecosystemMatch[1] as Ecosystem,
    dependency: dependencyMatch[1],
    fromVersion: versionsMatch[1],
    toVersion: versionsMatch[2],
    title: pr.title,
    prUrl: pr.html_url,
  };
}