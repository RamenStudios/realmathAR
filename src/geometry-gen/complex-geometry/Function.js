import { MarchingCubes } from "../mcubes/MarchingCubes"
import { Float32BufferAttribute, ShaderMaterial, Color, DoubleSide, BufferGeometry, Mesh, Group } from "three"

/// ///////////////////////////////////////////////////////////////////////////////////////////////
/// adapted from tamani-coding's marching cubes example
/// the repo is here: https://github.com/tamani-coding/threejs-marching-cubes-example/blob/main/README.md
/// usage according to MIT license:
/// Copyright (c) 2023 tamani-coding

/// Permission is hereby granted, free of charge, to any person obtaining a copy
/// of this software and associated documentation files (the "Software"), to deal
/// in the Software without restriction, including without limitation the rights
/// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
/// copies of the Software, and to permit persons to whom the Software is
/// furnished to do so, subject to the following conditions:

/// The above copyright notice and this permission notice shall be included in all
/// copies or substantial portions of the Software.

/// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
/// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
/// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
/// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
/// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
/// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
/// SOFTWARE.
/// ///////////////////////////////////////////////////////////////////////////////////////////////
/* helper for getting points, so I don't rewrite the snippet */
const FunctionPointGetter = (props) => {
    /* kwargs */
    const {equation, scalein, sizein, color} = props
    /* generates points using marching cubes alg */
    const trianglePoints = MarchingCubes(equation, scalein, sizein)
    const maxPolygons = 30000
    const vertices = Array(3 * maxPolygons).fill(0)
    /* faces */
    for (let i = 0; i < trianglePoints.length; i++) {
    const [x, y, z] = trianglePoints[i]
    vertices[i * 3]     = x
    vertices[i * 3 + 1] = z
    vertices[i * 3 + 2] = y
    }
    const positionAttribute = new Float32BufferAttribute(vertices, 3)
    return [positionAttribute, trianglePoints]
}

/* helper for function mesh material, so I don't rewrite the snippet */
const MakeFunctionMaterial = (geometry, color) => {
    geometry.computeBoundingBox()
    const material = new ShaderMaterial({
        uniforms: {
            color1: {
                value: new Color(0X2D0075),
            },
            color2: {
                value: new Color(0x60EFFF),
            },
            bboxMin: {
                value: geometry.boundingBox.min,
            },
            bboxMax: {
                value: geometry.boundingBox.max,
            },
        },
        vertexShader: `
            uniform vec3 bboxMin;
            uniform vec3 bboxMax;

            varying vec2 vUv;

            void main() {
                vUv.y = (position.y - bboxMin.y) / (bboxMax.y - bboxMin.y);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
            }
        `,
        fragmentShader: `
            uniform vec3 color1;
            uniform vec3 color2;

            varying vec2 vUv;
            
            void main() {
            
                gl_FragColor = vec4(mix(color1, color2, vUv.y), 1.0);
            }
        `,
        wireframe: false,
        side: DoubleSide,
    })
    return material
}

/* generates the BufferGeometry mesh from given equation */
export const FunctionMesh = (props) => {
    const [positionAttribute, trianglePoints] = FunctionPointGetter(props)
    const meshBufferGeometry = new BufferGeometry()
    meshBufferGeometry.setAttribute('position', positionAttribute)
    meshBufferGeometry.setDrawRange(0, trianglePoints.length)
    meshBufferGeometry.computeVertexNormals()

    /* make gradient material */
    /* from https://stackoverflow.com/questions/52614371/apply-color-gradient-to-material-on-mesh-three-js/52615186#52615186 */
    const material = MakeFunctionMaterial(meshBufferGeometry, props.color)

    const mesh = new Mesh(meshBufferGeometry, material)

    /* return group as appropriate */
    const funcgroup = new Group()
    funcgroup.add(mesh)
    return {
        'group': funcgroup,
        'mesh': mesh,
        'equation': props.equation,
    }
}
/// /////////////////////////////////////////
/// /////////////////////////////////////////