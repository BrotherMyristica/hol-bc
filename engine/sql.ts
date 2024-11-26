export const calculateValue = `
DELETE FROM combo_values;

WITH base_stats AS (
SELECT c.card1, c.card2, c.result, cr.rarity, cr.base_attack, cr.base_defense,
(SELECT value FROM config WHERE uid = 2) + rr.bonus_level_for_combo AS level,
MAX(r1.bonus_stat_per_level, r2.bonus_stat_per_level) AS level_bonus
FROM combos c
LEFT JOIN cards c1
ON c.card1 = c1.card
LEFT JOIN rarities r1
ON c1.rarity = r1.rarity
LEFT JOIN cards c2
ON c.card2 = c2.card
LEFT JOIN rarities r2
ON c2.rarity = r2.rarity
LEFT JOIN cards cr
ON c.result = cr.card
LEFT JOIN rarities rr
ON cr.rarity = rr.rarity
),
final_stats AS (
SELECT card1, card2, result, rarity, level,
(level - 1) * level_bonus + base_attack AS attack,
(level - 1) * level_bonus + base_defense AS defense
FROM base_stats),
valued_combos AS (
SELECT  card1, card2, result, rarity, level, attack, defense,
power((attack * (SELECT value FROM config WHERE uid = 1) + defense * (1-(SELECT value FROM config WHERE uid = 1))) / 20.0, (SELECT value FROM config WHERE uid = 3)) as value
FROM final_stats)
INSERT INTO combo_values (card1, card2, result, rarity, level, attack, defense, value, multiplier, potential_value)
SELECT card1, card2, result, rarity, level, attack, defense, value,
    COALESCE(c1.amount * c2.amount, 0) AS multiplier,
	COALESCE(value * c1.amount * c2.amount, 0) AS potential_value
FROM valued_combos v
LEFT JOIN collection c1 ON v.card1 = c1.card
LEFT JOIN collection c2 ON v.card2 = c2.card;
`;

export const multiCombos = `
DROP TABLE IF EXISTS combo3;
CREATE TABLE combo3 AS 
WITH combinations AS (
SELECT b.card1, b.card2, nc.card2 as card3, b.value AS old_value, nc.value as new_value, b.multiplier*col.amount AS multiplier FROM combo_values b
JOIN combo_values nc
ON b.card2 = nc.card1
JOIN collection col
ON nc.card2 = col.card
WHERE b.card1 != b.card2 and nc.card1 != nc.card2
)
SELECT c.card1, c.card2, c.card3, old_value + new_value + check1.value as value, c.multiplier FROM combinations c
JOIN combo_values check1
ON check1.card1 = c.card1 AND check1.card2 = c.card3
WHERE c.multiplier > 0;

DROP TABLE IF EXISTS combo4;
CREATE TABLE combo4 AS 
WITH combinations AS (
SELECT b.card1, b.card2, b.card3, nc.card2 as card4, b.value AS old_value, nc.value as new_value, b.multiplier*col.amount AS multiplier FROM combo3 b
JOIN combo_values nc
ON b.card3 = nc.card1
JOIN collection col
ON nc.card2 = col.card
WHERE b.card1 != b.card2 and nc.card1 != nc.card2
)
SELECT c.card1, c.card2, c.card3, c.card4, old_value + new_value + check1.value + check2.value as value, c.multiplier FROM combinations c
JOIN combo_values check1
ON check1.card1 = c.card1 AND check1.card2 = c.card4
JOIN combo_values check2
ON check2.card1 = c.card2 AND check2.card2 = c.card4
WHERE c.multiplier > 0;

DROP TABLE IF EXISTS core_suggestions;
CREATE TABLE core_suggestions AS 
WITH combinations AS (
SELECT b.card1, b.card2, b.card3, b.card4, nc.card as cardv, b.value AS old_value, b.multiplier*col.amount AS multiplier FROM combo4 b
JOIN cards nc
ON nc.is_basic = 1 AND b.card1 != nc.card AND b.card2 != nc.card AND b.card3 != nc.card AND b.card4 != nc.card 
JOIN collection col
ON nc.card = col.card
)
SELECT c.card1, c.card2, c.card3, c.card4, SUM(c.multiplier * (old_value + check1.value + check2.value + check3.value + check4.value)) as value FROM combinations c
JOIN combo_values check1
ON check1.card1 = MIN(c.card1, c.cardv) AND check1.card2 = MAX(c.card1, c.cardv)
JOIN combo_values check2
ON check2.card1 = MIN(c.card2, c.cardv) AND check2.card2 = MAX(c.card2, c.cardv)
JOIN combo_values check3
ON check3.card1 = MIN(c.card3, c.cardv) AND check3.card2 = MAX(c.card3, c.cardv)
JOIN combo_values check4
ON check4.card1 = MIN(c.card4, c.cardv) AND check4.card2 = MAX(c.card4, c.cardv)
WHERE c.multiplier > 0
GROUP BY c.card1, c.card2, c.card3, c.card4;

DROP TABLE combo3;
DROP TABLE combo4;
`;

export const addBestCardSql = `
WITH combinations AS (
SELECT MIN(d.card, a.card) AS card1, MAX(d.card, a.card) AS card2, a.card AS new_card FROM deck d, available_cards a
WHERE a.amount > 0
)
INSERT INTO deck (card)
SELECT c.new_card FROM combinations c
JOIN combo_values v
ON c.card1 = v.card1 AND c.card2 = v.card2
GROUP BY c.new_card
ORDER BY SUM(value) desc
LIMIT 1;
`;