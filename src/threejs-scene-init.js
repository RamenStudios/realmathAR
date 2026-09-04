import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import { Parser } from './input-processing/Parser';
import { Processor } from './input-processing/Processor';

/* *******************************TODO**********************************
  * Migrate to lil-gui, dat-gui is outdated
  * * lil-gui also supports easier color sliders
  * Untangle gui callbacks
  * Make axis generation less messy
  *  *  tbh just move back to axis helper probably
  * Add color changer callbacks
  * Update to current mathlive
  * ???
  * profit
********************************************************************* */

// allows vars to be updated by externalgui callback
const vars = {
  'scenescale': 0.5,
  'axisscale': 1,
  'size': 30,
  'scale': 10,
  't': 0,
  'slices': [9, 9, 1], 
}

const containers = {
  'vflds': []
}

/* initializing range constraints + steps */
const GlobalRanges =    {
                            axis: [75, 1],
                            t: [100, 0.1]
                        }

export const initScenePipelineModule = () => {
  const purple = 0xAD50FF

  // Populates a cube into an XR scene and sets the initial camera position.
  const initXrScene = ({scene, camera, renderer}) => {
    // Enable shadows in the rednerer.
    renderer.shadowMap.enabled = true

    // Add some light to the scene.
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5)
    directionalLight.position.set(5, 10, 7)
    directionalLight.castShadow = true
    scene.add(directionalLight)

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
            ([['x', 0], ['y', 1], ['z', 2]]).map((axis) => {
                gui
                .add(component, `${axis[0]}Max`, 5, GlobalRanges.axis[0], GlobalRanges.axis[1])
                .name(`${axis[0]} range (+-)`)
                .onFinishChange((value) => {
                    if (callback !== null) {
                        callback(value, axis[1], component)
                    }
                })
            })
        }
        /* for components with flat colors */
        const ColorSlider = (obj, name=null) => {
            if (name !== null) {  
              gui.addColor(obj.material, 'color').name(name)
            } else {
              gui.addColor(obj.material, 'color')
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
                ColorSlider(obj.group)
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
                ([['x', 0], ['y', 1], ['z', 2]]).map((slice) => {
                    sliceFolder
                      .add(component, `${slice[0]}Slices`, 1, 10, component.ranges[slice[1]])
                      .onFinishChange((value)=>{VectorFieldCallback(value, slice[1], component)})
                      .name(`${slice[0]}-axis`)
                })
                break
            // scrv
            case 4:
                RangeSlider()
                console.log(component)
                gui.add(component, 't', -GlobalRanges.t[0], GlobalRanges.t[0], GlobalRanges.t[1])
                ColorSlider(component.mesh, 'curve color')
                ColorSlider(component.point, 'point color')
                break
        }
    }

    /* extract components from URL, init their GUIs, prepare for scene addition */
    const Components = new THREE.Group()
    Processor(Parser()).map((component) => {
      console.log(component)
      let [name, obj] = component
      console.log(obj)
      let newFolder = gui.addFolder(name)
      GuiInit(newFolder, obj)
      Components.add(obj.group)
    })

    console.log('components complete')

    scene.add(Components)

    // Set the initial camera position relative to the scene we just laid out. This must be at a
    // height greater than y=0.
    camera.position.set(0, 2, 2)
    camera.up = new THREE.Vector3( 0, 0, 1 );
  }

  // Return a camera pipeline module that adds scene elements on start.
  return {
    // Camera pipeline modules need a name. It can be whatever you want but must be unique within
    // your app.
    name: 'threejsinitscene',

    // onStart is called once when the camera feed begins. In this case, we need to wait for the
    // XR8.Threejs scene to be ready before we can access it to add content. It was created in
    // XR8.Threejs.pipelineModule()'s onStart method.
    onStart: ({canvas}) => {
      const {scene, camera, renderer} = XR8.Threejs.xrScene()  // Get the 3js scene from XR8.Threejs

      initXrScene({scene, camera, renderer})  // Add objects set the starting camera position.

      // prevent scroll/pinch gestures on canvas
      canvas.addEventListener('touchmove', (event) => {
        event.preventDefault()
      })

      // Sync the xr controller's 6DoF position and camera paremeters with our scene.
      XR8.XrController.updateCameraProjectionMatrix(
        {origin: camera.position, facing: camera.quaternion}
      )

      // Recenter content when the canvas is tapped.
      canvas.addEventListener(
        'touchstart', (e) => {
          e.touches.length === 1 && XR8.XrController.recenter()
        }, true
      )
    },
  }
}
