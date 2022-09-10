const APP_ID = '97102b323d454c6a9859062183ca49fe'

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

    //INDEX.HTML?ROOM=235245
    channel.on('MemberJoined' ,  handleUserJoined)

    client.on('MessageFromPeer', handleMessageFromPeer)

    // To access user's camera & video
   localMediaStream =  await navigator.mediaDevices.getUserMedia({ video:true, audio: false})
   // To show the local media stream 
   document.getElementById('user1').srcObject = localMediaStream;

   
}


let handleMessageFromPeer = async function(message, memberID){
    message = JSON.parse(message.text)
    if(message.type === 'offer'){
        makeAnswer(memberID,message.offer)
    }
    if(message.type === 'answer'){
        addAnswer(message.answer)
    }
    if(message.type === 'candidate'){
        if(peerConnection){
            peerConnection.addIceCandidate(message.candidate);
        }
    }
}

let handleUserJoined = async function(memberID){
    console.log('New user joined the channel', memberID)
    makeOffer(memberID);
}

let createPeerConnection = async function(memberID){
    peerConnection =  new RTCPeerConnection(servers)
    remoteMediaStream = new MediaStream()

   document.getElementById('user2').srcObject = remoteMediaStream;
    
   if(!localMediaStream){
    localMediaStream =  await navigator.mediaDevices.getUserMedia({ video:true, audio: false})
    document.getElementById('user1').srcObject = localMediaStream;
   }

   localMediaStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localMediaStream)
   })

   peerConnection.ontrack = (event) => {
    event.streams[0].getTracks().forEach((track) => {
        remoteMediaStream.addTrack(track)
    })
   }

   peerConnection.onicecandidate = async (event) => {
    if(event.candidate){
        client.sendMessageToPeer({text:JSON.stringify({'type': 'candidate','candidate': event.candidate})}, memberID)
    }
   }

} 

const makeOffer = async function(memberID){

   await createPeerConnection(memberID);
   let offer = await peerConnection.createOffer()
   await peerConnection.setLocalDescription(offer)

   client.sendMessageToPeer({text:JSON.stringify({'type':'offer','offer':offer})}, memberID)


}

const makeAnswer = async function(memberID, offer){
  await createPeerConnection(memberID);

  await peerConnection.setRemoteDescription(offer);

  let answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);

  client.sendMessageToPeer({text:JSON.stringify({'type':'answer','answer':answer})}, memberID)

}

const addAnswer = async(answer) => {
    if(!peerConnection.currentRemoteDescription){
        peerConnection.setRemoteDescription(answer);
    }
}




init();