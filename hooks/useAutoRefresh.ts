// hooks/useAutoRefresh.ts
import { useFocusEffect } from '@react-navigation/native';
import {useCallback, useEffect, useRef} from 'react';

export function useAutoRefresh(fetchFn: () => Promise<void>) {
    const fetchFnRef = useRef(fetchFn);
    useEffect(() => {
        fetchFnRef.current = fetchFn;
    }, [fetchFn]);

    const stableFetch = useRef(() => fetchFnRef.current()).current;

    useEffect(() => {
        stableFetch();
    }, [stableFetch]);

    useEffect(() => {
        const interval = setInterval(() => stableFetch(), 180000);
        return () => clearInterval(interval);
    }, [stableFetch]);

    useFocusEffect(
        useCallback(() => {
            stableFetch();
        }, [stableFetch])
    );
}