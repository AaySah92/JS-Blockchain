let Blockchain = require('./blockchain');
let bitcoin = new Blockchain();

let bc1 = {
    "chain": [
        {
            "index": 1,
            "timestamp": 1561398586110,
            "nonce": 0,
            "previousHash": "0",
            "hash": "GenesisHash",
            "transactions": []
        },
        {
            "index": 2,
            "timestamp": 1561398590952,
            "nonce": 221496,
            "previousHash": "GenesisHash",
            "hash": "0000a4a73e928ddc160a84aa612b63edd98e9a7a625c79366500d8290f6cf29b",
            "transactions": []
        },
        {
            "index": 3,
            "timestamp": 1561398608745,
            "nonce": 20084,
            "previousHash": "0000a4a73e928ddc160a84aa612b63edd98e9a7a625c79366500d8290f6cf29b",
            "hash": "00007ad3218fc2de159b7110c4d4fd87bc64c24a7edc6abe8da5cb2a72895a13",
            "transactions": [
                {
                    "amount": 12.5,
                    "sender": "0",
                    "recipient": "7448a1e096a811e98a6addc6ebce9208",
                    "transactionId": "772e5cb096a811e98a6addc6ebce9208"
                },
                {
                    "amount": 400,
                    "sender": "A",
                    "recipient": "B",
                    "transactionId": "7ba6504096a811e98a6addc6ebce9208"
                },
                {
                    "amount": 400,
                    "sender": "A",
                    "recipient": "B",
                    "transactionId": "7e6f344096a811e98a6addc6ebce9208"
                },
                {
                    "amount": 122,
                    "sender": "Q",
                    "recipient": "Z",
                    "transactionId": "7fa3477096a811e98a6addc6ebce9208"
                }
            ]
        },
        {
            "index": 4,
            "timestamp": 1561398626421,
            "nonce": 108263,
            "previousHash": "00007ad3218fc2de159b7110c4d4fd87bc64c24a7edc6abe8da5cb2a72895a13",
            "hash": "0000d783288a8eb18170a60f1f536cd167e1498f553cd4f20c5f7cfd779d46d7",
            "transactions": [
                {
                    "amount": 12.5,
                    "sender": "0",
                    "recipient": "7448a1e096a811e98a6addc6ebce9208",
                    "transactionId": "81c6c3b096a811e98a6addc6ebce9208"
                },
                {
                    "amount": 13,
                    "sender": "P",
                    "recipient": "Q",
                    "transactionId": "88db0d0096a811e98a6addc6ebce9208"
                },
                {
                    "amount": 900,
                    "sender": "X",
                    "recipient": "Y",
                    "transactionId": "8a7004e096a811e98a6addc6ebce9208"
                }
            ]
        }
    ],
    "pendingTransactions": [
        {
            "amount": 12.5,
            "sender": "0",
            "recipient": "7448a1e096a811e98a6addc6ebce9208",
            "transactionId": "8c4fe87096a811e98a6addc6ebce9208"
        }
    ],
    "currentNodeUrl": "http://localhost:3001",
    "networkNodes": []
};

console.log('Valid: ', bitcoin.chainIsValid(bc1.chain));