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
import GrainIcon from "@mui/icons-material/Grain";
import CircleIcon from "@mui/icons-material/Circle";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import Tooltip from "@mui/material/Tooltip";
import Slider from "@mui/material/Slider";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { validateInput } from "./number-validation";
import Container from "@mui/material/Container";
import { setPreference } from "@/engine/storage";
import CrossOverRangeSlider from "./range-slider";
import SigmoidPlot from "./sigmoid-plot";

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
              valueLabelDisplay="on"
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

const ExponentPreference = (props: {
  update: (arg0: number) => void;
  value: number;
}) => {
  const valueToSlider = (value: number) => {
    return Math.round(50 * Math.log10(value));
  };

  const sliderToValue = (slider: number) => {
    const value = Math.pow(10, Math.round(slider) / 50);
    const significance = Math.pow(10, Math.round(-Math.log10(value) + 1.95));
    const roundedValue = Math.round(value * significance) / significance;
    return roundedValue;
  };

  const handleChange = (event: Event, slider: number | number[]) => {
    props.update(sliderToValue(slider as number));
  };

  const valuetext = (slider: number) => {
    const value = sliderToValue(slider);
    return `${value}`;
  };

  return (
    <TableRow>
      <TableCell sx={{ border: "0" }}>Valuation Exponent</TableCell>
      <TableCell sx={{ border: "0" }}>
        <Box sx={{ width: 250 }}>
          <Stack
            spacing={2}
            direction="row"
            sx={{ alignItems: "center", mb: 1 }}
          >
            <GrainIcon />
            <Slider
              value={valueToSlider(props.value)}
              valueLabelFormat={valuetext}
              onChange={handleChange}
              valueLabelDisplay="on"
              min={-50}
              max={50}
              step={1}
            />
            <CircleIcon />
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
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = validateInput(1, 5, 2, props.value, event.target.value);
    if (newValue != props.value) {
      props.update(newValue);
    }
  };

  return (
    <TableRow>
      <TableCell sx={{ border: "0" }}>Average Basic Card Level</TableCell>
      <TableCell sx={{ border: "0" }}>
        <TextField
          sx={{ width: "70px" }}
          type="number"
          value={`${props.value}`}
          onChange={handleChange}
          variant="outlined"
        />
      </TableCell>
    </TableRow>
  );
};

const ValueThreshold = (props: {
  update: (arg0: number) => void;
  value: number;
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(event.target.value);
    if (!isNaN(newValue)) {
      props.update(newValue);
    }
  };

  return (
    <TableRow>
      <TableCell sx={{ border: "0" }}>Rating Threshold</TableCell>
      <TableCell sx={{ border: "0" }}>
        <TextField
          sx={{ width: "100px" }}
          type="number"
          value={`${props.value}`}
          onChange={handleChange}
          variant="outlined"
        />
      </TableCell>
    </TableRow>
  );
};

const StatsThreshold = ({
  label,
  start,
  end,
  updateStart,
  updateEnd,
  updateK,
  updateT,
}: {
  label: string;
  start: number;
  end: number;
  updateStart: (arg0: number) => void;
  updateEnd: (arg0: number) => void;
  updateK: (arg0: number) => void;
  updateT: (arg0: number) => void;
}) => {
  const updateKRef = useRef(updateK);
  const updateTRef = useRef(updateT);

  useEffect(() => {
    updateKRef.current = updateK;
    updateTRef.current = updateT;
  });

  const [thresholdValues, setThresholdValues] = useState<[number, number]>([
    start,
    end,
  ]);
  const [isHovering, setIsHovering] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [k, t] = useMemo(() => {
    const new_t = (thresholdValues[0] + thresholdValues[1]) / 2;
    if (thresholdValues[0] === thresholdValues[1]) {
      return [25, new_t];
    }
    if (thresholdValues[0] === 0 && thresholdValues[1] === 45) {
      return [0, new_t];
    }
    const new_k = 2 / (thresholdValues[1] - thresholdValues[0]);
    return [new_k, new_t];
  }, [thresholdValues]);

  useEffect(() => {
    updateKRef.current(k);
    updateTRef.current(t);
  }, [k, t]);

  return (
    <TableRow>
      <TableCell sx={{ border: "0" }}>{label}</TableCell>
      <TableCell sx={{ border: "0" }}>
        <Tooltip
          open={isHovering || isDragging}
          title={<SigmoidPlot k={k} t={t} width={500} height={300} />}
          placement="top"
          arrow
          slotProps={{
            popper: {
              modifiers: [
                {
                  name: "offset",
                  options: {
                    offset: [0, 30],
                  },
                },
              ],
              sx: {
                "& .MuiTooltip-tooltip": {
                  maxWidth: "none",
                  backgroundColor: "white",
                  color: "black",
                  border: "1px solid #dadde9",
                  boxShadow: "0px 4px 8px rgba(0,0,0,0.1)",
                },
                "& .MuiTooltip-arrow": {
                  color: "white",
                },
              },
            },
          }}
        >
          <Box
            sx={{ width: 250 }}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <Stack
              spacing={2}
              direction="row"
              sx={{ alignItems: "center", mb: 1 }}
            >
              <ArrowDropDownIcon />
              <CrossOverRangeSlider
                value={thresholdValues}
                onChange={(e, v) => {
                  setIsDragging(true);
                  setThresholdValues(v);
                  updateStart(v[0]);
                  updateEnd(v[1]);
                }}
                onChangeCommitted={() => setIsDragging(false)}
                valueLabelDisplay="on"
                min={0}
                max={45}
                step={0.5}
              />
              <ArrowDropUpIcon />
            </Stack>
          </Box>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
};

const NoComboPenaltyPreference = (props: {
  update: (arg0: number) => void;
  value: number;
}) => {
  const handleChange = (event: Event, newValue: number | number[]) => {
    props.update(Math.round(newValue as number) / 100);
  };

  const valuetext = (value: number) => {
    return `${value}%`;
  };

  return (
    <TableRow>
      <TableCell sx={{ border: "0" }}>No Combo Penalty</TableCell>
      <TableCell sx={{ border: "0" }}>
        <Box sx={{ width: 250 }}>
          <Stack
            spacing={2}
            direction="row"
            sx={{ alignItems: "center", mb: 1 }}
          >
            <ArrowDropDownIcon />
            <Slider
              value={Math.round(100 * props.value)}
              valueLabelFormat={valuetext}
              onChange={handleChange}
              valueLabelDisplay="on"
              min={0}
              max={100}
              step={1}
            />
            <ArrowDropUpIcon />
          </Stack>
        </Box>
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
    setPreference(index, newValue);
  };

  return (
    <Container maxWidth="sm">
      {config && (
        <>
          <TableContainer>
            <Table sx={{ width: "auto", marginTop: "1em" }}>
              <TableBody>
                <LevelPreference
                  value={config[2]}
                  update={(v) => {
                    updatePreferences(2, v);
                  }}
                />
                <WeightPreference
                  value={config[1]}
                  update={(v) => {
                    updatePreferences(1, v);
                  }}
                />
                <ExponentPreference
                  value={config[3]}
                  update={(v) => {
                    updatePreferences(3, v);
                  }}
                />
                <ValueThreshold
                  value={config[4]}
                  update={(v) => {
                    updatePreferences(4, v);
                  }}
                />
                <NoComboPenaltyPreference
                  value={config[5]}
                  update={(v) => {
                    updatePreferences(5, v);
                  }}
                />
                <StatsThreshold
                  label="ATK Threshold"
                  start={config[6]}
                  end={config[7]}
                  updateStart={(v) => {
                    updatePreferences(6, v);
                  }}
                  updateEnd={(v) => {
                    updatePreferences(7, v);
                  }}
                  updateK={(v) => {
                    updatePreferences(8, v);
                  }}
                  updateT={(v) => {
                    updatePreferences(9, v);
                  }}
                />
                <StatsThreshold
                  label="DEF Threshold"
                  start={config[10]}
                  end={config[11]}
                  updateStart={(v) => {
                    updatePreferences(10, v);
                  }}
                  updateEnd={(v) => {
                    updatePreferences(11, v);
                  }}
                  updateK={(v) => {
                    updatePreferences(12, v);
                  }}
                  updateT={(v) => {
                    updatePreferences(13, v);
                  }}
                />
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Container>
  );
};

export default Preferences;
