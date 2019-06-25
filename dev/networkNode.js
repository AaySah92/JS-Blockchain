const express = require('express');
const bodyParser = require('body-parser');
const uuid = require('uuid/v1');
const requestPromise = require('request-promise');
const Blockchain = require('./blockchain');

const app = new express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
const nodeAddress = uuid().split("-").join("");
const bitcoin = new Blockchain();
const port = parseInt(bitcoin.currentNodeUrl.split(":")[2]);

app.get('/blockchain', function(req, res) {
    res.send(bitcoin);
});

app.post('/transaction/broadcast', function(req, res) {
    let newTransaction = bitcoin.createNewTransaction(req.body.amount, req.body.sender, req.body.recipient);
    bitcoin.addTransactionToPendingTransactions(newTransaction);
    let broadcastPromises = [];
    bitcoin.networkNodes.forEach(newtworkNode => {
        let requestPromiseOptions = {
            uri: newtworkNode + '/transaction',
            method: 'post',
            json: true,
            body: { newTransaction: newTransaction }
        };
        broadcastPromises.push(requestPromise(requestPromiseOptions));
    });
    Promise.all(broadcastPromises)
    .then(data => {
        res.send(`This transaction added & broadcasted Successfully`);
    })
});

app.post('/transaction', function(req, res) {
    let addedTo = bitcoin.addTransactionToPendingTransactions(req.body.newTransaction);
    res.send(`This transaction will be added to ${addedTo}.`);
});

app.get('/mine', function(req, res) {
    let previousHash = bitcoin.getLastBlock().hash;
    let transactionData = {
        transactions: bitcoin.pendingTransactions,
        index: bitcoin.getLastBlock().index + 1
    };
    let nonce = bitcoin.proofOfWork(previousHash, transactionData);
    let hash = bitcoin.hashBlock(previousHash, transactionData, nonce);
    let newBlock = bitcoin.createNewBlock(nonce, previousHash, hash);
    let broadcastPromises = [];
    bitcoin.networkNodes.forEach(networkNode => {
        let requestPromiseOptions = {
            uri: networkNode + '/receive-new-block',
            method: 'post',
            json: true,
            body: { newBlock: newBlock }
        };
        broadcastPromises.push(requestPromise(requestPromiseOptions));
    });
    Promise.all(broadcastPromises)
    .then(data => {
        let newTransaction = bitcoin.createNewTransaction(12.5, "0", nodeAddress);
        let requestPromiseOptions = {
            uri: bitcoin.currentNodeUrl + '/transaction/broadcast',
            method: 'post',
            json: true,
            body: newTransaction
        };
        return requestPromise(requestPromiseOptions);
    })
    .then(data => {
        res.send(newBlock);
    });
});

app.post('/receive-new-block', function(req, res) {
    let newBlock = req.body.newBlock;
    let previousBlock = bitcoin.getLastBlock();
    if(newBlock.previousHash === previousBlock.hash && newBlock.index === (previousBlock.index + 1)) {
        bitcoin.chain.push(newBlock);
        bitcoin.pendingTransactions = [];
        res.send('New Block Added');
    }
    else {
        res.send('New Block Rejected');
    }
});

app.post('/register-and-broadcast-node', function(req, res) {
    let newNetworkNode = req.body.newNetworkNode;
    if(bitcoin.networkNodes.indexOf(newNetworkNode) === -1 && bitcoin.currentNodeUrl !== newNetworkNode) {
        bitcoin.networkNodes.push(newNetworkNode);
    }
    let broadcastPromises = [];
    bitcoin.networkNodes.forEach(networkNode => {
        let requestPromiseOptions = {
            uri: networkNode + "/register-node",
            method: 'post',
            json: true,
            body: { newNetworkNode: newNetworkNode }
        };
        broadcastPromises.push(requestPromise(requestPromiseOptions));
    });
    Promise.all(broadcastPromises)
    .then(promiseResponses => {
        let bulkRequestPromiseOptions = {
            uri: newNetworkNode + "/register-nodes-bulk",
            method: 'post',
            json: true,
            body: { bulkNewNetworkNodes: [...bitcoin.networkNodes, bitcoin.currentNodeUrl] }
        };
        return requestPromise(bulkRequestPromiseOptions);
    })
    .then(promiseResponse => {
        res.send({ note: "Node registered and broadcasted" });
    });
});

app.post('/register-node', function(req, res) {
    let newNetworkNode = req.body.newNetworkNode;
    if(bitcoin.networkNodes.indexOf(newNetworkNode) === -1 && bitcoin.currentNodeUrl !== newNetworkNode) {
        bitcoin.networkNodes.push(newNetworkNode);
    }
    res.send({ note: "Node registered successfully" });
});

app.post('/register-nodes-bulk', function(req, res) {
    let bulkNewNetworkNodes = req.body.bulkNewNetworkNodes;
    bulkNewNetworkNodes.forEach(newNetworkNode => {
        if(bitcoin.networkNodes.indexOf(newNetworkNode) === -1 && bitcoin.currentNodeUrl !== newNetworkNode) {
            bitcoin.networkNodes.push(newNetworkNode);
        }
    });
    res.send({ note: "Bulk Node registered successfully" });
});

app.get('/consensus', function(req, res) {
    let broadcastPromises = [];
    bitcoin.networkNodes.forEach(networkNode => {
        let requestPromiseOptions = {
            uri: networkNode + "/blockchain",
            method: "get",
            json: true
        };
        broadcastPromises.push(requestPromise(requestPromiseOptions));
    })
    Promise.all(broadcastPromises)
    .then(blockchains => {
        let currentChainLength = bitcoin.chain.length;
        let maxChainLength = currentChainLength;
        let newLongestChain = null;
        let newPendingTransactions = null;
        blockchains.forEach(blockchain => {
            if(blockchain.chain.length > maxChainLength) {
                maxChainLength = blockchain.chain.length;
                newLongestChain = blockchain.chain;
                newPendingTransactions = blockchain.pendingTransactions
            }
        });
        if(!newLongestChain || (newLongestChain && !bitcoin.chainIsValid(newLongestChain))) {
            res.send('Block chain not replaced');
        }
        else {
            bitcoin.chain = newLongestChain;
            bitcoin.pendingTransactions = newPendingTransactions;
            res.send('Block chain replaced');
        }
    });
});

app.get('/block/:blockHash', function(req, res) {
    let blockHash = req.params.blockHash;
    let correctBlock = bitcoin.getBlock(blockHash);
    res.json({
        block: correctBlock
    });
});

app.get('/transaction/:transactionId', function(req, res) {
    let transactionId = req.params.transactionId;
    let transactionData = bitcoin.getTransaction(transactionId);
    res.json({
        transaction: transactionData.transaction,
        block: transactionData.block
    });
});

app.get('/address/:address', function(req, res) {
    let address = req.params.address;
    let addressData = bitcoin.getAddressData(address);
    res.json({
        addressData: addressData
    });
});

app.get('/block-explorer', function(req, res) {
    res.sendFile('/block-explorer/index.html', { root: __dirname });
});

app.listen(port, function() {
    console.log(`Listening on Port ${port}...`);
});