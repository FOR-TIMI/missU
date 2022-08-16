const APP_ID = 'YOUR API KEY'

let token = null;
let uid = String(Math.floor(Math.random() * 10000));

let client;
let channel;

let localMediaStream;
let remoteMediaStream;

//Stores information to connect to another user
let peerConnection;

const servers = {
    iceServers:[
        {
            urls:['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302']
        }
    ]
}

const init = async function(){

    client = await AgoraRTM.createInstance(APP_ID)
    await client.login({uid, token})

    channel = client.createChannel('main')
    await channel.join()

    channel.on('MemberJoined' ,  handleUserJoined)

    // To access user's camera & video
   localMediaStream =  await navigator.mediaDevices.getUserMedia({ video:true, audio: false})
   // To show the local media stream 
   document.getElementById('user1').srcObject = localMediaStream;

   makeOffer();
}

let handleUserJoined = async function(memberID){
    console.log('New user joined the channel', memberID)
}

const makeOffer = async function(){
   peerConnection =  new RTCPeerConnection(servers)

   remoteMediaStream = new MediaStream()

   document.getElementById('user2').srcObject = remoteMediaStream;


   localMediaStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localMediaStream)
   })

   peerConnection.ontrack = (event) => {
    event.streams[0].getTracks.forEach((track) => {
        remoteMediaStream.addTrack()
    })
   }

   peerConnection.onicecandidate = async (event) => {
    if(event.candidate){
       console.log('New Ice Candidate:', event.candidate)
    }
   }


   let offer = await peerConnection.createOffer()
   await peerConnection.setLocalDescription(offer)

   console.log('offer:', offer)
}


init();