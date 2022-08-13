let localMediaStream;
let remoteMediaStream;

const servers = {
    iceServers :[
        {
            urls:['stun:stun1.l.google.com:19302','stun:stun2.l.google.com:19302']
        }
    ]
}

//Stores information to connect to another user
let peerConnection;

const init = async function(){
    // To access user's camera & video
   localMediaStream =  await navigator.mediaDevices.getUserMedia({ video:true, audio: false})
   // To show the local media stream 
   document.getElementById('user1').srcObject = localMediaStream;

   makeOffer();
}

const makeOffer = async function(){
   peerConnection =  new RTCPeerConnection(servers)

   remoteMediaStream = new MediaStream()

   document.getElementById('user2').srcObject = remoteMediaStream;


   localMediaStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localMediaStream)
   })

   peerConnection.ontrack = event => {
    event.streams[0].getTracks.forEach((track) => {
        remoteMediaStream.addTrack()
    })
   }

   peerConnection.onicecandidate = async (event) => {
    if(event.candidate){
        console.log(event.candidate)
    }
   }


   let offer = await peerConnection.createOffer()
   await peerConnection.setLocalDescription(offer)

   console.log('offer:', offer)
}



init();