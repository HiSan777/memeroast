export type PersonalityId =
  | "roast-master"
  | "meme-lord"
  | "crypto-degenerate"
  | "chill";

export type Personality = {
  id: PersonalityId;
  name: string;
  description: string;
  accentClass: string;
};

export const personalities: Personality[] = [
  {
    id: "roast-master",
    name: "Roast Master",
    description: "Profile burns with spicy timing.",
    accentClass: "border-pink-300/70 bg-pink-300/12",
  },
  {
    id: "meme-lord",
    name: "Meme Lord",
    description: "Image chaos and viral formats.",
    accentClass: "border-lime-300/70 bg-lime-300/12",
  },
  {
    id: "crypto-degenerate",
    name: "Crypto Degenerate",
    description: "Market jokes with max leverage energy.",
    accentClass: "border-cyan-300/70 bg-cyan-300/12",
  },
  {
    id: "chill",
    name: "Chill Girl",
    description: "Soft captions, clean social punchlines.",
    accentClass: "border-violet-300/70 bg-violet-300/12",
  },
];

