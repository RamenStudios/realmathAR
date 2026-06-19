import { Vector3, LineBasicMaterial, BufferGeometry, Line, Group } from 'three'
import { LineGeometry } from 'three/examples/jsm/Addons.js'
import { LineMaterial } from 'three/examples/jsm/Addons.js'
import { Line2 } from 'three/examples/jsm/lines/webgpu/Line2.js'
import { Point } from '../base-geometry/Point'
import { evaluate, N, assign } from "@cortex-js/compute-engine";

export const SpaceCurve = (props) => {
    /* kwargs */
    const {eqs, scale, color, color2} = props
    const points = []
    let zeropoint = {'x': 0, 'y': 0, 'z': 0}

    for (let t = -scale; t < scale; t += 0.1) {
        let add = true  // prevents nan values from being pushed to points
        const values = {'x': null, 'y': null, 'z': null}
        assign('t', t)

        for (const element of ['x', 'y', 'z']) {
            const result = `${eqs[element].evaluate()}`
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

    // get the zero point
    assign('t', 0)
    for (const element of ['x', 'y', 'z']) {
        const result = `${eqs[element].evaluate()}`
        if (isNaN(result) === false) {
            zeropoint[element] = Number(result)
        } else {
            zeropoint[element] = 0
        }
    }

    // placeholder mats
    const linemat = new LineBasicMaterial({
        color: color,
    })
    const material = new LineMaterial({
        color: color,
        linewidth: 0.05,
        worldUnits: true,
    })

    const geometry = new BufferGeometry().setFromPoints(points)
    const linegeo = new LineGeometry().fromLine(new Line(geometry, linemat))
    const returngroup = new Group()
    returngroup.add(Point({pos: new Vector3(zeropoint.x, zeropoint.y, zeropoint.z), color: color2}))
    returngroup.add(new Line2(linegeo, material))
    return {
        'point': Point({pos: new Vector3(zeropoint.x, zeropoint.y, zeropoint.z), color: color2}),
        'mesh': new Line2(linegeo, material),
        'group': returngroup,
        'eqs': eqs,
    }
}