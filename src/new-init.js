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

/* initializing range constraints + steps */
const GlobalRanges =    {
                            axis: [75, 1],
                            t: [100, 0.1]
                        }

/* axes and grid */
const axes = new THREE.AxesHelper(10)
const grid = new THREE.GridHelper(10, 10, 0x9bdc6e, 0x333333)

/* global params affect more than 1 object */
const params = {
    scale: 1.0,
}

const gui = new GUI()

const genFolder = gui.addFolder('Global Variables')
genFolder.add(axes, 'visible').name('axes visible?')
genFolder.add(grid, 'visible').name('grid visible?')
genFolder.add(params, 'scale', 0, 1, 0.1)

scene.add(axes)
scene.add(grid)

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

/* initialize the gui for each component */
const GuiInit = (gui, component) => {
    /* for components affected by range constraints */
    const RangeSlider = (callback = null) => {
        [['x', 0], ['y', 1], ['z', 2]].map((axis) => {
            let tempgui = gui.add(component, `${axis[0]}Max`, 5, GlobalRanges.axis[0], GlobalRanges.axis[1])
            tempgui.onFinishChange((value) => {
                if (callback !== null) {
                    callback(value, axis[1], component)
                }
            })
            tempgui.name(`${axis[0]} range (+-)`)
        })
    }
    /* for components with flat colors */
    const ColorSlider = (obj=component, name=null) => {
        let tempgui = gui.addColor(obj.mesh.material, 'color')
        if (name !== null) {
            tempgui.name(name)
        }
    }
    /* gui composition by component type */
    switch (component.type) {
        // func
        case 0:
            RangeSlider()
            break
        // pt
        case 1:
            ColorSlider()
            break
        // vec
        case 2:
            gui.addColor(component.group.children[0].material, 'color').onChange((value) => {component.group.children[1].material.color = value.clone()})
            break
        // vfld
        case 3:
            /**
             *  SLICE UPDATERS
             *  having a separate one for each vFld prevents too many concurrent rerenders 
             *  map so as to not rewrite 3 lines or store arbitrary array
             **/
            sliceFolder = gui.addFolder('Vectors Along []-Axis')
            [['x', 0], ['y', 1], ['z', 2]].map((slice) => {
                let tempgui = sliceFolder.add(component, `${slice[0]}Slices`, 1, 10, component.ranges[slice[1]])
                tempgui.onFinishChange((value)=>{VectorFieldCallback(value, slice[1], component)})
                tempgui.name(`${slice[0]}-axis`)
            })
            break
        // scrv
        case 4:
            RangeSlider()
            gui.add(component, 't', -GlobalRanges.t[0], GlobalRanges.t[0], GlobalRanges.t[1])
            ColorSlider(component.mesh, 'curve color')
            ColorSlider(component.point, 'point color')
            break
    }
}

/* extract components from URL, init their GUIs, prepare for scene addition */
const Components = new THREE.Group()
Processor(Parser()).map((component) => {
    let newFolder = gui.addFolder(component.name)
    GuiInit(newFolder, component)
    /* some in groups, some singular meshes */
    if ('group' in component) {
        Components.add(component.group)
    } else {
        Components.add(component.mesh)
    }
})

scene.add(Components)