<h1 align="center">Unity Ethereum Signer API</h1>

<p align="center">
  <b>Unity Ethereum Wallet Generation and Transaction Signer</b>
  <br>
  <i>Unlock the true potential of your Unity game with invisible Ethereum wallet generation and transaction signing.</i>
</p>

<p align="center">
![Banner](https://github.com/nftpixels/Unity-Ethereum-Signer-API/assets/97366705/6c82cc82-3ebb-41fd-880c-5d3708fdc10e)
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

- Automatic Ethereum wallet generation for each player at the start of the game.
- Secure management of private keys, ensuring each player has a unique and personal wallet.
- Transaction signing support, enabling players to enjoy the game while the server handles contract interaction in the backround.
- Efficient queuing of transaction requests to prevent conflicts and ensure smooth gameplay.

Take your Unity game to the next level with the Unity Ethereum Signer API.
<br><br>
_For Unity integration, refer to the provided Unity script and make HTTP requests to the API endpoints at the appropriate game events._

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

- _CONTRACT ADDRESS_
- _CONTRACT ABI_ (Found in the **ContractABI.json** file
- _PROVIDER_ (Your RPC URL)

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
        // Generate a unique playerId for the player
        playerId = Guid.NewGuid().ToString();

        // Generate a wallet
        await GenerateSigner();
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

                // Assing our wallet address variable
                walletAddress = responseData.address;

                // Provide gas to the create wallet (You'll need to configure your own gas distribution API for the below)
                StartCoroutine(SendGas("https://corsproxy.io/?https://example-gas-api.onrender.com/claim/" + walletAddress));
            }
            else
            {
                Debug.LogError("Error generating wallet: " + request.error);
            }
        }
    }
```
<br>


**Send Transaction:**

Endpoint: POST **_/tokenCollected_**

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

            // Call our API endpoint ./tokenCollected - This can be any method and endpoint however
            var request = client.PostAsync(CreateWallet.instance.apiBaseUrl + "/tokenCollected", content);
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
* Author: Reinhardt Weyers <br>
* Email: weyers70@gmail.com <br>
* GitHub: [github.com/yourusername](https://github.com/nftpixels) <br>
* LinkedIn: [linkedin.com/in/yourprofile](https://www.linkedin.com/in/reinhardtweyers/)https://www.linkedin.com/in/reinhardtweyers/ <br>
