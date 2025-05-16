import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Container from "@mui/material/Container";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";

import { CardContext, ICardPool } from "./card-context";
import { useContext, useState } from "react";
import TableHead from "@mui/material/TableHead";
import { Box, Tab, TableCell, TableRow } from "@mui/material";
import GameCard from "./game-card";
import CardDetail from "./card-detail";
import { TabContext, TabList, TabPanel } from "@mui/lab";

const OpponentsOfPath = (props: {
  path: string;
  cardPool: ICardPool[];
  setDetail: (arg0: string) => void;
}) => {
  const filteredCardPool = props.cardPool.filter((e) => e.path === props.path);

  const sortedCardPool = filteredCardPool.toSorted(
    (a, b) => 100 * a.world + a.wins - 100 * b.world - b.wins
  );

  const cardPoolByWorld: {
    [world: number]: { [wins: number]: { [enemy: number]: ICardPool } };
  } = sortedCardPool.reduce(
    (
      a: {
        [world: number]: { [wins: number]: { [enemy: number]: ICardPool } };
      },
      v
    ) => ({
      ...a,
      [v.world]: {
        ...a[v.world],
        [v.wins]: { ...a[v.world]?.[v.wins], [v.enemy]: v },
      },
    }),
    {}
  );

  return (
    <>
      {Object.entries(cardPoolByWorld).map(([world, cardPoolByWins]) => (
        <Accordion key={world} defaultExpanded={world === "1"}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <b>Round {world}</b>
          </AccordionSummary>
          <AccordionDetails>
            <TableContainer>
              <Table sx={{ width: "100%", marginTop: "1em" }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ textAlign: "right" }}>
                      Required wins
                    </TableCell>
                    {Object.entries(cardPoolByWins[1]).map(
                      ([enemy, cardPool]) => (
                        <TableCell key={enemy} sx={{ textAlign: "center" }}>
                          {cardPool.enemyName}
                        </TableCell>
                      )
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(cardPoolByWins).map(
                    ([wins, cardPoolByEnemy]) => (
                      <TableRow key={wins}>
                        <TableCell sx={{ textAlign: "right" }}>
                          {wins}
                        </TableCell>
                        {Object.entries(cardPoolByEnemy).map(
                          ([enemy, cardPool]) => (
                            <TableCell key={enemy}>
                              <GameCard
                                card={cardPool.reward}
                                showDetails
                                onClick={() => props.setDetail(cardPool.reward)}
                              />
                            </TableCell>
                          )
                        )}
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </AccordionDetails>
        </Accordion>
      ))}
    </>
  );
};

const Opponents = () => {
  const [detail, setDetail] = useState("");
  const [tab, setTab] = useState("applicant");
  const cardCtx = useContext(CardContext);
  if (!cardCtx) {
    return null;
  }

  const { combos, cardAvailabilities, cardPool } = cardCtx;

  return (
    <Container maxWidth="lg">
      <CardDetail
        combos={combos}
        card={detail}
        cardAvailabilities={cardAvailabilities}
        setCard={setDetail}
        pool={cardPool}
      />
      <TabContext value={tab}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <TabList
            onChange={(_, v) => setTab(v)}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="The applicant's path" value="applicant" />
            <Tab label="The master's path" value="master" />
          </TabList>
        </Box>
        <TabPanel value="applicant">
          <OpponentsOfPath
            path="applicant"
            cardPool={cardPool}
            setDetail={setDetail}
          />
        </TabPanel>
        <TabPanel value="master">
          <OpponentsOfPath
            path="master"
            cardPool={cardPool}
            setDetail={setDetail}
          />
        </TabPanel>
      </TabContext>
    </Container>
  );
};

export default Opponents;
