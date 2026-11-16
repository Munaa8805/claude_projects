import Icon from '../ui/Icon';
import { useSaved } from '../../context/SavedContext';
import { useToast } from '../../context/ToastContext';
import { carName } from '../../lib/format';
import './SaveButton.css';

export default function SaveButton({ car, variant = 'overlay' }) {
  const { has, toggle } = useSaved();
  const notify = useToast();
  const saved = has(car.id);

  const onClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const nowSaved = toggle(car.id);
    notify(nowSaved ? `Saved ${carName(car)}` : `Removed ${carName(car)} from saved cars`, nowSaved ? { action: { to: '/account?tab=saved', label: 'View saved' } } : {});
  };

  return (
    <button
      type="button"
      className={`save-btn save-btn--${variant}${saved ? ' is-saved' : ''}`}
      onClick={onClick}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${carName(car)} from saved cars` : `Save ${carName(car)}`}
    >
      <Icon name="heart" filled={saved} size={20} />
      {variant === 'inline' && <span>{saved ? 'Saved' : 'Save'}</span>}
    </button>
  );
}
