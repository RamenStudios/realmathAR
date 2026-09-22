import { Function } from "./complex-geometry/FunctionClass";
import { Point } from "./base-geometry/Point";
import { Vector } from "./base-geometry/Vector";
import { VectorField } from "./complex-geometry/VectorFieldClass";
import { SpaceCurve } from "./complex-geometry/SpaceCurveClass";

/** 
 * Int switch makes life easy
 * 0 = Function
 * 1 = Point
 * 2 = Vector
 * 3 = VectorField
 * 4 = SpaceCurve
*/

export const GeometryContainer = (type, props) => {
    let geometry = null
    switch (type) {
        case 0:
            geometry = new Function(props)
            break
        case 1:
            geometry = {out: Point(props), type: 1}
            break
        case 2:
            geometry = Vector(props)
            break
        case 3:
            geometry = new VectorField(props)
            break
        case 4:
            geometry = new SpaceCurve(props)
            break
        default:
            throw new Error('Invalid type passed to GeometryContainer!')
    }
    return geometry
}