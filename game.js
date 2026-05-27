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
