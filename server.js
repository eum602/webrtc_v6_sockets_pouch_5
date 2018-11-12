const express = require('express')
const http = require('http')
const app = express()
const server = http.createServer(app)
const socketIO = require('socket.io')
//const io = socketIO(server)
const io = socketIO.listen(server)
let ids = []
let nodes_uuid = []
const port = 4001
let general_ids = []


verify = (arr , searched_value) => {
  return arr.findIndex(el=>{
    return el === searched_value
  })
}

io.on('connection', socket => {
  console.log('New socket connected')
  socket.on('searchingPeer',({id , node_uuid })=>{
    let candidates = []
    console.log("id: ", id , "node_uuid: " , node_uuid )
    const verifIndex = verify(nodes_uuid,node_uuid) //searching if new uuid exists
    
    const null_restriction = verify(nodes_uuid,null)//searching where to put him

    let newSocket = {'socket': id , state: 0}

    let idx = null

    ///////////cases
    //1.

    if(null_restriction>=0 && verifIndex==-1){ //case when there is an available position where 
      //to add a New node
      console.log(`The new node will be added in the index position ${null_restriction}
       abandoned by another peer`)
      nodes_uuid[null_restriction] = node_uuid
      let obj = {'node_uuid':node_uuid , newSocket }
      general_ids[null_restriction] = obj
      idx = null_restriction
    }
    //2.
    if( verifIndex>=0){ //case when the node_uuid is registered and I want to add a new socket
      // of that node
      let uuid_socket = general_ids[verifIndex]      
      //verifiying the node_uuid is in the array that contains node:uuid and sockets
      if(uuid_socket['node_uuid'] === node_uuid  ){ //extra verification to make sure node_uuid 
        //is registered
        let sockets = uuid_socket['sockets']//return an array        
        sockets.push(newSocket) //adding the new socket to the corresponding uuid
        uuid_socket['sockets'] = sockets
        console.log('updated object: ', uuid_socket)
        idx = verifIndex
      }else{
        console.log('Error, node_uuid partially not registered... check the code')
      }
    }else if( null_restriction ==-1 && verifIndex==-1 ){//3. if there are no null positions and
      //the node is new
      nodes_uuid.push(node_uuid)
      let obj = {'node_uuid':node_uuid , newSocket }
      general_ids.push(obj)
      console.log('New node uuid added: ', nodes_uuid )
       idx = nodes_uuid.length - 1
    }
    console.log('index where the incoming node is positiones is ' , idx )
      /////
      //LOGIC GOES HERE

      ///////////////////////////////////////////////      
      //ids = [...r_ids,newId]//Object.assign({},r_ids,newId)//{...r_ids,newId}      
      if(candidates.length>0){//if(Object.keys(candidates).length>0){
        console.log("candidate to send in searching peer: ", candidates[0])
        //socket.emit('newCandidate',candidates)
        socket.emit('newCandidate',{candidate_socket_id: candidates[0] , socket:socket.id})     
    }else{
      console.log("Error, node_uuid is in use!... ", node_uuid )}
  })

  socket.on('initSendCandidates',data =>{
    const {peer_id} = data
    console.log(`Telling socket ${peer_id} callee be prepared...`)
    socket.broadcast.to(peer_id).emit('startCallee',{candidate_socket_id: socket.id , socket:peer_id})
  })

  socket.on('signal',({type,message,peer_id}) =>{
    //const peer_id_socket_index = verify(ids,socket.id)
    //const peer_id_socket = ids[peer_id_socket_index]
    console.log('message receive in signal: ', {type,message,peer_id} )    
    socket.broadcast.to(peer_id).emit('signaling_message',{
      type:type,
      message:message
      //candidate_socket_id: socket.id
    })
  })

  socket.on('xyz',(data,callback)=>{
    callback(data)
  })

  // disconnect is fired when a client leaves the server
  socket.on('disconnect', () => {
    console.log('user disconnected: ', socket.id)
    if(!(nodes_uuid.length === ids.length)){
      console.log("Error arrays don't match!!")
    }
    
    const idx_to_clean = verify(ids,socket.id)
    if(idx_to_clean===ids.length-1){
      ids.splice(idx_to_clean,1)
      nodes_uuid.splice(idx_to_clean,1)
    }else{
      ids[idx_to_clean]=null
      nodes_uuid[idx_to_clean]=null
    }

    if(ids.length>0){
      console.log("c1: ",ids[ids.length-1]==null && ids.length ==nodes_uuid.length )
      while(ids[ids.length-1]==null && ids.length ==nodes_uuid.length ){
        ids.splice(ids.length-1,1)
        nodes_uuid.splice(nodes_uuid.length-1,1)
        if(ids.length==0) break;
      }
    }
    if(ids.length>0){
      console.log("c2: ",ids[0]==null && ids.length ==nodes_uuid.length)
      while(ids[0]==null && ids.length ==nodes_uuid.length ){
        ids.splice(0,1)
        nodes_uuid.splice(0,1)
        //ids.shift()
        //nodes_uuid.shift()
        if(ids.length==0) break;
      }
    }
    
    console.log("final ids", ids)
    console.log("final nodes_uuids",nodes_uuid)
      
  })
})

server.listen(port, () => console.log(`Listening on port ${port}`))