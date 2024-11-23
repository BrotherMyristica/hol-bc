import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";

import TableHead from "@mui/material/TableHead";
import Paper from "@mui/material/Paper";

import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid2";
import { useState, useEffect, useCallback } from "react";
import { addBestCardSql, calculateValue } from "@/engine/sql";

const DeckBuilder = (props: { db: Worker; active: boolean }) => {
  const [available, setAvailable] = useState([]);
  const [deck, setDeck] = useState([]);

  const selectDeckSql =
    "SELECT card, amount FROM available_cards ORDER BY card; SELECT uid, card FROM deck ORDER BY uid";

  const fetchData = useCallback(() => {
    props.db.onmessage = (event) => {
      if (event.data.id === "select_deck") {
        const a = event.data.results[0].values;
        const d = event.data.results[1]?.values ?? [];
        setAvailable(a);
        setDeck(d);
        console.log(a);
        console.log(d);
      }
    };
    props.db.postMessage({
      id: "select_deck",
      action: "exec",
      sql: `${calculateValue} ${selectDeckSql}`,
    });
  }, [props.db]);

  const addBestCard = () => {
    props.db.postMessage({
      id: "select_deck",
      action: "exec",
      sql: `${addBestCardSql}; ${selectDeckSql}`,
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

  const removeCard = (uid: number) => {
    props.db.postMessage({
      id: "select_deck",
      action: "exec",
      sql: `DELETE FROM deck WHERE uid=$uid; ${selectDeckSql}`,
      params: { $uid: uid },
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
          <Button
            sx={{ minWidth: "200px" }}
            variant="contained"
            onClick={() => addBestCard()}
            disabled={deck.length < 1}
          >
            Add best card
          </Button>
        </Grid>
        <Grid size={6}>
          <Paper sx={{ padding: "5px" }}>
            <h4 style={{ textAlign: "center" }}>Available Cards</h4>
            <TableContainer>
              <Table sx={{ width: "100%", marginTop: "1em" }} size="small">
                <TableHead>
                  <TableRow>
                    <TableCell align="right">Remaining Copies</TableCell>
                    <TableCell align="center">Card</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {available.map((item) => (
                    <TableRow key={item[0]}>
                      <TableCell align="right">{item[1]}</TableCell>
                      <TableCell align="center">
                        <Button
                          sx={{ width: "200px" }}
                          variant="outlined"
                          onClick={() => addCard(item[0])}
                          disabled={item[1] < 1}
                        >
                          {item[0]}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
        <Grid size={6}>
          <Paper sx={{ padding: "5px", minHeight: "90vh" }}>
            <h4 style={{ textAlign: "center" }}>Deck ({deck.length})</h4>
            {deck.length >= 30 && (
              <p style={{ textAlign: "center", color: "red" }}>
                When there are too many cards in your deck it means your are
                less likely to draw your good cards.
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
                        <Button
                          sx={{ width: "200px" }}
                          variant="outlined"
                          onClick={() => removeCard(item[0])}
                        >
                          {item[1]}
                        </Button>
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
