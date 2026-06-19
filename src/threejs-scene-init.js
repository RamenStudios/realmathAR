// Define an 8th Wall XR Camera Pipeline Module that adds a cube to a threejs scene on startup.
import * as THREE from 'three';
import { GUI } from 'dat.gui';
import { Parser } from './input-processing/Parser';
import { Processor } from './input-processing/Processor';
import { BaseComponentGui } from './gui/BaseComponentGui';
import { GuiCallbacks } from './gui/GuiCallbacks';
import { VectorFieldCallback } from './callbacks/VectorFieldCallback';

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

export const initScenePipelineModule = () => {
  const purple = 0xAD50FF

  // Populates a cube into an XR scene and sets the initial camera position.
  const initXrScene = ({scene, camera, renderer}) => {
    // Enable shadows in the rednerer.
    renderer.shadowMap.enabled = true

    const callbacks = {
      'vflds': (() => {
        VectorFieldCallback(vars.slices, containers.vflds)
        renderer.render(scene, camera)
      }),
    }


    // Add some light to the scene.
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5)
    directionalLight.position.set(5, 10, 7)
    directionalLight.castShadow = true
    scene.add(directionalLight)

    /* axes */
    const params = {
      showAxes: true,
      axisMax: 10,
      scale: 1.0,
      t: 0,
      xSlices: vars.slices[0],
      ySlices: vars.slices[1],
      zSlices: vars.slices[2],
    }

    /* could use axishelper but planes are more helpful visually */
    /* order: x, y, z */
    const axisPlanes = [
      [new THREE.PlaneGeometry(10, 10), 0xff0000],
      [new THREE.PlaneGeometry(10, 10), 0x0000ff],
      [new THREE.PlaneGeometry(10, 10), 0x00ff00],
    ]
    /* necessary rotations for x and z */
    axisPlanes[0][0].rotateX(Math.PI / 2)
    axisPlanes[2][0].rotateY(Math.PI / 2)

    /* make group of planes, set all to receive shadow */
    const axes = new THREE.Group()
    for (const plane of axisPlanes) {
      const axis = new THREE.Mesh(plane[0], new THREE.MeshBasicMaterial({
        color: plane[1],
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.4,
      }))
      axes.add(axis)
    }

    /* TODO: add outlines to axes to increase visibility */

    axes.scale.set(vars.scenescale, vars.scenescale, vars.scenescale)
    axes.receiveShadow = true
    axes.castShadow = false
    axes.visible = true

    scene.add(axes)

    // GUI - allows users to toggle axis visibility
    const gui = new GUI({width: 250})
    gui.domElement.id = 'gui'

    const inputvalues = Parser()
    const components = Processor(inputvalues)
    const componentGroup = new THREE.Group()

    /* makes component visibility togglable */
    const componentGui = gui.addFolder('Components')
    if (components.length > 0) {
      for (const group of components) {
        let [name, mesh] = group
        if (name.includes('VFld')) {
          containers.vflds.push(mesh)
        }
        componentGroup.add(mesh.group)
        BaseComponentGui(params, componentGui, mesh, name, vars, callbacks)
      }
    }

    componentGroup.scale.set(vars.scenescale, vars.scenescale, vars.scenescale)
    
    scene.add(componentGroup)

    /* sets up the rest of the gui */
    GuiCallbacks(params, gui, vars, axes, componentGroup, callbacks, renderer, scene, camera)

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
