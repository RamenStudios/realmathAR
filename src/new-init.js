import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import { Parser } from './input-processing/Parser';
import { Processor } from './input-processing/Processor';

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

/* vFlds container for callbacks */
const vFlds = []

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

/* callback when vfld slices changed */
const VectorFieldCallback = (value, index, vfld) => {
    /* update slice range, avoid redundant rerender */
    if (vfld.ranges[index] === value) {
        return
    } else {
        vfld.ranges[index] = value
    }
    /* clear old slices from display */
    vfld.group.children = []
    let i = 0 
    let j = 0
    let k = 0
    /* get desired slices from slice cache */
    for (let x = -vfld.ranges[0]; x < vfld.ranges[0]; x++) {
        for (let y = -vfld.ranges[1]; y < vfld.ranges[1]; y++) {
            for (let z = -vfld.ranges[2]; z < vfld.ranges[2]; z++) {
                try {
                    vfld.group.add(vfld.slices[i][j][k])
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

const GuiInit = (gui, component) => {
    /* for components affected by range constraints */
    const RangeSlider = () => {
        gui.add(component, 'xMax', 5, 50, 1)
        gui.add(component, 'yMax', 5, 50, 1)
        gui.add(component, 'zMax', 5, 50, 1)
    }
    /* for components with flat colors */
    const ColorSlider = () => {
        gui.addColor(component.mesh.material, 'color')
    }
    switch (component.type) {
        // func
        case 0:
            RangeSlider()
            break
        // pt
        case 1:
            break
        // vec
        case 2:
            break
        // vfld
        case 3:
            /**
             *  SLICE UPDATERS
             *  having a separate one for each vFld prevents too many concurrent rerenders 
             **/
            [['x', 0], ['y', 1], ['z', 2]].map((slice) => {
                gui.add(component, `${slice[0]}Slices`, 1, 20, component.ranges[slice[1]]).onFinishChange((value)=>{VectorFieldCallback(value, slice[1], component)})
            })
            break
        // scrv
        case 4:
            RangeSlider()
            ColorSlider()
            break
    }
}

Processor(Parser()).map((component) => {
    let newFolder = gui.addFolder(component.name)
    /* treat component types as appropriate */
    switch (component.type) {
        // func
        case 0:
            break
        // pt
        case 1:
            break
        // vec
        case 2:
            break
        // vfld
        case 3:
            /**
             *  SLICE UPDATERS
             *  having a separate one for each vFld prevents too many concurrent rerenders 
             **/
            newFolder.add(component, 'xSlices', 1, 20, component.ranges[0]).onFinishChange((value)=>{VectorFieldCallback(value, 0, component)})
            newFolder.add(component, 'ySlices', 1, 20, component.ranges[1]).onFinishChange((value)=>{VectorFieldCallback(value, 1, component)})
            newFolder.add(component, 'zSlices', 1, 20, component.ranges[2]).onFinishChange((value)=>{VectorFieldCallback(value, 2, component)})
            break
        // scrv
        case 4:
            break
    }
    // vfld uses a gradient 
    // hmm... so does function. maybe find a better way
    if (component.name.includes('VFld')) {
        /**
         *  SLICE UPDATERS
         *  having a separate one for each vFld prevents too many concurrent rerenders 
         **/
        newFolder.add(component, 'xSlices', 1, 20, component.ranges[0]).onFinishChange((value)=>{VectorFieldCallback(value, 0, component)})
        newFolder.add(component, 'ySlices', 1, 20, component.ranges[1]).onFinishChange((value)=>{VectorFieldCallback(value, 1, component)})
        newFolder.add(component, 'zSlices', 1, 20, component.ranges[2]).onFinishChange((value)=>{VectorFieldCallback(value, 2, component)})
        console.log('todo vfld, colors')
    } else {
        /* vectors are fixed magnitude, no range slider */
        if (component.name.includes('Vec')) {
            console.log('todo vec, line and cone colors')
        } else {
            /* everything else gets a size slider */
        }
        newFolder.add(component, 'xMax', 5, 50, 1)
        newFolder.add(component, 'yMax', 5, 50, 1)
        newFolder.add(component, 'zMax', 5, 50, 1)
        if (component.name.includes('Func')) {
            console.log('todo func, gradient colors')
        } else if (component.name.includes('Vec')) {
        } else {
            newFolder.addColor(component.mesh.material, 'color')
        }
    }
})