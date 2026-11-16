import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import Icon from '../ui/Icon';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useSaved } from '../../context/SavedContext';
import './Header.css';

export default function Header() {
  const { count } = useCart();
  const { user } = useAuth();
  const { ids: savedIds } = useSaved();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="header">
      <div className="header__inner container">
        <Link to="/" className="wordmark" aria-label="Forecourt home">
          <span className="wordmark__plate">FC</span>
          <span className="wordmark__text">Forecourt</span>
        </Link>

        <nav className={`header__nav${open ? ' is-open' : ''}`} aria-label="Main">
          <NavLink to="/cars" className="header__link">Browse cars</NavLink>
          <NavLink to="/cars?body=SUV" className="header__link header__link--minor">SUVs</NavLink>
          <NavLink to="/cars?fuel=Electric" className="header__link header__link--minor">Electric</NavLink>
          <a href="/#how-it-works" className="header__link header__link--minor">How reserving works</a>
        </nav>

        <div className="header__actions">
          <Link to="/account?tab=saved" className="header__icon" aria-label={`Saved cars, ${savedIds.length}`}>
            <Icon name="heart" />
            {savedIds.length > 0 && <span className="header__count num">{savedIds.length}</span>}
          </Link>
          <Link to="/cart" className="header__icon" aria-label={`Cart, ${count} ${count === 1 ? 'car' : 'cars'}`}>
            <Icon name="cart" />
            {count > 0 && <span className="header__count header__count--signal num">{count}</span>}
          </Link>
          {user ? (
            <Link to="/account" className="header__account" aria-label="Your account">
              <span className="header__avatar" aria-hidden="true">{user.name.slice(0, 1).toUpperCase()}</span>
              <span className="header__account-name">{user.name.split(' ')[0]}</span>
            </Link>
          ) : (
            <Link to="/login" className="header__signin">Sign in</Link>
          )}
          <button className="header__menu" aria-expanded={open} aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen((o) => !o)}>
            <Icon name={open ? 'close' : 'menu'} />
          </button>
        </div>
      </div>
    </header>
  );
}
