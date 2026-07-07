import type { PersonalityId } from "@/config/personalities";

export type GeneratedMemeImage = {
  dataUrl: string;
  prompt: string;
  provider: "mock-flux" | "real-image-api";
  seed: number;
  template: string;
  assetUrl?: string;
  contentHash?: string;
  ipfsCid?: string;
  storageProvider?: "cloudinary" | "ipfs" | "provider-url";
};

type MemeImageRequest = {
  caption: string;
  memeDescription: string;
  personalityId: PersonalityId;
  sourceImageDataUrl?: string;
};

const paletteByPersonality: Record<
  PersonalityId,
  { accent: string; glow: string; mid: string; name: string }
> = {
  "roast-master": {
    accent: "#fb7185",
    glow: "#f43f5e",
    mid: "#3f1d3b",
    name: "ROAST MASTER",
  },
  "meme-lord": {
    accent: "#bef264",
    glow: "#84cc16",
    mid: "#164e63",
    name: "MEME LORD",
  },
  "crypto-degenerate": {
    accent: "#22d3ee",
    glow: "#06b6d4",
    mid: "#312e81",
    name: "MAX LEVERAGE",
  },
  chill: {
    accent: "#c084fc",
    glow: "#a855f7",
    mid: "#064e3b",
    name: "CHILL MODE",
  },
};

const imageCharacters = [
  "cartoon crypto trader",
  "meme frog-inspired crypto trader",
  "degen ape trader",
  "anxious chart reader",
  "gigachad holder",
  "sleep-deprived wallet watcher",
  "pixel art gas fee victim",
  "cyberpunk liquidation bot",
  "diamond-hands trader made of cracked glass",
  "paper-hands trader dropping token bags",
  "tiny wallet warrior fighting giant candles",
  "bear-market ramen chef",
  "airdrop farmer with a microscope reward",
  "NFT collector in an abandoned neon gallery",
];

const imageEmotions = [
  "dramatic tears",
  "laughing through tears",
  "panicking at the chart",
  "dead inside stare",
  "overly confident grin",
  "confused but bullish expression",
  "forced diamond-hand smile",
  "thousand-yard bear-market stare",
  "villainous degen confidence",
  "quietly devastated but still posting",
];

const imageBackgrounds = [
  "glowing red candles",
  "burning portfolio screen",
  "rocket crashing behind a trading desk",
  "green chart screen melting into red candles",
  "neon wallet dashboard",
  "gas fee meter exploding",
  "pixel art exchange terminal",
  "cyberpunk city made of candlesticks",
  "liquidation casino floor",
  "NFT graveyard with neon frames",
  "ramen desk beside a collapsing chart",
  "airdrop lottery machine dropping tiny tokens",
  "rug-pull stage with a vanishing liquidity pool",
  "bull versus bear arena with hologram charts",
];

const imageStyles = [
  "high contrast cyber meme style",
  "clean vector-like cartoon composition",
  "dark neon trading room",
  "viral square social meme artwork",
  "sharp arcade poster lighting",
  "bold crypto dashboard aesthetic",
  "pixel art meme poster",
  "comic panel chaos",
  "neon noir social poster",
  "clean 3D sticker-like cartoon",
  "retro vaporwave market panic",
  "high-energy cyberpunk sticker pack",
  "bold editorial meme cover",
];

const imageTemplates = [
  {
    id: "rocket-crash",
    prompt: "rocket crash chart meme, diagonal motion, neon smoke trail",
  },
  {
    id: "gas-meter",
    prompt: "gas fee meter meme, dashboard gauge, panic UI",
  },
  {
    id: "burning-portfolio",
    prompt: "burning portfolio screen, terminal panels, orange glow",
  },
  {
    id: "moon-chart",
    prompt: "moon shot chart meme, huge pump arrow, glowing crypto moon",
  },
  {
    id: "pixel-arcade",
    prompt: "pixel art crypto arcade, blocky trader, retro candles",
  },
  {
    id: "cyberpunk-desk",
    prompt: "cyberpunk trading desk, neon city, hologram candles",
  },
  {
    id: "comic-panel",
    prompt: "comic panel meme layout, bold shapes, shocked crypto character",
  },
  {
    id: "glitch-terminal",
    prompt: "glitch terminal meme, corrupted chart panels, electric colors",
  },
  {
    id: "liquidation-casino",
    prompt: "liquidation casino, slot machine candles, degen at 100x table",
  },
  {
    id: "nft-graveyard",
    prompt: "NFT graveyard, empty bid signs, neon gallery frames",
  },
  {
    id: "ramen-desk",
    prompt: "bear market ramen desk, tiny wallet, red chart monitor",
  },
  {
    id: "airdrop-lottery",
    prompt: "airdrop lottery machine, microscopic tokens, exhausted farmer",
  },
  {
    id: "split-screen-duel",
    prompt: "bull versus bear split screen duel, green and red chart chaos",
  },
  {
    id: "wallet-xray",
    prompt: "wallet x-ray scanner, transparent balance vault, neon warning shapes",
  },
  {
    id: "mempool-subway",
    prompt: "mempool subway station, pending transactions, cyberpunk motion blur",
  },
  {
    id: "timeline-storm",
    prompt: "social timeline storm, viral post cards, candles raining through notifications",
  },
  {
    id: "profit-funeral",
    prompt: "profit funeral scene, tiny portfolio coffin, neon candles and dramatic spotlight",
  },
  {
    id: "bridge-hack",
    prompt: "bridge hack alarm room, broken portal, warning lights, chaotic crypto UI",
  },
  {
    id: "meme-factory",
    prompt: "meme factory assembly line, conveyor belt of charts, clean cartoon machinery",
  },
] as const;

export async function generateMemeImage(
  request: MemeImageRequest,
): Promise<GeneratedMemeImage> {
  const seed = createImageSeed();
  const template = pickFromSeed(imageTemplates, seed, 6);
  const prompt = buildImagePrompt(request, seed, template);

  // Production replacement point:
  // Call a server-side route that talks to Grok Image, Flux, Gemini image, or
  // another provider. Keep API keys server-only, upload the generated image to
  // IPFS, then return an HTTPS/IPFS URL instead of this SVG data URL.
  const realImage = await tryGenerateRealImage(prompt, seed);

  if (realImage) {
    return {
      assetUrl: realImage.assetUrl,
      contentHash: realImage.contentHash,
      dataUrl: realImage.dataUrl,
      prompt,
      provider: "real-image-api",
      ipfsCid: realImage.ipfsCid,
      seed,
      storageProvider: realImage.storageProvider,
      template: template.id,
    };
  }

  await new Promise((resolve) => setTimeout(resolve, 950));

  return {
    dataUrl: renderMockFluxImage(request, seed, template.id),
    prompt,
    provider: "mock-flux",
    seed,
    template: template.id,
  };
}

async function tryGenerateRealImage(prompt: string, seed: number) {
  try {
    const response = await fetch("/api/generate-image", {
      body: JSON.stringify({ prompt, seed }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });

    if (!response.ok) {
      return undefined;
    }

    const result = (await response.json()) as {
      contentHash?: string;
      imageUrl?: string;
      ipfsCid?: string;
      storageProvider?: "cloudinary" | "ipfs" | "provider-url";
    };

    if (!result.imageUrl) {
      return undefined;
    }

    return {
      assetUrl: result.imageUrl,
      contentHash: result.contentHash,
      dataUrl: result.imageUrl,
      ipfsCid: result.ipfsCid,
      storageProvider: result.storageProvider ?? "provider-url",
    };
  } catch {
    return undefined;
  }
}

function buildImagePrompt({
  sourceImageDataUrl,
}: MemeImageRequest, seed: number, template: (typeof imageTemplates)[number]) {
  const sourceHint = sourceImageDataUrl
    ? "Use the uploaded image as a stylized reaction subject."
    : `Create an original ${pickFromSeed(imageCharacters, seed, 1)}.`;
  const emotion = pickFromSeed(imageEmotions, seed, 2);
  const background = pickFromSeed(imageBackgrounds, seed, 3);
  const style = pickFromSeed(imageStyles, seed, 4);

  return [
    sourceHint,
    `Emotion: ${emotion}.`,
    `Scene: ${background}.`,
    `Style: ${style}.`,
    `Template: ${template.prompt}.`,
    "High quality funny crypto meme illustration, dark neon background, sharp details, high contrast, expressive character, chart elements, layered composition, cinematic lighting, clean symbol-only composition. Caption text is handled outside the image.",
    `Variation seed: ${seed}.`,
  ].join(" ");
}

function renderMockFluxImage({
  personalityId,
  sourceImageDataUrl,
}: MemeImageRequest, seed: number, templateId: string) {
  const palette = paletteByPersonality[personalityId];
  const accentTwo = pickFromSeed(["#22c55e", "#f472b6", "#22d3ee", "#bef264"], seed, 5);
  const faceShift = createSeededNumber(seed, 23, -12, 12);
  const sourceImage = sourceImageDataUrl ? escapeXml(sourceImageDataUrl) : undefined;
  const scene = buildDistinctTemplateScene({
    accentTwo,
    faceShift,
    palette,
    seed,
    sourceImage,
    templateId,
  });

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080">
  <defs>
    <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="${pickFromSeed(["#050505", "#020617", "#111827", "#120817"], seed, 7)}"/>
      <stop offset="0.52" stop-color="${palette.mid}"/>
      <stop offset="1" stop-color="${pickFromSeed(["#09090b", "#0f172a", "#1f1235", "#001b22"], seed, 8)}"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="20%" r="65%">
      <stop offset="0" stop-color="${palette.glow}" stop-opacity="0.52"/>
      <stop offset="0.55" stop-color="${palette.glow}" stop-opacity="0.10"/>
      <stop offset="1" stop-color="${palette.glow}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="hotspot" cx="${30 + (seed % 45)}%" cy="${18 + (seed % 35)}%" r="58%">
      <stop offset="0" stop-color="${accentTwo}" stop-opacity="0.38"/>
      <stop offset="0.45" stop-color="${accentTwo}" stop-opacity="0.10"/>
      <stop offset="1" stop-color="${accentTwo}" stop-opacity="0"/>
    </radialGradient>
    <pattern id="grid" width="54" height="54" patternUnits="userSpaceOnUse">
      <path d="M54 0H0V54" fill="none" stroke="#ffffff" stroke-opacity="0.075" stroke-width="2"/>
    </pattern>
    <pattern id="scan" width="1080" height="14" patternUnits="userSpaceOnUse">
      <rect width="1080" height="2" fill="#ffffff" fill-opacity="0.045"/>
    </pattern>
    <filter id="grain" x="-20%" y="-20%" width="140%" height="140%">
      <feTurbulence type="fractalNoise" baseFrequency="0.82" numOctaves="3" seed="${seed % 97}" result="noise"/>
      <feColorMatrix in="noise" type="saturate" values="0"/>
      <feComponentTransfer>
        <feFuncA type="table" tableValues="0 0.18"/>
      </feComponentTransfer>
    </filter>
    <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="26" stdDeviation="28" flood-color="#000000" flood-opacity="0.52"/>
    </filter>
    <filter id="neon">
      <feDropShadow dx="0" dy="0" stdDeviation="8" flood-color="${palette.glow}" flood-opacity="0.85"/>
      <feDropShadow dx="0" dy="0" stdDeviation="18" flood-color="${accentTwo}" flood-opacity="0.32"/>
    </filter>
    <clipPath id="avatarClip"><rect x="0" y="0" width="1080" height="1080" rx="0"/></clipPath>
  </defs>
  <rect width="1080" height="1080" fill="url(#bg)"/>
  <rect width="1080" height="1080" fill="url(#glow)"/>
  <rect width="1080" height="1080" fill="url(#hotspot)"/>
  ${buildAtmosphere(seed, palette, accentTwo)}
  ${scene}
  ${buildForegroundPolish(seed, palette, accentTwo)}
</svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function buildDistinctTemplateScene({
  accentTwo,
  faceShift,
  palette,
  seed,
  sourceImage,
  templateId,
}: {
  accentTwo: string;
  faceShift: number;
  palette: { accent: string; glow: string; mid: string; name: string };
  seed: number;
  sourceImage?: string;
  templateId: string;
}) {
  const offset = createSeededNumber(seed, 41, -46, 46);
  const character = sourceImage
    ? `<image href="${sourceImage}" x="640" y="250" width="290" height="290" preserveAspectRatio="xMidYMid slice" opacity="0.92"/>`
    : buildTemplateCharacter({
        accentTwo,
        faceShift,
        palette,
        scale: 1.24,
        templateId,
        x: 650 + createSeededNumber(seed, 77, -55, 45),
        y: 248 + createSeededNumber(seed, 79, -40, 40),
      });

  if (templateId === "rocket-crash") {
    return `<g filter="url(#softShadow)">
      <circle cx="${830 + offset}" cy="${190 - offset}" r="142" fill="${accentTwo}" fill-opacity="0.18" stroke="${accentTwo}" stroke-width="10"/>
      <path d="M70 880 C250 735 380 658 535 540 S755 345 958 188" fill="none" stroke="#ef4444" stroke-width="34" stroke-linecap="round" stroke-dasharray="36 22"/>
      <path d="M688 ${322 + offset} L905 ${442 + offset} L718 ${566 + offset} Z" fill="${palette.accent}" stroke="#ffffff" stroke-opacity="0.28" stroke-width="10"/>
      <path d="M642 ${480 + offset} C520 ${590 + offset} 320 ${660 + offset} 154 ${842 + offset}" fill="none" stroke="#f97316" stroke-width="44" stroke-linecap="round"/>
      <circle cx="162" cy="${845 + offset}" r="72" fill="#ef4444" fill-opacity="0.72"/>
      <circle cx="260" cy="${770 + offset}" r="44" fill="#facc15" fill-opacity="0.82"/>
      <g opacity="0.55">${buildLooseCandles(seed, 130, 740, 16, palette.accent, accentTwo)}</g>
      ${character}
    </g>`;
  }

  if (templateId === "gas-meter") {
    return `<g filter="url(#softShadow)">
      <circle cx="540" cy="540" r="390" fill="#020617" fill-opacity="0.70" stroke="${palette.accent}" stroke-width="12"/>
      <path d="M228 666 A330 330 0 0 1 852 666" fill="none" stroke="#ef4444" stroke-width="58" stroke-linecap="round"/>
      <path d="M302 614 A240 240 0 0 1 778 614" fill="none" stroke="${accentTwo}" stroke-width="38" stroke-linecap="round" opacity="0.75"/>
      <path d="M540 672 L812 ${412 + offset}" stroke="#facc15" stroke-width="32" stroke-linecap="round"/>
      <circle cx="540" cy="672" r="62" fill="${palette.accent}" stroke="#ffffff" stroke-opacity="0.32" stroke-width="8"/>
      <g opacity="0.50">${buildLooseCandles(seed, 70, 880, 20, "#ef4444", accentTwo)}</g>
      <g transform="translate(-130 70) scale(0.88)">${character}</g>
    </g>`;
  }

  if (templateId === "burning-portfolio") {
    return `<g filter="url(#softShadow)">
      <rect x="120" y="165" width="610" height="480" rx="34" fill="#111827" stroke="#f97316" stroke-width="12"/>
      <rect x="165" y="220" width="510" height="52" rx="14" fill="${palette.accent}" fill-opacity="0.26"/>
      <path d="M180 344 H650 M180 420 H520 M180 496 H600" stroke="#ef4444" stroke-width="26" stroke-linecap="round"/>
      <path d="M126 760 C220 590 310 805 405 640 S570 570 710 792" fill="none" stroke="#f97316" stroke-width="42" stroke-linecap="round"/>
      <path d="M212 822 C290 670 356 850 446 700 S604 638 790 870" fill="none" stroke="#facc15" stroke-width="28" stroke-linecap="round" opacity="0.78"/>
      <circle cx="${270 + offset}" cy="775" r="58" fill="#ef4444" fill-opacity="0.62"/>
      <g transform="translate(40 60)">${character}</g>
    </g>`;
  }

  if (templateId === "moon-chart") {
    return `<g filter="url(#softShadow)">
      <circle cx="${752 + offset}" cy="${264 - offset}" r="188" fill="${accentTwo}" fill-opacity="0.28" stroke="${accentTwo}" stroke-width="14"/>
      <path d="M110 806 L240 650 L346 714 L484 476 L620 560 L800 286" fill="none" stroke="#22c55e" stroke-width="44" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M710 288 L810 282 L774 378" fill="none" stroke="#22c55e" stroke-width="44" stroke-linecap="round" stroke-linejoin="round"/>
      <g opacity="0.45">${buildLooseCandles(seed, 80, 900, 14, "#22c55e", palette.accent)}</g>
      <g transform="translate(-80 150) scale(1.08)">${character}</g>
    </g>`;
  }

  if (templateId === "pixel-arcade") {
    return `<g filter="url(#softShadow)" shape-rendering="crispEdges">
      ${Array.from({ length: 144 })
        .map((_, index) => {
          const x = (index % 12) * 90;
          const y = Math.floor(index / 12) * 90;
          const color = index % 5 === 0 ? palette.accent : index % 3 === 0 ? accentTwo : "#111827";
          return `<rect x="${x}" y="${y}" width="45" height="45" fill="${color}" fill-opacity="0.24"/>`;
        })
        .join("")}
      <rect x="94" y="132" width="520" height="350" fill="#020617" stroke="${accentTwo}" stroke-width="12"/>
      <rect x="144" y="202" width="80" height="210" fill="#ef4444"/>
      <rect x="264" y="262" width="80" height="150" fill="#22c55e"/>
      <rect x="384" y="172" width="80" height="240" fill="${palette.accent}"/>
      <rect x="136" y="744" width="810" height="92" fill="#020617" stroke="${palette.accent}" stroke-width="12"/>
      <g transform="translate(42 70) scale(1.25)">${character}</g>
    </g>`;
  }

  if (templateId === "cyberpunk-desk") {
    return `<g filter="url(#softShadow)">
      ${Array.from({ length: 17 })
        .map((_, index) => {
          const x = 24 + index * 62;
          const h = 160 + ((seed + index * 53) % 390);
          return `<rect x="${x}" y="${620 - h}" width="42" height="${h}" fill="${index % 2 ? palette.accent : accentTwo}" fill-opacity="0.25"/>`;
        })
        .join("")}
      <path d="M70 700 H1010 L900 930 H180 Z" fill="#020617" stroke="${accentTwo}" stroke-width="12"/>
      <rect x="145" y="250" width="430" height="300" rx="22" fill="#0f172a" stroke="${palette.accent}" stroke-width="10"/>
      <path d="M188 470 C255 345 320 520 392 365 S510 445 548 300" fill="none" stroke="${accentTwo}" stroke-width="20" stroke-linecap="round"/>
      <circle cx="250" cy="790" r="34" fill="#22d3ee"/>
      <circle cx="370" cy="790" r="34" fill="#ef4444"/>
      <circle cx="490" cy="790" r="34" fill="${palette.accent}"/>
      ${character}
    </g>`;
  }

  if (templateId === "comic-panel") {
    return `<g filter="url(#softShadow)">
      <path d="M0 0 H540 V540 H0 Z" fill="#ef4444" fill-opacity="0.34"/>
      <path d="M540 0 H1080 V540 H540 Z" fill="${palette.accent}" fill-opacity="0.28"/>
      <path d="M0 540 H540 V1080 H0 Z" fill="${accentTwo}" fill-opacity="0.22"/>
      <path d="M540 540 H1080 V1080 H540 Z" fill="#020617" fill-opacity="0.92"/>
      <path d="M540 0 V1080 M0 540 H1080" stroke="#ffffff" stroke-width="24" stroke-opacity="0.24"/>
      <circle cx="265" cy="${280 + offset}" r="150" fill="#020617" stroke="#facc15" stroke-width="16"/>
      <path d="M140 800 C255 690 360 890 510 730 S730 690 900 830" fill="none" stroke="#facc15" stroke-width="38" stroke-linecap="round"/>
      <g transform="translate(-20 20)">${character}</g>
    </g>`;
  }

  if (templateId === "liquidation-casino") {
    return `<g filter="url(#softShadow)">
      <path d="M0 0 H1080 V1080 H0 Z" fill="#16051f" fill-opacity="0.62"/>
      <circle cx="540" cy="520" r="330" fill="#020617" stroke="${palette.accent}" stroke-width="16"/>
      <rect x="165" y="190" width="270" height="470" rx="34" fill="#111827" stroke="#facc15" stroke-width="12"/>
      <rect x="460" y="190" width="270" height="470" rx="34" fill="#111827" stroke="#ef4444" stroke-width="12"/>
      <rect x="755" y="190" width="160" height="470" rx="34" fill="#111827" stroke="${accentTwo}" stroke-width="12"/>
      ${[0, 1, 2].map((index) => {
        const x = 205 + index * 292;
        const color = index === 0 ? "#22c55e" : index === 1 ? "#ef4444" : accentTwo;
        return `<circle cx="${x}" cy="${330 + offset}" r="58" fill="${color}" fill-opacity="0.72"/><rect x="${x - 48}" y="${450 + offset}" width="96" height="130" rx="14" fill="${color}" fill-opacity="0.56"/>`;
      }).join("")}
      <path d="M130 820 C260 720 380 900 520 760 S780 700 970 850" fill="none" stroke="#ef4444" stroke-width="38" stroke-linecap="round"/>
      <g transform="translate(-115 140) scale(0.92)">${character}</g>
    </g>`;
  }

  if (templateId === "nft-graveyard") {
    return `<g filter="url(#softShadow)">
      <path d="M0 700 C210 610 360 760 540 690 S820 580 1080 690 V1080 H0 Z" fill="#020617" fill-opacity="0.84"/>
      ${Array.from({ length: 7 }).map((_, index) => {
        const x = 80 + index * 135;
        const y = 220 + ((seed + index * 41) % 170);
        const color = index % 2 ? palette.accent : accentTwo;
        return `<rect x="${x}" y="${y}" width="105" height="150" rx="18" fill="#111827" stroke="${color}" stroke-width="8"/><path d="M${x + 22} ${y + 102} H${x + 84}" stroke="#ef4444" stroke-width="10" stroke-linecap="round"/><circle cx="${x + 52}" cy="${y + 58}" r="24" fill="${color}" fill-opacity="0.56"/>`;
      }).join("")}
      <path d="M130 765 H950" stroke="${palette.accent}" stroke-width="12" stroke-dasharray="22 18" opacity="0.52"/>
      <g transform="translate(-60 145) scale(0.98)">${character}</g>
    </g>`;
  }

  if (templateId === "ramen-desk") {
    return `<g filter="url(#softShadow)">
      <rect x="70" y="690" width="940" height="230" rx="28" fill="#1f2937" stroke="${accentTwo}" stroke-width="10"/>
      <rect x="120" y="240" width="470" height="340" rx="28" fill="#020617" stroke="#ef4444" stroke-width="10"/>
      <path d="M170 500 C245 360 320 545 402 395 S520 455 565 310" fill="none" stroke="#ef4444" stroke-width="22" stroke-linecap="round"/>
      <ellipse cx="278" cy="790" rx="150" ry="70" fill="#f97316" fill-opacity="0.72"/>
      <ellipse cx="278" cy="762" rx="128" ry="42" fill="#facc15" fill-opacity="0.88"/>
      <path d="M190 744 C230 704 280 798 322 736 S390 720 410 760" fill="none" stroke="#fff7ed" stroke-width="12" stroke-linecap="round"/>
      <g transform="translate(-25 60)">${character}</g>
    </g>`;
  }

  if (templateId === "airdrop-lottery") {
    return `<g filter="url(#softShadow)">
      <circle cx="520" cy="420" r="260" fill="#020617" stroke="${palette.accent}" stroke-width="14"/>
      <circle cx="520" cy="420" r="178" fill="${accentTwo}" fill-opacity="0.18" stroke="${accentTwo}" stroke-width="10"/>
      ${Array.from({ length: 18 }).map((_, index) => {
        const angle = (index / 18) * Math.PI * 2;
        const x = 520 + Math.cos(angle) * (180 + (index % 3) * 35);
        const y = 420 + Math.sin(angle) * (180 + (index % 3) * 35);
        const color = index % 3 === 0 ? "#22c55e" : index % 2 === 0 ? "#facc15" : palette.accent;
        return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${18 + (index % 4) * 4}" fill="${color}" fill-opacity="0.76"/>`;
      }).join("")}
      <path d="M240 760 H840 L770 910 H310 Z" fill="#111827" stroke="#facc15" stroke-width="12"/>
      <g transform="translate(-100 200) scale(0.88)">${character}</g>
    </g>`;
  }

  if (templateId === "split-screen-duel") {
    return `<g filter="url(#softShadow)">
      <path d="M0 0 H540 V1080 H0 Z" fill="#052e16" fill-opacity="0.74"/>
      <path d="M540 0 H1080 V1080 H540 Z" fill="#450a0a" fill-opacity="0.72"/>
      <path d="M540 0 V1080" stroke="#ffffff" stroke-width="18" stroke-opacity="0.20"/>
      <path d="M100 820 L210 610 L330 690 L460 430" fill="none" stroke="#22c55e" stroke-width="40" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M620 380 L735 560 L845 510 L990 805" fill="none" stroke="#ef4444" stroke-width="40" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="285" cy="300" r="128" fill="#22c55e" fill-opacity="0.18" stroke="#22c55e" stroke-width="12"/>
      <circle cx="805" cy="300" r="128" fill="#ef4444" fill-opacity="0.18" stroke="#ef4444" stroke-width="12"/>
      <g transform="translate(-95 95) scale(0.90)">${character}</g>
    </g>`;
  }

  if (templateId === "wallet-xray") {
    return `<g filter="url(#softShadow)">
      <rect x="115" y="150" width="850" height="690" rx="48" fill="#020617" fill-opacity="0.72" stroke="${palette.accent}" stroke-width="14"/>
      <rect x="175" y="210" width="410" height="520" rx="34" fill="${accentTwo}" fill-opacity="0.10" stroke="${accentTwo}" stroke-width="10"/>
      <path d="M225 330 H540 M225 420 H490 M225 510 H560 M225 600 H435" stroke="#ffffff" stroke-width="20" stroke-opacity="0.20" stroke-linecap="round"/>
      <circle cx="740" cy="380" r="168" fill="#020617" stroke="#22d3ee" stroke-width="12" filter="url(#neon)"/>
      <path d="M642 382 H838 M740 284 V480" stroke="${accentTwo}" stroke-width="18" stroke-linecap="round" opacity="0.82"/>
      <path d="M150 792 C305 690 435 850 580 725 S800 680 944 800" fill="none" stroke="#ef4444" stroke-width="34" stroke-linecap="round"/>
      <g transform="translate(-45 115) scale(0.96)">${character}</g>
    </g>`;
  }

  if (templateId === "mempool-subway") {
    return `<g filter="url(#softShadow)">
      <path d="M80 760 L1000 760 L890 980 H190 Z" fill="#020617" stroke="${accentTwo}" stroke-width="12"/>
      <path d="M120 250 H960 V650 H120 Z" fill="#111827" fill-opacity="0.88" stroke="${palette.accent}" stroke-width="12"/>
      ${Array.from({ length: 7 }).map((_, index) => {
        const x = 160 + index * 118;
        const color = index % 2 === 0 ? palette.accent : accentTwo;
        return `<rect x="${x}" y="${305 + (index % 2) * 38}" width="86" height="190" rx="16" fill="${color}" fill-opacity="0.18" stroke="${color}" stroke-width="8"/><path d="M${x + 16} ${560 + offset / 3} H${x + 70}" stroke="#facc15" stroke-width="10" stroke-linecap="round"/>`;
      }).join("")}
      <path d="M75 690 C240 610 350 720 500 620 S760 570 990 700" fill="none" stroke="${palette.accent}" stroke-width="30" stroke-linecap="round" stroke-dasharray="50 34"/>
      <g transform="translate(15 110)">${character}</g>
    </g>`;
  }

  if (templateId === "timeline-storm") {
    return `<g filter="url(#softShadow)">
      ${Array.from({ length: 8 }).map((_, index) => {
        const x = 80 + (index % 4) * 235 + createSeededNumber(seed, index + 10, -18, 18);
        const y = 110 + Math.floor(index / 4) * 250 + createSeededNumber(seed, index + 30, -28, 28);
        const color = index % 3 === 0 ? "#f472b6" : index % 2 === 0 ? accentTwo : palette.accent;
        return `<rect x="${x}" y="${y}" width="190" height="150" rx="24" fill="#020617" stroke="${color}" stroke-width="8"/><circle cx="${x + 42}" cy="${y + 42}" r="22" fill="${color}" fill-opacity="0.78"/><path d="M${x + 78} ${y + 40} H${x + 150} M${x + 34} ${y + 92} H${x + 160} M${x + 34} ${y + 118} H${x + 120}" stroke="#ffffff" stroke-opacity="0.18" stroke-width="12" stroke-linecap="round"/>`;
      }).join("")}
      <path d="M150 890 C290 740 430 930 560 760 S790 690 950 865" fill="none" stroke="#ef4444" stroke-width="38" stroke-linecap="round"/>
      <g transform="translate(-95 215) scale(0.86)">${character}</g>
    </g>`;
  }

  if (templateId === "profit-funeral") {
    return `<g filter="url(#softShadow)">
      <ellipse cx="540" cy="840" rx="390" ry="95" fill="#020617" stroke="${palette.accent}" stroke-width="10"/>
      <rect x="250" y="520" width="590" height="170" rx="28" fill="#111827" stroke="${accentTwo}" stroke-width="12"/>
      <path d="M300 520 L405 390 H700 L810 520" fill="#020617" stroke="${palette.accent}" stroke-width="12"/>
      <circle cx="540" cy="265" r="118" fill="${accentTwo}" fill-opacity="0.18" stroke="${accentTwo}" stroke-width="12" filter="url(#neon)"/>
      <path d="M335 730 C445 650 515 770 630 685 S795 650 900 760" fill="none" stroke="#f97316" stroke-width="28" stroke-linecap="round"/>
      <g opacity="0.50">${buildLooseCandles(seed, 110, 970, 17, "#ef4444", palette.accent)}</g>
      <g transform="translate(-80 105) scale(0.94)">${character}</g>
    </g>`;
  }

  if (templateId === "bridge-hack") {
    return `<g filter="url(#softShadow)">
      <circle cx="380" cy="430" r="190" fill="#020617" stroke="${palette.accent}" stroke-width="14"/>
      <circle cx="700" cy="430" r="190" fill="#020617" stroke="${accentTwo}" stroke-width="14"/>
      <path d="M530 430 H550" stroke="#facc15" stroke-width="42" stroke-linecap="round"/>
      <path d="M235 430 C330 300 430 560 520 430 S750 300 845 430" fill="none" stroke="#ef4444" stroke-width="28" stroke-dasharray="42 24" stroke-linecap="round"/>
      <rect x="128" y="700" width="824" height="170" rx="30" fill="#020617" stroke="#ef4444" stroke-width="12"/>
      <path d="M190 785 H360 M430 785 H605 M675 785 H890" stroke="${palette.accent}" stroke-width="18" stroke-linecap="round"/>
      <g transform="translate(-70 170) scale(0.90)">${character}</g>
    </g>`;
  }

  if (templateId === "meme-factory") {
    return `<g filter="url(#softShadow)">
      <path d="M70 735 H1010 V910 H70 Z" fill="#020617" stroke="${palette.accent}" stroke-width="12"/>
      ${Array.from({ length: 5 }).map((_, index) => {
        const x = 130 + index * 170;
        const color = index % 2 === 0 ? accentTwo : palette.accent;
        return `<circle cx="${x}" cy="824" r="48" fill="${color}" fill-opacity="0.22" stroke="${color}" stroke-width="10"/><rect x="${x - 62}" y="${470 + (index % 2) * 35}" width="124" height="160" rx="22" fill="#111827" stroke="${color}" stroke-width="8"/><path d="M${x - 36} ${560 + (index % 2) * 35} H${x + 36}" stroke="#ef4444" stroke-width="12" stroke-linecap="round"/>`;
      }).join("")}
      <path d="M170 340 C290 235 430 382 545 270 S735 265 895 350" fill="none" stroke="#facc15" stroke-width="26" stroke-linecap="round"/>
      <g transform="translate(-30 105)">${character}</g>
    </g>`;
  }

  return `<g filter="url(#softShadow)">
    ${Array.from({ length: 18 })
      .map((_, index) => {
        const y = 70 + index * 52;
        const w = 160 + ((seed + index * 67) % 730);
        const color = index % 3 === 0 ? "#ef4444" : index % 2 === 0 ? accentTwo : palette.accent;
        return `<rect x="${40 + ((seed + index * 29) % 140)}" y="${y}" width="${w}" height="20" rx="10" fill="${color}" fill-opacity="0.50"/>`;
      })
      .join("")}
    <rect x="110" y="185" width="520" height="650" rx="30" fill="#020617" stroke="${palette.accent}" stroke-width="10"/>
    <path d="M170 300 H560 M170 382 H445 M170 464 H530 M170 546 H390 M170 628 H590" stroke="${accentTwo}" stroke-width="22" stroke-linecap="round"/>
    <path d="M120 865 L250 770 L360 835 L470 720 L610 800" fill="none" stroke="#ef4444" stroke-width="30" stroke-linecap="round" stroke-linejoin="round"/>
    ${character}
  </g>`;
}

function buildAtmosphere(
  seed: number,
  palette: { accent: string; glow: string; mid: string; name: string },
  accentTwo: string,
) {
  const diagonal = seed % 2 === 0 ? "M-40 880 L1120 240" : "M-40 260 L1120 820";

  return `<g aria-hidden="true">
    <rect width="1080" height="1080" fill="url(#grid)"/>
    <rect width="1080" height="1080" filter="url(#grain)" opacity="0.48"/>
    <rect width="1080" height="1080" fill="url(#scan)" opacity="0.40"/>
    <path d="${diagonal}" stroke="${palette.accent}" stroke-width="4" stroke-opacity="0.28" stroke-dasharray="34 28"/>
    <path d="${seed % 2 === 0 ? "M-40 940 L1120 300" : "M-40 320 L1120 880"}" stroke="${accentTwo}" stroke-width="3" stroke-opacity="0.20" stroke-dasharray="18 28"/>
    ${Array.from({ length: 34 })
      .map((_, index) => {
        const x = 34 + ((seed * (index + 11)) % 1012);
        const y = 42 + ((seed * (index + 17)) % 996);
        const size = 3 + ((seed + index * 19) % 8);
        const color = index % 3 === 0 ? palette.accent : index % 2 === 0 ? accentTwo : "#ffffff";
        return `<circle cx="${x}" cy="${y}" r="${size}" fill="${color}" fill-opacity="${index % 4 === 0 ? "0.48" : "0.22"}"/>`;
      })
      .join("")}
    ${Array.from({ length: 8 })
      .map((_, index) => {
        const x = 72 + index * 132;
        const y = 88 + ((seed + index * 73) % 760);
        const color = index % 2 === 0 ? palette.accent : accentTwo;
        return `<path d="M${x} ${y} h42 m-21 -21 v42" stroke="${color}" stroke-width="6" stroke-opacity="0.20" stroke-linecap="round"/>`;
      })
      .join("")}
  </g>`;
}

function buildForegroundPolish(
  seed: number,
  palette: { accent: string; glow: string; mid: string; name: string },
  accentTwo: string,
) {
  return `<g aria-hidden="true">
    <rect x="26" y="26" width="1028" height="1028" rx="42" fill="none" stroke="${palette.accent}" stroke-width="4" stroke-opacity="0.48" filter="url(#neon)"/>
    <rect x="54" y="54" width="972" height="972" rx="30" fill="none" stroke="${accentTwo}" stroke-width="2" stroke-opacity="0.30"/>
    <path d="M90 126 H290 M790 126 H990 M90 954 H290 M790 954 H990" stroke="#ffffff" stroke-width="8" stroke-opacity="0.18" stroke-linecap="round"/>
    <path d="M126 90 V290 M954 90 V290 M126 790 V990 M954 790 V990" stroke="#ffffff" stroke-width="8" stroke-opacity="0.18" stroke-linecap="round"/>
    <circle cx="${120 + (seed % 820)}" cy="102" r="10" fill="${accentTwo}" fill-opacity="0.80"/>
    <circle cx="${930 - (seed % 760)}" cy="978" r="8" fill="${palette.accent}" fill-opacity="0.80"/>
  </g>`;
}

function buildLooseCandles(
  seed: number,
  startX: number,
  baseY: number,
  count: number,
  primary: string,
  secondary: string,
) {
  return Array.from({ length: count })
    .map((_, index) => {
      const x = startX + index * 52;
      const height = 80 + ((seed + index * 47) % 290);
      const y = baseY - height + createSeededNumber(seed, index + 50, -24, 24);
      const color = index % 3 === 0 ? secondary : primary;
      return `<line x1="${x + 14}" y1="${y - 34}" x2="${x + 14}" y2="${y + height + 34}" stroke="${color}" stroke-width="5" stroke-linecap="round"/><rect x="${x}" y="${y}" width="28" height="${height}" rx="8" fill="${color}"/>`;
    })
    .join("");
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildTemplateCharacter({
  accentTwo,
  faceShift,
  palette,
  scale,
  templateId,
  x,
  y,
}: {
  accentTwo: string;
  faceShift: number;
  palette: { accent: string; glow: string; mid: string; name: string };
  scale: number;
  templateId: string;
  x: number;
  y: number;
}) {
  if (templateId === "pixel-arcade") {
    return `<g transform="translate(${x} ${y + 42}) scale(${scale})" shape-rendering="crispEdges">
      <rect x="18" y="18" width="190" height="190" fill="${palette.accent}" fill-opacity="0.32" stroke="${accentTwo}" stroke-width="8"/>
      <rect x="54" y="70" width="34" height="34" fill="#fafafa"/>
      <rect x="138" y="70" width="34" height="34" fill="#fafafa"/>
      <rect x="64" y="80" width="14" height="14" fill="#09090b"/>
      <rect x="148" y="80" width="14" height="14" fill="#09090b"/>
      <rect x="70" y="150" width="90" height="18" fill="#ef4444"/>
      <rect x="-8" y="70" width="34" height="76" fill="${accentTwo}"/>
      <rect x="202" y="70" width="34" height="76" fill="${accentTwo}"/>
    </g>`;
  }

  if (templateId === "moon-chart" || templateId === "cyberpunk-desk") {
    return `<g transform="translate(${x} ${y}) scale(${scale})">
      <path d="M50 30 C110 -8 198 16 224 88 C250 160 198 238 114 240 C26 242 -22 166 10 88 C18 68 30 48 50 30Z" fill="${palette.accent}" fill-opacity="0.24" stroke="${accentTwo}" stroke-width="10"/>
      <path d="M50 82 Q82 52 112 80" fill="none" stroke="#fafafa" stroke-width="13" stroke-linecap="round"/>
      <path d="M134 80 Q164 52 196 82" fill="none" stroke="#fafafa" stroke-width="13" stroke-linecap="round"/>
      <path d="M64 168 Q118 196 182 168" fill="none" stroke="#fafafa" stroke-width="16" stroke-linecap="round"/>
      <path d="M22 36 L-24 -8 M214 36 L262 -8" stroke="${accentTwo}" stroke-width="13" stroke-linecap="round"/>
    </g>`;
  }

  if (templateId === "comic-panel" || templateId === "gas-meter") {
    return `<g transform="translate(${x} ${y}) scale(${scale})">
      <path d="M72 18 C148 -22 226 48 220 138 C214 228 114 258 54 206 C-6 154 -4 58 72 18Z" fill="${palette.accent}" fill-opacity="0.22" stroke="${palette.accent}" stroke-opacity="0.75" stroke-width="9"/>
      <circle cx="${78 + faceShift}" cy="104" r="22" fill="#fafafa"/>
      <circle cx="${154 + faceShift}" cy="104" r="22" fill="#fafafa"/>
      <circle cx="${84 + faceShift}" cy="110" r="7" fill="#09090b"/>
      <circle cx="${160 + faceShift}" cy="110" r="7" fill="#09090b"/>
      <path d="M66 ${178 + faceShift} Q120 ${132 - faceShift} 178 ${178 + faceShift}" fill="none" stroke="#fafafa" stroke-width="16" stroke-linecap="round"/>
      <path d="M26 214 C86 246 164 246 224 214" fill="none" stroke="#ef4444" stroke-width="9" stroke-linecap="round" opacity="0.78"/>
    </g>`;
  }

  if (templateId === "glitch-terminal" || templateId === "burning-portfolio") {
    return `<g transform="translate(${x} ${y}) scale(${scale})">
      <path d="M42 22 H196 L232 86 V202 L178 246 H52 L4 196 V78 Z" fill="${palette.accent}" fill-opacity="0.21" stroke="${accentTwo}" stroke-width="10"/>
      <path d="M50 82 H102 M132 82 H190" stroke="#fafafa" stroke-width="16" stroke-linecap="round"/>
      <path d="M72 154 H170" stroke="#ef4444" stroke-width="16" stroke-linecap="round"/>
      <path d="M34 222 H92 M126 222 H210" stroke="${accentTwo}" stroke-width="10" stroke-linecap="round" opacity="0.78"/>
      <path d="M-10 52 H28 M210 42 H260 M-18 172 H36 M202 162 H252" stroke="#f472b6" stroke-width="8" stroke-linecap="round"/>
    </g>`;
  }

  return `<g transform="translate(${x} ${y}) scale(${scale})">
    <path d="M72 18 C148 -22 226 48 220 138 C214 228 114 258 54 206 C-6 154 -4 58 72 18Z" fill="${palette.accent}" fill-opacity="0.22" stroke="${palette.accent}" stroke-opacity="0.75" stroke-width="9"/>
    <path d="M50 78 Q78 48 106 78" fill="none" stroke="#fafafa" stroke-width="11" stroke-linecap="round"/>
    <path d="M126 78 Q154 48 184 78" fill="none" stroke="#fafafa" stroke-width="11" stroke-linecap="round"/>
    <circle cx="${82 + faceShift}" cy="112" r="15" fill="#fafafa"/>
    <circle cx="${158 + faceShift}" cy="112" r="15" fill="#fafafa"/>
    <circle cx="${88 + faceShift}" cy="116" r="6" fill="#09090b"/>
    <circle cx="${164 + faceShift}" cy="116" r="6" fill="#09090b"/>
    <path d="M70 ${178 + faceShift} Q120 ${132 - faceShift} 176 ${178 + faceShift}" fill="none" stroke="#fafafa" stroke-width="16" stroke-linecap="round"/>
    <path d="M44 214 C86 244 164 244 206 214" fill="none" stroke="#ef4444" stroke-width="9" stroke-linecap="round" opacity="0.78"/>
    <path d="M30 44 L-12 0 M206 44 L252 0" stroke="${palette.accent}" stroke-width="12" stroke-linecap="round"/>
  </g>`;
}

function createImageSeed() {
  return Math.floor(Math.random() * 1_000_000);
}

function pickFromSeed<T>(items: readonly T[], seed: number, salt: number) {
  return items[Math.abs(seed + salt * 9973) % items.length];
}

function createSeededNumber(
  seed: number,
  salt: number,
  min: number,
  max: number,
) {
  const range = max - min + 1;

  return min + (Math.abs(seed * (salt + 3)) % range);
}
