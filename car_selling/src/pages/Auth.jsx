import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { CARS } from '../data/cars';
import Button from '../components/ui/Button';
import Field from '../components/ui/Field';
import Icon from '../components/ui/Icon';
import LoadingImage from '../components/ui/LoadingImage';
import './Auth.css';

const SIDE_CAR = CARS.find((c) => c.id === 'audi-rs6-avant-2021');

export default function Auth({ mode }) {
  const isLogin = mode === 'login';
  useDocumentTitle(isLogin ? 'Sign in' : 'Create an account');
  const { user, login, register } = useAuth();
  const notify = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/account';
  const reason = location.state?.reason;

  const [f, setF] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [showPw, setShowPw] = useState(false);

  if (user && !busy) return <Navigate to={from} replace />;

  const set = (k) => (e) => {
    setF((s) => ({ ...s, [k]: e.target.value }));
    if (errors[k]) setErrors((x) => ({ ...x, [k]: undefined }));
  };

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!isLogin && !f.name.trim()) errs.name = 'Enter your name.';
    if (!/^\S+@\S+\.\S+$/.test(f.email)) errs.email = 'Enter an email like name@example.com.';
    if (isLogin ? !f.password : f.password.length < 8) errs.password = isLogin ? 'Enter your password.' : 'Use at least 8 characters.';
    setErrors(errs);
    setFormError(null);
    if (Object.keys(errs).length) return;

    setBusy(true);
    try {
      if (isLogin) await login(f);
      else await register(f);
      notify(isLogin ? 'Signed in' : 'Account created');
      navigate(from, { replace: true });
    } catch (err) {
      setBusy(false);
      if (err.field) setErrors({ [err.field]: err.message });
      else setFormError(err.message);
    }
  };

  const swapState = { from: location.state?.from, reason };

  return (
    <div className="auth">
      <div className="auth__panel">
        <div className="auth__inner">
          <div className="auth__tabs" role="tablist" aria-label="Account">
            <Link to="/login" state={swapState} role="tab" aria-selected={isLogin} className={isLogin ? 'is-active' : ''}>Sign in</Link>
            <Link to="/register" state={swapState} role="tab" aria-selected={!isLogin} className={!isLogin ? 'is-active' : ''}>Create account</Link>
          </div>

          <h1 className="auth__title display">{isLogin ? 'Welcome back' : 'Create your account'}</h1>
          <p className="auth__lede">
            {reason === 'checkout'
              ? 'Sign in to reserve. Your cart is saved.'
              : isLogin ? 'Pick up where you left off with your saved cars and reservations.' : 'Reserve cars, track test drives and keep a list of cars you like.'}
          </p>

          {formError && <div className="auth__alert" role="alert"><Icon name="alert" size={18} />{formError}</div>}

          <form className="auth__form" onSubmit={submit} noValidate>
            {!isLogin && <Field label="Full name" autoComplete="name" value={f.name} onChange={set('name')} error={errors.name} />}
            <Field label="Email" type="email" autoComplete="email" value={f.email} onChange={set('email')} error={errors.email} />
            <div className="auth__pw">
              <Field
                label="Password" type={showPw ? 'text' : 'password'}
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                hint={isLogin ? undefined : 'At least 8 characters.'}
                value={f.password} onChange={set('password')} error={errors.password}
              />
              <button type="button" className="auth__show" onClick={() => setShowPw((s) => !s)} aria-pressed={showPw}>
                {showPw ? 'Hide' : 'Show'}
              </button>
            </div>
            <Button type="submit" size="lg" block loading={busy}>
              {isLogin ? (busy ? 'Signing in…' : 'Sign in') : (busy ? 'Creating account…' : 'Create account')}
            </Button>
          </form>

          <p className="auth__switch">
            {isLogin ? 'New to Forecourt? ' : 'Already have an account? '}
            <Link to={isLogin ? '/register' : '/login'} state={swapState}>{isLogin ? 'Create an account' : 'Sign in'}</Link>
          </p>
        </div>
      </div>
      <div className="auth__visual" aria-hidden="true">
        <LoadingImage className="auth__img" src={`${SIDE_CAR.image}&w=1400`} alt="" />
      </div>
    </div>
  );
}
