import Container from "@mui/material/Container";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";

import { CardContext } from "./card-context";
import { useContext } from "react";
import TableHead from "@mui/material/TableHead";
import { TableCell, TableRow } from "@mui/material";

const GameMechanics = () => {
  const cardCtx = useContext(CardContext);
  if (!cardCtx) {
    return null;
  }

  const { dustUpgrade, dustRecycle } = cardCtx;

  return (
    <Container maxWidth="lg">
      <h2>Dust for upgrading/recycling cards</h2>
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
              {Object.entries(dustUpgrade[0]).map((e) => {
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
            {dustUpgrade.map((e, index) => (
              <TableRow key={index}>
                <TableCell sx={{ textAlign: "right" }}>{e.rarity}</TableCell>
                {Object.entries(e).map(([k, v]) => {
                  console.log(k);
                  console.log(v);
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
              {Object.entries(dustRecycle[0]).map((e) => {
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
            {dustRecycle.map((e, index) => (
              <TableRow key={index}>
                <TableCell sx={{ textAlign: "right" }}>{e.rarity}</TableCell>
                {Object.entries(e).map(([k, v]) => {
                  console.log(k);
                  console.log(v);
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
      <h2>Calculating the stats of cards</h2>
      <h3>Final Cards</h3>
      <p>
        The base stats apply for level 1 cards. For each further level ATK and
        DEF are both increased by +1 for common, +2 for uncommon, +3 for rare,
        +4 for epic cards.
      </p>
      <h3>Combo Cards</h3>
      <p>
        When combining two basic cards into a combo card, the stats of the combo
        card depend on its own rarity and the level and the rarity of the{" "}
        <i>used basic cards</i>.
      </p>
      <p>
        <b>Step 1 - Level of combo card: </b>
        The level of the combo is the <i>average</i> (rounded up) of the two
        basic cards, +1 if the result is a <i>rare or epic</i> card.
      </p>
      <p>
        <b>Step 2 - Stats of combo card: </b>
        The base stats apply for level 1 cards. For each further level ATK and
        DEF are both increased by +1/+2/+3 if the{" "}
        <i>highest-rarity basic card</i> used is common/uncommon/rare.
      </p>
    </Container>
  );
};

export default GameMechanics;
