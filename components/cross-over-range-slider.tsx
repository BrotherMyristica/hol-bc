import React from "react";
import Slider from "@mui/material/Slider";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

interface CrossOverRangeSliderProps {
  /**
   * The "minimum" allowed value of the slider.
   */
  min: number;
  /**
   * The "maximum" allowed value of the slider.
   */
  max: number;
  /**
   * The current values of the slider thumbs. The values can cross.
   */
  value: [number, number];
  /**
   * Callback function that is fired when the slider's value changes.
   */
  onChange: (
    event: Event | React.SyntheticEvent,
    value: [number, number],
    activeThumb: number
  ) => void;
  /**
   * The label for the slider.
   */
  label: string;
  /**
   * The granularity with which the slider can step through values.
   * @default 1
   */
  step?: number;
}

/**
 * A reusable Material-UI range slider that supports:
 * - Thumbs that can "cross over" each other.
 * - Negative and positive values, including ranges that cross zero.
 *
 * This is achieved by using a single Slider and managing the thumb
 * interaction state to work around MUI's internal sorting.
 */
const CrossOverRangeSlider: React.FC<CrossOverRangeSliderProps> = ({
  min,
  max,
  value: valueProp,
  onChange,
  label,
  step = 1,
}) => {
  // This ref holds the logical index (0 or 1) of the thumb being dragged.
  // It's cached for the duration of a drag operation.
  const activeThumbRef = React.useRef<number | null>(null);

  const handleChange = (
    event: Event,
    newSliderValue: number | number[], // This is the new, sorted array from MUI
    activeThumb: number // This is the index of the thumb being moved in the sorted array
  ) => {
    if (!Array.isArray(newSliderValue)) {
      return;
    }

    const [startValue, endValue] = valueProp;
    const newThumbValue = newSliderValue[activeThumb];

    let logicalThumbIndex: number;

    if (activeThumbRef.current === null) {
      // A new drag has started. Determine which logical thumb is being moved.
      if (startValue === endValue) {
        // If values are identical, the `activeThumb` from MUI is the only way to know.
        logicalThumbIndex = activeThumb;
      } else {
        // Check which of the old values is still present in the new sorted array.
        // The one that is still there is the one that was NOT moved.
        if (newSliderValue.includes(startValue)) {
          // startValue is unchanged, so endValue must have moved.
          logicalThumbIndex = 1;
        } else {
          // endValue is unchanged (or both changed), so startValue must have moved.
          logicalThumbIndex = 0;
        }
      }
      activeThumbRef.current = logicalThumbIndex;
    } else {
      // Continue the current drag operation with the cached thumb.
      logicalThumbIndex = activeThumbRef.current;
    }

    const finalNewValue: [number, number] = [...valueProp];
    finalNewValue[logicalThumbIndex] = newThumbValue;

    onChange(event, finalNewValue, logicalThumbIndex);
  };

  const handleChangeCommitted = () => {
    // Reset the cached thumb when the user stops sliding.
    activeThumbRef.current = null;
  };

  // The value prop for the underlying MUI slider *must* be sorted for rendering.
  const displayValue = [...valueProp].sort((a, b) => a - b);

  return (
    <Box sx={{ width: 300, my: 2 }}>
      <Typography id="crossover-range-slider-label" gutterBottom>
        {label}
      </Typography>
      <Slider
        aria-labelledby="crossover-range-slider-label"
        min={min}
        max={max}
        step={step}
        value={displayValue}
        onChange={handleChange}
        onChangeCommitted={handleChangeCommitted}
        disableSwap
        valueLabelDisplay="on"
      />
    </Box>
  );
};

export default CrossOverRangeSlider;
