import { FeatureCollection, Polygon, Position } from "@vpriem/geojson";
import { GeofenceInterface } from "./geofence-interface";

export class Geofence implements GeofenceInterface {
  data: FeatureCollection<Polygon> | undefined;

  init(data: FeatureCollection<Polygon>): Promise<void> {
    this.data = data;
    return Promise.resolve();
  }

  shutdown(): Promise<void> {
    delete this.data;
    return Promise.resolve();
  }

  set(position: Position): Promise<FeatureCollection<Polygon>> {

    if (!this.data) {
      return Promise.reject("data is undefined");
    }

    try {
      return Promise.resolve({
        type: "FeatureCollection",
        features: this.data.features.filter((polygon) =>
          this.rayTracing_oddEvenRule(
            position[0],
            position[1],
            polygon.geometry
          )
        ),
      });
    } catch (error) {
      throw new Error(error);
    }
  }

  rayTracing_oddEvenRule = function (
    positionLong: number,
    positionLat: number,
    polygon: Polygon
  ) {
    let odd = false;
    var aX: number, bX: number, aY: number, bY: number;
    for (let i = 0; i < polygon.coordinates.length; i++) {
      for (let j = 0; j < polygon.coordinates[i].length - 1; j++) {
        aX = polygon.coordinates[i][j][0];
        bX = polygon.coordinates[i][j + 1][0];
        aY = polygon.coordinates[i][j][1];
        bY = polygon.coordinates[i][j + 1][1];

        if (positionLat < aY != positionLat < bY && positionLong < ((bX - aX) * (positionLat - aY)) / (bY - aY) + aX)
          odd = !odd;
      }
    }
    //If the number of crossings was odd, the point is in the polygon
    return odd;
  };
}
