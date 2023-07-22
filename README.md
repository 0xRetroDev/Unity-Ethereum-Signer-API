<h1 align="center">Unity Ethereum Signer API</h1>

<p align="center">
  <b>Unity Ethereum Wallet Generation and Transaction Signer</b>
  <br>
  <i>Unlock the true potential of your Unity game with invisible Ethereum wallet generation and transaction signing.</i>
</p>

<p align="center">
  <img src="screenshot.png" alt="Project Screenshot">
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

- CONTRACT ADDRESS.
- CONTRACT ABI (Found in the **ContractABI.json** file.
- PROVIDER (Your RPC URL).

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
```
curl -X POST http://localhost:3000/generateWallet -d '{ "playerId": "player123" }'
```
<br>
