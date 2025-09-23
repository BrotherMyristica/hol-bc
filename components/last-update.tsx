import { useContext, useEffect } from "react";
import { CardContext } from "./card-context";

interface LastUpdateProps {
  setLastUpdate: (_: string) => void;
}

const LastUpdate = ({ setLastUpdate }: LastUpdateProps) => {
  const cardCtx = useContext(CardContext);

  const { staticData } = cardCtx || {};

  useEffect(() => {
    if (staticData?.last_update) {
      setLastUpdate("Last update: " + staticData?.last_update);
    }
  }, [setLastUpdate, staticData?.last_update]);

  return null;
};

export default LastUpdate;
