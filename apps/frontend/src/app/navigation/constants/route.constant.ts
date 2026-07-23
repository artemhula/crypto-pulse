import { LoginPage } from '../../../modules/auth';
import { Route } from '../types';

export const NAVIGATION_ROUTE = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
} as const;

export const ROUTES: Route[] = [
  {
    path: NAVIGATION_ROUTE.HOME,
    Component: LoginPage,
  },
  {
    path: NAVIGATION_ROUTE.LOGIN,
    Component: LoginPage,
  },
  {
    path: NAVIGATION_ROUTE.DASHBOARD,
    Component: LoginPage,
  },
  {
    path: NAVIGATION_ROUTE.PROFILE,
    Component: LoginPage,
  },
];
