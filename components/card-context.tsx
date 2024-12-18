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

export const CardContext = createContext<null | {
  cards: ICardDetails[];
  combos: ICombos[];
  cardPool: ICardPool[];
}>(null);

const CardProvider = (props: { db: Worker; children: React.ReactNode }) => {
  const [cardData, setCardData] = useState<null | {
    cards: ICardDetails[];
    combos: ICombos[];
    cardPool: ICardPool[];
  }>(null);

  const fetchData = useCallback(() => {
    props.db.onmessage = (event) => {
      if (event.data.id === "select_card_data") {
        const d = event.data.results[0].values;
        const c = event.data.results[1].values;
        const p = event.data.results[2].values;
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
        });
      }
    };
    const restoreSQL = assembleRestoreSQL();
    const selectCardsSQL =
      "SELECT card, rarity, is_basic, is_mergeresult, base_attack, base_defense FROM cards ORDER BY card;";
    const selectCombosSQL =
      "SELECT card1, card2, result FROM combos ORDER BY card1, card2;";
    const selectPoolSQL =
      "SELECT world, enemy, stage, battle, enemy_name, wins, reward FROM card_pool ORDER BY world, enemy, stage, battle;";
    props.db.postMessage({
      id: "select_card_data",
      action: "exec",
      sql: `${restoreSQL} ${selectCardsSQL} ${selectCombosSQL} ${selectPoolSQL}`,
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
