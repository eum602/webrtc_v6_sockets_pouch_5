import React, {Component} from 'react';
//import SHA256 from "crypto-js/sha256";
import {Link} from 'react-router-dom'
import {Menu,Button} from "semantic-ui-react";
import Layout from '../Style/Layout';
import Blockchain from '../Blockchain/Blockchain'
import PendingTransactions from '../Blockchain/PendingTransactions';

class MineBlock extends Component {
  state = {
    blockchain: new Blockchain(),
    pending_transactions : null

  }

 getPendingTransactions = ()=>{
   new Promise((resolve,reject)=>{
     resolve(this.state.blockchain.getPendingTransactions())
     reject('Error getting pending transactions')
   }).then(res=>{
    console.log('pendingTransactions: ' , res )
    //return res
    const pending_transactions = [...res]
    this.setState({pending_transactions})
   })
   
   

     /*
   axios.get('/getPendingTransactions')
   .then((response)=>{
     console.log('response', response.data);
     this.setState({pending_transactions:response.data});
   })
   */
 }

 mine = () => {

     /*
   this.setState({mining:true});
   axios.get('/mineBlock')
   .then((response)=>{
     console.log('nuevo bloque creado es:',response.data.newBlock);
     this.setState({lastBlock:response.data.newBlock,mining:response.data.mining});
   })
   .catch(err => {
     console.log('error al intentar realizar el minado: ',err);
   })*/
 }

 headers = () => {
    return(
      <Menu>
        <Menu.Menu style={{ marginBottom: "1px", marginLeft:"0px" }} >      
            <Link to = "/operations/createTransaction">              
                <Button
                  content="Create Transaction"
                  icon="add circle"
                  labelPosition="right"
                  floated="right"
                  primary           
                  disabled = {false}
                />
            </Link>
        </Menu.Menu>
        
        <Menu.Menu style={{ marginBottom: "2px" , marginLeft:"100px"}}>
          <Button
              content="Get Pending Transactions"
              icon="add circle"
              labelPosition="left"
              floated="left"
              onClick={this.getPendingTransactions}
              primary     
              disabled = {false/*this.state.created*/}
            />
            </Menu.Menu >

            <Menu.Menu position = "right" style={{ marginBottom: "1px" }}>
            <Button
              content="Mine"
              icon="add circle"
              labelPosition="right"
              floated="left"
              onClick={this.mine}
              primary
              disabled = {false/*this.state.created*/}
              loading = {this.state.mining}
            />
            </Menu.Menu>     
              
      </Menu>)
 }

 renderPendingTxHandler = () => {
   if(!(this.state.pending_transactions===null)){
     return(<PendingTransactions pending_transactions = {this.state.pending_transactions}/>)
   }
 }
  
render(){/*
  let renderLatestBlock = () => {
    //console.log('last block en renderLatestBLock')       
    return(<ShowLatestBlock block={this.state.lastBlock}/>);
  }*/
    return(
      <Layout>
        {this.headers()}
        {this.renderPendingTxHandler()} 
      </Layout>
    )
  }
}
export default MineBlock;
