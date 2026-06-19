import { GUI } from "dat.gui";
import { VectorFieldCallback } from "../callbacks/VectorFieldCallback";

export const BaseComponentGui = (params, gui, mesh, name, vars, callbacks) => {
    const newparam = `show${name.replace(' ', '')}`
    params[newparam] = true  //  new visibility param
    let currgui = gui
    if (name.includes('VFld')) {
        currgui = gui.addFolder(name.replace(' ', ''))
        currgui.add(params, 'xSlices', 1, 20, 1).name('X Slices').onFinishChange((value) => {
            vars.slices[0] = value
            callbacks.vflds()
        })
        currgui.add(params, 'ySlices', 1, 20, 1).name('Y Slices').onFinishChange((value) => {
            vars.slices[1] = value
            callbacks.vflds()
        })
        currgui.add(params, 'zSlices', 1, 20, 1).name('Z Slices').onFinishChange((value) => {
            vars.slices[2] = value
            callbacks.vflds()
        })
    }
    currgui.add(params, newparam).name(`show ${name.toLowerCase()}`).onFinishChange((value) => {
        mesh.visible = value
        console.log(mesh.visible)
    })
        
}

