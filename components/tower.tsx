"use client";

import styled from "styled-components";
import { useDrop } from "react-dnd";
import Disk from "./disk";

// Tower container
const TowerContainer = styled.div<{ isOver: boolean; canDrop: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  border-radius: 8px;
  background-color: ${(props) =>
    props.isOver && props.canDrop
      ? "rgba(99, 102, 241, 0.2)"
      : props.isOver
      ? "rgba(244, 63, 94, 0.1)"
      : "transparent"};
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${(props) =>
      props.isOver
        ? props.canDrop
          ? "rgba(99, 102, 241, 0.2)"
          : "rgba(244, 63, 94, 0.1)"
        : "rgba(99, 102, 241, 0.05)"};
  }
`;

// Tower rod
const TowerRod = styled.div`
  width: 12px;
  height: 180px;
  background-color: hsl(var(--tower-rod));
  border-radius: 6px;
  margin-bottom: 8px;
  position: relative;
  z-index: 1;
`;

// Tower base
const TowerBase = styled.div`
  width: 160px;
  height: 20px;
  background-color: hsl(var(--tower-base));
  border-radius: 6px;
`;

// Disks container
const DisksContainer = styled.div`
  display: flex;
  flex-direction: column-reverse;
  align-items: center;
  position: absolute;
  bottom: 0;
  width: 100%;
`;

interface TowerProps {
  index: number;
  disks: number[];
  maxDiskSize: number;
  onDiskMove: (fromTower: number, toTower: number) => boolean;
}

export default function Tower({
  index,
  disks,
  maxDiskSize,
  onDiskMove,
}: TowerProps) {
  // Set up drop target
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: "DISK",
    drop: (item: { towerIndex: number; diskSize: number }) => {
      onDiskMove(item.towerIndex, index);
      return { towerIndex: index };
    },
    canDrop: (item: { towerIndex: number; diskSize: number }) => {
      // Can't drop on the same tower
      if (item.towerIndex === index) return false;

      // Can drop if target tower is empty or top disk is larger
      return disks.length === 0 || item.diskSize < disks[disks.length - 1];
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  });

  return (
    <TowerContainer ref={drop as any} isOver={isOver} canDrop={canDrop}>
      <TowerRod>
        <DisksContainer>
          {disks.map((size, diskIndex) => (
            <Disk
              key={diskIndex}
              size={size}
              maxSize={maxDiskSize}
              isTop={diskIndex === disks.length - 1}
              towerIndex={index}
              canDrag={diskIndex === disks.length - 1}
            />
          ))}
        </DisksContainer>
      </TowerRod>
      <TowerBase />
    </TowerContainer>
  );
}
