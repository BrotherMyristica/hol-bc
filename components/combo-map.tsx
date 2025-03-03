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
import { useMemo, useState } from "react";
import { useInView } from "react-intersection-observer";

const stickyHeader = {
  position: "sticky",
  left: 0,
  background: "white",
  zIndex: "9999",
};

const ComboMapRow = (props: {
  cards: [string, number][];
  setCard: (card: string) => void;
  combos: [string, string, string, string, number, number, number, number][];
  d1: [string, number];
}) => {
  const [isInView, setIsInView] = useState(false);
  const { ref } = useInView({
    onChange: (inView) => {
      if (inView) {
        setIsInView(true);
      }
    },
    triggerOnce: true,
  });
  const combos = useMemo(() => props.combos ?? [], [props.combos]);
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
  } = useMemo(
    () => combos.reduce((a, v) => ({ ...a, [String([v[0], v[1]])]: v }), {}),
    [combos]
  );

  return (
    <TableRow ref={ref} sx={{ height: "4em" }}>
      {isInView && (
        <>
          <TableCell
            sx={{
              borderRight: "2px solid black",
              padding: "8px",
              ...stickyHeader,
            }}
          >
            <GameCard
              card={props.d1[0]}
              onClick={() => props.setCard(props.d1[0])}
            />
          </TableCell>
          {props.cards.map((d2, colIndex) => {
            const lookupKey = String([props.d1[0], d2[0]].toSorted());
            const combo = comboLookup[lookupKey];
            return (
              <TableCell
                key={colIndex}
                sx={{
                  borderRight: "1px solid rgba(224, 224, 224, 1)",
                  padding: "8px",
                }}
              >
                {combo ? (
                  <GameCard
                    card={combo[2]}
                    level={combo[4]}
                    attack={combo[5]}
                    defense={combo[6]}
                    showDetails={true}
                    onClick={() => props.setCard(combo[2])}
                  />
                ) : (
                  ""
                )}
              </TableCell>
            );
          })}
        </>
      )}
    </TableRow>
  );
};

const ComboMap = (props: {
  cards: [string, number][];
  setCard: (card: string) => void;
  combos: [string, string, string, string, number, number, number, number][];
  open: boolean;
  close: () => void;
}) => {
  const cards = props.cards ?? [];

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
      <DialogContent
        sx={{ paddingTop: 0, paddingLeft: 0, borderLeft: "24px solid white" }}
      >
        {props.open && (
          <div style={{ minHeight: "calc(90vh - 100px)" }}>
            <Table stickyHeader sx={{ width: "100%" }}>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      borderBottom: "2px solid black",
                      borderRight: "2px solid black",
                      ...stickyHeader,
                      zIndex: 99999,
                    }}
                  >
                    Combo Map
                  </TableCell>
                  {cards.map((e) => (
                    <TableCell
                      key={e[0]}
                      sx={{
                        borderBottom: "2px solid black",
                        padding: "8px",
                      }}
                    >
                      <GameCard
                        card={e[0]}
                        onClick={() => props.setCard(e[0])}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {cards.map((d1, rowIndex) => (
                  <ComboMapRow
                    key={rowIndex}
                    cards={cards}
                    combos={props.combos}
                    setCard={props.setCard}
                    d1={d1}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ComboMap;
