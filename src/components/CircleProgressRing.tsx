import { GlassView } from "expo-glass-effect";
import React from "react";
import { Platform, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

interface CircleProgressRingProps {
  progress: number; // 0..1
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
}

export const CircleProgressRing: React.FC<CircleProgressRingProps> = ({
  progress,
  size = 120,
  strokeWidth = 10,
  color = "#4CAF50",
  backgroundColor = "#E0E0E0",
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  const Container = Platform.OS === "ios" ? GlassView : View;

  return (
    <Container
      style={{ width: size, height: size }}
      glassEffectStyle="clear"
      tintColor={backgroundColor}
    >
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
    </Container>
  );
};
