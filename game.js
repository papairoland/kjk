let player = {
  skill:      10,
  stamina:    20,
  maxStamina: 20,
  luck:       8,
  maxLuck:    8,
  food:       2,
  items:      [],
};
let combat = null;
let currentPassageId = 1;
function d6() {
  return Math.floor(Math.random() * 6) + 1;
}
function twoD6() {
  return d6() + d6();
}
function testLuck() {
  const roll = twoD6();
  const success = roll <= player.luck;
  player.luck = Math.max(0, player.luck - 1);
  return success;
}
function addItem(item) {
  if (!player.items.includes(item)) {
    player.items.push(item);
  }
}
function hasItem(item) {
  return player.items.includes(item);
}
function eatFood() {
  if (player.food > 0 && player.stamina < player.maxStamina) {
    player.food--;
    player.stamina = Math.min(player.maxStamina, player.stamina + 4);
    updateHUD();
    return true;
  }
  return false;
}
const passages = {
  1: {
    title: "A Fekete Kastély kapuja",
    icon: "🏰",
    text: `Hosszú, fárasztó utazás után végre megérkezel <strong>Morgath, a Sötét Úr</strong> fellegvárához. A fekete kövekből emelt kastély falai félelmet árasztanak.<br><br>A főkapu előtt <strong>két fegyveres őr</strong> vigyáz. Azonban észreveszel egy <strong>oldalsó ösvényt</strong> is, amely a fal mentén kanyarog.<br><br><em>Küldetésed: eljutni Morgath-hoz és legyőzni.</em>`,
    choices: [
      { text: "⚔️ Megrohanod a főkaput", next: 2 },
      { text: "🌿 Az oldalsó ösvényt követed", next: 3 },
    ],
  },
  2: {
    title: "Az őrök",
    icon: "⚔️",
    text: `Az őrök azonnal észrevesznek és kardot rántanak!<br>"Állj! Senki sem léphet be a Sötét Úr engedélye nélkül!"<br><br>Nincs más választás – <strong>harcolnod kell!</strong>`,
    combat: {
      name: "Kastélyőr",
      skill: 7,
      stamina: 6,
      rewardText: `Legyőzöd az őröket, és benyomulsz a kastélyba!`,
      nextPassage: 4,
    },
  },
  3: {
    title: "Az oldalsó ösvény",
    icon: "🌿",
    text: `Az ösvényen haladva egy szerencsétlen kalandor holttestét találod a bokrok között. Még szorítja kezében a palackját – egy <strong>kékes Szerencse-ital</strong>.<br><br>A fal mellett egy <strong>titkos ajtót</strong> is észreveszel.`,
    choices: [
      { text: "🧪 Felveszed az italt, majd bemész a titkos ajtón", next: 6 },
      { text: "🚪 Otthagyod az italt és bemész a titkos ajtón", next: 5 },
    ],
  },
  4: {
    title: "A kastély előcsarnoka",
    icon: "🏛️",
    text: `A hatalmas előcsarnokban néma csend honol. Fáklyák lobognak a falakon, hosszú árnyékokat vetve a kőpadlóra.<br><br>Két folyosó nyílik előtted:<br>⬅️ <strong>Balra</strong> – penészes szag és zörgő láncok hangja szűrődik ki<br>➡️ <strong>Jobbra</strong> – fojtott fény és díszes ajtók sorakoznak`,
    choices: [
      { text: "⛓️ Balra mész – a börtönök felé", next: 7 },
      { text: "👑 Jobbra mész – a trónterem felé", next: 8 },
    ],
  },
  5: {
    title: "Titkos folyosó",
    icon: "🚪",
    text: `Az ajtó mögött egy szűk, sötét folyosó húzódik. Ázott kő szaga csap meg. Valahonnan mélységből furcsa zörejek hallatszanak.`,
    choices: [
      { text: "🕯️ Előre – bemérsz a sötétbe", next: 9 },
      { text: "🔙 Visszafordulsz az ösvényre", next: 1 },
    ],
  },
  6: {
    title: "A Szerencse-ital",
    icon: "🧪",
    text: `Kihúzod a dugót és megiszod az italt. Melegség terjed szét a testedben – a szerencse határozottan mosolyog rád!<br><em>(Szerencse +2)</em><br><br>Belöksz a titkos ajtón és besétálsz a sötét folyosóra.`,
    onEnter: function() {
      player.luck = Math.min(player.maxLuck + 2, player.luck + 2);
      player.maxLuck = Math.max(player.maxLuck, player.luck);
    },
    choices: [
      { text: "🚪 Bemérsz a titkos folyosóra", next: 9 },
    ],
  },
  7: {
    title: "A börtönök",
    icon: "⛓️",
    text: `A börtön legmélyén egy ősz hajú, legyengült lovagot találsz: <strong>Aldric</strong>. Rácsain át elmeséli, hogy Morgath fogságában tartja már egy éve.<br><br>"Halld! <strong>Morgath-ot csak ezüst karddal lehet megölni!</strong> A trónteremben lóg egy ilyen kard a falon – vidd el, mielőtt szembeszállsz vele!"`,
    onEnter: function() {
      addItem("Aldric tanácsa (ezüst kard)");
    },
    choices: [
      { text: "🔓 Kiszabadítod Aldric-ot (csináltok kerülőt)", next: 10 },
      { text: "↩️ Hálálkodva elhagyod a börtönt", next: 4 },
    ],
  },
  8: {
    title: "A trónterem",
    icon: "👑",
    text: `Óvatosan benyitsz a trónterembe. Üresnek tűnik... de hirtelen <strong>kattanást</strong> hallasz! Nyílcsapda!`,
    luckTest: {
      successText: `Ösztönösen kitérsz, és a nyíl a falba csapódik melletted. Sértetlenül megúszod! A trón mögött megpillantasz egy ezüstösen csillogó kardot a falon.`,
      failText: `A nyíl megkarcolja a karodat – elveszítesz <strong>2 életerőt</strong>. Fájdalmad ellenére észreveszel egy ezüstösen csillogó kardot a falon.`,
      failEffect: function() {
        player.stamina = Math.max(0, player.stamina - 2);
      },
      nextPassage: 11,
    },
  },
  9: {
    title: "Az Óriáspók",
    icon: "🕷️",
    text: `A folyosón haladva sűrű pókháló vesz körül. A mennyezetről lassan ereszkedik le egy <strong>hatalmas Óriáspók</strong> – szeme vörösen izzik a sötétben!<br><br>Harcolnod kell!`,
    combat: {
      name: "Óriáspók",
      skill: 6,
      stamina: 8,
      rewardText: `A pókot legyőzöd! Mellette egy kis ládikót találsz élelmiszerrel és gyógyfűvel – visszaszerzed <strong>4 életerődet</strong>.`,
      rewardEffect: function() {
        player.stamina = Math.min(player.maxStamina, player.stamina + 4);
      },
      nextPassage: 12,
    },
  },
  10: {
    title: "Aldric segít",
    icon: "🤝",
    text: `Feltöröd Aldric cellájának zárját. A lovag lassan kikecmereg, majd mélyen meghajol. "Örök hálám, hős! Ismerem a kastélyt – tudok egy <strong>titkos folyosót</strong>, ami egyenesen Morgath termébe vezet."<br><br>Útközben Aldric bekötözi sebeidet. <em>(Életerő +4)</em>`,
    onEnter: function() {
      player.stamina = Math.min(player.maxStamina, player.stamina + 4);
    },
    choices: [
      { text: "⚔️ Elindultok Morgath termébe!", next: 14 },
    ],
  },
  11: {
    title: "Az Ezüst Kard",
    icon: "🗡️",
    text: `A falon lógó kard ezüstösen ragyog – <strong>ez az Ezüst Kard</strong>, Morgath egyetlen gyengesége! Leveszed a falról és megérzed a súlyát a kezedben. Ez az igazi fegyver a Sötét Úr ellen.`,
    onEnter: function() {
      addItem("Ezüst Kard");
    },
    choices: [
      { text: "⚔️ Veszed a kardot és Morgath-hoz indulsz", next: 14 },
    ],
  },
  12: {
    title: "A titkos kamra",
    icon: "💰",
    text: `A pók legyőzése után egy rejtett ajtó tűnik elő. Mögötte kincseskamra – és ami fontosabor: élelmiszer, gyógyszerek.<br><em>+4 életerő (már elszámolva)</em><br><br>Innen egy folyosó vezet mélyebbre a kastélyba.`,
    choices: [
      { text: "⚔️ Előre – Morgath terébe!", next: 14 },
    ],
  },
  14: {
    title: "Morgath terme",
    icon: "👹",
    text: `Hatalmas fekete ajtón léptek be egy félelmetes terembe. A trón előtt áll <strong>Morgath, a Sötét Úr</strong> – fekete páncélban, égő vörös szemekkel.<br><br>"Merészen jöttél, kis hős... de itt véget ér a kalandog!"`,
    get combat() {
      return {
        name: "Morgath, a Sötét Úr",
        skill: hasItem("Ezüst Kard") ? 9 : 11,
        stamina: 14,
        isBoss: true,
        rewardText: null,
        nextPassage: 15,
      };
    },
  },
  15: {
    title: "Győzelem!",
    icon: "🏆",
    text: `Morgath térdre rogy, fekete páncélja széthasad. Egy pillanat – majd hamuvá omlik, szanaszét fújja a szél.<br><br>A kastély falai megremegnek. A sötét varázslat szétfoszlik, mint köd a napfényben.<br><br><strong>Megmentetted a királyságot.</strong> Évszázadokig fognak énekelni rólad a bárdok, és neved bevésődin a történelem lapjaira.`,
    isVictory: true,
  },
};
function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}
function updateHUD() {
  document.getElementById("val-stamina").textContent = `${player.stamina}/${player.maxStamina}`;
  document.getElementById("val-skill").textContent  = player.skill;
  document.getElementById("val-luck").textContent   = player.luck;
  document.getElementById("val-food").textContent   = player.food;
  const pct = Math.max(0, (player.stamina / player.maxStamina) * 100);
  document.getElementById("bar-stamina").style.width = pct + "%";
  const itemsBox  = document.getElementById("items-box");
  const itemsList = document.getElementById("items-list");
  if (player.items.length > 0) {
    itemsList.textContent = player.items.join(", ");
    itemsBox.classList.remove("hidden");
  } else {
    itemsBox.classList.add("hidden");
  }
}
function checkDeath() {
  if (player.stamina <= 0) {
    player.stamina = 0;
    updateHUD();
    showScreen("screen-death");
    return true;
  }
  return false;
}
function renderPassage(id) {
  currentPassageId = id;
  const p = passages[id];
  if (!p) {
    console.error("Nincs ilyen jelenet:", id);
    return;
  }
  if (p.onEnter) p.onEnter();
  updateHUD();
  if (checkDeath()) return;
  if (p.isVictory) {
    showScreen("screen-victory");
    document.getElementById("victory-text").innerHTML = p.text;
    return;
  }
  showScreen("screen-game");
  document.getElementById("passage-icon").textContent = p.icon || "📖";
  document.getElementById("passage-title").textContent = p.title;
  document.getElementById("passage-text").innerHTML = p.text;
  document.getElementById("combat-area").classList.add("hidden");
  const choicesArea = document.getElementById("choices-area");
  choicesArea.innerHTML = "";
  if (p.combat) {
    startCombat(p.combat);
    return;
  }
  if (p.luckTest) {
    runLuckTest(p.luckTest);
    return;
  }
  if (p.choices) {
    renderChoices(p.choices);
  }
}
function renderChoices(choices) {
  const area = document.getElementById("choices-area");
  area.innerHTML = "";
  choices.forEach(choice => {
    const btn = document.createElement("button");
    btn.className = "btn btn-choice";
    btn.innerHTML = choice.text;
    btn.addEventListener("click", () => renderPassage(choice.next));
    area.appendChild(btn);
  });
}
function runLuckTest(luckTestData) {
  const success = testLuck();
  const currentText = document.getElementById("passage-text").innerHTML;
  if (success) {
    document.getElementById("passage-text").innerHTML = currentText + `<br><br><span style="color:#6fcf97">🍀 <strong>Szerencse teszt: SIKERES!</strong></span><br>` + luckTestData.successText;
  } else {
    if (luckTestData.failEffect) luckTestData.failEffect();
    document.getElementById("passage-text").innerHTML = currentText + `<br><br><span style="color:#e07070">💢 <strong>Szerencse teszt: SIKERTELEN.</strong></span><br>` + luckTestData.failText;
  }
  updateHUD();
  if (checkDeath()) return;
  const area = document.getElementById("choices-area");
  area.innerHTML = "";
  const btn = document.createElement("button");
  btn.className = "btn btn-choice";
  btn.textContent = "➡️ Tovább";
  btn.addEventListener("click", () => renderPassage(luckTestData.nextPassage));
  area.appendChild(btn);
}
function startCombat(enemyTemplate) {
  combat = {
    name:       enemyTemplate.name,
    skill:      enemyTemplate.skill,
    stamina:    enemyTemplate.stamina,
    maxStamina: enemyTemplate.stamina,
    rewardText: enemyTemplate.rewardText   || null,
    rewardEffect: enemyTemplate.rewardEffect || null,
    nextPassage: enemyTemplate.nextPassage,
    isBoss:      enemyTemplate.isBoss         || false,
  };
  document.getElementById("enemy-name").textContent    = "⚔️ Ellenfél: " + combat.name;
  document.getElementById("enemy-stamina-val").textContent = combat.stamina;
  document.getElementById("bar-enemy").style.width     = "100%";
  const log = document.getElementById("combat-log");
  log.innerHTML = "";
  addLogEntry("info", `A harc kezdődik! ${combat.name} – Ügyesség: ${combat.skill}, Életerő: ${combat.stamina}`);
  if (combat.isBoss && hasItem("Ezüst Kard")) {
    addLogEntry("info", "⚔️ Az Ezüst Kard ragyog a kezedben – Morgath legyengült előled!");
  }
  document.getElementById("combat-area").classList.remove("hidden");
  document.getElementById("choices-area").innerHTML = "";
}
function doCombatRound() {
  if (!combat) return;
  const playerRoll = twoD6() + player.skill;
  const enemyRoll  = twoD6() + combat.skill;
  if (playerRoll > enemyRoll) {
    combat.stamina -= 2;
    addLogEntry("player", `Te: ${playerRoll} vs Ellenfél: ${enemyRoll} → ⚔️ Te találsz! (${combat.name}: -2 életerő)`);
  } else if (enemyRoll > playerRoll) {
    player.stamina -= 2;
    addLogEntry("enemy", `Te: ${playerRoll} vs Ellenfél: ${enemyRoll} → 💢 ${combat.name} talál! (Te: -2 életerő)`);
  } else {
    addLogEntry("draw", `Te: ${playerRoll} vs Ellenfél: ${enemyRoll} → 🤝 Döntetlen, egyik sem sérül.`);
  }
  const enemyPct = Math.max(0, (combat.stamina / combat.maxStamina) * 100);
  document.getElementById("bar-enemy").style.width       = enemyPct + "%";
  document.getElementById("enemy-stamina-val").textContent = Math.max(0, combat.stamina);
  updateHUD();
  if (player.stamina <= 0) {
    addLogEntry("enemy", `💀 Elesett a hős! ${combat.name} győzedelmeskedett.`);
    document.getElementById("btn-attack").disabled = true;
    setTimeout(() => showScreen("screen-death"), 1200);
    return;
  }
  if (combat.stamina <= 0) {
    addLogEntry("player", `🎉 Legyőzted: ${combat.name}!`);
    document.getElementById("btn-attack").disabled = true;
    if (combat.rewardText) {
      document.getElementById("passage-text").innerHTML += `<br><br><span style="color:#6fcf97">${combat.rewardText}</span>`;
    }
    if (combat.rewardEffect) combat.rewardEffect();
    updateHUD();
    const area = document.getElementById("choices-area");
    area.innerHTML = "";
    const btn = document.createElement("button");
    btn.className = "btn btn-choice";
    btn.textContent = "➡️ Tovább";
    btn.addEventListener("click", () => {
      const next = combat.nextPassage;
      combat = null;
      renderPassage(next);
    });
    area.appendChild(btn);
  }
}
function addLogEntry(type, text) {
  const log   = document.getElementById("combat-log");
  const entry = document.createElement("div");
  entry.className = `log-entry log-${type}`;
  entry.textContent = text;
  log.appendChild(entry);
  log.scrollTop = log.scrollHeight;
}
