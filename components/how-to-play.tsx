import styled from "styled-components";

const Section = styled.section`
  margin-bottom: 24px;
`;

const Title = styled.h4`
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 12px;
  color: hsl(var(--foreground));
`;

const Paragraph = styled.p`
  margin-bottom: 16px;
  line-height: 1.5;
  color: hsl(var(--foreground));
`;

const Divider = styled.hr`
  border: 0;
  border-top: 1px solid hsl(var(--border));
  margin: 16px 0;
`;

const List = styled.ul`
  list-style-type: disc;
  padding-left: 24px;
  margin-bottom: 16px;
`;

const ListItem = styled.li`
  margin-bottom: 8px;
  line-height: 1.5;
  color: hsl(var(--foreground));
`;

const SecondaryText = styled.p`
  margin-left: 24px;
  margin-top: -4px;
  margin-bottom: 12px;
  font-size: 0.875rem;
  color: hsl(var(--muted-foreground));
`;

const Note = styled.p`
  font-size: 0.875rem;
  color: hsl(var(--muted-foreground));
  font-style: italic;
`;

export default function HowToPlay() {
  return (
    <div>
      <Section>
        <Title>Tower of Hanoi - Game Rules</Title>
        <Paragraph>
          The Tower of Hanoi is a classic puzzle game that consists of three
          rods and a number of disks of different sizes. The goal is to move the
          entire stack of disks from the leftmost rod to the rightmost rod.
        </Paragraph>
      </Section>

      <Divider />

      <Section>
        <Title>Rules:</Title>
        <List>
          <ListItem>Only one disk can be moved at a time.</ListItem>
          <ListItem>
            Each move consists of taking the top disk from one stack and placing
            it on top of another stack.
          </ListItem>
          <ListItem>No disk may be placed on top of a smaller disk.</ListItem>
        </List>
      </Section>

      <Divider />

      <Section>
        <Title>How to Play:</Title>
        <List>
          <ListItem>Drag and drop disks between towers.</ListItem>
          <SecondaryText>
            You can only drag the top disk from each tower.
          </SecondaryText>

          <ListItem>Valid moves will be highlighted in blue.</ListItem>
          <SecondaryText>
            Invalid moves will be highlighted in red.
          </SecondaryText>

          <ListItem>
            The game is won when all disks are moved to the rightmost tower.
          </ListItem>
        </List>
      </Section>

      <Divider />

      <Note>
        Did you know? The minimum number of moves required to solve the Tower of
        Hanoi puzzle is 2ⁿ - 1, where n is the number of disks.
      </Note>
    </div>
  );
}
