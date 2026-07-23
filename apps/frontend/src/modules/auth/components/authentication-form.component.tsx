import { Container, Group, Paper, PaperProps, Text } from '@mantine/core';
import { GoogleButton } from './google-button.component';
import { API_ENDPOINTS } from '../../../shared';

export function AuthenticationForm(props: PaperProps) {
  const handleGoogleLogin = () => {
    window.location.href = API_ENDPOINTS.AUTH.LOGIN;
  };

  return (
    <Container>
      <Paper radius="md" p="lg" withBorder {...props}>
        <Text size="lg" fw={500} c="bright">
          Welcome to <strong>pulsee</strong>, login with
        </Text>

        <Group grow mb="md" mt="md">
          <GoogleButton radius="xl" onClick={handleGoogleLogin}>
            Google
          </GoogleButton>
        </Group>
      </Paper>
    </Container>
  );
}
