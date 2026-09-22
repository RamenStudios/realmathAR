import { Group, Vector3, Color } from "three"
import { Vector } from "../base-geometry/Vector"
import { evaluate, N, assign } from "@cortex-js/compute-engine";

const MAXSIZE = 75
const MAXSLICE = 10
const STEP = 0.2

/* makes vector field */
export const VectorField = (props) => {
    /* kwargs */
    let {eqs, scale, sliceranges, update} = props
    /* init */
    const vecsize = (MAXSIZE * 2) / STEP
    const vecs = new Group()
    /* cache all vecs to avoid having to reevaluate, as loops are expensive */
    const slices = Array(vecsize).fill().map(()=>{return Array(vecsize).fill().map(()=>Array(vecsize).fill())})
    // generate the list of vectors
    const xyz = {x: -MAXSIZE, y: -MAXSIZE, z: -MAXSIZE}
    for (let i = -vecsize; i < vecsize; i += 1) {
        for (let j = -vecsize; j < vecsize; j += 1) {
            xyz.z = -MAXSIZE
            for (let k = -vecsize; k < vecsize; k += 1) {
                assign('x', xyz.x)
                assign('y', xyz.y)
                assign('z', xyz.z)

                let add = true  // prevents nan values from being included in vecs
                const values = {'x': null, 'y': null, 'z': null}

                for (const element of ['x', 'y', 'z']) {
                    const result = `${eqs[element].evaluate()}`
                    if (isNaN(result) === false) {
                        values[element] = Number(result)
                    } else {
                        add = false
                        break
                    }
                }

                const dir = new Vector3(values.x, values.y, values.z)
                const colorvec = new Vector3().copy(dir).normalize()

                if (add) {
                    let mesh = Vector({
                        init: dir,
                        vec: colorvec, 
                        color: new Color().setRGB(colorvec.x, colorvec.z, colorvec.y),
                        vfld: true,
                    })
                    try {
                        slices[i][j][k] = mesh.group
                    } catch (e) {
                        throw new Error(`${e}`)
                    }
                }
                xyz.z += STEP
            }
            xyz.y += STEP           
        }
        xyz.x += STEP
    }
    
    // now only add the desired ones
    for (let x = -sliceranges[0]; x < sliceranges[0]; x++) {
        for (let y = -sliceranges[1]; y < sliceranges[1]; y++) {
            for (let z = -sliceranges[2]; z < sliceranges[2]; z++) {
                try {
                    vecs.add(slices[i][j][k])
                } catch (e) {
                    console.error(`${e}`)
                }
                k+=1
            }
            k = 0
            j+=1
        }
        j = 0
        i+=1
    }

    return {
        group: vecs,
        xSlices: sliceranges[0],
        ySlices: sliceranges[1],
        zSlices: sliceranges[2],
        slices: slices,
        xMax: scale,
        yMax: scale,
        zMax: scale,
        type: 3
    }
}