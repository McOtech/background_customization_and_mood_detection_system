importScripts(
    // '/assets/js/imported.worker.js',
    '/assets/js/test.js'
);

const worker = {
    minColor: (val, a, b) => {
        if (a.value < b.value) {
            val.least = {
                value: a.value,
                color: a.color
            }
            return val;
        } else {
            val.least = {
                value: b.value,
                color: b.color
            }
            return val;
        }
    },
    maxColor: (r, g, b) => {
        const val = {};
        // find Modest
        if (r > g && r > b) {
            val.mode = {
                value: r,
                color: 'r'
            }
            return worker.minColor(val, {value: g, color: 'g'}, {value: g, color: 'g'})
        } else if (g > r && g > b) {
            val.mode = {
                value: g,
                color: 'g'
            }
            return worker.minColor(val, {value: r, color: 'r'}, {value: b, color: 'b'})
        } else {
            val.mode = {
                value: b,
                color: 'b'
            }
            return worker.minColor(val, {value: r, color: 'r'}, {value: g, color: 'g'})
        }
    },
    pixelRange: (frame) => {
        return (new Promise((resolve, reject) => {
            const colorRange = {
                mode: undefined,
                least: undefined
            }

            for(let i = 0; i < frame.data.length / 4; i++) {
                try {
                    let r = frame.data[i * 4 + 0];
                    let g = frame.data[i * 4 + 1];
                    let b = frame.data[i * 4 + 2];
                    let pxRange = worker.maxColor(r, g, b);
        
                    const modeValue = pxRange.mode.value;
                    const leastValue = pxRange.least.value;
        
                    if (colorRange.mode === undefined || colorRange.mode[pxRange.mode.color] === undefined) {
                        colorRange.mode = {};
                        colorRange.mode[pxRange.mode.color] = {
                            count: 1,
                            min: modeValue,
                            max: modeValue
                        }
                    } else {
                        colorRange.mode[pxRange.mode.color].count = colorRange.mode[pxRange.mode.color].count + 1;
                        colorRange.mode[pxRange.mode.color].min = Math.min(modeValue, colorRange.mode[pxRange.mode.color].min);
                        colorRange.mode[pxRange.mode.color].max = Math.max(modeValue, colorRange.mode[pxRange.mode.color].max);
                    }
        
                    if (colorRange.least === undefined || colorRange.least[pxRange.least.color] === undefined) {
                        colorRange.least = {};
                        colorRange.least[pxRange.least.color] = {
                            count: 1,
                            min: leastValue,
                            max: leastValue
                        }
                    } else {
                        colorRange.least[pxRange.least.color].count = colorRange.least[pxRange.least.color].count + 1;
                        colorRange.least[pxRange.least.color].min = Math.min(leastValue, colorRange.least[pxRange.least.color].min);
                        colorRange.least[pxRange.least.color].max = Math.max(leastValue, colorRange.least[pxRange.least.color].max);
                    }
                } catch (error) {
                    reject(colorRange)
                }
            }
            resolve({...colorRange.mode, ...colorRange.least});
        }));
    },
    message: (e) => {
        let frame = e.data.message;
        try {
            worker.pixelRange(frame)
            .then(colors => {
                postMessage({message: colors});
            })
            .catch(rawColors => {
                postMessage({message: rawColors});
            });
            
        } catch (error) {
            console.error(error);
        }
    }
}

addEventListener('message', worker.message);