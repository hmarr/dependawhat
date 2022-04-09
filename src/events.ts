import { DependabotUpdate, Ecosystem } from "./dependabot-update";

interface GitHubEvent {
  id: string;
  type: string;
  repo: {
    name: string;
  };
  payload?: {
    action: string;
    pull_request?: {
      id: number;
      body: string;
      title: string;
      html_url: string;
    };
  };
  actor?: {
    login: string;
  };
}

const GITHUB_EVENT_STREAM_URL = 'https://github-firehose.libraries.io/events';

export function subscribe(callback: (update: DependabotUpdate) => void): () => void {
  const source = new EventSource(GITHUB_EVENT_STREAM_URL);
  const listener = (rawEvent: MessageEvent) => {
    const ghEvent = JSON.parse(rawEvent.data) as GitHubEvent;
    const update = dependabotUpdateFromEvent(ghEvent);
    if (!update) {
      return;
    }

    callback(update);
  };
  source.addEventListener('event', listener);
  return () => source.removeEventListener('event', listener);
}

function dependabotUpdateFromEvent(event: GitHubEvent): DependabotUpdate | null {
  if (event.type !== 'PullRequestEvent') {
    return null;
  }
  if (event.payload?.action !== 'opened') {
    return null;
  }
  if (event.actor?.login !== 'dependabot[bot]') {
    return null;
  }

  const pr = event.payload!.pull_request!;

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

  return {
    id: pr.id.toString(),
    repo: event.repo.name,
    repoOwner: event.repo.name.split('/')[0],
    repoOwnerAvatarUrl: `https://github.com/${encodeURIComponent(
      event.repo.name.split('/')[0]
    )}.png?s=50`,
    ecosystem: ecosystemMatch[1] as Ecosystem,
    dependency: dependencyMatch[1],
    fromVersion: versionsMatch[1],
    toVersion: versionsMatch[2],
    title: pr.title,
    prUrl: pr.html_url,
  };
}