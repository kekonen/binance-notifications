async function asyncForEach(array, callback) {
    try {
        for (let index = 0; index < array.length; index++) {
            await callback(array[index], index, array)
        }
    } catch(e) {
        // console.log(`Async For Each function detected an error`)
        throw e
    }
    
}

async function asyncMap(array, callback) {
    var newArray = [];
    try {
        for (let index = 0; index < array.length; index++) {
            let newVal = await callback(array[index], index, array)
            if (newVal) newArray.push(newVal)
        }
        return newArray
    } catch(e) {
        console.log(`Async map function detected an error`)
        throw e
    }
    
}

module.exports = {asyncForEach, asyncMap}