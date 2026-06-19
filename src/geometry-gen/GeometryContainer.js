import { FunctionMesh } from "./complex-geometry/Function";
import { Point } from "./base-geometry/Point";
import { Vector } from "./base-geometry/Vector";
import { VectorField } from "./complex-geometry/VectorField";
import { SpaceCurve } from "./complex-geometry/SpaceCurve";

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
            geometry = FunctionMesh(props)
            break
        case 1:
            geometry = Point(props)
            break
        case 2:
            geometry = Vector(props)
            break
        case 3:
            geometry = VectorField(props)
            break
        case 4:
            geometry = SpaceCurve(props)
            break
        default:
            throw new Error('Invalid type passed to GeometryContainer!')
    }
    return geometry
}