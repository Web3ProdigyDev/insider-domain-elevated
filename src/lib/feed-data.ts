import type { Member } from "./placeholder-data";

export type FeedComment = {
  id: string;
  author: string;
  handle: string;
  body: string;
  date: string;
};

export type FeedPost = {
  id: string;
  author: string;
  handle: string;
  tier: Member["tier"];
  date: string;
  body: string;
  likes: number;
  liked: boolean;
  comments: FeedComment[];
};

export const feedPosts: FeedPost[] = [
  {
    id: "p1",
    author: "E. Sørensen",
    handle: "@sorensen",
    tier: "Founding",
    date: "18m ago",
    body: "Rotated a third of my simulated BTC weight into tokenised gold this morning. Not conviction — just discipline. The drift was getting loud.",
    likes: 14,
    liked: false,
    comments: [
      {
        id: "c1",
        author: "K. Nakamura",
        handle: "@nakamura",
        body: "Same read. I trimmed at the same level, kept the rest untouched.",
        date: "12m ago",
      },
      {
        id: "c2",
        author: "A. Marchetti",
        handle: "@marchetti",
        body: "Sensible. Rebalancing beats prediction in every simulation I've run here.",
        date: "6m ago",
      },
    ],
  },
  {
    id: "p2",
    author: "K. Nakamura",
    handle: "@nakamura",
    tier: "Private",
    date: "2h ago",
    body: "Quiet observation: the majors are moving together again. Correlation this tight usually means the room is positioned the same way.",
    likes: 26,
    liked: true,
    comments: [
      {
        id: "c3",
        author: "R. Adeyemi",
        handle: "@adeyemi",
        body: "Which is exactly when it stops working.",
        date: "1h ago",
      },
    ],
  },
  {
    id: "p3",
    author: "R. Adeyemi",
    handle: "@adeyemi",
    tier: "Invited",
    date: "Yesterday",
    body: "First month inside. The absence of noise is the feature. No leaderboards, no confetti, no one shouting a price target.",
    likes: 41,
    liked: false,
    comments: [],
  },
];
