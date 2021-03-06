export interface Location {
  ip: string;
  city: string;
  region: string;
  country: string;
  postal: string;
  latitude: number;
  longitude: number;
  timezone: string;
  reserved?: boolean;
}
