import React, {Component} from 'react'
import {Menu,Button,Header,Grid,Input} from "semantic-ui-react"
import Layout from '../Style/Layout'
import { Link } from 'react-router-dom'
import Blockchain from '../Blockchain/Blockchain'
import PendingTransactions from '../Blockchain/PendingTransactions';
class CreateTransaction extends Component {
    state={
        data : new Array(5),
        blockchain: new Blockchain(),
        storedTx:null
    }

    setData = (order,e) => {        
        let data = this.state.data
        const value = e.target.value
        data[order]=value
        this.setState({data})
      }

    createTx = () => {   
        const newTx = [...this.state.data]
        const Tx = {
            "amount":newTx[0],
            "sender":newTx[1],
            "recipient":newTx[2],
            "value4":newTx[3],
            "value5":newTx[4]
        }
        new Promise((resolve, reject)=>{
            resolve(this.state.blockchain.createNewTransaction(Tx))
            reject('Error when triying to create a new Transaction')
        })
        .then( response =>{
            console.log('Respuesta desde el servidor: ',response)
            this.setState({storedTx:{...response}})            
        })
        .catch( error => {
            console.log('error trying to post a Transaction: ',error);
        })
        
    }

    header = () => {
        if(this.state.storedTx===null){
            return(
                <Menu>
                    <Button
                    content="Create Transaction"
                    icon="add circle"
                    labelPosition="left"
                    floated="left"
                    primary
                    onClick={this.createTx}
                    disabled = {false}
                        />

                    
                    <Menu.Menu position = "right" style={{ marginBottom: "1px" }} >      
                        <Link to="/operations/mineBlock">                        
                            <Button
                            content="Operations"
                            icon="add circle"
                            labelPosition="right"
                            floated="right"
                            primary            
                            disabled = {false}
                            />                        
                        </Link>
                    </Menu.Menu>
                </Menu>
            )
        }
    }

    headerOutput = () => {
        if(this.state.storedTx !== null) {
            return(
                <Menu>
                    <Button
                    content="Create another Transaction"
                    icon="add circle"
                    labelPosition="left"
                    floated="left"
                    primary
                    onClick={this.resetToCreateHandler}
                    disabled = {false}
                        />

                    
                    <Menu.Menu position = "right" style={{ marginBottom: "1px" }} >      
                        <Link to="/operations/mineBlock">                        
                            <Button
                            content="Operations"
                            icon="add circle"
                            labelPosition="right"
                            floated="right"
                            primary            
                            disabled = {false}
                            />                        
                        </Link>
                    </Menu.Menu>
                </Menu>
            )
        }
    }
    
    inputTx =  () => {
        if(this.state.storedTx === null){
            return(
                <Menu>      
                    <Grid columns={3} style={{marginRight:"-80px",marginLeft:"2px",marginTop:"1px", marginBottom:"1px" }} >
                        <Grid.Row> <Grid columns={1}><Header as='h5' style={{marginBottom:"-20px",marginLeft:"20px",marginTop:"1px"}} >
                        DataSet 1:</Header></Grid> </Grid.Row>
                        
                        <Grid.Row style={{marginTop:"2px"}}>   
                        <Grid.Column>   
                            <Input label ="Tx-data1" labelPosition='left' placeholder="enter data"
                            onChange={e=>this.setData(0,e)} ></Input>
                        </Grid.Column>
                        <Grid.Column>            
                            <Input label ="Tx-data2" labelPosition='left' placeholder="enter data"
                            onChange={e=>this.setData(1,e)} ></Input>
                        </Grid.Column>
                        <Grid.Column>            
                            <Input label ="Tx-data3" labelPosition='left' placeholder="enter data"
                            onChange={e=>this.setData(2,e)} ></Input>
                        </Grid.Column>
                        </Grid.Row>
                        <Grid.Row>          
                        <Grid.Column>            
                            <Input label ="Tx-data4" labelPosition='left' placeholder="enter data"
                            onChange={e=>this.setData(3,e)} ></Input>
                        </Grid.Column>
                        <Grid.Column>           
                            <Input label ="Tx-data5" labelPosition='left' placeholder="enter data"
                            onChange={e=>this.setData(4,e)} ></Input>
                        </Grid.Column>
                        </Grid.Row>         
                    </Grid>
                </Menu>
            )
        }
    }

    outputTx = () => {
        
        if(this.state.storedTx!==null){
            console.log('storedTx en outputTx: ',this.state.storedTx)
            return(
                <div>
                    <h2>New Transaction created:</h2>
                    <PendingTransactions pending_transactions={[this.state.storedTx]} />
                </div>
            )
        }
    }

    resetToCreateHandler = () => {
        this.setState({storedTx:null})
    }

    render(){
        return(
            <Layout>
                <div style={{ marginTop: "10px" }}>
                     {this.header()}
                     {this.headerOutput()}
                     {this.inputTx()}
                     {this.outputTx()}                     
                </div>
            </Layout>

        )
    }
}
export default CreateTransaction;