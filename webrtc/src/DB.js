import PouchDB from 'pouchdb'
import { v1 } from 'uuid'
import PouchdbFind from 'pouchdb-find';
//PouchDB.plugin(require('pouchdb-find'));

export default class DB {
    constructor(name){
        PouchDB.plugin(PouchdbFind)
        this.db = new PouchDB(name)
    }

    getUUID = async () => {
        let node_uuid 
        await this.db.get('my_UUID').then(result => node_uuid = result.value ).catch(e => node_uuid = e.name)        
        return node_uuid
    }

    createUUID = () =>{
        return v1()
    }

    saveUUID = async (my_UUID) => {
        await this.db.put({_id:'my_UUID',value:my_UUID}).then(r=>{return my_UUID})
        .catch(e=>console.log('Error saving id: ', e.name ))
    }

    saveBlockchain = async (B) =>{
        try{
            const _id = B.index.toString()
            const block = {...B,_id}
            const res = await this.db.post(block)
            //const {id} = res
            return res
        }catch(e){
            const {message} = e
            console.log('Error on saveBlockchain method in class DB.js: ',message)
            return 'error'
        }
    }

    saveTx = async (newTx) =>{
        try{            
            const type = 'pendingTransaction'
            const totalTx = {...newTx,type}
            const res = await this.db.post(totalTx)
            //const {id} = res
            return res
        }catch(e){
            const {message} = e
            console.log('Error saving new Transaction on DB.js: ',message)
            return null
        }
    }
}