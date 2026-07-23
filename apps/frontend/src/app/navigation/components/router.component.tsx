import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ROUTES } from '../constants';

export const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        {ROUTES.map((r) => (
          <Route key={r.path} path={r.path} element={<r.Component />} />
        ))}
      </Routes>
    </BrowserRouter>
  );
};
