"use client";

import styled from "styled-components";
import { useDrag } from "react-dnd";

// Calculate disk width based on size and max size
const getDiskWidth = (size: number, maxSize: number) => {
  const minWidth = 40;
  const maxWidth = 140;
  const step = (maxWidth - minWidth) / (maxSize - 1);
  return minWidth + (size - 1) * step;
};

// Get disk color based on size
const getDiskColor = (size: number, maxSize: number) => {
  // Color palette from small to large
  const colors = [
    "#f43f5e", // red
    "#fb7185",
    "#f97316", // orange
    "#fbbf24", // yellow
    "#84cc16", // lime
    "#22c55e", // green
    "#06b6d4", // cyan
    "#3b82f6", // blue
    "#6366f1", // indigo
  ];

  // Map size to color index
  const index = Math.floor(((size - 1) / maxSize) * colors.length);
  return colors[Math.min(index, colors.length - 1)];
};

// Disk component
const DiskElement = styled.div<{
  width: number;
  color: string;
  isTop: boolean;
  isDragging: boolean;
  canDrag: boolean;
}>`
  width: ${(props) => props.width}px;
  height: 20px;
  background-color: ${(props) => props.color};
  border-radius: 10px;
  margin: 2px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 10px;
  font-weight: bold;
  box-shadow: ${(props) =>
    props.isTop ? "0 0 8px rgba(0, 0, 0, 0.2)" : "none"};
  opacity: ${(props) => (props.isDragging ? 0.4 : 1)};
  cursor: ${(props) => (props.canDrag ? "grab" : "default")};
  transition: transform 0.2s ease;

  &:hover {
    transform: ${(props) => (props.canDrag ? "scale(1.05)" : "none")};
  }
`;

interface DiskProps {
  size: number;
  maxSize: number;
  isTop: boolean;
  towerIndex: number;
  canDrag: boolean;
}

export default function Disk({
  size,
  maxSize,
  isTop,
  towerIndex,
  canDrag,
}: DiskProps) {
  const width = getDiskWidth(size, maxSize);
  const color = getDiskColor(size, maxSize);

  // Set up drag source
  const [{ isDragging }, drag] = useDrag({
    type: "DISK",
    item: { towerIndex, diskSize: size },
    canDrag: canDrag,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  return (
    <DiskElement
      ref={drag as any}
      width={width}
      color={color}
      isTop={isTop}
      isDragging={isDragging}
      canDrag={canDrag}
    >
      {size}
    </DiskElement>
  );
}
