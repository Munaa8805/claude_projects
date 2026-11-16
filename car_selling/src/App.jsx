import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import Layout from './components/layout/Layout';
import PageLoader from './components/layout/PageLoader';
import RequireAuth from './components/layout/RequireAuth';
import Home from './pages/Home';

/* Home ships in the main bundle for a fast first paint; other pages load on demand. */
const Listing = lazy(() => import('./pages/Listing'));
const CarDetail = lazy(() => import('./pages/CarDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Reservation = lazy(() => import('./pages/Reservation'));
const Purchase = lazy(() => import('./pages/Purchase'));
const Auth = lazy(() => import('./pages/Auth'));
const Profile = lazy(() => import('./pages/Profile'));
const NotFound = lazy(() => import('./pages/NotFound'));

const page = (el) => <Suspense fallback={<PageLoader />}>{el}</Suspense>;

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="cars" element={page(<Listing />)} />
        <Route path="cars/:id" element={page(<CarDetail />)} />
        <Route path="cart" element={page(<Cart />)} />
        <Route path="checkout" element={<RequireAuth reason="checkout">{page(<Checkout />)}</RequireAuth>} />
        <Route path="reservations/:id" element={<RequireAuth>{page(<Reservation />)}</RequireAuth>} />
        <Route path="reservations/:id/buy" element={<RequireAuth>{page(<Purchase />)}</RequireAuth>} />
        <Route path="login" element={page(<Auth mode="login" />)} />
        <Route path="register" element={page(<Auth mode="register" />)} />
        <Route path="account" element={<RequireAuth>{page(<Profile />)}</RequireAuth>} />
        <Route path="*" element={page(<NotFound />)} />
      </Route>
    </Routes>
  );
}
