import { Position, Polygon, FeatureCollection, Point } from '@vpriem/geojson';
import { GeosearchInterface } from './geosearch-interface';
import booleanIntersects from '@turf/boolean-intersects';
import circle from '@turf/circle';

export class Geosearch implements GeosearchInterface {
    data: FeatureCollection<Polygon | Point> | undefined;

    init(data: FeatureCollection<Polygon | Point>): Promise<void> {
        this.data = data;
        return Promise.resolve();
    }

    shutdown(): Promise<void> {
        delete this.data;
        return Promise.resolve();
    }

    find(
        position: Position,
        radius: number
    ): Promise<FeatureCollection<Polygon | Point>> {

        if (!this.data) {
            return Promise.reject("data is undefined");
        }
        try {
            return Promise.resolve({
                type: 'FeatureCollection',
                features: this.data.features.filter((feature) => {
                    return this.isInSearchArea(
                        radius,
                        position,
                        feature.geometry,
                    );
                }),
            });
        } catch (error) {
            throw new Error(error);
        }

    }

    isInSearchArea = function (
        radius: number,
        position: Position,
        geometry: Polygon | Point
    ) {
        if (geometry.type === 'Point') {

            var givenPointX: number = geometry.coordinates[0];
            var givenPointY: number = geometry.coordinates[1];
            var circleX: number = position[0];
            var circleY: number = position[1];
            return this.isWithinCircleRadius_haversine(givenPointX, givenPointY, circleX, circleY, radius);

        } else if (geometry.type === 'Polygon') {

            var createdCircle = circle(position, radius, {
                units: 'meters',
            });
            return booleanIntersects(createdCircle, geometry);

        }
    };

    isWithinCircleRadius_haversine = function (a: number, b: number, x: number, y: number, radius: number) {

        var earthRadius: number = 6371000;
        var dLat: number = this.toRad(y - b);
        var dLon: number = this.toRad(x - a);
        var lat1: number = this.toRad(y);
        var lat2: number = this.toRad(b);

        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = earthRadius * c;

        return d <= radius;
    };

    toRad = function (value: number) {
        return value * Math.PI / 180;
    };
}
