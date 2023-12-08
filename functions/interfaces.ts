export interface OrefUpdate {
    id: string;
    cities: Array<string>;
    category: string;
    is_test?: boolean
  }
  
  export interface ActiveAlert {
    name: string;
    timestamp: Date;
    city?: City
    threat?: Threat,
    is_test: boolean
  }
  
  export interface Threat {
    he: string,
    en: string,
  }
  
  export interface Threats {
    [id: string]: Threat
  }
  
  export type LatLng = [number, number];
  export type IPolygon = LatLng[];
  
  export interface Polygons {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [id: string]: IPolygon
  }
  
  export interface Area {
    he: string,
    en: string
  }
  
  export interface City {
    id: number
    name: string,
    name_en: string,
    name_ru: string,
    name_ar: string,
    zone: string,
    zone_en: string,
    zone_ru: string,
    zone_ar: string,
    time: string,
    time_en: string,
    time_ru: string,
    time_ar: string,
    countdown: number
    lat: number
    lng: number
    value: string
  }
  
  export interface Cities {
    [name: string]: City
  }
  
  export interface Areas {
    [name: string]: Area
  }
  