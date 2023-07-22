const express = require('express');
const ContractABI = require('./contractABI');
const bodyParser = require('body-parser');
const ethers = require('ethers');
const app = express();

// Use body-parser middleware to parse JSON data
app.use(bodyParser.json());

// Dictionary (Map) to store player data based on playerId
const playersMap = new Map();

///////////////////////////////////////////////////////
//    Ethereum provider and contract information     //
///////////////////////////////////////////////////////

// You need to replace these with your own
const provider = new ethers.JsonRpcProvider('https://mainnet.skalenodes.com/v1/honorable-steel-rasalhague');
const contractAddress = '0xC6633354CeB5Ed42cF26EA5F4a24DE7b833C8c86';
const contractAbi = ContractABI;


///////////////////////////////////////////////////////
// Create a new request queue to handle multiple TXs //
///////////////////////////////////////////////////////

let queue;

// Function to initialize the queue
async function initializeQueue() {
  const module = await import('p-queue');
  queue = new module.default({ concurrency: 1 });
}

initializeQueue();

///////////////////////////////////////////////////////
// Endpoint to generate a new wallet for each player //
///////////////////////////////////////////////////////

app.post('/generateWallet', (req, res) => {
  console.log('Received Signer request:', req.body);
  const playerId = req.body.playerId;

  if (!playerId) {
    return res.status(400).json({ error: 'Player ID is required' });
  }

  const playerWallet = ethers.Wallet.createRandom();

  // Store player data in the playersMap dictionary
  playersMap.set(playerId, {
    privateKey: playerWallet.privateKey,
    address: playerWallet.address
  });

  res.json({ address: playerWallet.address });
});



///////////////////////////////////////////////////////
//   Endpoint to call the contract method on-chain   //
///////////////////////////////////////////////////////

// This endpoint can be renamed and modified to handle any kind of contract method (Remember to add parameters if required)
app.post('/tokenCollected', async (req, res) => {
  console.log('Received Transacion request:', req.body);
  const playerId = req.body.playerId;

  // If the request is coming with no player ID, reject it.
  if (!playerId) {
    return res.status(400).json({ error: 'Player ID is required' });
  }

  // Retrieve the player data from the playersMap dictionary
  const playerData = playersMap.get(playerId);

  if (!playerData) {
    return res.status(404).json({ error: 'Player not found' });
  }


///////////////////////////////////////////////////////
// Queue the request to ensure sequential execution  //
///////////////////////////////////////////////////////
 
  queue.add(async () => {
    try {
      console.log('Fetching next request from queue...');

      // Connect to the Ethereum network
      const wallet = new ethers.Wallet(playerData.privateKey, provider);
      const contract = new ethers.Contract(contractAddress, contractAbi, wallet);

      // Call the TokenCollected method on the contract (This can again be any method, as long as it's present in the contractABI.json file)
      const tx = await contract.TokenCollected();
      console.log('Calling Requested Method..');

      // Wait for the transaction to be mined (optional)
      await tx.wait();

      console.log('Mining Transaction..');

      res.json({ success: true });

      console.log('Transaction Mined Successfully!');
    } catch (error) {
      console.error('Error executing the transaction:', error);
      res.status(500).json({ error: 'Error executing the transaction' });
    }
  });
});

app.listen(3000, () => console.log(`Server running on port 3000`));
