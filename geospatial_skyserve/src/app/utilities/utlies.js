// utils.js

// Parse GeoJSON data
export function parseGeoJSON(data) {
    try {
        console.log('Data:', data); // Log the data variable
        if (typeof data !== 'string') {
            console.error('Expected string data but received:', typeof data, data);
            return null;
        }

        const trimmedData = data.trim();
        console.log('Trimmed data:', trimmedData); // Log the trimmed data
        const parsedData = JSON.parse(trimmedData);
        console.log('Parsed data:', parsedData); // Log the parsed data

        if (parsedData.type !== 'FeatureCollection' || !Array.isArray(parsedData.features)) {
            alert('Invalid GeoJSON format: missing FeatureCollection type or features array', parsedData);
            return null;
        }

        parsedData.features.forEach((feature, index) => {
            if (!feature.geometry || !feature.geometry.type || !feature.geometry.coordinates) {
                alert(`Invalid GeoJSON: Missing geometry attributes in feature at index ${index}`, feature);
                return null;
            }
        });

        return parsedData;

    } catch (error) {
        console.error('Error parsing GeoJSON:', error, '\nData:', data);
        return null;
    }
}

// Calculate viewport bounds from GeoJSON data
export function fitBoundsFromGeoJSON(geojson) {
    const coordinates = [];

    geojson.features.forEach((feature) => {
        switch (feature.geometry.type) {
            case 'Point':
                coordinates.push(feature.geometry.coordinates);
                break;
            case 'LineString':
            case 'MultiPoint':
                feature.geometry.coordinates.forEach((coord) => coordinates.push(coord));
                break;
            case 'Polygon':
            case 'MultiLineString':
                feature.geometry.coordinates.forEach((ring) => ring.forEach((coord) => coordinates.push(coord)));
                break;
            case 'MultiPolygon':
                feature.geometry.coordinates.forEach((polygon) =>
                    polygon.forEach((ring) => ring.forEach((coord) => coordinates.push(coord)))
                );
                break;
            default:
                break;
        }
    });

    const validCoordinates = coordinates.filter(coord => 
        Array.isArray(coord) && coord.length === 2 && 
        typeof coord[0] === 'number' && typeof coord[1] === 'number'
    );

    if (validCoordinates.length === 0) {
        console.error('No valid coordinates found in GeoJSON data');
        return null;
    }

    const bounds = validCoordinates.reduce((acc, coord) => {
        return [
            Math.min(acc[0], coord[0]),
            Math.min(acc[1], coord[1]),
            Math.max(acc[2], coord[0]),
            Math.max(acc[3], coord[1])
        ];
    }, [Infinity, Infinity, -Infinity, -Infinity]);

    if (bounds.includes(Infinity) || bounds.includes(-Infinity)) {
        console.error('Invalid bounds calculated from GeoJSON data');
        return null;
    }

    const latitude = (bounds[1] + bounds[3]) / 2;
    const longitude = (bounds[0] + bounds[2]) / 2;
    const zoom = 10;

    return { latitude, longitude, zoom };
}

