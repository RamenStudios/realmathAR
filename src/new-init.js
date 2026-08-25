import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'

/* 
    gridhelper example. consider orbit ctrls? 
    https://threejsdemos.com/demos/basics/grid-helper
*/

/* gridhelper example
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
camera.position.set(2, 2, 3)

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(width, height)
document.querySelector('#app').appendChild(renderer.domElement)

const controls = new OrbitControls(camera, renderer.domElement)
controls.target.set(0, 0, 0)
controls.update()

const grid = new THREE.GridHelper(10, 10, 0x9bdc6e, 0x333333)
scene.add(grid)

const axes = new THREE.AxesHelper(1.5)
scene.add(axes)

function animate() {
  requestAnimationFrame(animate)
  controls.update()
  renderer.render(scene, camera)
}
animate()
*/

/* axes and grid */
const axes = new THREE.AxesHelper(10)
const grid = new THREE.GridHelper(10, 10, 0x9bdc6e, 0x333333)

/* global params affect more than 1 object */
const params = {
    scale: 1.0,
    t: 0,
}

const gui = new GUI()

const genFolder = gui.addFolder('General')
genFolder.add(axes, 'visible')
genFolder.add(grid, 'visible')
genFolder.add(params, 'scale', 0, 1, 0.1)
genFolder.add(params, 't', -50, 50, 0.1)

/* 
    for component colors, do
    gui.addColor(component.material, 'color')
*/

const components = []

components.map((component) => {
    let newFolder = gui.addFolder(component.name)
    // vfld uses a gradient 
    // hmm... so does function. maybe find a better way
    if (!(component.name.includes('VFld'))) {
        newFolder.addColor(component.mesh.material, 'color')
    }
    newFolder.add(component, 'xMax', 5, 50, 1)
    newFolder.add(component, 'yMax', 5, 50, 1)
    newFolder.add(component, 'zMax', 5, 50, 1)
})