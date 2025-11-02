import React from 'react';

// recursively check if parsedItem has the same structure as initialValue
// if any property is missing, add it from initialValue
// if a property has a different type, replace it with the one from initialValue
// if there is an extra property, remove it
function validatedItem<T>(parsedItem: any, initialValue: T): T {
  // Helper function for deep validation
  function validate(value: any, template: any): any {
    // Handle arrays
    if (Array.isArray(template)) {
      if (!Array.isArray(value)) return template;
      const itemTemplate = template[0];
      // only add missing structure, keep all existing items
      return itemTemplate !== undefined
        ? value.map(v => validate(v, itemTemplate))
        : value;
    }

    // Handle objects
    if (template && typeof template === "object" && !Array.isArray(template)) {
      if (!value || typeof value !== "object" || Array.isArray(value)) {
        return template;
      }

      const validated: any = { ...value }; // start with everything from value
      for (const key of Object.keys(template)) {
        validated[key] = validate(value[key], template[key]);
      }
      return validated;
    }

    // For primitives — return existing value if present, else template default
    return value !== undefined ? value : template;
  }

  return validate(parsedItem, initialValue);
}



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
        parsedItem = validatedItem(parsedItem, initialValue);
        setItem(parsedItem);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error reading localStorage item:', error);
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
