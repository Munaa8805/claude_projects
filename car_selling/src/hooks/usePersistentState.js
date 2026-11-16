import { useEffect, useState } from 'react';
import { read, write } from '../lib/storage';

export function usePersistentState(key, initial) {
  const [value, setValue] = useState(() => read(key, initial));
  useEffect(() => { write(key, value); }, [key, value]);
  return [value, setValue];
}
