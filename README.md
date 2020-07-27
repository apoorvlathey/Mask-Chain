# Mask-Chain
Mask Chain is a Supply Chain utilizing Ethereum Blockchain and IoT.

### Problem
In the current times of pandemic, it is very important that the people wear masks to safeguard themselves. But many scammers have popped up to sell fake and non-standard masks that can be fatal to the innocent public.
So to have a decentralized verification mechanism to combat this, I have created Mask Chain.

### Walk through
1. ![](https://i.imgur.com/QqaYnfb.png)
The **Manufacturer** produces a new Mask. It is then put onto the weight measuring sensor, that transmits the data to computer from Arduino board via USB. The data is logged by the server. The webpage fetches this data from server.
The Manufacturer inputs the price as well as the transporter's Ethereum Address.
An image is taken of the mask, which gets uploaded to the IPFS decentralized storage. The buyer can verify that the mask he/she receives is the same one that was sent.
On clicking the button, the data is stored onto the smart contract on blockchain, along with additional data like location and time.

2. ![](https://i.imgur.com/6uRFM76.png)
The **Transporter** on successfully delivering the package, scans the QR code to get MaskID. He/she then inputs the transportation fees and this data is then recorded onto the smart contract.

3. ![](https://i.imgur.com/rPaPJJe.png)
The buyer scans the QR code on the package received.
The Application fetches the data from blockchain and displays it to the buyer.

![](https://i.imgur.com/K8w3LbK.png)
The Buyer can see the entire history of the package and hence verify its authenticity.

To pay the parties involved, the buyer clicks ob Pay button and sends the transaction in form of Ether.

Due to the peer-to-peer nature, the amount is split up and sent to the individual wallets of Manufacturer and Transporter without any Middlemen taking a cut.
Here you can see it on Etherscan:

![](https://i.imgur.com/X29e0Lc.png)

### Setup
1. **Arduino**
Setup the circuit as shown:
![](https://i.imgur.com/xnZqOZp.png)

Upload the code from `./arduino/weight.ino` and upload it to the Arduino. Connect USB to receive sensor Data to Serial Monitor via port `COM17` (might be different for different computers).

2. **Server**
a) In `server` directory, run `npm install` to install the required dependencies. It is a Express Node server.
b) `node server.js` to start the server on Port 5000. The server listens to data sent by Arduino and makes it accessible via API endpoint.

3. **Client**
a) The frontend is in React.js and available in `client` directory.
b) Use `npm install` to install required packages.
c) `npm run start` to start react application on Port 3000.
d) Grant webcam permissions to the application in browser and switch to "Rinkeby" Ethereum Testnet via MetMask to interact with the DApp.
