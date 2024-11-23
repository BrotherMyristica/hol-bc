import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";

import TableHead from "@mui/material/TableHead";

import Button from "@mui/material/Button";

import { useState, useEffect, useCallback } from "react";

import { calculateValue, multiCombos } from "@/engine/sql";

const CoreSuggestions = (props: {
  db: Worker;
  active: boolean;
  goToDeckBuilder: () => void;
}) => {
  const [suggestions, setSuggestions] = useState([]);

  const fetchData = useCallback(() => {
    props.db.onmessage = (event) => {
      if (event.data.id === "select_suggestions") {
        const result = event.data.results[0].values;
        setSuggestions(result);
      }
    };
    props.db.postMessage({
      id: "select_suggestions",
      action: "exec",
      sql: `${calculateValue} ${multiCombos} SELECT card1, card2, card3, card4, value FROM core_suggestions ORDER BY value DESC LIMIT 100`,
    });
  }, [props.db]);

  useEffect(() => {
    if (props.active && props.db) {
      fetchData();
    }
  }, [props.active, props.db, fetchData]);

  const startDeckBuilding = (
    suggestion: [string, string, string, string, number]
  ) => {
    props.db.onmessage = (event) => {
      if (event.data.id === "start_deck") {
        props.goToDeckBuilder();
      }
    };
    props.db.postMessage({
      id: "start_deck",
      action: "exec",
      sql: `DELETE FROM deck; INSERT INTO deck (card) VALUES ('${suggestion[0]}'), ('${suggestion[1]}'), ('${suggestion[2]}'), ('${suggestion[3]}');`,
    });
  };

  return (
    <>
      <h3>
        Skip this step if you already have some cards in mind that you want to
        use
      </h3>
      <TableContainer>
        <Table sx={{ width: "auto", marginTop: "1em" }}>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Cards</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {suggestions.map((item, index) => (
              <TableRow
                key={index}
                sx={{ opacity: 0.3 + (0.7 * item[4]) / suggestions[0][4] }}
              >
                <TableCell>{index + 1}</TableCell>
                <TableCell>{`${item[0]}, ${item[1]}, ${item[2]}, ${item[3]}`}</TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    onClick={() => startDeckBuilding(item)}
                  >
                    Start Deck
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default CoreSuggestions;
