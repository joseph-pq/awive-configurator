import React from 'react';

function useLocalStorage<T>(itemName: string, initialValue: T) {
  const [item, setItem] = React.useState<T>(initialValue);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    try {
      const localStorageItem = localStorage.getItem(itemName);

      let parsedItem;

      if (!localStorageItem) {
        localStorage.setItem(itemName, JSON.stringify(initialValue));
        parsedItem = initialValue;
      } else {
        parsedItem = JSON.parse(localStorageItem);
        if (parsedItem === "[]") {
          setItem([] as T);
        } else if (parsedItem === "{}") {
          setItem({} as T);
        }
        setItem(parsedItem);
      }

      setLoading(false);
    } catch (error) {
      setLoading(false);
      setError(true);
    }
  }, []);

  const saveItem = (newItem: T | ((prevState: T) => T)) => {
    const valueToStore = typeof newItem === 'function' 
      ? (newItem as (prevState: T) => T)(item)
      : newItem;
    localStorage.setItem(itemName, JSON.stringify(valueToStore));
    setItem(valueToStore);
  };

  return {
    item,
    saveItem,
    loading,
    error,
  };
}

export { useLocalStorage };
