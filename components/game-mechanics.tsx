import Container from "@mui/material/Container";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";

import {
  CardContext,
  IAbility,
  ICardDetails,
  IDustRecycle,
  IDustUpgrade,
  IEventQuest,
  ILootTableEntry,
  IMiniEventReward,
  IPlayerLevel,
  IQuestChest,
} from "./card-context";
import { useCallback, useContext, useMemo, useState } from "react";
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

const EventQuestTable = (props: { eventQuests: IEventQuest[] }) => {
  const events = useMemo(
    () => [...new Set(props.eventQuests.map((e) => e.event_name))],
    [props.eventQuests]
  );
  const quests = useMemo(
    () =>
      props.eventQuests.reduce(
        (acc: Record<string, IEventQuest[]>, cv) => ({
          ...acc,
          [cv.event_name]: [...(acc[cv.event_name] ?? []), cv],
        }),
        {}
      ),
    [props.eventQuests]
  );
  const [selectedEvent, setSelectedEvent] = useState(events.at(-1) ?? "");
  return (
    <>
      <FormControl fullWidth>
        <InputLabel id="demo-simple-select-label">Event</InputLabel>
        <Select
          value={selectedEvent}
          label="Event"
          onChange={(e) => setSelectedEvent(e.target.value)}
        >
          {events.map((e, i) => (
            <MenuItem key={i} value={e}>
              {e}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <TableContainer>
        <Table sx={{ marginTop: "1em", border: "1px solid lightgray" }}>
          <TableHead>
            <TableRow>
              <TableCell
                sx={{ textAlign: "right", backgroundColor: "lightgray" }}
              >
                Chapter - Quest number
              </TableCell>
              <TableCell
                sx={{ textAlign: "left", backgroundColor: "lightgray" }}
              >
                Quest objective
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(quests[selectedEvent] ?? []).map((q, i) => (
              <TableRow key={i}>
                <TableCell
                  sx={{ textAlign: "right" }}
                >{`${q.event_chapter}-${q.quest_number}`}</TableCell>
                <TableCell sx={{ textAlign: "left" }}>{q.quest_text}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

const LootTable = (props: {
  lootTable: ILootTableEntry[];
  col1: string;
  col2: string;
  setDetail: (card: string) => void;
}) => {
  return (
    <>
      <TableContainer>
        <Table sx={{ marginTop: "1em", border: "1px solid lightgray" }}>
          <TableHead>
            <TableRow>
              <TableCell
                sx={{ textAlign: "center", backgroundColor: "lightgray" }}
              >
                {props.col1}
              </TableCell>
              <TableCell
                sx={{ textAlign: "center", backgroundColor: "lightgray" }}
              >
                {props.col2}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {props.lootTable.map((l, i) => (
              <TableRow key={i}>
                <TableCell sx={{ textAlign: "center" }}>
                  {l.reward_category === "Card" ? (
                    <GameCard
                      card={l.reward}
                      showDetails
                      onClick={() => props.setDetail(l.reward)}
                    />
                  ) : (
                    l.reward
                  )}
                </TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                  {l.value_text}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

const MiniEventData = (props: {
  miniEventRewards: IMiniEventReward[];
  setDetail: (card: string) => void;
}) => {
  const events = useMemo(
    () => [...new Set(props.miniEventRewards.map((e) => e.event_name))],
    [props.miniEventRewards]
  );
  const [selectedEvent, setSelectedEvent] = useState(events.at(-1) ?? "");

  const calculateSignificantDigits = useCallback(
    (number: number, relativeError: number = 0.029, minDigits: number = 0) => {
      if (number === 0) {
        return 0;
      }
      const absNumber = Math.abs(number);
      const firstDigit = Math.floor(Math.log10(absNumber)) + 1;
      const nthDigit = Math.min(
        minDigits,
        Math.floor(Math.log10(absNumber * relativeError))
      );
      const significantDigits = firstDigit - nthDigit;
      return significantDigits;
    },
    []
  );

  const formatValueText = useCallback(
    <T extends { value: number }>(
      obj: T,
      percentage: boolean = true
    ): T & { value_text: string } => {
      const multiplier = percentage ? 100 : 1;
      const suffix = percentage ? "\u202F%" : "";
      const value = multiplier * obj.value;
      const precision = calculateSignificantDigits(value);
      const value_text = value.toPrecision(precision) + suffix;
      return { ...obj, value_text };
    },
    [calculateSignificantDigits]
  );

  const selectedMiniEventRewards = useMemo(
    () =>
      props.miniEventRewards.filter((e) => {
        return e.event_name === selectedEvent;
      }),
    [props.miniEventRewards, selectedEvent]
  );
  const cardPullRewards = useMemo(
    () =>
      selectedMiniEventRewards
        .filter(
          (e) => e.reward_source === "Pull" && e.reward_category === "Card"
        )
        .map((e) => formatValueText(e)),
    [selectedMiniEventRewards, formatValueText]
  );
  const resourcePullRewards = useMemo(
    () =>
      selectedMiniEventRewards
        .filter(
          (e) => e.reward_source === "Pull" && e.reward_category !== "Card"
        )
        .map((e) => formatValueText(e, false)),
    [selectedMiniEventRewards, formatValueText]
  );
  const chestRewards = useMemo(() => {
    const grouped = selectedMiniEventRewards
      .filter((e) => e.reward_source !== "Pull")
      .map((e) => formatValueText(e))
      .reduce<Record<string, (IMiniEventReward & { value_text: string })[]>>(
        (acc, item) => {
          const key = item.reward_source;
          if (!acc[key]) {
            acc[key] = [];
          }
          acc[key].push(item);
          return acc;
        },
        {}
      );
    return Object.keys(grouped)
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
      .map((key) => grouped[key]);
  }, [selectedMiniEventRewards, formatValueText]);

  return (
    <>
      <FormControl fullWidth>
        <InputLabel>Event</InputLabel>
        <Select
          value={selectedEvent}
          label="Event"
          onChange={(e) => setSelectedEvent(e.target.value)}
        >
          {events.map((e, i) => (
            <MenuItem key={i} value={e}>
              {e}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {cardPullRewards && (
        <div>
          <h4 style={{ marginBottom: 0 }}>Card drop rates for pulls</h4>
          <LootTable
            lootTable={cardPullRewards}
            col1="Card"
            col2="Chance to get card within 100 pulls"
            setDetail={props.setDetail}
          />
        </div>
      )}
      {resourcePullRewards && (
        <div>
          <h4 style={{ marginBottom: 0 }}>Resource drops for pulls</h4>
          <LootTable
            lootTable={resourcePullRewards}
            col1="Resource"
            col2="Average amount within 100 pulls"
            setDetail={props.setDetail}
          />
        </div>
      )}
      {chestRewards.map((singleChestRewards) => (
        <>
          <h4 style={{ marginBottom: 0 }}>
            Drop rates for {singleChestRewards[0].reward_source}
          </h4>
          <LootTable
            lootTable={singleChestRewards}
            col1="Reward"
            col2="Chance"
            setDetail={props.setDetail}
          />
        </>
      ))}
    </>
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
    eventQuests,
    combos,
    cardAvailabilities,
    cardPool,
    miniEventRewards,
  } = cardCtx;

  const sections = [
    {
      title: "Event quests",
      component: EventQuestTable,
      props: { eventQuests },
    },
    {
      title: "Ticket Event Rewards",
      component: MiniEventData,
      props: { miniEventRewards, setDetail },
    },
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
