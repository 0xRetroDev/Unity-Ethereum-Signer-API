<h1 align="center">Unity Ethereum Signer API</h1>

<p align="center">
  <b>Unity Ethereum Wallet Generation and Transaction Signer</b>
  <br>
  <i>Unlock the true potential of your Unity game with invisible Ethereum wallet generation and transaction signing.</i>
</p>

<p align="center">
  <img src="https://user-images.githubusercontent.com/97366705/231331134-fb9d64c2-f3b8-404b-9cae-12124f9bbfe5.png" width=600>
  <br><br>
<b>Unity Example & Demo:</b> https://github.com/nftpixels/Unity-Ethereum-Signer-Demo
</p>

## Table of Contents

- [Introduction](#introduction)
- [Installation](#installation)
- [Usage](#usage)
- [License](#license)
- [Author](#author)

## Introduction

Unity Ethereum Signer API is a Node.js API that provides seamless integration of decentralized Ethereum wallet generation and transaction signing capabilities into your Unity game. This powerful API utilizes the SKALE network to ensure secure and fast blockchain interactions for your players, allowing them to collect tokens and enjoy an enhanced gaming experience, however any EVM based network can be used.

**Key features:**

- Automatic Ethereum wallet generation for each player at the start of the game (Or where required).
- Secure management of private keys, ensuring each player has a unique and personal wallet.
- Transaction signing support, enabling players to enjoy the game while the server handles contract interaction.
- Efficient queuing of transaction requests to prevent conflicts and ensure smooth gameplay.

Take your Unity game to the next level with the Unity Ethereum Signer API.
<br>


## Installation

1. **Clone this repository to your local machine.**

```bash

git clone https://github.com/nftpixels/Unity-Ethereum-Signer-API.git
cd Unity-Ethereum-Signer-API
```
<br>

2. **Install the required Node.js packages.**
```
npm install
```
<br>

3. **Replace the defaults of the following:**

- **CONTRACT** (Your smart contract address)
- **PROVIDER** (The RPC for the network you're using)
- **CONTRACT ABI** (Found in the **ContractABI.json** file
<br>
Example:
<br>
<br>

```node
///////////////////////////////////////////////////////
//    Ethereum provider and contract information     //
///////////////////////////////////////////////////////

const ContractABI = require('./contractABI');

// You need to replace these with your own
const provider = new ethers.JsonRpcProvider('https://mainnet.skalenodes.com/v1/honorable-steel-rasalhague');
const contractAddress = '0xC6633354CeB5Ed42cF26EA5F4a24DE7b833C8c86';
const contractAbi = ContractABI;
```

This will be used to connect to your smart contract using your network of choice.
<br>
<br>

4. **Start the server**
```
npm start
```
<br>

## Usage

**Generate Wallet:**

Endpoint: POST **_/generateWallet_**

Generate a new Ethereum wallet for each player at the beginning of the game. Players will receive a unique wallet address to interact with the blockchain. In the **CreateWallet.cs** script we pass the player GUID as the **playerId**. You can however pass any data as a player ID, or even use session tokens.
<br>
<br>
Example:
```curl
curl -X POST http://localhost:3000/generateWallet -d '{ "playerId": "player123" }'
```
<br>
<br>

**Unity Example:**

```c#
    private void Start()
    {
        // If the connecting player doesn't have a playerId, we generate a new one and store it the playerPrefs to be reused (This is optional and you can remove it if you prefer to generate a brand new signer for every session)
        if (!PlayerPrefs.HasKey("playerID"))
        {
            Debug.Log("No ID Found, Generating a new one");
            string newPlayerID = Guid.NewGuid().ToString();

            // Generate a unique playerId for the player and store it in playerPrefs
            PlayerPrefs.SetString("playerID", newPlayerID);
            playerId = newPlayerID;
        }
        else
        {
            playerId = PlayerPrefs.GetString("playerID");
        }

        // Invoke our signer method
        GenerateSigner();
    }


    // Invoke this method to generate a new signer and assign it to the playerID
    public async Task GenerateSigner()
    {
        Debug.Log("Your PlayerID: " + playerId);

        // Create the JSON payload with playerId
        var requestData = new RequestData
        {
            playerId = playerId
        };
        var json = JsonUtility.ToJson(requestData);
        var contentBytes = Encoding.UTF8.GetBytes(json);

        // Call our API endpoint ./generateWallet
        using (var request = UnityWebRequest.PostWwwForm(apiBaseUrl + "/generateWallet", ""))
        {
            // Set the request content type
            request.SetRequestHeader("Content-Type", "application/json");

            // Set the request data
            request.uploadHandler = new UploadHandlerRaw(contentBytes);

            // Send the request
            await request.SendWebRequest();

            Debug.Log("Generating Wallet for: " + playerId);

            if (request.result == UnityWebRequest.Result.Success)
            {
                var responseJson = request.downloadHandler.text;
                var responseData = JsonUtility.FromJson<GenerateWalletResponse>(responseJson);
                Debug.Log("Wallet generated for player " + playerId + " - Address: " + responseData.address);

                // Adding our wallet address variable
                walletAddress = responseData.address;

                // Provide gas to the created wallet (You'll need to configure your own gas distribution API for the below)
                // SKALE network does this best as their gas token has no value, so you can mine transactions and distribute gas for free.
                StartCoroutine(SendGas("https://corsproxy.io/?https://example-gas-api.onrender.com/claim/" + walletAddress));
            }
            else
            {
                {
                    // Check if there's an error in the response data
                    var responseJson = request.downloadHandler.text;
                    if (!string.IsNullOrEmpty(responseJson))
                    {
                        // Deserialize the JSON error message from the response
                        var errorData = JsonUtility.FromJson<ErrorResponse>(responseJson);
                        Debug.LogError("Error generating wallet: " + errorData.message);

                        // The only reason we'd get this error is to let us know we already have a signer, which means we can load the level
                        SceneManager.LoadScene("GameScene");
                    }
                    else
                    {
                        // If there's no response data or error message, display the generic error
                        Debug.LogError("Error generating wallet: " + request.result);
                    }
                }
            }
        }
    }
```
<br>


**Sign Transaction:**

Endpoint: POST **_/signTransaction_**

Call the TokenCollected method on the example contract for a player when they collect tokens in the game. This will initiate a transaction using their generated wallet.
This is just an **example** method and can be replaced with any method and endpoint. _eg. /mintNFT could invoke a mint function on the node server and use parameters passed from the Unity client._
<br>
<br>
Example:
```curl
curl -X POST http://localhost:3000/tokenCollected -d '{ "playerId": "player123" }'
```
<br>
<br>

**Unity Example:**

```c#
    // Queue our request to the API server
    public IEnumerator MakeAPIRequest()
    {
        Debug.Log("Adding transaction request to server queue");

        using (var client = new HttpClient())
        {
            var requestData = new RequestData
            {
                // Pass the player ID generated from the wallet API
                playerId = playerId
            };
            var json = JsonUtility.ToJson(requestData);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            // Call our API endpoint ./signTransaction - This can be any method and endpoint however
            var request = client.PostAsync(CreateWallet.instance.apiBaseUrl + "/signTransaction", content);
            yield return new WaitUntil(() => request.IsCompleted);

            if (request.Exception != null)
            {
                Debug.LogError("Error calling method: " + request.Exception.Message);
            }
            else if (request.Result.IsSuccessStatusCode)
            {
                Debug.Log("Transaction successfully mined for " + playerId);
            }
            else
            {
                Debug.LogError("Error calling method: " + request.Result.ReasonPhrase);
            }
        }
    }
```
<br>
<br>

## License
This project is licensed under the MIT License.

## Author
* Author: 0xRetroDev <br>
* GitHub: [nftpixels](https://github.com/0xretrodev) <br>
* LinkedIn: https://www.linkedin.com/in/reinhardtweyers/ <br>

## Security & Liability
This repository and all of its sub-packages and connected packages are WITHOUT ANY WARRANTY; without even the implied warranty for any user commerical or otherwise. The creators and contributors of this package may not be held liable for any damages, losses, issues, or problems caused resulting in the use of this package for any reason.

**EXPERIMENTAL NOTICE**
This package is under heavy development. Use at your own risk.
