export default class NewPeer{    

    constructor(socket , peer_id) {
        this.fileBuffer = []
        this.fileSize = [] 
        this.receivedFileSize = 0
        this.closed = false
        this.socket = socket
        this.peer_id = peer_id
        this.told = false
        this.rtcPeerConn = []
        this.sendDataChannel = []
        this.catchDataChannel = []
        this.icesReq = []
        this.ices = []
        this.caller = false
        this.calleeVariable = false
    }

    did() {
        const socket = this.socket
        socket.on('signaling_message',(data) => socket.emit('xyz',
        data,this.signalingMessageHandler))

        window.onbeforeunload = () => {
            socket.emit('signal',{"type":"endCall","message":"finishing call","peer_id":this.peer_id})
        }
    }

    callee = () => {
        this.calleeVariable = true
        //this.will()
        this.did()
    }

    callAction = () => {
        this.caller = true
        console.log('socket:',this.socket)
        const socket = this.socket
        //this.will()
        this.did()
        //peer_id = this.props.peer_id
        if(!this.told){
            this.told =true
            socket.emit('initSendCandidates',{message:"start","peer_id":this.peer_id})
        }
        
        //sendFile.disabled = true
        console.log('Starting operation call.')
        //let i = null
        //console.log(0, this.state)
        new Promise((resolve,reject) => {
                //this.setState({i,rtcPeerConn,sendDataChannel,catchDataChannel})
                resolve(this.createPC())
                reject('error...')
            }).then(i =>{
                //console.log('state data after create: ' , this.state)
                console.log('data after createPC function: ',i)                
                console.log("i after createPc fcn",i)
                if(i>=0){
                    return new Promise((resolve,reject)=>{
                        resolve(this.setPC(i))
                        reject('Error on setPC...')
                    }).then(result => {
                        //displaySignalMessage('peerConnection createOffer start.')
                        //let [rtcPeerConn,sendDataChannel] = result
                        console.log('peerConnection createOffer start.')
                        this.rtcPeerConn[i].createOffer()
                        .then(e => this.createdOffer(e,i)).catch(this.setSessionDescriptionError)
                    })
                }else{
                    return new Promise((resolve,reject)=>{                        
                        reject('Error on nowhere...')
                    })

                }
            }).then(result =>{                
                console.log(result)

            }).catch(e=>console.log(e))       
        
    }

    createPC = () => {      
        console.log("rtcPeerConn1: ",this.rtcPeerConn)
        const i = this.rtcPeerConn.length
        console.log('is',i)
        const initiator = null
        this.rtcPeerConn.push(initiator)
        this.sendDataChannel.push(initiator)
        this.catchDataChannel.push(initiator)

        return i
    }

    setPC = (i) => {        
        const servers = {
            'iceServers':[//{
                //'url':'stun:stun.l.google.com:19302'
            //},{'url': 'stun:stun.services.mozilla.com'}
            {'url':'turn:kaydee@159.65.151.221','credential':'userdeepak','username':'kaydee'}
        ]
        }
        const dataChannelOptions = {
            ordered: true//false, //not guaranteed delivery, unreliable but faster
            //maxRetransmitTime:  1000 //miliseconds
        }
        //callButton.disabled = true;
        //hangupButton.disabled = false;
        console.log(`Received data in setPC:rtcPeerConn[${i}]-> ${this.rtcPeerConn[i]}`)
        this.rtcPeerConn[i] = new window.webkitRTCPeerConnection(servers)
        console.log('Created local peer connection object rtcPeerConn index: ' + i )
        const name = 'textMessages' + i
        this.sendDataChannel[i] = this.rtcPeerConn[i].createDataChannel(name,dataChannelOptions)    
        this.rtcPeerConn[i].ondatachannel = e=>this.receiveDataChannel(e,i)
        this.rtcPeerConn[i].addEventListener('icecandidate', this.handleConnection)
        this.rtcPeerConn[i].addEventListener(
        'iceconnectionstatechange', this.handleConnectionChange)

        //return [rtcPeerConn,sendDataChannel]
    }
    
    
    receiveDataChannel = (event,i)=>{
        console.log("Receiving a data channel")
        this.catchDataChannel[i] = event.channel;//seteando el canal de datos a ser el que el   
        this.catchDataChannel[i].onmessage = e=>this.receiveDataChannelMessage(e,i);
        this.catchDataChannel[i].onopen = e=>this.dataChannelStateChanged(e,i);
        this.catchDataChannel[i].onclose = e => this.dataChannelStateChanged(e,i);
        //return catchDataChannel;
        //this.setState({catchDataChannel})
    }
    
    receiveDataChannelMessage = (event, i) => {
        let fileBuffer = this.fileBuffer//[...this.state.fileBuffer]
        fileBuffer.push(event.data) //pushing each chunk of the incoming file
        //into fileBuffer
        let fileSize = this.fileSize
        let receivedFileSize = this.receivedFileSize
        fileSize += event.data.byteLength //updating the size of the file    
        //fileProgress.value = fileSize  //------------------------>>>
        if(fileSize === receivedFileSize){
            //var received = new window.Blob(fileBuffer)
            fileBuffer = []
            //displaySignalMessage("clearing fileBuffer..." + "length buffer = "+fileBuffer.length)
            console.log("clearing fileBuffer...length buffer = " + fileBuffer.length)
            //displaySignalMessage("all done... data received")
            console.log("all done... data received")
            //downloadLink.href = URL.createObjectURL(received)//finally when all is received
            //the peer will get the link to download de file
            //downloadLink.download = receivedFileName
            //removeAllChildItems(downloadLink)
            //downloadLink.appendChild(document.createTextNode(receivedFileName + "(" + 
            //fileSize + ") bytes" ))
            //displaySignalMessage("Received... " + fileSize + "/" + receivedFileSize )
            console.log("Received... " + fileSize + "/" + receivedFileSize)
            fileSize = 0
            receivedFileSize = 0
            //this.setState({fileSize,receivedFileSize,fileBuffer})
            this.fileSize = fileSize
            this.receivedFileSize = receivedFileSize
            this.fileBuffer = fileBuffer
        }else{
            //this.setState({fileSize,receivedFileSize,fileBuffer})
            this.fileSize = fileSize
            this.receivedFileSize = receivedFileSize
            this.fileBuffer = fileBuffer
        }
    }

    dataChannelStateChanged = (e,i) =>{
        if(this.catchDataChannel[i]!==null){
            if(this.catchDataChannel[i].readyState === 'open'){//si el readyState es abierto
                //displaySignalMessage("Data Channel Opened")
                console.log("Data Channel Opened")
                if(this.calleeVariable===true){
                    console.log('rtcPeerConn[i].iceCandidate: ' , this.rtcPeerConn[i])
                    console.log(`I am a callee and I am ready`)
                }
            }else{
                //displaySignalMessage("data channel is : " + catchDataChannel[i].readyState)
                console.log("data channel is : " + this.catchDataChannel[i].readyState)
            }
        }
    }

    handleConnection = event => {
        const socket=this.socket
        const peer_id=this.peer_id
        const iceCandidate = event.candidate;
        if(iceCandidate){
            //console.log('state data after create.....: ' , this.state)
            //let icesReq = [...this.state.icesReq]
            this.icesReq.push(iceCandidate)
            //this.setState({icesReq})
        }
        //else if (!iceCandidate && this.state.icesReq.length>0) {
        else if (!iceCandidate && this.icesReq.length>0) {           
            console.log("icesReq: ",this.icesReq)
            //const {socket} = this.props
            //let len = this.state.icesReq.length
            let len = this.icesReq.length
            let iter = 0
            //displaySignalMessage("ICE protocol gathered " + len + " candidates.." )
            console.log("ICE protocol gathered " + len + " candidates..")
            let newIceCandidate
            //let icesReq = [...this.state.icesReq]
            this.icesReq.forEach(iceCandidate=>{
                iter++
                newIceCandidate = iceCandidate
                console.log("candidate created ready to be sent: ", newIceCandidate)
                socket.emit('signal',{
                    "type":"ice candidate",
                    "message":JSON.stringify({'candidate':newIceCandidate}),
                    //"room":SIGNAL_ROOM
                    "peer_id":peer_id
                })
                //displaySignalMessage( iter +". Sending Ice candidate ...");
                console.log(`${iter} . Sending Ice candidate al peer ${peer_id}`)
            })
            socket.emit('signal',{
                "type":"noIce",
                "message":"",
                //"room":SIGNAL_ROOM})
                "peer_id":peer_id
            })
                console.log(`ending noIce signal to peer ${peer_id}`)
            //icesReq = []
        }//else if(!iceCandidate && this.state.icesReq.length==0){
            else if(!iceCandidate && this.icesReq.length===0){
            //displaySignalMessage("Candidate received is null, no candidates received yet, check your code!..")
            console.log("Candidate received is null, no candidates received yet, check your code!..")
        }
    }

    setSessionDescriptionError = (error) => {
        //displaySignalMessage(`Failed to create session description: ${error.toString()}.`);
        console.log(`Failed to create session description: ${error.toString()}.`);
    }

    handleConnectionChange = (event) => {
        const peerConnection = event.target;
        console.log('ICE state change event: ', event);
        if(peerConnection.iceConnectionState === "connected"); //sendFile.disabled = false;
        //displaySignalMessage(`ICE state: ` +
        //        `${peerConnection.iceConnectionState}.`);
        console.log(`ICE state: ` +
                `${peerConnection.iceConnectionState}.`)        
    }
    
    createdOffer = (description , i) => {
        console.log('offer from this local peer connection: ',description.sdp)
        //displaySignalMessage('localPeerConnection setLocalDescription start.');
        console.log('localPeerConnection setLocalDescription start.');
        this.rtcPeerConn[i].setLocalDescription(description)
        .then(() => {
        this.setLocalDescriptionSuccess(i);
        console.log('Local description created: ',this.rtcPeerConn[i].localDescription)
        //displaySignalMessage("Local description created..")
        console.log("Local description created..")
        this.sendLocalDesc(this.rtcPeerConn[i].localDescription)
        }).catch(this.setSessionDescriptionError);
    }

    setLocalDescriptionSuccess = (i) => {
        this.setDescriptionSuccess(`setLocalDescription number ${i}`);
    }

    setDescriptionSuccess = (functionName) => {
        //displaySignalMessage(`${functionName} complete.`);
        console.log(`${functionName} complete.`)
    }

    sendLocalDesc = (desc) => {
        const socket = this.socket
        const peer_id = this.peer_id
        //const {socket} = this.props
        console.log("sending local description",desc)
        try{
            //displaySignalMessage("16. Sending Local description");
            console.log("16. Sending Local description")
            var sdp = {
                type:"SDP",
                message:JSON.stringify({'sdp':desc}),              
                //room:SIGNAL_ROOM
                peer_id:peer_id
            }
            console.log("sdp sent to other nodes in sendLocalDescription: ",sdp)
            socket.emit('signal',sdp);
        }catch(e){
            this.logError1(e,"sending local description");
        }
    }

    setSessionDescriptionError = error => {
        //displaySignalMessage(`Failed to create session description: ${error.toString()}.`);
        console.log(`Failed to create session description: ${error.toString()}.`);
    }

    logError1 = (error,where) => {
        //displaySignalMessage("problems in " + where +" "+ error.name + ': ' + error.message );
        console.log("problems in " + where +" "+ error.name + ': ' + error.message )
    }

    determineI = () => {
        let i = 0    
        return i
    }

    signalingMessageHandler = async (data)=>{
        console.log('data recibida en signalingMessageHandler ',data)
        let i = this.determineI()
        //console.log("data",data)
        //displaySignalMessage("data type: " + data.type)
        if (!this.rtcPeerConn[i]) this.setPC(i);
        try {
            if (data.type==="SDP") {
                var a = JSON.parse(data.message)
                var desc = a.sdp
                console.log("desc: ",desc)
                var c = desc.type          
                //displaySignalMessage('working on sdp type ' + c)
                console.log('working on sdp type ' + c)
                // if we get an offer, we need to reply with an answer
                if (c === 'offer') {
                    //displaySignalMessage("Entering to define an answer because of offer input..")
                    console.log("Entering to define an answer because of offer input..")
                    await this.rtcPeerConn[i].setRemoteDescription(desc).then(r=>{
                        //displaySignalMessage("Remote description stored")
                        console.log("Remote description stored")
                    }).catch(e=>{
                        //displaySignalMessage('error setting remote description ' + e.name)
                        console.log("Error setting remote description: ", e)
                    });
                    await this.rtcPeerConn[i].setLocalDescription(await this.rtcPeerConn[i].createAnswer()).then(r=>{
                        //displaySignalMessage("Created Local description")
                        console.log("Created Local description")
                    }).catch(e=>{
                        //displaySignalMessage("Error setting local description when receiving an offer: " + 
                        //e.name)
                        console.log("Error setting local description when receiving an offer: " + e.name)
                    });
                    console.log('local description-answer: ',this.rtcPeerConn[i].localDescription)
                    this.sendLocalDesc(this.rtcPeerConn[i].localDescription)
                } else if (c === 'answer') {
                    //displaySignalMessage("Entering to store the answer remote description..")
                    console.log("Entering to store the answer remote description..")
                    await this.rtcPeerConn[i].setRemoteDescription(desc).then(r=>{
                        //displaySignalMessage("Remote answer stored")
                        console.log("Remote answer stored :",this.rtcPeerConn[i].remoteDescription)                            
                    }).catch(e=>{
                    //displaySignalMessage('error setting remote descrition: '+ e.name)
                    console.log('error setting remote descrition: ', e)
                    });                     
                } else {
                    console.log('Unsupported SDP type.');
                }
            } else if (data.type === "ice candidate") {
                //displaySignalMessage("Adding foreign Ice candidate..")
                console.log("Adding foreign Ice candidate..")
                var m = JSON.parse(data.message)
                const ice = m.candidate
                console.log('ice candidate: ',ice)                
                this.ices.push(ice)
            } else if(this.ices.length>0 && data.type ==="noIce"){                    
                this.ices.forEach(ice=>{
                        this.rtcPeerConn[i].addIceCandidate(ice).then(r=>{
                            //displaySignalMessage('added a foreign candidate')
                            console.log('added a foreign candidate')
                        }).catch(e => {
                        //displaySignalMessage("3. Failure during addIceCandidate(): " + e.name)
                        console.log('error adding iceCandidate: ', e)
                        })
                    })
                }
            else if(data.type ==="endCall"){
                this.rtcPeerConn[i].close()
                if(this.sendDataChannel[i]){
                    this.sendDataChannel[i].close()
                    this.sendDataChannel[i] = null
                }
                if(this.catchDataChannel[i]){
                    this.catchDataChannel[i].close()
                    this.catchDataChannel[i] = null
                }
                this.rtcPeerConn[i] = null;
                //sendFile.disabled = true
                this.icesReq = []
                //hangupButton.disabled = true;
                //callButton.disabled = false;                
                this.closed = true
            }
        } catch (err) {
            //displaySignalMessage("error on signaling message: " + err.name);
            console.log("error on signaling message: " , err)
        }
    }    
}