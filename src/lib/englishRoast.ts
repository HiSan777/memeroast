import type { PersonalityId } from "@/config/personalities";

export type EnglishRoastOutput = {
  caption: string;
  memeDescription: string;
};

type RoastMode = "preview" | "final";
type PromptTopic =
  | "airdrop"
  | "gas"
  | "image"
  | "leverage"
  | "market"
  | "nft"
  | "portfolio"
  | "rug"
  | "wallet";

const blockedPhrases = [
  "ghosts its own transactions",
  "empty portfolio",
  "asks for gas",
  "this wallet is so empty",
  "final cut: roasted",
  "ready for timeline violence",
];

const topicSetups: Record<PromptTopic, string[]> = {
  wallet: [
    "This wallet has whale confidence with shrimp liquidity",
    "Your transaction history looks like a true crime documentary for common sense",
    "This address entered Web3 for freedom and found exit liquidity with extra steps",
    "Your swaps have the accuracy of a blindfolded degen throwing darts at red candles",
    "This wallet treats risk management like optional DLC",
    "The balance is quiet, but the transaction history is screaming in lowercase",
    "Your wallet has the energy of a casino receipt pretending to be a financial plan",
    "This address moved like a genius and settled like a court case",
    "Your wallet is proof that on-chain transparency can still hide common sense",
    "This wallet did not find alpha; it found expensive character development",
    "Your address is one bad swap away from becoming educational content",
    "This wallet connects like a main character and trades like a caution label",
  ],
  portfolio: [
    "This portfolio applied for a job as a gas fee and still got rejected",
    "Your bags are so light even an airdrop would call them carry-on luggage",
    "This portfolio is not down bad, it is a liquidation museum with Wi-Fi",
    "Your PnL is so red it started giving financial advice to stop signs",
    "This stack is so thin even dust attacks are asking for collateral",
    "Your holdings got rugged so quietly the Discord mod forgot to mute chat",
    "This portfolio has more cope than capital and somehow less volume than both",
    "Your bags are not underwater, they are negotiating with the Mariana Trench",
    "These bags are so heavy the app needed two-factor depression",
    "Your portfolio has diamond hands and paper-thin decision making",
    "This stack is not diversified; it is a group project of bad ideas",
    "Your holdings are aging like milk in a leverage chat",
  ],
  market: [
    "Bitcoin did not crash, it rage-quit and took everyone's leverage with it",
    "That candle went red so fast the stop loss filed a missing person report",
    "The chart dumped like it found out everyone bought the top on speakerphone",
    "BTC sneezed and every overleveraged timeline prophet became a philosopher",
    "That wick is not market structure, it is a vertical eviction notice",
    "Bitcoin just turned diamond hands into jazz hands in one candle",
    "The chart did not correct, it sent a cease-and-desist to everyone's hopium",
    "BTC pulled a trapdoor and the leverage crowd discovered gravity",
    "That candle fell so hard it unlocked a new support level called prayer",
    "The market moved like it had insider information about your entry",
    "The candles formed a pattern called please stop trading",
    "Green candles gave the bulls hope, then red candles charged interest",
  ],
  image: [
    "This screenshot has the energy of someone typing bullish while deleting the app",
    "This image belongs in a museum exhibit called Confidence Before Liquidation",
    "The vibe here is not alpha, it is a portfolio autopsy with neon lighting",
    "This picture looks like conviction met a chart with no mercy and lost custody",
    "This screenshot is what hopium looks like five minutes before the margin call",
    "The screenshot says alpha, but the chart says unpaid internship",
    "This visual has premium degen energy and discount risk controls",
    "The picture is loud, the thesis is louder, and the PnL is hiding",
    "This screenshot belongs in a folder named before disaster",
    "The image is doing more due diligence than the trader did",
  ],
  gas: [
    "Your gas fee had more ambition than the actual trade",
    "This wallet paid network fees like it was funding a small nation",
    "The gas meter saw your transaction and started charging emotional damages",
    "Your trade was so tiny the fee had to carry the entire plot",
    "This transaction spent premium gas to arrive at a discount mistake",
    "The fee was the main character and the swap was just background noise",
    "Your wallet treats gas like a luxury tax on bad decisions",
    "That transaction paid first-class gas for economy-class alpha",
  ],
  leverage: [
    "Your leverage was so high the liquidation price could hear you breathing",
    "This position had more red flags than a hacked bridge announcement",
    "The stop loss saw this trade and resigned before market open",
    "You opened 100x like sleep and risk management were optional side quests",
    "This trade went from conviction to liquidation faster than a KOL apology",
    "Your margin level had the structural integrity of a meme coin roadmap",
    "The exchange did not liquidate you; it performed a mercy uninstall",
    "This position was not trading, it was financial parkour without shoes",
  ],
  nft: [
    "Your NFT bag has museum confidence and floor-price trauma",
    "This JPEG collection aged like milk in a Discord announcement channel",
    "Your NFT thesis is carrying culture while liquidity left through the back door",
    "The floor price did not fall; it entered witness protection",
    "This bag is so illiquid even the metadata stopped responding",
    "Your JPEGs have diamond hands because nobody is bidding",
    "The collection said community, but the chart said abandoned group chat",
    "Your NFT bag sounds less tragic if we call it historical evidence",
  ],
  airdrop: [
    "Your airdrop farming has the stamina of a marathon and the payout of a vending machine",
    "This wallet clicked every quest and still got rewarded like a background extra",
    "The eligibility checker saw your effort and chose violence",
    "Your sybil score is doing burpees while the allocation stays microscopic",
    "This farm had more transactions than profit and called it strategy",
    "The airdrop did not miss you; it professionally ignored you",
    "You bridged, minted, swapped, begged, and still got confetti dust",
    "This wallet farmed so hard the faucet started unionizing",
  ],
  rug: [
    "This token did not rug, it performed a full Broadway exit scam",
    "Your entry became exit liquidity with premium onboarding",
    "The roadmap had more fiction than a bear-market whitepaper",
    "Liquidity left the pool like it had a flight to catch",
    "The founder wallet moved and your portfolio learned new vocabulary",
    "This chart did not dump; it deleted the group chat with candles",
    "The tokenomics said sustainable while the deployer practiced disappearing",
    "Your bags got rugged so cleanly even the block explorer looked impressed",
  ],
};

const topicPunchlines: Record<PromptTopic, string[]> = {
  wallet: [
    "Even the block explorer checked twice and whispered bro.",
    "The transaction succeeded and the strategy failed.",
    "The nonce advanced, but the life lessons stayed pending.",
    "Somewhere, a hardware wallet just locked itself for safety.",
    "Even MEV bots looked at it and chose compassion.",
    "The mempool saw it early and chose silence.",
    "The wallet connected, and profit disconnected.",
    "Somewhere a faucet refused to enable this behavior.",
  ],
  portfolio: [
    "The portfolio tracker opened and immediately needed a wellness check.",
    "At least the losses are fully decentralized.",
    "The only thing compounding here is regret.",
    "Your average entry is now a historical landmark.",
    "The watchlist has more upside than the holdings.",
    "The bags are light, but the emotional damage has market cap.",
    "Even the tax software asked if this was a prank.",
    "The spreadsheet flinched before the chart loaded.",
  ],
  market: [
    "Leverage got humbled in 4K.",
    "Everyone became a long-term investor at the exact same second.",
    "The liquidation bot ate like it had reservations.",
    "Hopium got margin-called before lunch.",
    "The chart chose violence and the timeline chose cope.",
    "Support broke faster than a roadmap promise.",
    "The order book looked away out of respect.",
    "Liquidity left the room and locked the door.",
  ],
  image: [
    "The reaction says bullish, the chart says lawyer up.",
    "Even the pixels look overleveraged.",
    "The meme is already doing better risk management than the trader.",
    "This belongs on X before common sense wakes up.",
    "The chart is the main character and the trader is the plot twist.",
    "The vibes are immaculate and the execution is criminal.",
    "This screenshot needs less confidence and more stop loss.",
    "The image has more conviction than the wallet has funds.",
  ],
  gas: [
    "The fee ate first and left the portfolio crumbs.",
    "That was not a transaction, that was a donation to infrastructure.",
    "The swap got a cameo while gas took the headline role.",
    "Even the validator sent a thank-you note.",
    "Your wallet paid cover charge to enter the wrong club.",
    "The receipt is greener than the PnL.",
    "That fee had better fundamentals than the asset.",
    "Gas did the only profitable trade in the room.",
  ],
  leverage: [
    "The liquidation bot ate like it was sponsored.",
    "Risk management left the group chat before entry.",
    "That candle turned confidence into downloadable trauma.",
    "The chart did not move against you; it filed a restraining order.",
    "Your collateral got speedran by gravity.",
    "The margin call arrived with main-character energy.",
    "The exchange turned your thesis into confetti.",
    "This was not alpha; it was a stress test for your notification settings.",
  ],
  nft: [
    "The floor is not low; it is underground with utilities.",
    "Even OpenSea needed a moment of silence.",
    "The rarity score is doing more work than the liquidity.",
    "Your best trait is still denial.",
    "The holder count is stable because nobody can leave.",
    "That JPEG is now a long-term relationship by force.",
    "The metadata has more upside than the bid wall.",
    "The community is strong because everyone is trapped together.",
  ],
  airdrop: [
    "The allocation arrived wearing a microscope.",
    "Eligibility said yes, generosity said absolutely not.",
    "The reward was so small the gas fee started laughing.",
    "Your wallet did cardio for a participation sticker.",
    "The farm produced vibes, dust, and tax complexity.",
    "Sybil detection found your soul before the token did.",
    "The claim button did more emotional damage than the bear market.",
    "You farmed like a whale and got fed like plankton.",
  ],
  rug: [
    "The liquidity pool left faster than alpha in a public Discord.",
    "The deployer wallet had cleaner exits than your trading plan.",
    "Even the chart looked embarrassed by the angle.",
    "The audit was vibes, the exploit was punctual.",
    "The community stayed strong because the sell button disappeared.",
    "Your stop loss could not save you from marketing.",
    "The candle did not fall; it evacuated.",
    "The whitepaper should have been filed under comedy.",
  ],
};

const personalitySpice: Record<PersonalityId, string[]> = {
  chill: [
    "Softly, this is performance art with red candles.",
    "No panic, just beautifully organized financial embarrassment.",
    "Breathe in, breathe out, maybe stop clicking buy.",
  ],
  "crypto-degenerate": [
    "This is max-leverage clown math with a wallet connection.",
    "Degen energy detected, risk controls nowhere on-chain.",
    "The trade screamed ape-in and the exit whispered help.",
  ],
  "meme-lord": [
    "Post it before the timeline finds a better victim.",
    "This is not a loss, it is premium meme inventory.",
    "The caption is doing more ROI than the position.",
  ],
  "roast-master": [
    "Emotionally, this belongs in a liquidation courtroom.",
    "The blockchain is public, and sadly so are the choices.",
    "This wallet is not cooked; it is professionally flambed.",
  ],
};

const sceneSubjects: Record<PromptTopic, string[]> = {
  wallet: [
    "a cartoon trader staring at a glowing wallet with tiny balances and failed swap receipts",
    "a meme frog-inspired character holding a weightless wallet beside a skeptical block explorer",
    "an anxious chart reader surrounded by transaction hashes, warning labels, and falling candles",
    "a cyberpunk wallet terminal with red alerts, tiny green dots, and a trader in visible denial",
  ],
  portfolio: [
    "a burned-out portfolio vending machine dispensing cope instead of profit",
    "a sad chart reader holding feather-light bags while red candles rain through the ceiling",
    "a degen ape dragging oversized bags through a neon bear-market tunnel",
    "a tiny portfolio island sinking under red candle waves while one green candle hides nearby",
  ],
  market: [
    "a Bitcoin crash scene with red candles falling like meteors and liquidation alarms everywhere",
    "a neon trading desk where green hopium posters burn while the chart breaks support",
    "a shocked trader watching a giant red wick split the screen like a disaster movie",
    "a bull and bear tug-of-war over a glowing chart in a chaotic cyber arena",
  ],
  image: [
    "the uploaded image as the central reaction subject inside a clean crypto meme composition",
    "the uploaded image remixed as a dramatic trading screenshot reaction with chart chaos around it",
    "the uploaded image placed in a comic panel surrounded by wallet UI, candles, and reaction symbols",
    "the uploaded image as a social-post-ready reaction scene with no embedded caption text",
  ],
  gas: [
    "a giant gas meter eating tiny swap receipts in a dark neon trading room",
    "a wallet sitting at a luxury gas station while a trader counts dust balances",
    "a validator cash register glowing while the actual trade looks microscopic",
    "a cartoon receipt monster swallowing a small portfolio beside red and green candles",
  ],
  leverage: [
    "a liquidation casino with a trader at a 100x table and red candles as slot machines",
    "a margin call alarm tower flashing beside a collapsing chart and a panicked degen",
    "a rocket strapped to a tiny wallet crashing into a leverage warning sign",
    "a trader balancing on a red candle tightrope above a liquidation pit",
  ],
  nft: [
    "an NFT graveyard with glowing frames, empty bid signs, and a lonely collector",
    "a gallery of abandoned JPEG frames under neon lights with one tiny bid in the corner",
    "a cartoon collector hugging illiquid art while the floor price melts into red candles",
    "a pixel-art museum where every frame has culture but no buyers",
  ],
  airdrop: [
    "an airdrop lottery machine dropping microscopic tokens into a giant farming wallet",
    "a quest checklist longer than the reward with a tired trader holding dust",
    "a parachute dropping tiny tokens over a crowd of exhausted wallet farmers",
    "a neon eligibility scanner laughing at a wallet full of completed tasks",
  ],
  rug: [
    "a liquidity pool draining through a trapdoor while a trader holds a useless token bag",
    "a founder silhouette sprinting away from a neon roadmap while candles collapse",
    "a rug-shaped red candle pulling the floor from under a confused wallet",
    "a dark comedy token launch scene with empty liquidity, alerts, and shocked holders",
  ],
};

const recentCaptions: string[] = [];
const recentPunchlines: string[] = [];
const lastIndexByKey = new Map<string, number>();

export function createEnglishRoastPreview(
  personalityId: PersonalityId,
  hasImage: boolean,
  prompt = "",
): EnglishRoastOutput {
  return createFreshEnglishRoast({
    hasImage,
    mode: "preview",
    personalityId,
    prompt,
  });
}

export function createFreshEnglishRoast({
  hasImage,
  mode,
  personalityId,
  prompt,
}: {
  hasImage: boolean;
  mode: RoastMode;
  personalityId: PersonalityId;
  prompt: string;
}): EnglishRoastOutput {
  const cleanPrompt = ensureEnglishOnly(prompt.toLowerCase());
  const topic = getPromptTopic(cleanPrompt, hasImage);

  return {
    caption: buildCaption(topic, personalityId, mode),
    memeDescription: buildMemeDescription(topic, mode),
  };
}

export function ensureEnglishOnly(text: string) {
  return text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E]/g, "")
    .trim();
}

function buildCaption(
  topic: PromptTopic,
  personalityId: PersonalityId,
  mode: RoastMode,
) {
  const setup = pickNonRepeating(`${topic}:${mode}:setup`, topicSetups[topic]);
  const punchline = pickFreshPunchline(
    `${topic}:${personalityId}:${mode}:punchline`,
    topicPunchlines[topic],
  );
  const spice =
    mode === "final" && Math.random() > 0.38
      ? ` ${pickNonRepeating(`${personalityId}:spice`, personalitySpice[personalityId])}`
      : "";
  const connector = pickNonRepeating("connector", [".", ";", "."]);
  const caption = sanitizeText(`${setup}${connector} ${punchline}${spice}`);

  if (!recentCaptions.includes(caption)) {
    rememberCaption(caption);
    return caption;
  }

  const rerolled = sanitizeText(
    `${pickNonRepeating(`${topic}:${mode}:reroll`, topicSetups[topic])}. ${pickNonRepeating(
      `${topic}:${personalityId}:${mode}:reroll`,
      [...topicPunchlines[topic], ...personalitySpice[personalityId]],
    )}`,
  );

  rememberCaption(rerolled);
  return rerolled;
}

function buildMemeDescription(topic: PromptTopic, mode: RoastMode) {
  const subject = pickNonRepeating(`${topic}:subject`, sceneSubjects[topic]);
  const camera = pickNonRepeating("camera", [
    "square 1080x1080 social meme frame",
    "high-contrast X timeline meme composition",
    "polished poster-like meme visual",
    "clean editorial crypto meme scene",
    "dramatic close-up with readable shapes",
  ]);
  const style = pickNonRepeating("scene-style", [
    "dark neon palette with red and green chart elements",
    "cyberpunk crypto lighting with crisp vector-like shapes",
    "arcade-pixel accents mixed with modern neon UI",
    "comic panel energy with exaggerated facial expressions",
    "sharp meme-template composition with no embedded caption text",
  ]);
  const finish =
    mode === "final"
      ? "Final image should be sharp, varied, funny, and ready to post."
      : "Preview direction should be punchy and easy to understand.";

  return sanitizeText(`${camera} showing ${subject}, ${style}. ${finish}`);
}

function getPromptTopic(prompt: string, hasImage: boolean): PromptTopic {
  if (hasImage || prompt.includes("image") || prompt.includes("screenshot")) {
    return "image";
  }

  if (matches(prompt, ["airdrop", "faucet", "farm", "quest", "eligible", "sybil"])) {
    return "airdrop";
  }

  if (matches(prompt, ["gas", "fee", "fees", "transaction cost"])) {
    return "gas";
  }

  if (matches(prompt, ["leverage", "liquidation", "margin", "100x", "long", "short"])) {
    return "leverage";
  }

  if (matches(prompt, ["nft", "jpeg", "floor", "mint", "metadata", "pfp"])) {
    return "nft";
  }

  if (matches(prompt, ["rug", "scam", "fud", "founder", "liquidity pool", "unlock"])) {
    return "rug";
  }

  if (matches(prompt, ["portfolio", "bag", "bags", "empty", "pnl", "holding", "holdings"])) {
    return "portfolio";
  }

  if (matches(prompt, ["bitcoin", "btc", "eth", "crash", "chart", "candle", "market", "dump", "pump"])) {
    return "market";
  }

  return "wallet";
}

function matches(prompt: string, keywords: string[]) {
  return keywords.some((keyword) => prompt.includes(keyword));
}

function pickNonRepeating(key: string, items: string[]) {
  if (items.length === 1) {
    return items[0];
  }

  const lastIndex = lastIndexByKey.get(key);
  let nextIndex = Math.floor(Math.random() * items.length);

  if (nextIndex === lastIndex) {
    nextIndex =
      (nextIndex + 1 + Math.floor(Math.random() * (items.length - 1))) %
      items.length;
  }

  lastIndexByKey.set(key, nextIndex);
  return items[nextIndex];
}

function rememberCaption(caption: string) {
  recentCaptions.unshift(caption);
  recentCaptions.splice(80);
}

function pickFreshPunchline(key: string, items: string[]) {
  const freshItems = items.filter((item) => !recentPunchlines.includes(item));
  const punchline = pickNonRepeating(key, freshItems.length > 0 ? freshItems : items);

  recentPunchlines.unshift(punchline);
  recentPunchlines.splice(16);

  return punchline;
}

function sanitizeText(text: string) {
  let sanitized = ensureEnglishOnly(text)
    .replace(/\s+/g, " ")
    .replace(/\s+([,.!?;])/g, "$1");

  for (const phrase of blockedPhrases) {
    sanitized = sanitized.replace(new RegExp(escapeRegExp(phrase), "gi"), "");
  }

  return sanitized.replace(/\s+/g, " ").trim();
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
