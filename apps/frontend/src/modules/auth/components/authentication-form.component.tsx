import { Container, Group, Paper, PaperProps, Text } from '@mantine/core';
import { GoogleButton } from './google-button.component';

export function AuthenticationForm(props: PaperProps) {
  return (
    <Container>
      <Paper radius="md" p="lg" withBorder {...props}>
        <Text size="lg" fw={500} c="bright">
          Welcome to <strong>pulsee</strong>, login with
        </Text>

        <Group grow mb="md" mt="md">
          <GoogleButton radius="xl">Google</GoogleButton>
        </Group>
      </Paper>
    </Container>
  );
}
