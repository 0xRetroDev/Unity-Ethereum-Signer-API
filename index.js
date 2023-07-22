// index.js
const express = require('express');
const bodyParser = require('body-parser');
const { ethers } = require('ethers');
const jwt = require('jsonwebtoken');

const app = express();
app.use(bodyParser.json());

const wallets = {}; // Store the player wallets and private keys
const secretKey = 'YOUR_SECRET_KEY'; // Replace this with a secret key for JWT signing

// Endpoint to create a new wallet for a player
app.post('/createWallet', authenticatePlayer, (req, res) => {
  const wallet = ethers.Wallet.createRandom();
  const address = wallet.address;
  const privateKey = wallet.privateKey;
  wallets[address] = privateKey;

  // Generate a JWT token for the player
  const token = jwt.sign({ address }, secretKey);

  res.json({ address, privateKey, token });
});

// Endpoint to call the TokenCollected method
app.post('/tokenCollected', authenticatePlayer, async (req, res) => {
  const { address } = req.body;
  const privateKey = wallets[address];
  if (!privateKey) {
    return res.status(400).json({ error: 'Wallet not found' });
  }

  try {
    const provider = new ethers.providers.JsonRpcProvider('YOUR_ETHEREUM_NODE_URL');
    const wallet = new ethers.Wallet(privateKey, provider);

    // Use the address and privateKey to interact with the smart contract and call TokenCollected method
    const contractAddress = '0x4A5B12722C57d48d3Cff9629E5B2039e11539cfd';
    const contractABI = [
      // Add your smart contract's ABI here
      // Example: { "constant": false, "inputs": [], "name": "TokenCollected", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }
    ];
    const contract = new ethers.Contract(contractAddress, contractABI, wallet);

    const transaction = await contract.TokenCollected();

    res.json({ transactionHash: transaction.hash });
  } catch (err) {
    res.status(500).json({ error: 'Transaction failed', details: err.message });
  }
});

// Middleware to authenticate the player using the session token
function authenticatePlayer(req, res, next) {
  const token = req.header('x-session-token');

  if (!token) {
    return res.status(401).json({ error: 'Authentication failed. Session token not provided.' });
  }

  try {
    // Verify the session token using the secretKey
    const decoded = jwt.verify(token, secretKey);
    req.playerAddress = decoded.address;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Authentication failed. Invalid session token.' });
  }
}

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`API server is running on ${port}`);
});
