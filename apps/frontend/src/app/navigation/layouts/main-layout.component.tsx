import { Outlet } from 'react-router-dom';
import { Container } from '@mantine/core';
import { Header } from '../../../shared';

export const MainLayout = () => {
  return (
    <>
      <Header />
      <Container m={4}>
        <Outlet />
      </Container>
    </>
  );
};
