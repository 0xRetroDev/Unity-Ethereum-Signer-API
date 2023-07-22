// app.js

const express = require('express');
const bodyParser = require('body-parser');
const ethers = require('ethers');
const app = express();
const port = 3000;

// Use body-parser middleware to parse JSON data
app.use(bodyParser.json());

// Array to store player data (In a real application, you should use a database)
const players = [];

// Ethereum provider and contract information (you need to replace these with your own)
const provider = new ethers.JsonRpcProvider('YOUR_ETHEREUM_PROVIDER_URL');
const contractAddress = 'YOUR_CONTRACT_ADDRESS';
const contractAbi = ['YOUR_CONTRACT_ABI'];

// Endpoint to generate a new wallet for each player
app.post('/generateWallet', (req, res) => {
  const playerId = req.body.playerId;

  if (!playerId) {
    return res.status(400).json({ error: 'Player ID is required' });
  }

  const playerWallet = ethers.Wallet.createRandom();

  // Save player data in your players array or database
  players.push({
    playerId: playerId,
    privateKey: playerWallet.privateKey,
    address: playerWallet.address
  });

  res.json({ address: playerWallet.address });
});

// Endpoint to call the TokenCollected method for a player
app.post('/tokenCollected', async (req, res) => {
  const playerId = req.body.playerId;

  if (!playerId) {
    return res.status(400).json({ error: 'Player ID is required' });
  }

  // Find the player in your players array or database
  const player = players.find((p) => p.playerId === playerId);

  if (!player) {
    return res.status(404).json({ error: 'Player not found' });
  }

  // Connect to the Ethereum network
  const wallet = new ethers.Wallet(player.privateKey, provider);
  const contract = new ethers.Contract(contractAddress, contractAbi, wallet);

  try {
    // Call the TokenCollected method on the contract
    const tx = await contract.TokenCollected();

    // Wait for the transaction to be mined (optional)
    await tx.wait();

    res.json({ success: true });
  } catch (error) {
    console.error('Error executing the transaction:', error);
    res.status(500).json({ error: 'Error executing the transaction' });
  }
});

app.listen(port, () => console.log(`Server running on port ${port}`));
