const { ethers } = require("ethers");
const abi = require("./abi.json"); // Ensure this ABI is correct

const provider = new ethers.providers.WebSocketProvider("wss://polygon-amoy.infura.io/ws/v3/ad22d5ae3ad04b50920efe566eea8890");
const tokenAddress = "0xfCA750C3EED4C9A45aC3dA40BD9D987276303414"; // Your token address

const tokenContract = new ethers.Contract(tokenAddress, abi, provider);

let tokenHolders = {};

async function listenToTransfers() {
    console.log("Setting up Transfer event listener...");

    // Listen for Transfer events
    tokenContract.on("Transfer", (from, to, value) => {
        console.log(`Transfer detected: ${value.toString()} tokens from ${from} to ${to}`);

        // Update token holders
        if (from !== ethers.constants.AddressZero) {
            tokenHolders[from] = (tokenHolders[from] || ethers.BigNumber.from(0)).sub(value);
            if (tokenHolders[from].isZero()) {
                delete tokenHolders[from]; // Remove from holders if balance is 0
            }
        }

        tokenHolders[to] = (tokenHolders[to] || ethers.BigNumber.from(0)).add(value); 
        console.log(`Updated token holders: ${JSON.stringify(tokenHolders, null, 2)}`); // Log current holders
    });

    console.log("Listener is set up. Waiting for Transfer events...");
}

// Start listening to transfers
listenToTransfers().catch(error => {
    console.error("Error in listening to transfers:", error);
});
