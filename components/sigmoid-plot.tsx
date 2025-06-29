import React from "react";
import { LineChart } from "@mui/x-charts/LineChart";
import { useTheme } from "@mui/material/styles";

interface SigmoidPlotProps {
  /**
   * The steepness of the curve (k).
   */
  k: number;
  /**
   * The x-value of the sigmoid's midpoint (t).
   */
  t: number;
  /**
   * The width of the chart in pixels.
   * @default 500
   */
  width?: number;
  /**
   * The height of the chart in pixels.
   * @default 300
   */
  height?: number;
}

/**
 * Generates data points for the sigmoid function y = 1 / (1 + e^(-k * (x - t))).
 * @param k - The steepness of the curve.
 * @param t - The x-value of the sigmoid's midpoint.
 * @param xRange - The range of x values to generate data for.
 * @param points - The number of points to generate for a smooth curve.
 * @returns An object with arrays for x and y data.
 */
const generateSigmoidData = (
  k: number,
  t: number,
  xRange: [number, number] = [0, 45],
  points: number = 100
) => {
  const xData: number[] = [];
  const yData: number[] = [];
  const step = (xRange[1] - xRange[0]) / (points - 1);

  for (let i = 0; i < points; i++) {
    const x = xRange[0] + i * step;
    const y = 1 / (1 + Math.exp(-k * (x - t)));
    xData.push(x);
    yData.push(y);
  }

  return { xData, yData };
};

/**
 * A component that renders a line plot of the sigmoid function y = 1 / (1 + e^(-k * (x - t))).
 */
const SigmoidPlot: React.FC<SigmoidPlotProps> = ({
  k,
  t,
  width = 500,
  height = 300,
}) => {
  const theme = useTheme();
  const { xData, yData } = React.useMemo(
    () => generateSigmoidData(k, t),
    [k, t]
  );

  return (
    <LineChart
      xAxis={[{ data: xData, min: 0, max: 45, label: "attribute" }]}
      yAxis={[{ min: -0.05, max: 1.05, label: "value" }]}
      series={[
        { data: yData, showMark: false, color: theme.palette.primary.main },
      ]}
      width={width}
      height={height}
      grid={{ vertical: true, horizontal: true }}
    />
  );
};

export default SigmoidPlot;
