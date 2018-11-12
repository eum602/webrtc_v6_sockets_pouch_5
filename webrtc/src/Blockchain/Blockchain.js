//const sha256 = require('sha256');
//import sha256 from 'sha256'
//const currentNodeUrl = process.argv[3];//jalando la url contenida en el script cuando se inici esta
import PouchDB from 'pouchdb'
import { v1 } from 'uuid'
import PouchdbFind from 'pouchdb-find';
import DB from '../DB'

export default class  Blockchain { 
        
	constructor() {
		PouchDB.plugin(PouchdbFind)
		this.chain = []
		this.pendingTransactions = []
		this.db = new PouchDB('blockchain')
	}
    
    createFirstBlockHandler = (t) =>{
		//console.log('recibido en createFirstBlockHandler:',t)
        for (let tx of t){
            const newTx = {
                amount: tx.amount,
                sender: tx['sender'],
                recipient: tx['recipient'],
                value4:tx['value4'],
                value5:tx['value5'],
                transactionId: v1().split('-').join('') //adding a new attribute, latter this must be
                //sophisticated with cryptogtaphy.
			}
			//console.log("newTx",newTx)
            this.pendingTransactions.push(newTx)
		}
		//console.log('pending Transactions',this.pendingTransactions)
        return this.createNewBlock(100, '0', '0')
        
    }

    createNewBlock = (nonce, previousBlockHash, hash) => {
        const newBlock = {
			//_id: (this.chain.length + 1).toString(),
            index: this.chain.length + 1,
            timestamp: Date.now(),
            transactions: this.pendingTransactions,
            nonce: nonce,
            hash: hash,
            previousBlockHash: previousBlockHash
        }
        
        //this.chain.push(newBlock);
        this.pendingTransactions = []
		this.chain.push(newBlock)
		//console.log(newBlock)
        return newBlock;
	}
	
	getLastBlock = async() => {
		let options = {include_docs:true}
		let idx = 0
		let key = null
		let foundBlock = null
		let rowIndex = null
		let aux = 0
		
		await this.db.allDocs(options, (err, response) => {
			//console.log("response",response)
			if(response && response.rows.length > 0){
				let fullBlocks = response.rows
				for(let totalBlock of fullBlocks){
					//console.log('total block',totalBlock)
					let block = totalBlock.doc			
					if(typeof(block.index) === "number"){
						if(block.index > idx){
							idx = block.index
							key = totalBlock.id
							rowIndex = aux
						}					
					}
					aux++
				}

				if(idx>0){
					console.log('lastBlock index found: ' , idx)
					console.log('id del bloque',key)
					
					const {index,timestamp,transactions,nonce, hash , previousBlockHash} = 
					response['rows'][rowIndex]['doc']
					foundBlock = {index,timestamp,transactions,nonce, hash , previousBlockHash}
					console.log('las block from pouch...' , foundBlock)
				}			
			
			}else{
				console.log('nothing received: ')
				
			}
			if(err){
				console.log('Error when getting las block...',err)
			}

			// handle err or response
		})
		return foundBlock	
	}

	createNewTransaction = (newTx) => {
		const newTransaction = {
			amount: newTx.amount,
			sender: newTx.sender,
			recipient: newTx.recipient,
			value4:newTx.value4,
			value5:newTx.value5,
			transactionId: v1().split('-').join('') //adding a new attribute, latter this must be
			//sophisticated with cryptogtaphy.
		}
		//this.pendingTransactions.push(newTransaction);
		//return newTransaction			
		let output = new Promise((resolve,reject)=>{
			resolve(this.getLastBlock())
			reject('Error getting last Block')
		}).then(block=>{
			return block
			/*if(block !== null) {
				console.log('Allowed to create a transaction')
				return newTransaction				
			}*/
			
		})

		if(output !== null){
			output = new Promise((resolve,reject)=>{
				resolve(this.addTransactionToPendingTransactions(newTransaction))
				reject('Error adding a new Transation to the database')
			}).then(res=>{
				console.log('res intermedio: ',res)
				return res
			})
		}

		return output
	}

	addTransactionToPendingTransactions = async(newTx) => {
		//this.pendingTransactions.push(transactionObj)
		const db1 = new DB('blockchain')
		const res = await db1.saveTx(newTx)
		if(res !== null){
			console.log(`Successfully saved Tx, pouch responded with:`,res)
			return newTx
		}
		//return this.getLastBlock()['index'] + 1;
	}

	getPendingTransactions = async () => {
		let options = {include_docs:true}
		let pendingTxs = []
		
		await this.db.allDocs(options, (err, response) => {
			//console.log("response",response)
			if(response && response.rows.length > 0){
				let res1 = response.rows
				for(let a of res1){					
					let fullPendingTx = a.doc					
					if(fullPendingTx.type=== "pendingTransaction"){
						let {amount,recipient,sender,value4,value5} = {...fullPendingTx}
						let pendingTx = {amount,recipient,sender,value4,value5}
						pendingTxs.push(pendingTx)
						//console.log('pendingTx: ',pendingTx)
					}
				}
			}
			
		})
		return pendingTxs
	}
}

/*
Blockchain.prototype.hashBlock = function(previousBlockHash, currentBlockData, nonce) {
	const dataAsString = previousBlockHash + nonce.toString() + JSON.stringify(currentBlockData);
	const hash = sha256(dataAsString);
	return hash;
};


Blockchain.prototype.proofOfWork = function(previousBlockHash, currentBlockData) {
	let nonce = 0;
	let hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
	while (hash.substring(0, 6) !== '000000' && hash.substring(0, 6) !== '000001' &&
	hash.substring(0, 6) !== '000002' && hash.substring(0, 6) !== '000003' &&
	hash.substring(0, 6) !== '000004' &&
	hash.substring(0, 6) !== '000005' &&
	hash.substring(0, 6) !== '000006' &&
	hash.substring(0, 6) !== '000007' &&
	hash.substring(0, 6) !== '000008') {
		nonce++;
		hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
	}
	console.log('El nonce del pow es: ' +  hash , '..........', hash);
	return nonce;
};


Blockchain.prototype.chainIsValid = function(blockchain) { //as a parameter a chain enter into this
	//function with the name blockchain
	let validChain = true;
	for (var i = 1; i < blockchain.length; i++) {		
		const prevBlock = blockchain[i - 1];
		console.log('previous block' + ' : ',prevBlock);
		const currentBlock = blockchain[i];
		console.log('block' + i+1 + ' : ',currentBlock);
		//1. verify the hashes on every block by rehashing them and verifiying the amount of zeros.
		//const hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
		let currentBlockData = { transactions: currentBlock['transactions'], index: currentBlock['index'] };
		let previousBlockHash = prevBlock['hash'];
		const blockHash = this.hashBlock(previousBlockHash, currentBlockData,currentBlock['nonce']);
		console.log('blockHash',blockHash);
		if (blockHash.substring(0, 6) !== '000000' && blockHash.substring(0, 6) !== '000001' &&
		blockHash.substring(0, 6) !== '000002' && blockHash.substring(0, 6) !== '000003' &&
		blockHash.substring(0, 6) !== '000004' &&
		blockHash.substring(0, 6) !== '000005' &&
		blockHash.substring(0, 6) !== '000006' &&
		blockHash.substring(0, 6) !== '000007' &&
		blockHash.substring(0, 6) !== '000008' ) validChain = false;
		console.log('1. verify the hashes on every block by rehashing them and verifiying the amount of zeros: ',
		validChain);
		//2. verify the hash of the previous block hash on every current block
		if (currentBlock['previousBlockHash'] !== prevBlock['hash']) validChain = false;
		console.log('hash anterior',prevBlock['hash'],'previousBlockHash en current block',
		currentBlock['previousBlockHash'])
		console.log('2. verify the hash of the previous hash on every block: ', 
		currentBlock['previousBlockHash'] == prevBlock['hash']);
	};
	//3. verify the initial values on the genesis block
	const genesisBlock = blockchain[0];
	const correctNonce = genesisBlock['nonce'] === 100;
	const correctPreviousBlockHash = genesisBlock['previousBlockHash'] === '0';
	const correctHash = genesisBlock['hash'] === '0';
	const correctTransactions = genesisBlock['transactions'].length === 6;

	if (!correctNonce || !correctPreviousBlockHash || !correctHash || !correctTransactions) validChain = false;
	console.log('3. verify the initial values on the genesis block: ',
	correctNonce && correctPreviousBlockHash && correctHash && correctTransactions);
	return validChain;
};
/*

Blockchain.prototype.getBlock = function(blockHash) {
	let correctBlock = null;
	this.chain.forEach(block => {
		if (block.hash === blockHash) correctBlock = block;
	});
	return correctBlock;
};


Blockchain.prototype.getTransaction = function(transactionId) {
	let correctTransaction = null;
	let correctBlock = null;

	this.chain.forEach(block => {
		block.transactions.forEach(transaction => {
			if (transaction.transactionId === transactionId) {
				correctTransaction = transaction;
				correctBlock = block;
			};
		});
	});

	return {
		transaction: correctTransaction,
		block: correctBlock
	};
};


Blockchain.prototype.getAddressData = function(address) {
	const addressTransactions = [];
	this.chain.forEach(block => {
		block.transactions.forEach(transaction => {
			if(transaction.sender === address || transaction.recipient === address) {
				addressTransactions.push(transaction);
			};
		});
	});

	let balance = 0;
	addressTransactions.forEach(transaction => {
		if (transaction.recipient === address) balance += transaction.amount;
		else if (transaction.sender === address) balance -= transaction.amount;
	});

	return {
		addressTransactions: addressTransactions,
		addressBalance: balance
	};
};




*/



//module.exports = Blockchain;



