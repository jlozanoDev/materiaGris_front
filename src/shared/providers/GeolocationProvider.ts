export interface GeolocationProvider {
  getCurrentPosition(): Promise<{ lat: number; lon: number }>;
}

export class BrowserGeolocationProvider implements GeolocationProvider {
  getCurrentPosition(): Promise<{ lat: number; lon: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not available'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        (err) => {
          reject(err);
        },
        { timeout: 10000, enableHighAccuracy: false }
      );
    });
  }
}

export class MockGeolocationProvider implements GeolocationProvider {
  private lat: number;
  private lon: number;
  private shouldReject: boolean;

  constructor(lat = 40.4168, lon = -3.7038, shouldReject = false) {
    this.lat = lat;
    this.lon = lon;
    this.shouldReject = shouldReject;
  }

  async getCurrentPosition(): Promise<{ lat: number; lon: number }> {
    if (this.shouldReject) {
      throw new Error('Geolocation denied');
    }
    return { lat: this.lat, lon: this.lon };
  }
}
