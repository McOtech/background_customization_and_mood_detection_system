// importScripts('/face-api.min.js');

let input;

const worker = {
    message: (e) => {
        input = e.data.media;
        console.log(input);
    }
}
// function moodDetection(media) {
//     input = media;
//     console.log(input);
//     Promise.all([
//         faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
//         faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
//         // faceapi.nets.faceRecognitionNet.loadFromUri('/models')
//         faceapi.nets.faceExpressionNet.loadFromUri('/models')
//     ])
//     .then(start)
//     .catch(error => {
//         console.log(error);
//     })
// }
// function start() {
//     faceapi.detectAllFaces(input).then(detections => {
//         console.log(detections);
//     })
//     .catch(error => {
//         console.log('Face Detection Error:', error);
//     })
// }

addEventListener('message', worker.message);