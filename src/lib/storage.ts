import { createStore, get, set } from "idb-keyval";
import { useEffect, useState } from "react";

const store = createStore("react-sandbox", "kv");

export const load = <T>(key: string) => get<T>(key, store);
export const save = <T>(key: string, value: T) => set(key, value, store);

/** useState persisted in IndexedDB. `ready` is false until the stored value is loaded. */
export function usePersistentState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    load<T>(key)
      .then((stored) => stored !== undefined && setValue(stored))
      .finally(() => setReady(true));
  }, [key]);

  useEffect(() => {
    if (ready) save(key, value);
  }, [key, value, ready]);

  return [value, setValue, ready] as const;
}
