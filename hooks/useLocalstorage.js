'use client'

import { useEffect, useState } from 'react';

function useLocalStorage(key, initialValue) {

    const storedValue = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
    const [value, setValue] = useState(() => {
        if (storedValue) {
            return JSON.parse(storedValue);
        } else {
            return initialValue;
        }
    });

    useEffect(() => {
        if (value !== undefined) {
            localStorage.setItem(key, JSON.stringify(value));
        }
    }, [key, value]);

    return [value, setValue];
}

export default useLocalStorage;
