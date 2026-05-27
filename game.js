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
