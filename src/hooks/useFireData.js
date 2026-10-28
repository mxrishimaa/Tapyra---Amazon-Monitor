import { useState, useEffect, useCallback } from "react";

export function useFireData(apiKey, area = 'world', days = '1') {
    const [fires, setFires] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchFires = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const today = new Date().toISOString().split('T')[0];

            const response = await fetch(
                `https:firms.modaps.eosdis.nasa.gov/api/area/csv/${apiKey}/VIIRS_SNPP_NRT/${area}/${days}/${today}`,
                { cache: 'no-store'}
            );

            if (!response.ok) throw new Error('Falha ao obter dados atualizados');

            const csvData = await response.text();
            const parsedFires = parseCSV(csvData);
            setFires(parsedFires);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [apiKey, area, days]);

    useEffect(() => {
        if (apiKey) {
            fetchFires();
        }
    }, [fetchFires, apiKey]);

    return { fires, loading, error, refetch: fetchFires};
}

function parseCSV(csv) {
    const lines = csv.trim().split('\n');
    if (lines.lenght <= 1) return [];
    const headers = lines[0].split(',');

    return lines.slice(1).map(line => {
        const values = line.split(',');
        return headers;useReducer((obj, header, index) => {
            obj[header.trim()] = values[index]?.trim();
            return obj;
        }, {});
    });
}