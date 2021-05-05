const worker = {
    customizeBackground: ({frame, frame2, modeMin, modeMax, leastMin, leastMax, colorKeys, monochrome, toggleGreenScreen}) => {
        return (new Promise((resolve, reject) => {
            try {
                // let steps = modeMax;
                // for (let j = 0; j < frame2.data.length; j++) {
                //     let alpha = frame2.data[j];
                //     if (alpha > 0) {
                //         let currentAlpha = Math.ceil(alpha/steps);
                //         frame2.data[j] += currentAlpha;
                //     }
                // }

                for(let i = 0; i < frame.data.length / 4; i++) {
                    let pixel = {
                        r: frame.data[i * 4 + 0],
                        g: frame.data[i * 4 + 1],
                        b: frame.data[i * 4 + 2]
                    }
                    
                    try {
                        if (
                            toggleGreenScreen === true &&
                            pixel[colorKeys[0]] >= modeMin &&
                            pixel[colorKeys[0]] <= modeMax &&
                            pixel[colorKeys[1]] >= leastMin &&
                            pixel[colorKeys[1]] <= leastMax
                        ) {
                            frame.data[i * 4 + 0] = frame2.data[i * 4 + 0];
                            frame.data[i * 4 + 1] = frame2.data[i * 4 + 1];
                            frame.data[i * 4 + 2] = frame2.data[i * 4 + 2];
                            frame.data[i * 4 + 3] = frame2.data[i * 4 + 3];
                        } else if (monochrome === true) {
                            let average = (frame.data[i * 4 + 0] + frame.data[i * 4 + 1] + frame.data[i * 4 + 2]) / 3;
                            frame.data[i * 4 + 0] = average;
                            frame.data[i * 4 + 1] = average;
                            frame.data[i * 4 + 2] = average;
                        }
                    } catch (error) {
                        continue;
                    }
                }
                // console.log(frame)
                resolve(frame);
            } catch (error) {
                reject(error);
            }
        }));
    },
    message: (e) => {
        let frame = e.data.frame;
        let frame2 = e.data.frame2;
        let modeMin = e.data.modeMin;
        let modeMax = e.data.modeMax;
        let leastMin = e.data.leastMin;
        let leastMax = e.data.leastMax;
        let colorKeys = e.data.colorKeys;
        let monochrome = e.data.monochrome
        let toggleGreenScreen = e.data.toggleGreenScreen;
        worker.customizeBackground({frame, frame2, modeMin, modeMax, leastMin, leastMax, colorKeys, monochrome, toggleGreenScreen})
        .then(customFrame => {
            postMessage({frame: customFrame});
        })
        .catch(error => {
            console.error(error);
        });
    }
}

addEventListener('message', worker.message);