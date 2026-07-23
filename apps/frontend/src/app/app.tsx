// import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import { Router } from './navigation';

export function App() {
  return (
    <MantineProvider>
      <Router />
    </MantineProvider>
  );
}

export default App;
