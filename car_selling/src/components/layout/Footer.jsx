import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__lead">
          <p className="footer__name title">Forecourt</p>
          <p className="muted">Inspected used cars with upfront prices. Hold any car online for a refundable $500 deposit.</p>
        </div>
        <nav className="footer__cols" aria-label="Footer">
          <div>
            <h2>Shop</h2>
            <Link to="/cars">All cars</Link>
            <Link to="/cars?body=Coupe">Coupes</Link>
            <Link to="/cars?body=Sedan">Sedans</Link>
            <Link to="/cars?fuel=Electric">Electric</Link>
          </div>
          <div>
            <h2>Your account</h2>
            <Link to="/account">Reservations</Link>
            <Link to="/account?tab=saved">Saved cars</Link>
            <Link to="/cart">Cart</Link>
          </div>
          <div>
            <h2>Visit</h2>
            <p>1180 Harbor Road<br />Open daily, 9am–7pm</p>
            <a href="tel:+15550142200">(555) 014-2200</a>
          </div>
        </nav>
      </div>
      <div className="container footer__legal">
        <p>Demo storefront. Accounts and reservations are stored in this browser only.</p>
      </div>
    </footer>
  );
}
