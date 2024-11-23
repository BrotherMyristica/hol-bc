import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import TableRow from "@mui/material/TableRow";
import Box from "@mui/material/Box";
import BoltIcon from "@mui/icons-material/Bolt";
import ShieldIcon from "@mui/icons-material/Shield";
import Slider from "@mui/material/Slider";
import { useState, useEffect, useCallback } from "react";

const WeightPreference = (props: {
  update: (arg0: number) => void;
  value: number;
}) => {
  const handleChange = (event: Event, newValue: number | number[]) => {
    props.update(Math.round(100 - (newValue as number)) / 100);
  };

  const valuetext = (value: number) => {
    const attack = Math.round(100 - value);
    const defense = Math.round(value);
    return `${attack}% / ${defense}%`;
  };

  return (
    <TableRow>
      <TableCell sx={{ border: "0" }}>Attack / Defense Balance</TableCell>
      <TableCell sx={{ border: "0" }}>
        <Box sx={{ width: 250 }}>
          <Stack
            spacing={2}
            direction="row"
            sx={{ alignItems: "center", mb: 1 }}
          >
            <BoltIcon />
            <Slider
              value={Math.round(100 - 100 * props.value)}
              valueLabelFormat={valuetext}
              onChange={handleChange}
              valueLabelDisplay="auto"
              min={0}
              max={100}
              step={1}
            />
            <ShieldIcon />
          </Stack>
        </Box>
      </TableCell>
    </TableRow>
  );
};

const LevelPreference = (props: {
  update: (arg0: number) => void;
  value: number;
}) => {
  const isValid = (value: string) => {
    return ["1", "2", "3", "4", "5"].includes(value);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    if (isValid(newValue)) {
      props.update(parseInt(newValue));
      return;
    }
    if (!isValid(`${props.value}`)) {
      props.update(2);
    }
  };

  return (
    <TableRow>
      <TableCell sx={{ border: "0" }}>Average Basic Card Level</TableCell>
      <TableCell sx={{ border: "0" }}>
        <TextField
          sx={{ width: "70px" }}
          type="number"
          value={props.value}
          onChange={handleChange}
          variant="outlined"
        />
      </TableCell>
    </TableRow>
  );
};

const Preferences = (props: { db: Worker; active: boolean }) => {
  const [config, setConfig] = useState<null | { [key: number]: number }>(null);

  const fetchData = useCallback(() => {
    props.db.onmessage = (event) => {
      if (event.data.id === "select_preferences") {
        const result = event.data.results[0].values;
        setConfig(
          result.reduce(
            (a: { [key: number]: number }, v: [number, number]) => ({
              ...a,
              [v[0]]: v[1],
            }),
            {}
          )
        );
      }
    };
    props.db.postMessage({
      id: "select_preferences",
      action: "exec",
      sql: "SELECT uid, value FROM config",
    });
  }, [props.db]);

  useEffect(() => {
    if (props.active && props.db) {
      fetchData();
    }
  }, [props.active, props.db, fetchData]);

  const updatePreferences = (index: number, newValue: number) => {
    setConfig((config) => ({
      ...config,
      [index]: newValue,
    }));
    props.db.postMessage({
      action: "exec",
      sql: "UPDATE config SET value=$value WHERE uid=$uid",
      params: { $uid: index, $value: newValue },
    });
  };

  return (
    <>
      {config && (
        <TableContainer>
          <Table sx={{ width: "auto", marginTop: "1em" }}>
            <TableBody>
              <WeightPreference
                value={config[1]}
                update={(v) => {
                  updatePreferences(1, v);
                }}
              />
              <LevelPreference
                value={config[2]}
                update={(v) => {
                  updatePreferences(2, v);
                }}
              />
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </>
  );
};

export default Preferences;
