import Container from "@mui/material/Container";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";

import {
  CardContext,
  IAbility,
  ICardDetails,
  IDustRecycle,
  IDustUpgrade,
  IPlayerLevel,
  IQuestChest,
} from "./card-context";
import { useContext, useState } from "react";
import TableHead from "@mui/material/TableHead";
import { TableCell, TableRow } from "@mui/material";
import GameCard from "./game-card";
import CardDetail from "./card-detail";

const DustUpgradeRecycleTable = (props: {
  dustUpgrade: IDustUpgrade[];
  dustRecycle: IDustRecycle[];
}) => (
  <>
    <TableContainer>
      <Table sx={{ marginTop: "1em", border: "1px solid lightgray" }}>
        <TableHead>
          <TableRow>
            <TableCell
              sx={{ textAlign: "center", backgroundColor: "lightgray" }}
              colSpan={6}
            >
              Dust cost for card upgrades
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ textAlign: "right" }}>Rarity</TableCell>
            {Object.entries(props.dustUpgrade[0]).map((e) => {
              if (e[0] === "rarity") {
                return null;
              }
              return (
                <TableCell key={e[0]} sx={{ textAlign: "right" }}>
                  {e[0]}
                </TableCell>
              );
            })}
          </TableRow>
        </TableHead>
        <TableBody>
          {props.dustUpgrade.map((e, index) => (
            <TableRow key={index}>
              <TableCell sx={{ textAlign: "right" }}>{e.rarity}</TableCell>
              {Object.entries(e).map(([k, v]) => {
                if (k === "rarity") {
                  return null;
                }
                return (
                  <TableCell sx={{ textAlign: "right" }} key={k}>
                    {v}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
    <TableContainer>
      <Table
        sx={{
          marginTop: "3em",
          marginBottom: "1em",
          border: "1px solid lightgray",
        }}
      >
        <TableHead>
          <TableRow>
            <TableCell
              sx={{ textAlign: "center", backgroundColor: "lightgray" }}
              colSpan={6}
            >
              Dust refund for card recycling
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ textAlign: "right" }}>Rarity</TableCell>
            {Object.entries(props.dustRecycle[0]).map((e) => {
              if (e[0] === "rarity") {
                return null;
              }
              return (
                <TableCell key={e[0]} sx={{ textAlign: "right" }}>
                  {e[0]}
                </TableCell>
              );
            })}
          </TableRow>
        </TableHead>
        <TableBody>
          {props.dustRecycle.map((e, index) => (
            <TableRow key={index}>
              <TableCell sx={{ textAlign: "right" }}>{e.rarity}</TableCell>
              {Object.entries(e).map(([k, v]) => {
                if (k === "rarity") {
                  return null;
                }
                return (
                  <TableCell sx={{ textAlign: "right" }} key={k}>
                    {v}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  </>
);

const CardStatsCalculation = () => (
  <>
    <h3>Final Cards</h3>
    <p>
      The base stats apply for level 1 cards. For each further level ATK and DEF
      are both increased by +1 for common, +2 for uncommon, +3 for rare, +4 for
      epic cards.
    </p>
    <h3>Combo Cards</h3>
    <p>
      When combining two basic cards into a combo card, the stats of the combo
      card depend on its own rarity and the level and the rarity of the{" "}
      <i>used basic cards</i>.
    </p>
    <p>
      <b>Step 1 - Level of combo card: </b>
      The level of the combo is the <i>average</i> (rounded up) of the two basic
      cards, +1 if the result is a <i>rare or epic</i> card.
    </p>
    <p>
      <b>Step 2 - Stats of combo card: </b>
      The base stats apply for level 1 cards. For each further level ATK and DEF
      are both increased by +1/+2/+3 if the <i>
        highest-rarity basic card
      </i>{" "}
      used is common/uncommon/rare.
    </p>
  </>
);

const Abilities = (props: {
  abilities: Record<string, Record<number, IAbility>>;
}) => {
  const abilities = [
    ["healer", "Healer", "Heal HP"],
    ["elementalist", "Elementalist", "Deal DMG"],
    ["enchanter", "Enchanter", "Increase ATK/DEF"],
  ];
  const comboPoints = Array.from({ length: 5 }, (_, i) => i + 1);
  return (
    <TableContainer>
      <Table sx={{ marginTop: "1em", border: "1px solid lightgray" }}>
        <TableHead>
          <TableRow>
            <TableCell
              sx={{ textAlign: "center", backgroundColor: "lightgray" }}
            ></TableCell>
            {abilities.map((e, i) => (
              <TableCell key={i} sx={{ textAlign: "center" }}>
                {e[1]}
              </TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell
              sx={{ textAlign: "center", backgroundColor: "lightgray" }}
            >
              Combo points
            </TableCell>
            {abilities.map((e, i) => (
              <TableCell key={i} sx={{ textAlign: "center" }}>
                {e[2]}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {comboPoints.map((comboPoint) => (
            <TableRow key={comboPoint}>
              <TableCell
                sx={{ textAlign: "center", backgroundColor: "lightgray" }}
              >
                {comboPoint}
              </TableCell>
              {abilities.map((ability, i) => (
                <TableCell key={i} sx={{ textAlign: "center" }}>
                  {props.abilities[ability[0]][comboPoint].effect}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const QuestChest = (props: { questChests: Record<number, IQuestChest> }) => {
  const chests = Array.from({ length: 5 }, (_, i) => i + 1);
  return (
    <TableContainer>
      <Table sx={{ marginTop: "1em", border: "1px solid lightgray" }}>
        <TableHead>
          <TableRow>
            <TableCell
              sx={{ textAlign: "center", backgroundColor: "lightgray" }}
            >
              Chest
            </TableCell>
            {chests.map((e, i) => (
              <TableCell
                key={i}
                sx={{ textAlign: "center", backgroundColor: "lightgray" }}
              >
                {e}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell sx={{ textAlign: "center" }}>Reward</TableCell>
            {chests.map((e, i) => (
              <TableCell key={i} sx={{ textAlign: "center" }}>
                {props.questChests[e].reward_amount}{" "}
                {props.questChests[e].reward_type}
              </TableCell>
            ))}
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const PlayerLevels = (props: {
  playerLevels: IPlayerLevel[];
  cardsByName: Record<string, ICardDetails>;
  setDetail: (card: string) => void;
}) => {
  let totalXP: number = 0;
  return (
    <TableContainer>
      <Table sx={{ marginTop: "1em", border: "1px solid lightgray" }}>
        <TableHead>
          <TableRow>
            <TableCell
              sx={{ textAlign: "center", backgroundColor: "lightgray" }}
            >
              Level
            </TableCell>
            <TableCell
              sx={{ textAlign: "center", backgroundColor: "lightgray" }}
            >
              Required XP
            </TableCell>
            <TableCell
              sx={{ textAlign: "center", backgroundColor: "lightgray" }}
            >
              Total XP
            </TableCell>
            <TableCell
              sx={{ textAlign: "center", backgroundColor: "lightgray" }}
            >
              Reward
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {props.playerLevels.map((e, i) => {
            totalXP += e.required_xp;
            return (
              <TableRow key={i}>
                <TableCell sx={{ textAlign: "center" }}>{e.level}</TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                  {e.required_xp}
                </TableCell>
                <TableCell sx={{ textAlign: "center" }}>{totalXP}</TableCell>
                <TableCell>
                  <ul
                    style={{
                      marginTop: "-10px",
                      marginBottom: 0,
                      listStyleType: "none",
                    }}
                  >
                    {e.rewards.map((r, i) => (
                      <li key={i} style={{ marginTop: "10px" }}>
                        {r.reward_type in props.cardsByName ? (
                          <GameCard
                            card={r.reward_type}
                            showDetails
                            noCenter
                            onClick={() => props.setDetail(r.reward_type)}
                          />
                        ) : (
                          `${r.reward_amount} ${r.reward_type}`
                        )}
                      </li>
                    ))}
                  </ul>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const GameMechanics = () => {
  const [detail, setDetail] = useState("");
  const cardCtx = useContext(CardContext);
  if (!cardCtx) {
    return null;
  }

  const {
    cardsByName,
    dustUpgrade,
    dustRecycle,
    abilities,
    dailyQuestChests,
    weeklyQuestChests,
    playerLevels,
    combos,
    cardAvailabilities,
    cardPool,
  } = cardCtx;

  const sections = [
    {
      title: "Dust for upgrading/recycling cards",
      component: DustUpgradeRecycleTable,
      props: { dustUpgrade, dustRecycle },
    },
    {
      title: "Daily Quest Chests",
      component: QuestChest,
      props: { questChests: dailyQuestChests },
    },
    {
      title: "Weekly Quest Chests",
      component: QuestChest,
      props: { questChests: weeklyQuestChests },
    },
    {
      title: "Abilities",
      component: Abilities,
      props: { abilities },
    },
    {
      title: "Level up requirements and rewards",
      component: PlayerLevels,
      props: {
        playerLevels,
        cardsByName,
        setDetail,
      },
    },
    {
      title: "Calculating the stats of cards",
      component: CardStatsCalculation,
      props: {},
    },
  ];

  return (
    <Container maxWidth="lg">
      <CardDetail
        combos={combos}
        card={detail}
        cardAvailabilities={cardAvailabilities}
        setCard={setDetail}
        pool={cardPool}
      />
      <h2>Navigation</h2>
      <ul>
        {sections.map(({ title }, i) => {
          return (
            <li key={i}>
              <a href={`#${i.toString()}`}>{title}</a>
            </li>
          );
        })}
      </ul>
      {sections.map(({ title, component: Component, props }, i) => {
        return (
          <div key={i}>
            <h2 id={i.toString()} style={{ marginTop: "2em" }}>
              {title}
            </h2>
            {/*
            // @ts-expect-error as the list contains different components with different props*/}
            <Component {...props} />
          </div>
        );
      })}
    </Container>
  );
};

export default GameMechanics;
