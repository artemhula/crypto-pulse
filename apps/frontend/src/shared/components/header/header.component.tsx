import { Anchor, Container, Group } from '@mantine/core';
import { Link } from 'react-router-dom';
import { NAVIGATION_ROUTE } from '../../../app/navigation';
import styles from './header.module.scss';

export const Header = () => {
  return (
    <header className={styles.header}>
      <Container size="md" className={styles.inner} color="black">
        <Anchor
          component={Link}
          to={NAVIGATION_ROUTE.HOME}
          className={styles.brand}
        >
          pulsee.
        </Anchor>
      </Container>
    </header>
  );
};
