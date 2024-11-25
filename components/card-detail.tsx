import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";

import TableContainer from "@mui/material/TableContainer";

import TableHead from "@mui/material/TableHead";
import Paper from "@mui/material/Paper";

import Grid from "@mui/material/Grid2";

import {
  Breakpoint,
  DialogActions,
  DialogContent,
  IconButton,
} from "@mui/material";
import Dialog from "@mui/material/Dialog";
import CloseIcon from "@mui/icons-material/Close";

import GameCard from "./game-card";
import { ICombos } from "./card-context";

const CardDetail = (props: {
  card: string;
  setCard: (card: string) => void;
  combos: ICombos[];
}) => {
  const filteredCombosWith = props.combos
    .filter((c: ICombos) => c.card1 === props.card || c.card2 === props.card)
    .toSorted(
      (a, b) => +(String([a.card1, a.card2]) > String([b.card1, b.card2])) - 0.5
    );
  const filteredCombosResulting = props.combos
    .filter((c: ICombos) => c.result === props.card)
    .toSorted(
      (a, b) => +(String([a.card1, a.card2]) > String([b.card1, b.card2])) - 0.5
    );
  return (
    <Dialog
      fullWidth={true}
      maxWidth={"100%" as Breakpoint}
      open={props.card !== ""}
      onClose={() => props.setCard("")}
      scroll="paper"
    >
      <DialogActions>
        <IconButton
          sx={{ borderRadius: "5px" }}
          onClick={() => props.setCard("")}
        >
          <CloseIcon />
        </IconButton>
      </DialogActions>
      {props.card !== "" && (
        <DialogContent>
          <div style={{ minHeight: "calc(90vh - 100px)" }}>
            <Grid container rowSpacing={5} columnSpacing={10}>
              <Grid size={12} sx={{ textAlign: "center" }}>
                <GameCard card={props.card} showDetails />
              </Grid>
              <Grid size={6}>
                <Paper sx={{ padding: "5px" }}>
                  <h4 style={{ textAlign: "center" }}>
                    Combos with {props.card}
                  </h4>
                  {filteredCombosWith.length === 0 ? (
                    <p style={{ textAlign: "center" }}>
                      Only basic cards can be combined with other cards.
                    </p>
                  ) : (
                    <TableContainer>
                      <Table
                        sx={{ width: "100%", marginTop: "1em" }}
                        size="small"
                      >
                        <TableHead>
                          <TableRow>
                            <TableCell align="center">
                              Other Basic Card
                            </TableCell>
                            <TableCell align="center">Result</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {filteredCombosWith.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                <GameCard
                                  card={
                                    item.card1 === props.card
                                      ? item.card2
                                      : item.card1
                                  }
                                  onClick={() =>
                                    props.setCard(
                                      item.card1 === props.card
                                        ? item.card2
                                        : item.card1
                                    )
                                  }
                                />
                              </TableCell>
                              <TableCell>
                                <GameCard
                                  card={item.result}
                                  showDetails
                                  onClick={() => props.setCard(item.result)}
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </Paper>
              </Grid>
              <Grid size={6}>
                <Paper sx={{ padding: "5px" }}>
                  <h4 style={{ textAlign: "center" }}>
                    Combos resulting in {props.card}
                  </h4>
                  {filteredCombosResulting.length === 0 ? (
                    <p style={{ textAlign: "center" }}>
                      This card cannot be created by combining other cards.
                    </p>
                  ) : (
                    <TableContainer>
                      <Table
                        sx={{ width: "100%", marginTop: "1em" }}
                        size="small"
                      >
                        <TableHead>
                          <TableRow>
                            <TableCell align="center">Card 1</TableCell>
                            <TableCell align="center">Card 2</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {filteredCombosResulting.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell align="center">
                                <GameCard
                                  card={item.card1}
                                  onClick={() => props.setCard(item.card1)}
                                />
                              </TableCell>
                              <TableCell align="center">
                                <GameCard
                                  card={item.card2}
                                  onClick={() => props.setCard(item.card2)}
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
};

export default CardDetail;
