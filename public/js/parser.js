// parseTaglish(text): turns a typed or spoken Taglish phrase into an entry.
// Returns {kind, name, item, qty, amount, confidence, needsConfirm, weak}
//   kind: 'utang' | 'bayad' | 'benta' | 'gastos' | null
//   amount: pesos (not centavos), e.g. 85.5
//   weak: list of fields the UI should highlight yellow
// Test it: `node public/js/parser.js` or runParserTests() in the browser console.

const NUMBER_WORDS = {
  isa: 1,
  isang: 1,
  dalawa: 2,
  dalawang: 2,
  tatlo: 3,
  tatlong: 3,
  apat: 4,
  lima: 5,
  limang: 5,
  anim: 6,
  pito: 7,
  pitong: 7,
  walo: 8,
  walong: 8,
  siyam: 9,
  sampu: 10,
  sampung: 10,
  // Spanish-style units, used in prices like "bente singko" (25)
  uno: 1,
  dos: 2,
  tres: 3,
  kwatro: 4,
  singko: 5,
  sais: 6,
  siyete: 7,
  otso: 8,
  nuwebe: 9,
  // Tens and hundreds, how prices are usually said
  bente: 20,
  beinte: 20,
  trenta: 30,
  treinta: 30,
  kwarenta: 40,
  kuwarenta: 40,
  singkwenta: 50,
  sinkwenta: 50,
  sisenta: 60,
  sitenta: 70,
  setenta: 70,
  otsenta: 80,
  nobenta: 90,
  dalawampu: 20,
  tatlumpu: 30,
  apatnapu: 40,
  limampu: 50,
  animnapu: 60,
  pitumpu: 70,
  walumpu: 80,
  siyamnapu: 90,
  sandaan: 100,
  isandaan: 100,
  siyento: 100,
  // TODO: verify with native Ilocano speaker
  maysa: 1,
  dua: 2,
  tallo: 3,
  uppat: 4,
  innem: 6,
  siam: 9,
  sangapulo: 10,
};
const MULTIPLIERS = {
  daan: 100,
  daang: 100,
  raan: 100,
  raang: 100,
  libo: 1000,
  libong: 1000,
}; // "dalawang daan" = 200

const KIND_WORDS = {
  utang: "utang",
  inutang: "utang",
  nangutang: "utang",
  umutang: "utang",
  bayad: "bayad",
  nagbayad: "bayad",
  bumayad: "bayad",
  binayaran: "bayad",
  benta: "benta",
  nabenta: "benta",
  binenta: "benta",
  nagbenta: "benta",
  naibenta: "benta",
  gastos: "gastos",
  gumastos: "gastos",
  bumili: "gastos",
  binili: "gastos",
  // TODO: verify with native Ilocano speaker
  nailako: "benta",
  inlako: "benta",
  gimmatang: "gastos",
  ginatang: "gastos",
};

// Words that only show up in Ilocano phrases; they lower confidence a bit.
// TODO: verify with native Ilocano speaker
const ILOCANO_WORDS = [
  "maysa",
  "dua",
  "tallo",
  "uppat",
  "innem",
  "siam",
  "sangapulo",
  "nailako",
  "inlako",
  "gimmatang",
  "ginatang",
  "ti",
  "iti",
  "ken",
];

const NAME_MARKERS = ["si", "ni", "kay"]; // "utang si ...", Ilocano "utang ni ..."
const STOP_WORDS = [
  "si",
  "ni",
  "kay",
  "ng",
  "nang",
  "na",
  "ang",
  "sa",
  "ay",
  "mga",
  "para",
  "pesos",
  "peso",
  "piso",
  "php",
  "ti",
  "iti",
  "ken",
  "a",
];

function toNumber(token) {
  if (token in NUMBER_WORDS) return { value: NUMBER_WORDS[token], word: true };
  const m = token.match(/^(?:₱|php|p)?(\d+(?:\.\d{1,2})?)(?:php|pesos?)?$/);
  return m ? { value: parseFloat(m[1]), word: false } : null;
}

function parseTaglish(text) {
  const tokens = String(text || "")
    .toLowerCase()
    .replace(/(\d),(\d{3})/g, "$1$2") // 1,500 -> 1500
    .replace(/[^\p{L}\p{N}₱.\-\s]/gu, " ")
    .split(/\s+/)
    .map((t) => t.replace(/^\.+|\.+$/g, ""))
    .filter(Boolean);

  const used = new Array(tokens.length).fill(false);
  const weak = [];

  // 1. Kind. "bayad" wins over "utang" ("nagbayad ng utang").
  const kinds = [];
  let kindIndex = -1;
  tokens.forEach((t, i) => {
    if (KIND_WORDS[t]) {
      kinds.push(KIND_WORDS[t]);
      used[i] = true;
      if (kindIndex < 0) kindIndex = i;
    }
  });
  const kind = kinds.includes("bayad") ? "bayad" : kinds[0] || null;

  // 2. Numbers. Spoken numbers combine with the number right before them:
  // "dalawang daan" -> 200, "bente singko" -> 25.
  const numbers = [];
  tokens.forEach((t, i) => {
    const prev =
      used[i - 1] && numbers.length ? numbers[numbers.length - 1] : null;
    const prevIsNumber = prev && prev.index === i - 1;
    if (t in MULTIPLIERS) {
      if (prevIsNumber) {
        prev.value *= MULTIPLIERS[t];
        prev.index = i;
      } else numbers.push({ value: MULTIPLIERS[t], word: true, index: i });
      used[i] = true;
      return;
    }
    const n = toNumber(t);
    if (!n) return;
    used[i] = true;
    const isTens =
      prevIsNumber && prev.word && prev.value >= 20 && prev.value % 10 === 0;
    if (isTens && n.word && n.value < 10) {
      prev.value += n.value;
      prev.index = i;
    } else numbers.push({ ...n, index: i });
  });

  // 3. Name (only for utang/bayad): words after si/ni/kay, else words right after the kind word.
  let name = "";
  let nameGuessed = false;
  if (kind === "utang" || kind === "bayad") {
    let start = tokens.findIndex((t) => NAME_MARKERS.includes(t));
    if (start >= 0) {
      used[start] = true;
      start += 1;
    } else if (kindIndex >= 0) {
      start = kindIndex + 1;
      nameGuessed = true;
    }
    const nameTokens = [];
    for (
      let i = start;
      i >= 0 && i < tokens.length && nameTokens.length < 3;
      i++
    ) {
      if (used[i] || STOP_WORDS.includes(tokens[i])) break;
      nameTokens.push(tokens[i]);
      used[i] = true;
    }
    name = nameTokens.join(" ");
  }

  // 4. Item: whatever is left that isn't a filler word.
  const item = tokens
    .filter((t, i) => !used[i] && !STOP_WORDS.includes(t))
    .join(" ");

  // 5. Qty and amount: two+ numbers -> first is qty, last is amount.
  let qty = 1;
  let amount = null;
  if (numbers.length >= 2) {
    qty = Math.round(numbers[0].value);
    amount = numbers[numbers.length - 1].value;
  } else if (numbers.length === 1) {
    // "benta dalawang kape" -> a lone small number word (1-10) is a qty, not a price.
    if (numbers[0].word && numbers[0].value <= 10) qty = numbers[0].value;
    else amount = numbers[0].value;
  }

  // 6. Confidence.
  let confidence = 1;
  if (!kind) {
    confidence = 0;
    weak.push("kind");
  }
  if (amount === null) {
    confidence -= 0.5;
    weak.push("amount");
  }
  if (kind === "utang" || kind === "bayad") {
    if (!name) {
      confidence -= 0.4;
      weak.push("name");
    } else if (nameGuessed) {
      confidence -= 0.25;
      weak.push("name");
    }
  }
  if ((kind === "benta" || kind === "gastos") && !item) {
    confidence -= 0.3;
    weak.push("item");
  }
  if (tokens.some((t) => ILOCANO_WORDS.includes(t))) {
    confidence -= 0.15;
    weak.push("kind");
  }
  confidence = Math.max(0, Math.round(confidence * 100) / 100);

  return {
    kind,
    name,
    item,
    qty,
    amount,
    confidence,
    needsConfirm: confidence < 0.8,
    weak,
  };
}

// Each test only checks the fields listed in `expect`.
const parserTests = [
  {
    text: "utang si Mang Tonyo 50 sardinas",
    expect: {
      kind: "utang",
      name: "mang tonyo",
      item: "sardinas",
      amount: 50,
      needsConfirm: false,
    },
  },
  {
    text: "nagbayad si Ate Joy 200",
    expect: {
      kind: "bayad",
      name: "ate joy",
      amount: 200,
      needsConfirm: false,
    },
  },
  {
    text: "nagbayad ng utang si kuya ben 100",
    expect: { kind: "bayad", name: "kuya ben", amount: 100 },
  },
  {
    text: "inutang ni Aling Rosing ang kape 35",
    expect: { kind: "utang", name: "aling rosing", item: "kape", amount: 35 },
  },
  {
    text: "nabenta 3 kape 45",
    expect: {
      kind: "benta",
      item: "kape",
      qty: 3,
      amount: 45,
      needsConfirm: false,
    },
  },
  {
    text: "benta ng dalawang sardinas 50",
    expect: { kind: "benta", item: "sardinas", qty: 2, amount: 50 },
  },
  {
    text: "sampung itlog benta 80",
    expect: { kind: "benta", item: "itlog", qty: 10, amount: 80 },
  },
  {
    text: "₱85.50 benta sardinas",
    expect: { kind: "benta", item: "sardinas", amount: 85.5 },
  },
  {
    text: "gastos 500 bigas",
    expect: { kind: "gastos", item: "bigas", amount: 500, qty: 1 },
  },
  {
    text: "bumili ng mantika 120",
    expect: { kind: "gastos", item: "mantika", amount: 120 },
  },
  { text: "benta 1,500 bigas", expect: { kind: "benta", amount: 1500 } },
  {
    text: "benta dalawang kape",
    expect: { kind: "benta", qty: 2, amount: null, needsConfirm: true },
  },
  { text: "utang 50", expect: { kind: "utang", name: "", needsConfirm: true } },
  { text: "hello world", expect: { kind: null, needsConfirm: true } },
  {
    text: "utang ni Manang Lita 75 kape",
    expect: { kind: "utang", name: "manang lita", amount: 75, item: "kape" },
  },
  {
    text: "Utang si Mang Tonyo singkwenta sardinas",
    expect: {
      kind: "utang",
      name: "mang tonyo",
      item: "sardinas",
      amount: 50,
      needsConfirm: false,
    },
  },
  {
    text: "nabenta tatlong kape bente singko",
    expect: { kind: "benta", item: "kape", qty: 3, amount: 25 },
  },
  {
    text: "nagbayad si Ate Joy dalawang daan",
    expect: {
      kind: "bayad",
      name: "ate joy",
      amount: 200,
      needsConfirm: false,
    },
  },
  {
    text: "utang ni Aling Rosing isandaan kape",
    expect: { kind: "utang", name: "aling rosing", item: "kape", amount: 100 },
  },
  {
    text: "nailako ti dua a kape 30",
    expect: {
      kind: "benta",
      qty: 2,
      amount: 30,
      item: "kape",
      needsConfirm: false,
    },
  },
];

function runParserTests() {
  let failed = 0;
  for (const test of parserTests) {
    const got = parseTaglish(test.text);
    const bad = Object.keys(test.expect).filter(
      (k) => got[k] !== test.expect[k],
    );
    if (bad.length) {
      failed++;
      console.log(
        "FAIL",
        JSON.stringify(test.text),
        bad
          .map(
            (k) =>
              `${k}: expected ${JSON.stringify(test.expect[k])}, got ${JSON.stringify(got[k])}`,
          )
          .join("; "),
      );
    } else {
      console.log("pass", JSON.stringify(test.text));
    }
  }
  console.log(
    `${parserTests.length - failed}/${parserTests.length} parser tests passed`,
  );
  return failed;
}

// Lets `node public/js/parser.js` run the tests. Ignored in the browser.
if (typeof module !== "undefined" && require.main === module) {
  process.exitCode = runParserTests() ? 1 : 0;
}
