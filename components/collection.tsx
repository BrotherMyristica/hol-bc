import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import TableRow from "@mui/material/TableRow";

import Button from "@mui/material/Button";
import TableHead from "@mui/material/TableHead";
import { useState, useEffect, useCallback } from "react";

const Copies = (props: { update: (arg0: number) => void; value: number }) => {
  const isValid = (value: string) => {
    return ["0", "1", "2", "3"].includes(value);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    if (isValid(newValue)) {
      props.update(parseInt(newValue));
      return;
    }
    if (!isValid(`${props.value}`)) {
      props.update(0);
    }
  };

  return (
    <TextField
      sx={{ width: "50px" }}
      size="small"
      slotProps={{
        htmlInput: {
          sx: {
            padding: "3px 5px 3px 10px",
          },
        },
      }}
      type="number"
      value={props.value}
      onChange={handleChange}
      variant="outlined"
    />
  );
};

const CardCollection = (props: { db: Worker; active: boolean }) => {
  const [collection, setCollection] = useState<null | {
    [key: string]: number;
  }>(null);

  const fetchData = useCallback(() => {
    props.db.onmessage = (event) => {
      if (event.data.id === "select_collection") {
        const result = event.data.results[0].values;
        setCollection(
          result.reduce(
            (a: { [key: string]: number }, v: [string, number]) => ({
              ...a,
              [v[0]]: v[1],
            }),
            {}
          )
        );
      }
    };
    props.db.postMessage({
      id: "select_collection",
      action: "exec",
      sql: "SELECT card, amount FROM collection",
    });
  }, [props.db]);

  useEffect(() => {
    if (props.active && props.db) {
      fetchData();
    }
  }, [props.active, props.db, fetchData]);

  const setAllToZero = () => {
    props.db.postMessage({
      id: "select_collection",
      action: "exec",
      sql: "UPDATE collection SET amount=0; SELECT card, amount FROM collection",
    });
  };

  const setAllTo3 = () => {
    props.db.postMessage({
      id: "select_collection",
      action: "exec",
      sql: "UPDATE collection SET amount=3; SELECT card, amount FROM collection",
    });
  };

  const setCommonTo3 = () => {
    props.db.postMessage({
      id: "select_collection",
      action: "exec",
      sql: "UPDATE collection SET amount=3 WHERE card IN (SELECT card FROM cards WHERE rarity = 'Common'); SELECT card, amount FROM collection",
    });
  };

  const setUncommonTo3 = () => {
    props.db.postMessage({
      id: "select_collection",
      action: "exec",
      sql: "UPDATE collection SET amount=3 WHERE card IN (SELECT card FROM cards WHERE rarity = 'Uncommon'); SELECT card, amount FROM collection",
    });
  };

  const updateCollection = (card: string, newValue: number) => {
    setCollection((collection) => ({
      ...collection,
      [card]: newValue,
    }));
    props.db.postMessage({
      action: "exec",
      sql: "UPDATE collection SET amount=$amount WHERE card=$card",
      params: { $card: card, $amount: newValue },
    });
  };

  const collectionList: [string, number][] = collection
    ? Object.keys(collection)
        .toSorted()
        .map((k) => [k, collection[k]])
    : [];

  return (
    <>
      <h3>How many copies do you have of each card?</h3>
      <Stack spacing={2} direction="row">
        <Button variant="contained" onClick={setAllToZero}>
          Set all to 0
        </Button>
        <Button variant="contained" onClick={setCommonTo3}>
          Set Common cards to 3
        </Button>
        <Button variant="contained" onClick={setUncommonTo3}>
          Set Uncommon cards to 3
        </Button>
        <Button variant="contained" onClick={setAllTo3}>
          Set all to 3
        </Button>
      </Stack>
      <TableContainer>
        <Table sx={{ width: "auto", marginTop: "1em" }} size="small">
          <TableHead>
            <TableRow>
              <TableCell>Card</TableCell>
              <TableCell>Copies</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {collectionList.map((item) => (
              <TableRow key={item[0]}>
                <TableCell sx={{ border: "0" }}>{item[0]}</TableCell>
                <TableCell sx={{ border: "0" }}>
                  <Copies
                    value={item[1]}
                    update={(v) => {
                      updateCollection(item[0], v);
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default CardCollection;