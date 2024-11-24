import { createContext, useCallback, useEffect, useState } from "react";

type Rarities = "Common" | "Uncommon" | "Rare" | "Epic";

interface ICardDetails {
  card: string;
  rarity: Rarities;
  is_basic: boolean;
  is_mergeresult: boolean;
  base_attack: number;
  base_defense: number;
}

interface ICombos {
  card1: string;
  card2: string;
  result: string;
}

export const CardContext = createContext<null | {
  cards: ICardDetails[];
  combos: ICombos[];
}>(null);

const CardProvider = (props: { db: Worker; children: React.ReactNode }) => {
  const [cardData, setCardData] = useState<null | {
    cards: ICardDetails[];
    combos: ICombos[];
  }>(null);

  const fetchData = useCallback(() => {
    props.db.onmessage = (event) => {
      if (event.data.id === "select_card_data") {
        const d = event.data.results[0].values;
        const c = event.data.results[1].values;
        setCardData({
          cards: d.map(
            (e: [string, Rarities, boolean, boolean, number, number]) => ({
              card: e[0],
              rarity: e[1],
              is_basic: e[2],
              is_mergeresult: e[3],
              base_attack: e[4],
              base_defense: e[5],
            })
          ),
          combos: c.map((e: [string, string, string]) => ({
            card1: e[0],
            card2: e[1],
            result: e[2],
          })),
        });
      }
    };
    props.db.postMessage({
      id: "select_card_data",
      action: "exec",
      sql: "SELECT card, rarity, is_basic, is_mergeresult, base_attack, base_defense FROM cards; SELECT card1, card2, result FROM combos;",
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
