import React, { Component } from 'react'
import io from 'socket.io-client'
import DB from '../DB'
import CreateBlockchain from '../Blockchain/CreateBlockchain'
import Layout from '../Style/Layout'
import NewPeer from '../wrtconf/NewPeer'

const endpoint = "http://localhost:4001" // this is where we are connecting to with sockets
class Mean extends Component {
    state = {
      db:new DB('blockchain'),          
      otherNodes_id:[],
      flag:true,
      cPc:[]    
    }

    componentWillMount(){
      let sockets = []
      for(let i=0 ; i < 4;i++){
        const socket = io.connect(endpoint)
        socket.on('connect', ()=>{
          console.log("triggered socket.id: ",socket.id)
        })
        sockets.push(socket)
      }
      this.setState({sockets})      
    }
  createSocketHandler = () => {
    new Promise((resolve,reject) => {
      resolve(this.showUUID())
      reject('Error getting UUID')
    }).then(r=> {
      for(let socket of this.state.sockets){        
        socket.on('newCandidate', candidatesSocket => socket.emit('xyz',
        candidatesSocket,this.receiveCandidateHandler))
        socket.on('startCallee', data => {
        console.log("receiving call from peer: ", data.candidate_socket_id)
        socket.emit('xyz',
        data,this.becomeCallee)})
        console.log('socket and uuid triggered',{'id':socket.id,'node_uuid':this.state.node_uuid})
        socket.emit('searchingPeer',{'id':socket.id,'node_uuid':this.state.node_uuid})
      }
    })
  }

  
  receiveCandidateHandler = data => {
    new Promise((resolve,reject)=>{
      resolve(this.signalingMessageHandler(data))
      reject("Error in receiveCandidateHandler")
    }).then(i=>this.state.cPc[i].callAction()).catch(e=>
      console.log(`Error in receive signalingMessageHandler: ${e}`))
  }

  becomeCallee = (data) => {
    new Promise((resolve,reject)=>{
      resolve(this.signalingMessageHandler(data))
      reject("Error in becomeCallee")
    }).then(i=>this.state.cPc[i].callee())
    .catch(e=>console.log(`Error in receive signalingMessageHandler: ${e}`))
  }

  signalingMessageHandler = data => {
    console.log("candidate received",data)
    console.log("signalingMessageHandler en App.js")
    const {candidate_socket_id,socket} = data
    if(candidate_socket_id && socket){
      let otherNodes_id = [...this.state.otherNodes_id]
      otherNodes_id.push(candidate_socket_id)
      const i = otherNodes_id.length - 1      
      let pc = new NewPeer(socket , candidate_socket_id)
      let cPc = [...this.state.cPc]
      cPc.push(pc)
      this.setState({otherNodes_id,cPc})
      console.log("indice i", i)
      return i
    }
  }

  showUUID = async () => {
    let node_uuid = this.state.db.createUUID()
    let msg = null
    await this.state.db.getUUID().then(r=>{
      if(r==='not_found'){
        console.log('creando uuid...')
        const fcn_uuid = async()=>{await this.state.db.saveUUID(node_uuid)}
        fcn_uuid(node_uuid)
        console.log('uuid',node_uuid)
        msg='uuid created!... : '
      }else{
        node_uuid = r
        msg='uuid catched!... : '
      }
      this.setState({node_uuid},()=>console.log(msg , node_uuid))
    })
  }
  
  connect_peer = () =>{
    if(this.state.otherNodes_id.length>0){
      //console.log(this.state.cPc[0].render())
      let i = 0
      console.log(`Peers created are ${this.state.cPc.length}` )
      this.state.cPc.forEach(pc =>{
        i++
        console.log(`${i}. State of peer:`,pc )
        //return this.state.cPc[i].render()
      })
    }
  }


  render() {
    return (
      <Layout>
        <button onClick = {this.createSocketHandler} >Connect</button>
        <h2>{this.state.node_uuid}</h2>
        {this.connect_peer()}
        <CreateBlockchain />
      </Layout>
    )
  }
}

export default Mean