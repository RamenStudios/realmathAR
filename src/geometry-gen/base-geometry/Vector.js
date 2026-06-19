import { Vector3, Group, ConeGeometry, Mesh,  DoubleSide, MeshToonMaterial } from "three"
import { Line2 } from "three/examples/jsm/Addons.js"
import { LineGeometry } from "three/examples/jsm/Addons.js"
import { LineMaterial } from "three/examples/jsm/Addons.js"

const WIDTH = 0.05

/** 
 * adaptation from js ArrowHelper native 
 * allows custom line width utilizing Line2 addon
 */

/**
 * gathers and sets direction from vec input
 * outputs final oriented vector
 */
const set_dir = (group, vec) => {
    /* normalize input vec */
    const dir = new Vector3(vec.x, vec.y, vec.z)
    dir.normalize()
    /* logic taken directly from ArrowHelper native */
    if ( dir.y > 0.99999 ) {
        group.quaternion.set( 0, 0, 0, 1 )
    } else if ( dir.y < - 0.99999 ) {
        group.quaternion.set( 1, 0, 0, 0 )
    } else {
        const axis = new Vector3()
        axis.set( dir.z, 0, - dir.x ).normalize()
        const radians = Math.acos(dir.y )
        group.quaternion.setFromAxisAngle( axis, radians )
    }
    return {group: group}
}

/**
 * main object export 
 * takes in initial points and color
 */
export const Vector = (props) => {
    /* initializing vars / kwargs */
    const group = new Group()
    const {init, vec, color} = props
    const length =  init.distanceTo(vec)
    const rad = length / 8
    const head = rad / 4
    /* creating the line (arrow shaft) */
    const points = props.vfld === true  ?   [
                                            new Vector3(0,0,0),
                                            new Vector3(0, 1, 0)
                                        ]
                                    :   [
                                            new Vector3(0,0,0),
                                            new Vector3(0, length, 0)
                                        ]
    const line = new Line2(
    (new LineGeometry()).setFromPoints(points),
    new LineMaterial({
        color: color,
        linewidth: WIDTH,
        worldUnits: true,
    })
    )
    line.matrixAutoUpdate = false
    /* creating the cone (arrow point) */
    const cone = new Mesh(new ConeGeometry(head, rad, 6, 1), new MeshToonMaterial({
        color: color,
        worldUnits: true,
        side: DoubleSide,
    }))
    cone.matrixAutoUpdate = false
    group.add(line)
    group.add(cone)
    group.position.copy(init)
    const coneY = props.vfld === true ? cone.position.y + 1 : cone.position.y + (length*0.9)
    cone.position.set(cone.position.x, coneY, cone.position.z)
    cone.updateMatrix();
    line.scale.set(1, 0.9, 1)
    line.updateMatrix()
    cone.matrixAutoUpdate = true
    line.matrixAutoUpdate = true
    return set_dir(group, vec)
}