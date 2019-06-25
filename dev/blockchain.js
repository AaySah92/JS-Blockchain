const sha256 = require('sha256');
const uuid = require('uuid/v1');
const currentNodeUrl = process.argv[2];

function Blockchain() {
    this.chain = [];
    this.pendingTransactions = [];
    this.currentNodeUrl = currentNodeUrl;
    this.networkNodes = [];
    this.createNewBlock(0, '0', 'GenesisHash');
}

Blockchain.prototype.createNewBlock = function(nonce, previousHash, hash) {
    const newBlock = {
        index: this.chain.length + 1,
        timestamp: Date.now(),
        nonce: nonce,
        previousHash: previousHash,
        hash: hash,
        transactions: this.pendingTransactions
    }
    this.pendingTransactions = [];
    this.chain.push(newBlock);
    return newBlock;
};

Blockchain.prototype.getLastBlock = function() {
    return this.chain[this.chain.length - 1];
};

Blockchain.prototype.createNewTransaction = function(amount, sender, recipient) {
    const transaction = {
        amount: amount,
        sender: sender,
        recipient: recipient,
        transactionId: uuid().split("-").join("")
    };
    return transaction;
};

Blockchain.prototype.addTransactionToPendingTransactions = function(newTransaction) {
    this.pendingTransactions.push(newTransaction);
    return this.getLastBlock()['index'] + 1;
};

Blockchain.prototype.hashBlock = function(previousHash, transactionData, nonce) {
    return sha256(previousHash + nonce.toString() + JSON.stringify(transactionData));
};

Blockchain.prototype.proofOfWork = function(previousHash, transactionData) {
    let hash = "";
    let nonce;
    for(nonce = 0; hash.substring(0, 4) !== "0000"; nonce++) {
        hash = this.hashBlock(previousHash, transactionData, nonce);
    }
    return nonce - 1;
};

Blockchain.prototype.chainIsValid = function(existingChain) {
    let valid = true;
    for(let i = 1; i < existingChain.length; i++) {
        let currentBlock = existingChain[i];
        let previousBlockHash = existingChain[i - 1].hash;
        let calculatedHash = this.hashBlock(currentBlock.previousHash, {
            transactions: currentBlock.transactions,
            index: currentBlock.index
        }, currentBlock.nonce);
        let hashOrderCheck = currentBlock.previousHash === previousBlockHash;
        let hashAccordingToProofOfWork = calculatedHash.substring(0, 4) === "0000"
        let hashCalculatedCorrectly = calculatedHash === existingChain[i].hash;
        if(!hashOrderCheck || !hashAccordingToProofOfWork || !hashCalculatedCorrectly) {
            valid = false;
        }
    }
    let genesisBlock = existingChain[0];
    if(genesisBlock.nonce !== 0 || genesisBlock.previousHash !== "0" || genesisBlock.hash !== "GenesisHash") {
        valid = false;
    }
    return valid;
};

Blockchain.prototype.getBlock = function(blockHash) {
    let correctBlock = null;
    this.chain.forEach(block => {
        if(block.hash === blockHash) {
            correctBlock = block;
        }
    });
    return correctBlock;
};

Blockchain.prototype.getTransaction = function(transactionId) {
    let correctBlock = null;
    let correctTransaction = null;
    this.chain.forEach(block => {
        block.transactions.forEach(transaction => {
            if(transaction.transactionId === transactionId) {
                correctBlock = block;
                correctTransaction = transaction;
            }
        })
    });
    return {
        block: correctBlock,
        transaction: correctTransaction
    };
};

Blockchain.prototype.getAddressData = function(address) {
    let addressTransactions = [];
    let balance = 0;
    this.chain.forEach(block => {
        block.transactions.forEach(transaction => {
            if(transaction.recipient === address || transaction.sender === address) {
                addressTransactions.push(transaction);
            }
        })
    });
    addressTransactions.forEach(transaction => {
        if(transaction.sender === address) {
            balance -= transaction.amount;
        }
        else if(transaction.recipient === address) {
            balance += transaction.amount;
        }
    });
    return {
        addressTransactions: addressTransactions,
        addressBalance: balance
    };
};

module.exports = Blockchain;