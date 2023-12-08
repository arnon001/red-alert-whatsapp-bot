import classifyPoint from 'robust-point-in-polygon';
import * as interfaces from './interfaces';

import cities_raw_json from "../assets/cities.json";
import polygons_raw_json from "../assets/polygons.json";
import threats_raw_json from "../assets/threats.json";

// Update citiesJson and polygonsJson to handle the new JSON structure
const citiesJson = cities_raw_json as interfaces.City[];
const polygonsJson = polygons_raw_json as unknown as interfaces.IPolygon[];

const threatsJson = threats_raw_json as interfaces.Threats

// Function to check if a point is inside a polygon
function pointInPolygon(polygon: interfaces.IPolygon, point: [number, number]) {
    return classifyPoint(polygon, point) !== 1; // 1 means it's outside
}

export {
    pointInPolygon,
    interfaces,
    threatsJson,
    citiesJson,
    polygonsJson,
};
