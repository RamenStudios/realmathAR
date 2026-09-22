import { GeometryParent } from '../GeometryParent.js'
import { Group, Vector3, Color } from "three"
import { Vector } from "../base-geometry/Vector"
import { evaluate, N, assign } from "@cortex-js/compute-engine";

export class VectorField extends GeometryParent {
    static STEP = 0.2
    constructor (props) {
        /* initialize super and vars */
        super(3, props.eqs)
        this.slices = {x: 5, y:5, z:1}
        this.prevSlices = {...this.slices}
        this.vecSize = (this.constructor.MAXSIZE * 2) / this.constructor.STEP
        console.log(this.vecSize)
        /* generate all vectors, caching to avoid reeval */
        this.vecs = Array(this.vecSize).fill().map(()=>{return Array(this.vecSize).fill().map(()=>Array(this.vecsize).fill())})
        const xyz = {x: -this.constructor.MAXSIZE, y: -this.constructor.MAXSIZE, z: -this.constructor.MAXSIZE}
        for (let i = 0; i < this.vecSize; i += 1) {
            xyz.y = -this.constructor.MAXSIZE
            for (let j = 0; j < this.vecSize; j += 1) {
                xyz.z = -this.constructor.MAXSIZE
                for (let k = 0; k < this.vecSize; k += 1) {
                    assign('x', xyz.x)
                    assign('y', xyz.y)
                    assign('z', xyz.z)

                    let add = true  // prevents nan values from being included in vecs
                    const values = {'x': null, 'y': null, 'z': null}

                    for (const element of ['x', 'y', 'z']) {
                        const result = `${this.eqs[element].evaluate()}`
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
                        const mesh = Vector({
                            init: dir,
                            vec: colorvec, 
                            color: new Color().setRGB(colorvec.x, colorvec.z, colorvec.y),
                            vfld: true,
                        }).out
                        try {
                            this.vecs[i][j][k] = mesh
                        } catch (e) {
                            throw new Error(`error @ VectorFieldClass l:51 ${e}`)
                        }
                    }
                    xyz.z += this.constructor.STEP
                }
                xyz.y += this.constructor.STEP           
            }
            xyz.x += this.constructor.STEP
        }
    }

    getVecs () {
        /* clear old slices from display */
        /* no garbage collection, since we want them cached */
        this.out.children = []
        let i = 0
        let j = 0
        let k = 0
        /* get desired # of vecs in each direction */
        for (let x = -this.slices.x; x < this.slices.x; x++) {
            for (let y = -this.slices.y; y < this.slices.y; y++) {
                for (let z = -this.slices.z; z < this.slices.z; z++) {
                    try {
                        this.out.add(this.vecs[i][j][k])
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
    }

    vecsCallback = (coord) => {
        /* prevent redundant changes */
        if (this.prevSlices[coord] == this.slices[coord]) {
            return
        } else {
            this.prevSlices[coord] = this.slices[coord]
            this.getVecs()
        }
    }


}