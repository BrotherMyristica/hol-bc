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
import { TableCell, TableRow } from "@mui/material";
import GameCard from "./game-card";
import CardDetail from "./card-detail";

const Opponents = () => {
  const [detail, setDetail] = useState("");
  const cardCtx = useContext(CardContext);
  if (!cardCtx) {
    return null;
  }

  const { combos, cardAvailabilities, cardPool } = cardCtx;

  const sortedCardPool = cardPool.toSorted(
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
    <Container maxWidth="lg">
      <CardDetail
        combos={combos}
        card={detail}
        cardAvailabilities={cardAvailabilities}
        setCard={setDetail}
        pool={cardPool}
      />
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
                                onClick={() => setDetail(cardPool.reward)}
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
    </Container>
  );
};

export default Opponents;
