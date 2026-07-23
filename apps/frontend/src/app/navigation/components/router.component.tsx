import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ROUTES } from '../constants';
import { MainLayout } from '../layouts';

const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: ROUTES,
  },
]);

export const Router = () => {
  return <RouterProvider router={router} />;
};
