let localMediaStream;
let remoteMediaStream;

let init = async () => {
    // To access user's camera & video
   localMediaStream =  await navigator.mediaDevices.getUserMedia({ video:true, audio: false})

document.getElementById('user1').srcObject = localMediaStream
}

init();