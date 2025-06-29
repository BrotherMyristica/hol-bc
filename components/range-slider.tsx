import React from "react";
import Slider, { SliderProps } from "@mui/material/Slider";

interface CrossOverRangeSliderProps
  extends Omit<SliderProps, "value" | "onChange"> {
  value: [number, number];
  onChange: (
    event: Event | React.SyntheticEvent,
    value: [number, number],
    activeThumb: number
  ) => void;
  onChangeCommitted?: (
    event: React.SyntheticEvent | Event,
    value: number | number[]
  ) => void;
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
  value: valueProp,
  onChange,
  onChangeCommitted: onChangeCommittedProp,
  sx,
  ...otherProps
}) => {
  // This ref holds the logical index (0 or 1) of the thumb being dragged.
  // It's cached for the duration of a drag operation.
  const activeThumbRef = React.useRef<number | null>(null);
  // This ref is a fallback for keyboard navigation to remember the last-moved
  // thumb, which is necessary when both thumbs have the same value.
  const lastActiveThumbRef = React.useRef<number>(0);

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
        // When values are equal, we must use the last known
        // active thumb as a tie-breaker because `onChangeCommitted` resets
        // the main `activeThumbRef` after every step.
        logicalThumbIndex = lastActiveThumbRef.current;
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

    // Persist the determined thumb index for the next keyboard step.
    lastActiveThumbRef.current = logicalThumbIndex;

    const finalNewValue: [number, number] = [...valueProp];
    finalNewValue[logicalThumbIndex] = newThumbValue;

    onChange(event, finalNewValue, logicalThumbIndex);
  };

  const handleChangeCommitted = (
    event: React.SyntheticEvent | Event,
    value: number | number[]
  ) => {
    // Reset the cached thumb when the user stops sliding.
    activeThumbRef.current = null;
    onChangeCommittedProp?.(event, value);
  };

  // The value prop for the underlying MUI slider *must* be sorted for rendering.
  const displayValue = [...valueProp].sort((a, b) => a - b);

  const isNegativeRange = valueProp[0] > valueProp[1];

  return (
    <Slider
      {...otherProps}
      value={displayValue}
      onChange={handleChange}
      onChangeCommitted={handleChangeCommitted}
      sx={{
        "& .MuiSlider-track": {
          backgroundColor: isNegativeRange ? "purple" : "primary.main",
        },
        ...sx,
      }}
    />
  );
};

export default CrossOverRangeSlider;
