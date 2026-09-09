import { Group } from 'three'

/**
 * allows all geometry to share same global vars
 */
class Geometry {
    static MAXSIZE = 75
    static DEFAULT = 10
    
    constructor (type, eqs) {
        this.xMax = this.DEFAULT
        this.yMax = this.DEFAULT
        this.zMax = this.DEFAULT
        this.type = type
        this.eqs = eqs
        this.out = new Group()
    }

    getMax (this) {
        return this.MAXSIZE
    }

}