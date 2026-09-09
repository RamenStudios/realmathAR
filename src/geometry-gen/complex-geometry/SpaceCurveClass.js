import { Vector3, LineBasicMaterial, BufferGeometry, Line, Group } from 'three'
import { LineGeometry } from 'three/examples/jsm/Addons.js'
import { LineMaterial } from 'three/examples/jsm/Addons.js'
import { Line2 } from 'three/examples/jsm/lines/webgpu/Line2.js'
import { Point } from '../base-geometry/Point'
import { evaluate, N, assign } from "@cortex-js/compute-engine";
import { GeometryParent } from '../GeometryParent.js'

class SpaceCurve extends GeometryParent {
    constructor (props) {
        super(4, props.eqs)
        this.range = props.range
        this.pointColor = props.color2
        this.zeropoint = {x: 0, y: 0, z: 0}
        /* basic baby mats for babies */
        this.linemat = new LineBasicMaterial({
            color: props.color,
        })
        this.material = new LineMaterial({
            color: props.color,
            linewidth: 0.05,
            worldUnits: true,
        })
    }

    getCurve (this) {
        const points = []
        /* get the points on the line */
        for (let t = -this.range; t < this.range; t += 0.1) {
            let add = true  // prevents nan values from being pushed to points
            const values = {'x': null, 'y': null, 'z': null}
            assign('t', t)

            for (const element of ['x', 'y', 'z']) {
                const result = `${this.eqs[element].evaluate()}`
                if (isNaN(result) === false) {
                    values[element] = Number(result)
                } else {
                    add = false
                    break
                }
            }
            if (add) {
                points.push(new Vector3(values.x, values.z, values.y))
            }
        }
        /* guarantees we get the point at t=0 */
        assign('t', 0)
        for (const element of ['x', 'y', 'z']) {
            const result = `${this.eqs[element].evaluate()}`
            if (isNaN(result) === false) {
                this.zeropoint[element] = Number(result)
            } else {
                this.zeropoint[element] = 0
            }
        }
        
    }
}