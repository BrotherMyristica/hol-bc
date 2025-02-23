import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";

import TableHead from "@mui/material/TableHead";
import Paper from "@mui/material/Paper";

import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid2";
import { useState, useEffect, useCallback } from "react";
import { addAllCardsSql, addBestCardSql, calculateValue } from "@/engine/sql";
import GameCard from "./game-card";
import { setDeckAll } from "@/engine/storage";
import Stack from "@mui/material/Stack";

const DeckBuilder = (props: { db: Worker; active: boolean }) => {
  const [available, setAvailable] = useState([]);
  const [sortSynergy, setSortSynergy] = useState(true);
  const [deck, setDeck] = useState([]);

  const selectDeckSql = `SELECT a.card, a.amount, COALESCE(s.relative_synergy, 0) FROM available_cards a LEFT JOIN deck_synergy s on a.card = s.new_card ORDER BY (a.amount > 0) DESC, ${
    sortSynergy ? "s.relative_synergy DESC" : "a.card"
  }, card; SELECT uid, card FROM deck ORDER BY uid`;

  const fetchData = useCallback(() => {
    props.db.onmessage = (event) => {
      if (event.data.id === "select_deck") {
        const a = event.data.results[0].values;
        const d = event.data.results[1]?.values ?? [];
        setAvailable(a);
        setDeck(d);
        setDeckAll(d.map((e: [number, string]) => e[1]));
      }
    };
    props.db.postMessage({
      id: "select_deck",
      action: "exec",
      sql: `${calculateValue} ${selectDeckSql}`,
    });
  }, [props.db, selectDeckSql]);

  const addBestCard = () => {
    props.db.postMessage({
      id: "select_deck",
      action: "exec",
      sql: `${addBestCardSql} ${selectDeckSql}`,
    });
  };

  const addCard = (card: string) => {
    props.db.postMessage({
      id: "select_deck",
      action: "exec",
      sql: `INSERT INTO deck (card) VALUES ($card); ${selectDeckSql}`,
      params: { $card: card },
    });
  };

  const fillDeck = () => {
    const amount = 30 - deck.length;
    if (amount < 1 || amount >= 30) {
      return;
    }
    props.db.postMessage({
      id: "select_deck",
      action: "exec",
      sql: `${addBestCardSql.repeat(amount)} ${selectDeckSql}`,
    });
  };

  const removeCard = (uid: number) => {
    props.db.postMessage({
      id: "select_deck",
      action: "exec",
      sql: `DELETE FROM deck WHERE uid=$uid; ${selectDeckSql}`,
      params: { $uid: uid },
    });
  };

  const clearDeck = () => {
    props.db.postMessage({
      id: "select_deck",
      action: "exec",
      sql: `DELETE FROM deck; ${selectDeckSql}`,
    });
  };

  const addAllCards = () => {
    props.db.postMessage({
      id: "select_deck",
      action: "exec",
      sql: `${addAllCardsSql} ${selectDeckSql}`,
    });
  };

  useEffect(() => {
    if (props.active && props.db) {
      fetchData();
    }
  }, [props.active, props.db, fetchData]);

  return (
    <Container maxWidth="lg">
      <Grid container rowSpacing={2} columnSpacing={10}>
        <Grid size={12} sx={{ textAlign: "center" }}>
          <Stack
            direction={"row"}
            spacing={2}
            sx={{ justifyContent: "center" }}
          >
            <Button
              sx={{ minWidth: "200px" }}
              variant="outlined"
              onClick={() => clearDeck()}
              disabled={deck.length < 1}
            >
              Clear deck
            </Button>
            <Button
              sx={{ minWidth: "200px" }}
              variant="outlined"
              onClick={() => addAllCards()}
              disabled={available.length < 1}
            >
              Add all cards
            </Button>
            <Button
              sx={{ minWidth: "200px" }}
              variant="contained"
              onClick={() => addBestCard()}
              disabled={deck.length < 1}
            >
              Add best card
            </Button>
            <Button
              sx={{ minWidth: "200px" }}
              variant="contained"
              onClick={() => fillDeck()}
              disabled={deck.length < 1 || deck.length >= 30}
            >
              Fill deck
            </Button>
          </Stack>
        </Grid>
        <Grid size={7}>
          <Paper sx={{ padding: "5px" }}>
            <h4 style={{ textAlign: "center" }}>Available Cards</h4>
            <Grid container justifyContent="center">
              <FormControlLabel
                control={
                  <Switch
                    checked={sortSynergy}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                      setSortSynergy(event.target.checked);
                    }}
                  />
                }
                label="Sort by Synergy"
              />
            </Grid>
            <TableContainer>
              <Table sx={{ width: "100%", marginTop: "1em" }} size="small">
                <TableHead>
                  <TableRow>
                    <TableCell align="right">Remaining Copies</TableCell>
                    <TableCell align="center">Card</TableCell>
                    <TableCell align="center">Synergy</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {available.map((item) => (
                    <TableRow key={item[0]}>
                      <TableCell align="right">{item[1]}</TableCell>
                      <TableCell align="center">
                        <GameCard
                          card={item[0]}
                          onClick={() => addCard(item[0])}
                          disabled={item[1] < 1}
                        />
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ color: item[1] === 0 ? "lightgray" : "black" }}
                      >
                        {Math.round(100 * item[2])}&thinsp;%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
        <Grid size={5}>
          <Paper sx={{ padding: "5px", minHeight: "90vh" }}>
            <h4 style={{ textAlign: "center" }}>Deck ({deck.length})</h4>
            {deck.length > 30 && (
              <p style={{ textAlign: "center", color: "red" }}>
                When there are too many cards in your deck it means you are less
                likely to draw your good cards.
              </p>
            )}
            <TableContainer>
              <Table sx={{ width: "100%", marginTop: "1em" }} size="small">
                <TableHead>
                  <TableRow>
                    <TableCell align="center">Card</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {deck.map((item) => (
                    <TableRow key={item[0]}>
                      <TableCell align="center">
                        <GameCard
                          card={item[1]}
                          onClick={() => removeCard(item[0])}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default DeckBuilder;
