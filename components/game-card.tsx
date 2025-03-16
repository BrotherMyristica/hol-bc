import { useInView } from "react-intersection-observer";

import BoltIcon from "@mui/icons-material/Bolt";
import ShieldIcon from "@mui/icons-material/Shield";

import { MouseEventHandler, useContext, useState } from "react";
import { CardContext } from "./card-context";
import Stack from "@mui/material/Stack";

import Tooltip from "@mui/material/Tooltip";

import { LinkSymbol, BasicSymbol } from "./symbols";

const GameCard = (props: {
  card: string;
  attack?: number;
  defense?: number;
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLDivElement>;
  showDetails?: boolean;
  noCenter?: boolean;
  level?: number;
}) => {
  const [isInView, setIsInView] = useState(false);
  const { ref } = useInView({
    onChange: (inView) => {
      if (inView) {
        setIsInView(true);
      }
    },
    triggerOnce: true,
  });
  const cards = useContext(CardContext);

  if (!cards) {
    return null;
  }

  const cardDetails = cards.cardsByName[props.card];

  const colors = {
    Common: "#CD7F32",
    Uncommon: "#C0C0C0",
    Rare: "#FFD700",
    Epic: "#800080",
  };

  const attack = props.attack ?? cardDetails.base_attack;
  const defense = props.defense ?? cardDetails.base_defense;

  const clickable = !props.disabled && props.onClick;

  return (
    <div
      ref={ref}
      className={`card ${props.showDetails && "detailcard"} ${
        props.disabled && "disabled"
      } ${clickable && "clickable"}`}
      onClick={clickable ? props.onClick : undefined}
    >
      <Stack>
        <b
          style={{
            whiteSpace: "nowrap",
          }}
        >
          {props.card}
        </b>
        {props.showDetails && isInView && (
          <Stack direction="row" spacing={1} sx={{ margin: "auto" }}>
            <div
              className="details"
              style={{ textAlign: "right", minWidth: "50px" }}
            >
              <Tooltip title="Attack">
                <BoltIcon sx={{ fontSize: "1em", verticalAlign: "text-top" }} />
              </Tooltip>
              {attack}{" "}
              <Tooltip title="Defense">
                <ShieldIcon
                  sx={{ fontSize: "1em", verticalAlign: "text-top" }}
                />
              </Tooltip>
              {defense}
            </div>
            <div className="details" style={{ textAlign: "center" }}>
              Lv. {props.level ?? "1"}
            </div>
            <div className="details" style={{ textAlign: "right" }}>
              <Stack
                direction="row"
                spacing={0.3}
                sx={{ paddingTop: "0.2em", fontSize: "1.1em" }}
              >
                <BasicSymbol show={cardDetails.is_basic} />
                <LinkSymbol show={cardDetails.is_mergeresult} />
              </Stack>
            </div>
          </Stack>
        )}
      </Stack>
      <style jsx>
        {`
          .card {
            border: 2px solid;
            border-color: ${colors[cardDetails.rarity]};
            padding: 5px;
            border-radius: 5px;
            background-color: ${colors[cardDetails.rarity]}20;
            text-align: center;
            min-width: 130px;
            max-width: 300px;
            margin: ${props.noCenter ? "0" : "auto"};
          }
          .detailcard {
            min-height: 3.5em;
          }
          .card.clickable:hover {
            filter: drop-shadow(0px 0px 5px ${colors[cardDetails.rarity]}80);
            cursor: pointer;
          }
          .card.clickable:active {
            filter: brightness(0.8);
          }
          .disabled {
            color: #c0c0c0;
            border-color: #c0c0c0;
            background-color: #f0f0f0;
          }
          .details {
            font-size: 0.8em;
            white-space: nowrap;
          }
          p {
            margin: 0px;
          }
        `}
      </style>
    </div>
  );
};

export default GameCard;
