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

export const CardContext = createContext<null | {
  cards: ICardDetails[];
  cardAvailabilities: ICardAvailabilities[];
  combos: ICombos[];
  cardPool: ICardPool[];
  dustUpgrade: IDustUpgrade[];
  dustRecycle: IDustRecycle[];
}>(null);

const CardProvider = (props: { db: Worker; children: React.ReactNode }) => {
  const [cardData, setCardData] = useState<null | {
    cards: ICardDetails[];
    cardAvailabilities: ICardAvailabilities[];
    combos: ICombos[];
    cardPool: ICardPool[];
    dustUpgrade: IDustUpgrade[];
    dustRecycle: IDustRecycle[];
  }>(null);

  const fetchData = useCallback(() => {
    props.db.onmessage = (event) => {
      if (event.data.id === "select_card_data") {
        const d = event.data.results[0].values;
        const a = event.data.results[1].values;
        const c = event.data.results[2].values;
        const p = event.data.results[3].values;
        const du = event.data.results[4].values;
        const dr = event.data.results[5].values;
        setCardData({
          cards: d.map(
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
              e: [number, number, number, number, string, number, string],
              index: number
            ) => ({
              id: index,
              world: e[0],
              enemy: e[1],
              stage: e[2],
              battle: e[3],
              enemyName: e[4],
              wins: e[5],
              reward: e[6],
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
      "SELECT world, enemy, stage, battle, enemy_name, wins, reward FROM card_pool ORDER BY world, enemy, stage, battle;";
    const selectDustUpgradeSQL =
      "SELECT rarity, `2`, `3`, `4`, `5` FROM dust_upgrade;";
    const selectDustRecycleSQL =
      "SELECT rarity, `1`, `2`, `3`, `4`, `5` FROM dust_recycle;";
    props.db.postMessage({
      id: "select_card_data",
      action: "exec",
      sql: `${restoreSQL} ${selectCardsSQL} ${selectCardAvailabilitiesSQL} ${selectCombosSQL} ${selectPoolSQL} ${selectDustUpgradeSQL} ${selectDustRecycleSQL}`,
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
