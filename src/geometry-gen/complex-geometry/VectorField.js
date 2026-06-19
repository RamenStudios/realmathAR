import { Group, Vector3, Color } from "three"
import { Vector } from "../base-geometry/Vector"
import { evaluate, N, assign } from "@cortex-js/compute-engine";

const MAXSIZE = 20

/* makes vector field */
export const VectorField = (props) => {
    /* kwargs */
    let {eqs, scale, sliceranges, update} = props
    /* init */
    const step = scale / MAXSIZE
    const vecsize = MAXSIZE * 2
    const vecs = new Group()
    /* we store all vecs to avoid having to reevaluate */
    const slices = Array(vecsize).fill().map(()=>{return Array(vecsize).fill().map(()=>Array(vecsize).fill())})
    // generate the list of vectors
    let i = 0
    let j = 0
    let k = 0
    for (let x = -scale; x < scale; x += 1) {
        for (let y = -scale; y < scale; y += 1) {
            for (let z = -scale; z < scale; z += 1) {
                assign('x', x)
                assign('y', y)
                assign('z', z)

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
                        init: new Vector3(x, z, y), 
                        vec: (new Vector3(values.x, values.z, values.y)).normalize(), 
                        color: new Color().setRGB(colorvec.x, colorvec.z, colorvec.y),
                        vfld: true,
                    })
                    try {
                        slices[i][j][k] = mesh.group
                    } catch (e) {
                        throw new Error(`${e}`)
                    }
                }
                k = k < vecsize-1 ? k + 1 : k
            }
            j = j < vecsize-1 ? j + 1 : j
            k = 0
        }
        i = i < vecsize-1 ? i + 1 : i
        j = 0
    }

    i = 0
    j = 0
    k = 0
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
        eqs: eqs,
        slices: slices
    }
}