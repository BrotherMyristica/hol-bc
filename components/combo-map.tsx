import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";

import TableHead from "@mui/material/TableHead";
import {
  Breakpoint,
  DialogActions,
  DialogContent,
  IconButton,
} from "@mui/material";
import Dialog from "@mui/material/Dialog";
import CloseIcon from "@mui/icons-material/Close";

import GameCard from "./game-card";

const ComboMap = (props: {
  cards: [string, number][];
  combos: [string, string, string, string, number, number, number, number][];
  open: boolean;
  close: () => void;
}) => {
  const cards = props.cards ?? [];
  const combos = props.combos ?? [];
  const comboLookup: {
    [key: string]: [
      string,
      string,
      string,
      string,
      number,
      number,
      number,
      number
    ];
  } = combos.reduce((a, v) => ({ ...a, [String([v[0], v[1]])]: v }), {});
  return (
    <Dialog
      fullWidth={true}
      maxWidth={"100%" as Breakpoint}
      open={props.open}
      onClose={props.close}
      scroll="paper"
    >
      <DialogActions>
        <IconButton sx={{ borderRadius: "5px" }} onClick={() => props.close()}>
          <CloseIcon />
        </IconButton>
      </DialogActions>
      <DialogContent>
        <div style={{ minHeight: "calc(90vh - 100px)" }}>
          <Table sx={{ width: "100%" }}>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    borderBottom: "2px solid black",
                    borderRight: "2px solid black",
                  }}
                >
                  Combo Map
                </TableCell>
                {cards.map((e) => (
                  <TableCell
                    key={e[0]}
                    sx={{ borderBottom: "2px solid black" }}
                  >
                    <GameCard card={e[0]} />
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {cards.map((d1, rowIndex) => (
                <TableRow key={rowIndex}>
                  <TableCell sx={{ borderRight: "2px solid black" }}>
                    <GameCard card={d1[0]} />
                  </TableCell>
                  {cards.map((d2, colIndex) => {
                    const lookupKey = String([d1[0], d2[0]].toSorted());
                    const combo = comboLookup[lookupKey];
                    return (
                      <TableCell
                        key={colIndex}
                        sx={{ borderRight: "1px solid rgba(224, 224, 224, 1)" }}
                      >
                        {combo ? (
                          <GameCard
                            card={combo[2]}
                            level={combo[4]}
                            attack={combo[5]}
                            defense={combo[6]}
                            showDetails={true}
                          />
                        ) : (
                          ""
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ComboMap;
