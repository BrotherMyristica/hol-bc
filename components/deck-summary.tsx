import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";

import TableHead from "@mui/material/TableHead";
import Paper from "@mui/material/Paper";

import Grid from "@mui/material/Grid2";
import { useState, useEffect, useCallback, useContext } from "react";
import { calculateValue } from "@/engine/sql";
import GameCard from "./game-card";
import ComboMap from "./combo-map";
import GridOnIcon from "@mui/icons-material/GridOn";
import IconButton from "@mui/material/IconButton";
import CardDetail from "./card-detail";
import { CardContext } from "./card-context";

const DeckSummary = (props: { db: Worker; active: boolean }) => {
  const [mapOpen, setMapOpen] = useState(false);
  const [detail, setDetail] = useState("");
  const [deck, setDeck] = useState([]);
  const [deckCombos, setDeckCombos] = useState([]);

  const selectDeckSql =
    "SELECT card, amount FROM final_deck ORDER BY card; SELECT card1, card2, result, rarity, level, attack, defense, value FROM deck_combos ORDER BY value DESC";

  const fetchData = useCallback(() => {
    props.db.onmessage = (event) => {
      if (event.data.id === "select_deck") {
        const d = event.data.results[0].values;
        const c = event.data.results[1]?.values ?? [];
        setDeck(d);
        setDeckCombos(c);
      }
    };
    props.db.postMessage({
      id: "select_deck",
      action: "exec",
      sql: `${calculateValue} ${selectDeckSql}`,
    });
  }, [props.db]);

  useEffect(() => {
    if (props.active && props.db) {
      fetchData();
    }
  }, [props.active, props.db, fetchData]);

  const cardCtx = useContext(CardContext);

  if (!cardCtx) {
    return null;
  }

  const { combos, cardPool } = cardCtx;

  return (
    <>
      <CardDetail
        combos={combos}
        card={detail}
        cardAvailabilities={cardCtx.cardAvailabilities}
        setCard={setDetail}
        pool={cardPool}
      />
      <ComboMap
        cards={deck}
        combos={deckCombos}
        open={mapOpen}
        setCard={setDetail}
        close={() => setMapOpen(false)}
      />
      <Grid container rowSpacing={2} columnSpacing={10}>
        <Grid size={4}>
          <Paper sx={{ padding: "5px" }}>
            <h4 style={{ textAlign: "center" }}>Deck</h4>
            <TableContainer>
              <Table sx={{ width: "100%", marginTop: "1em" }} size="small">
                <TableHead>
                  <TableRow>
                    <TableCell align="center">Card</TableCell>
                    <TableCell align="left">Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {deck.map((item) => (
                    <TableRow key={item[0]}>
                      <TableCell align="center">
                        <GameCard
                          card={item[0]}
                          onClick={() => setDetail(item[0])}
                        />
                      </TableCell>
                      <TableCell align="left">{item[1]}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
        <Grid size={8}>
          <Paper
            sx={{ padding: "5px", minHeight: "90vh", position: "relative" }}
          >
            <h4 style={{ textAlign: "center" }}>Combos</h4>
            <IconButton
              sx={{
                borderRadius: "5px",
                position: "absolute",
                top: "15px",
                right: "15px",
              }}
              color="primary"
              onClick={() => setMapOpen(true)}
              disabled={deckCombos.length < 1}
            >
              <GridOnIcon />
            </IconButton>
            <TableContainer>
              <Table sx={{ width: "100%", marginTop: "1em" }} size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Card 1</TableCell>
                    <TableCell>Card 2</TableCell>
                    <TableCell>Result</TableCell>
                    <TableCell>Rating</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {deckCombos.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <GameCard
                          card={item[0]}
                          onClick={() => setDetail(item[0])}
                        />
                      </TableCell>
                      <TableCell>
                        <GameCard
                          card={item[1]}
                          onClick={() => setDetail(item[1])}
                        />
                      </TableCell>

                      <TableCell>
                        <GameCard
                          card={item[2]}
                          level={item[4]}
                          attack={item[5]}
                          defense={item[6]}
                          showDetails={true}
                          onClick={() => setDetail(item[2])}
                        />
                      </TableCell>

                      <TableCell align="center">
                        {Math.round(100 * item[7]) / 100}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </>
  );
};

export default DeckSummary;
