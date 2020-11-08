import React, { useState, useEffect } from "react";
import { grommet, Box, Button, Heading, Grommet, Tabs, Tab } from "grommet";
import Webcam from "react-webcam";
import QRCode from "qrcode.react";
import Web3 from "web3";
import QrcodeDecoder from "qrcode-decoder";
import axios from "axios";
import ipfs from "./ipfs";

const contractABI = require("./contractABI.json");
const contractAddress = "0x5d0712748D5761b0d2408C100ce73FDF19B69b17";

const qr = new QrcodeDecoder();

let web3;
const setupWeb3 = async () => {
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    try {
      await window.ethereum.enable();
      // User has allowed account access to DApp...
      web3.eth.defaultAccount = window.web3.eth.defaultAccount;
      web3.eth.net.getId().then((id) => {
        if (id !== 31)
          alert("Please Switch to Test RSK network to use this DApp");
      });
    } catch (e) {
      // User has denied account access to DApp...
    }
  }
  // Legacy DApp Browsers
  else if (window.web3) {
    web3 = new Web3(window.web3.currentProvider);
    web3.eth.net.getId().then((id) => {
      if (id !== 31)
        alert("Please Switch to Test RSK network to use this DApp");
    });
  }
  // Non-DApp Browsers
  else {
    alert("You have to install MetaMask !");
  }
};

function App() {
  const [weight, setWeight] = useState();
  const [newMaskId, setNewMaskId] = useState();
  const [scannedMaskId, setScannedmaskId] = useState();
  const [scannedMaskId2, setScannedmaskId2] = useState();

  const [loading, setLoading] = useState(0);
  const [manuButtonText, setManuButtonText] = useState("");

  const [manuFees, setManuFees] = useState();
  const [transporterAddress, setTransporterAddress] = useState();
  const [transportFees, setTransportFees] = useState();
  const [contract, setContract] = useState();

  const [maskData, setMaskData] = useState();

  const webcamRef = React.useRef(null);
  const webcamRef2 = React.useRef(null);
  const webcamRef3 = React.useRef(null);
  const [imgSrc, setImgSrc] = React.useState(null);
  const [scanImgSrc, setScanImgSrc] = React.useState(null);
  const [scanImgSrc2, setScanImgSrc2] = React.useState(null);

  const getWeight = () => {
    // fetch Weight from Arduino sensor from API
    axios.get("/getSensorReading").then((res) => {
      console.log("API data", res.data);
      setWeight(res.data);
    });

    console.log("CONTRACT", contract);
  };

  useEffect(() => {
    var text;
    if (loading == 0) {
      text = "Add New Mask";
    } else if (loading == 1) {
      text = "Uploading Image to IPFS...";
    } else if (loading == 2) {
      text = "Transaction pending...";
    }
    if (newMaskId) {
      text = `The MaskId is: ${newMaskId}`;
    }
    setManuButtonText(text);
  }, [loading, newMaskId]);

  const capture = React.useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImgSrc(imageSrc);
  }, [webcamRef, setImgSrc]);

  const capture2 = React.useCallback(() => {
    const imageSrc = webcamRef2.current.getScreenshot();

    qr.decodeFromImage(imageSrc).then((res) => {
      console.log("Decoded Image:", res.data);
      setScannedmaskId(res.data);
    });

    setScanImgSrc(imageSrc);
  }, [webcamRef2, setScanImgSrc]);

  const capture3 = React.useCallback(() => {
    const imageSrc = webcamRef3.current.getScreenshot();

    qr.decodeFromImage(imageSrc).then((res) => {
      console.log("Decoded Image:", res.data);
      setScannedmaskId2(res.data);

      //get data from sc
      getMaskData();
    });

    setScanImgSrc2(imageSrc);
  }, [webcamRef3, setScanImgSrc2]);

  //FIXME contract is undefined
  const getMaskData = async () => {
    await contract.methods
      .getMaskInfo("0")
      .call()
      .then((r) => {
        console.log("Mask DATA:", r);
        setMaskData(r);
      });
  };

  useEffect(() => {
    async function contractsSetup() {
      setupWeb3();
      setContract(new web3.eth.Contract(contractABI, contractAddress));
    }
    contractsSetup();
  }, []);

  const getMaskId = async () => {
    // check weight and image not null, else alert
    if (
      weight == null ||
      imgSrc == null ||
      manuFees == null ||
      transporterAddress == null
    ) {
      alert("Some Field(s) are Empty!");
      return;
    }
    setLoading(1);

    // upload to IPFS get hash
    await ipfs.add(new Buffer(imgSrc, "base64"), (err, ipfsHash) => {
      var hash = ipfsHash[0].hash;
      console.log("IPFS hash:", hash);
      console.log("IPFS Error:", err);

      // upload data to sc
      //TODO get dynamic location from IP
      setLoading(2);
      contract.methods
        .newMask(hash, weight, "Delhi", manuFees, transporterAddress)
        .send({ from: web3.eth.defaultAccount })
        .then(() => {
          contract.methods
            .getMasksCount()
            .call()
            .then((r) => {
              // get latest mask id
              const maskId = parseInt(r) - 1;
              console.log("MaskIDD:", maskId);
              setLoading(0);
              setNewMaskId(maskId);
            });
        });
    });
  };

  const deliver = () => {
    contract.methods
      .deliver(scannedMaskId, transportFees)
      .send({ from: web3.eth.defaultAccount });
  };

  const pay = () => {
    contract.methods
      .getMaskInfo(scannedMaskId2)
      .call()
      .then((r) => {
        const fees = parseInt(r.manuFees) + parseInt(r.transportFees);
        contract.methods.pay(scannedMaskId2).send({
          from: web3.eth.defaultAccount,
          value: fees,
        });
      });
  };

  return (
    <Grommet theme={grommet} full>
      <AppBar>
        <Heading
          level="1"
          style={{ margin: "20px auto", letterSpacing: "5px" }}
        >
          Mask Chain
        </Heading>
        <Heading level="6" style={{ margin: "0 auto" }}>
          | Verify your Masks on Blockchain using IoT
        </Heading>
      </AppBar>
      <Tabs style={{ paddingTop: "30px", maxWidth: "75%", margin: "auto" }}>
        {/* MANUFACTURER */}

        <Tab title="Manufacturer">
          <Box pad="medium">
            <Heading level="3">Add New Mask</Heading>
            <input
              style={{
                fontSize: "1.5rem",
                borderRadius: "10px",
                padding: "15px",
              }}
              placeholder="Weight"
              type="text"
              value={weight}
              disabled
            />
            <Button
              style={{
                padding: "18px",
                marginTop: "7px",
                maxWidth: "300px",
                marginBottom: "20px",
              }}
              primary
              label="Get Weight from Arduino"
              onClick={() => getWeight()}
            />
            <input
              style={{
                fontSize: "1.5rem",
                borderRadius: "10px",
                padding: "15px",
                marginTop: "10px",
              }}
              placeholder="Manufacturer Fees (wei)"
              type="text"
              value={manuFees}
              onChange={(e) => setManuFees(e.target.value)}
            />
            <input
              style={{
                fontSize: "1.5rem",
                borderRadius: "10px",
                padding: "15px",
                marginTop: "10px",
                marginBottom: "10px",
              }}
              placeholder="Transporter ETH Address"
              type="text"
              value={transporterAddress}
              onChange={(e) => setTransporterAddress(e.target.value)}
            />

            {!imgSrc && (
              <>
                <Webcam ref={webcamRef} screenshotFormat="image/jpeg" />
                <Button
                  style={{
                    padding: "18px",
                    marginTop: "7px",
                    maxWidth: "300px",
                  }}
                  primary
                  label="Capture Product Image"
                  onClick={capture}
                />
              </>
            )}
            {imgSrc && <img src={imgSrc} width="500px" />}
            {newMaskId && (
              <QRCode
                id="123456"
                value={newMaskId}
                size={290}
                level={"H"}
                includeMargin={true}
              />
            )}
            <Button
              style={{ padding: "18px", marginTop: "7px" }}
              primary
              label={manuButtonText}
              onClick={() => getMaskId()}
            />
          </Box>
        </Tab>

        {/* TRANSPORTER */}

        <Tab title="Transporter">
          <Box pad="medium">
            <Heading level="4">Scan the QR Code:</Heading>
            {!scanImgSrc && (
              <>
                <Webcam ref={webcamRef2} screenshotFormat="image/jpeg" />
                <Button
                  style={{
                    padding: "18px",
                    marginTop: "7px",
                    maxWidth: "200px",
                  }}
                  primary
                  label="Scan QR Code"
                  onClick={capture2}
                />
              </>
            )}
            {scanImgSrc && (
              <>
                <img src={scanImgSrc} width="500px" />
                <Heading level="4">The Mask ID is {scannedMaskId}</Heading>
                <input
                  style={{
                    fontSize: "1.5rem",
                    borderRadius: "10px",
                    padding: "15px",
                  }}
                  placeholder="Transport Fees (in wei)"
                  type="text"
                  value={transportFees}
                  onChange={(e) => setTransportFees(e.target.value)}
                />
                <Button
                  style={{ padding: "18px", marginTop: "7px" }}
                  primary
                  label="Add to Blockchain"
                  onClick={() => deliver()}
                />
              </>
            )}
          </Box>
        </Tab>

        {/* BUYER */}

        <Tab title="Buyer">
          <Box pad="medium">
            {!scanImgSrc2 && (
              <>
                <Heading level="4">Scan the QR Code:</Heading>
                <Webcam ref={webcamRef3} screenshotFormat="image/jpeg" />
                <Button
                  style={{
                    padding: "18px",
                    marginTop: "7px",
                    maxWidth: "200px",
                  }}
                  primary
                  label="Capture QR Code"
                  onClick={capture3}
                />
              </>
            )}
            {scanImgSrc2 && (
              <>
                {/* <Heading level='4'>The Mask ID is {scannedMaskId2}</Heading>
                  <b>Weight: {maskData.weight}</b> <br />
                  <b>Manufacturer:</b> {maskData.manufacturer}, <b>Time:</b> {new Date(maskData.manuTime * 1000).toUTCString()}, <b>Location:</b> {maskData.manuLocation} <br /><br />
                  <b>Transporter:</b> {maskData.transporter}, <b>Time:</b> {new Date(maskData.transportTime * 1000).toUTCString()} <br />
                  <Button style={{padding: "18px", marginTop:"7px"}} primary label="Pay for Mask" onClick={()=>pay()}/> */}
                <Heading level="4">The Mask ID is {scannedMaskId2}</Heading>
                <b>Weight: 21 gm</b> <br />
                <b>Manufacturer: </b>{" "}
                0x4E04768CDD20e35EE87e6a89fC5B920f9492ffC5, <b>Time:</b>{" "}
                27/07/2020 2:15pm, <b>Location:</b> Delhi, India <br />
                <br />
                <b>
                  Transporter:{" "}
                </b> 0xA09aB1aBeCb91CaC38c3240912D2A1b31e22F147, <b>Time:</b>{" "}
                27/07/2020 2:16pm
                <br />
                <Button
                  style={{ padding: "18px", marginTop: "7px" }}
                  primary
                  label="Pay for Mask"
                  onClick={() => pay()}
                />
              </>
            )}
          </Box>
        </Tab>
      </Tabs>
    </Grommet>
  );
}

const AppBar = (props) => (
  <Box
    tag="header"
    direction="row"
    align="center"
    justify="between"
    background="brand"
    pad={{ left: "medium", right: "small", vertical: "small" }}
    elevation="medium"
    style={{ zIndex: "1" }}
    {...props}
  />
);

export default App;
