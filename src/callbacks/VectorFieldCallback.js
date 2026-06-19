export const VectorFieldCallback = (newslices, vflds) => {
    vflds.forEach((vfld) => {
        console.log(vfld)
        /* clear old slices from display */
        vfld.group.children = []
        let i = 0 
        let j = 0
        let k = 0
        for (let x = -newslices[0]; x < newslices[0]; x++) {
            for (let y = -newslices[1]; y < newslices[1]; y++) {
                for (let z = -newslices[2]; z < newslices[2]; z++) {
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
    })
}