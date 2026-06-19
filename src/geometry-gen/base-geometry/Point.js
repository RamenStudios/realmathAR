import {SphereGeometry, Mesh, DoubleSide, MeshToonMaterial} from 'three'

export const Point = (props) => {
    const {pos, color} = props
    const geometry = new SphereGeometry(0.1, 8, 8)
    const material = new MeshToonMaterial({
        color: 0xffff00,
        side: DoubleSide,
    })
    const point = new Mesh(geometry, material)
    point.position.set(pos.x, pos.y, pos.z)
    return point
}