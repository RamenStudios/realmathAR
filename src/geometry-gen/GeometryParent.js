import { Group } from 'three'

/**
 * allows all geometry to share same global vars
 */
export class GeometryParent {
    static MAXSIZE = 75
    static DEFAULT = 10
    
    constructor (type, eqs) {
        this.scale = this.constructor.DEFAULT
        this.prevScale = this.constructor.DEFAULT
        this.setSize()
        this.type = type
        this.eqs = eqs
        this.out = new Group()
    }

    getMax = () => {
        return this.constructor.MAXSIZE
    }

    setSize = () => {
        this.size = this.scale + 20
    }

    checkRedundant = () => {
        if (this.scale === this.prevScale) {
            return true
        } else {
            this.prevScale = this.scale
            return false
        }
    }
} 