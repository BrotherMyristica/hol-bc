import { assembleRestoreSQL } from "@/engine/storage";
import { createContext, useCallback, useEffect, useState } from "react";

type Rarities = "Common" | "Uncommon" | "Rare" | "Epic";

export interface ICardDetails {
  id: number;
  card: string;
  rarity: Rarities;
  is_basic: boolean;
  is_mergeresult: boolean;
  base_attack: number;
  base_defense: number;
}

export interface ICombos {
  id: number;
  card1: string;
  card2: string;
  result: string;
}

export interface ICardPool {
  id: number;
  path: string;
  world: number;
  enemy: number;
  stage: number;
  battle: number;
  enemyName: string;
  wins: number;
  reward: string;
}

export interface ICardAvailabilities {
  card: string;
  availability: string;
}

export interface IDustUpgrade {
  rarity: string;
  "1 → 2": number;
  "2 → 3": number;
  "3 → 4": number;
  "4 → 5": number;
}

export interface IDustRecycle {
  rarity: string;
  "1": number;
  "2": number;
  "3": number;
  "4": number;
  "5": number;
}

export interface IAbility {
  ability: string;
  combo_points: number;
  effect: string;
}

export interface IQuestChest {
  chest_number: number;
  reward_type: string;
  reward_amount: number;
}

interface IPlayerLevelReward {
  reward_type: string;
  reward_amount: number;
}

export interface IPlayerLevel {
  level: number;
  required_xp: number;
  rewards: IPlayerLevelReward[];
}

export interface IEventQuest {
  event_number: number;
  event_name: string;
  event_chapter: number;
  quest_number: number;
  quest_text: string;
}

interface IContext {
  cards: ICardDetails[];
  cardsByName: Record<string, ICardDetails>;
  cardAvailabilities: ICardAvailabilities[];
  combos: ICombos[];
  cardPool: ICardPool[];
  dustUpgrade: IDustUpgrade[];
  dustRecycle: IDustRecycle[];
  abilities: Record<string, Record<number, IAbility>>;
  dailyQuestChests: Record<number, IQuestChest>;
  weeklyQuestChests: Record<number, IQuestChest>;
  playerLevels: IPlayerLevel[];
  eventQuests: IEventQuest[];
}

export const CardContext = createContext<null | IContext>(null);

const CardProvider = (props: { db: Worker; children: React.ReactNode }) => {
  const [cardData, setCardData] = useState<null | IContext>(null);

  const fetchData = useCallback(() => {
    props.db.onmessage = (event) => {
      if (event.data.id === "select_card_data") {
        const d = event.data.results[0].values;
        const a = event.data.results[1].values;
        const c = event.data.results[2].values;
        const p = event.data.results[3].values;
        const du = event.data.results[4].values;
        const dr = event.data.results[5].values;
        const abilities = event.data.results[6].values;
        const dailyQuestChests = event.data.results[7].values;
        const weeklyQuestChests = event.data.results[8].values;
        const playerLevelsRaw: [] = event.data.results[9].values;
        const playerLevelsTranslated = playerLevelsRaw.map(
          (e: [number, number, string, number]) => ({
            level: e[0],
            required_xp: e[1],
            reward_type: e[2],
            reward_amount: e[3],
          })
        );
        const playerLevelsObj: Record<number, IPlayerLevel> =
          playerLevelsTranslated.reduce(
            (acc: Record<number, IPlayerLevel>, cv) => {
              const level = cv.level;
              return {
                ...acc,
                [level]: {
                  level: cv.level,
                  required_xp: cv.required_xp,
                  rewards: [
                    ...(acc[level]?.rewards ?? []),
                    {
                      reward_type: cv.reward_type,
                      reward_amount: cv.reward_amount,
                    },
                  ],
                },
              };
            },
            {}
          );
        const playerLevels = Object.keys(playerLevelsObj)
          .map(Number)
          .sort(function (a, b) {
            return a - b;
          })
          .map((level: number) => playerLevelsObj[level]);
        const cards: ICardDetails[] = d.map(
          (
            e: [string, Rarities, boolean, boolean, number, number],
            index: number
          ) => ({
            id: index,
            card: e[0],
            rarity: e[1],
            is_basic: e[2],
            is_mergeresult: e[3],
            base_attack: e[4],
            base_defense: e[5],
          })
        );
        const eventQuests = event.data.results[10].values.map(
          (e: [number, string, number, number, string]) => ({
            event_number: e[0],
            event_name: e[1],
            event_chapter: e[2],
            quest_number: e[3],
            quest_text: e[4],
          })
        );
        setCardData({
          cards,
          cardsByName: cards.reduce(
            (previous, current) => ({ ...previous, [current.card]: current }),
            {}
          ),
          cardAvailabilities: a.map((e: [string, string]) => ({
            card: e[0],
            availability: e[1],
          })),
          combos: c.map((e: [string, string, string], index: number) => ({
            id: index,
            card1: e[0],
            card2: e[1],
            result: e[2],
          })),
          cardPool: p.map(
            (
              e: [
                number,
                string,
                number,
                number,
                number,
                string,
                number,
                string
              ],
              index: number
            ) => ({
              id: index,
              path: e[0],
              world: e[1],
              enemy: e[2],
              stage: e[3],
              battle: e[4],
              enemyName: e[5],
              wins: e[6],
              reward: e[7],
            })
          ),
          dustUpgrade: du.map(
            (e: [string, number, number, number, number]) => ({
              rarity: e[0],
              "1 → 2": e[1],
              "2 → 3": e[2],
              "3 → 4": e[3],
              "4 → 5": e[4],
            })
          ),
          dustRecycle: dr.map(
            (e: [string, number, number, number, number, number]) => ({
              rarity: e[0],
              "1": e[1],
              "2": e[2],
              "3": e[3],
              "4": e[4],
              "5": e[5],
            })
          ),
          abilities: abilities.reduce(
            (
              acc: Record<string, Record<number, IAbility>>,
              cv: [string, number, string]
            ) => {
              const ability: string = cv[0];
              const combo_points: number = cv[1];
              const effect: string = cv[2];
              return {
                ...acc,
                [ability]: {
                  ...(acc[ability] ?? {}),
                  [combo_points]: {
                    ability,
                    combo_points,
                    effect,
                  },
                },
              };
            },
            {}
          ),
          dailyQuestChests: dailyQuestChests.reduce(
            (
              acc: Record<number, IQuestChest>,
              cv: [number, string, number]
            ) => {
              const chest_number: number = cv[0];
              const reward_type: string = cv[1];
              const reward_amount: number = cv[2];
              return {
                ...acc,
                [chest_number]: {
                  chest_number,
                  reward_type,
                  reward_amount,
                },
              };
            },
            {}
          ),
          weeklyQuestChests: weeklyQuestChests.reduce(
            (
              acc: Record<number, IQuestChest>,
              cv: [number, string, number]
            ) => {
              const chest_number: number = cv[0];
              const reward_type: string = cv[1];
              const reward_amount: number = cv[2];
              return {
                ...acc,
                [chest_number]: {
                  chest_number,
                  reward_type,
                  reward_amount,
                },
              };
            },
            {}
          ),
          playerLevels,
          eventQuests,
        });
      }
    };
    const restoreSQL = assembleRestoreSQL();
    const selectCardsSQL =
      "SELECT card, rarity, is_basic, is_mergeresult, base_attack, base_defense FROM cards ORDER BY card;";
    const selectCardAvailabilitiesSQL =
      "SELECT card, availability FROM card_availabilities;";
    const selectCombosSQL =
      "SELECT card1, card2, result FROM combos ORDER BY card1, card2;";
    const selectPoolSQL =
      "SELECT path, world, enemy, stage, battle, enemy_name, wins, reward FROM card_pool ORDER BY path, world, enemy, stage, battle;";
    const selectDustUpgradeSQL =
      "SELECT rarity, `2`, `3`, `4`, `5` FROM dust_upgrade;";
    const selectDustRecycleSQL =
      "SELECT rarity, `1`, `2`, `3`, `4`, `5` FROM dust_recycle;";
    const abilitiesSQL = "SELECT ability, combo_points, effect FROM abilities;";
    const dailyQuestChestSQL =
      "SELECT chest_number, reward_type, reward_amount FROM quest_chests WHERE quest_type = 'daily';";
    const weeklyQuestChestSQL =
      "SELECT chest_number, reward_type, reward_amount FROM quest_chests WHERE quest_type = 'weekly';";
    const playerLevelSQL =
      "SELECT level, required_xp, reward_type, reward_amount FROM player_level;";
    const eventQuestSQL =
      "SELECT event_number, event_name, event_chapter, quest_number, quest_text FROM event_quests ORDER BY event_number, quest_number;";
    props.db.postMessage({
      id: "select_card_data",
      action: "exec",
      sql: `${restoreSQL} ${selectCardsSQL} ${selectCardAvailabilitiesSQL} ${selectCombosSQL} ${selectPoolSQL} ${selectDustUpgradeSQL} ${selectDustRecycleSQL} ${abilitiesSQL} ${dailyQuestChestSQL} ${weeklyQuestChestSQL} ${playerLevelSQL} ${eventQuestSQL}`,
    });
  }, [props.db]);

  useEffect(() => {
    if (props.db) {
      fetchData();
    }
  }, [props.db, fetchData]);

  return (
    <CardContext.Provider value={cardData}>
      {props.db && cardData && props.children}
    </CardContext.Provider>
  );
};

export default CardProvider;
