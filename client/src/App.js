import React, { useState, useEffect } from 'react';
import { grommet, Box, Button, Heading, Grommet, Tabs, Tab } from 'grommet';
import Webcam from 'react-webcam'
import QRCode from 'qrcode.react'

import Web3 from "web3";

let web3
const setupWeb3 = async () => {
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    try { 
      await window.ethereum.enable()
      // User has allowed account access to DApp...
      web3.eth.defaultAccount = window.web3.eth.defaultAccount
      web3.eth.net.getNetworkType()
        .then(network => {
          if(network !== "rinkeby")
            alert("Please Switch to Rinkeby to use this DApp")
        });
    } catch(e) {
      // User has denied account access to DApp...
    }
  }
  // Legacy DApp Browsers
  else if (window.web3) {
    web3 = new Web3(window.web3.currentProvider);
    web3.eth.net.getNetworkType()
      .then(network => {
        if(network !== "rinkeby")
          alert("Please Switch to Rinkeby to use this DApp")
      });
  }
  // Non-DApp Browsers
  else {
    alert('You have to install MetaMask !');
  }
}

function App() {
  const [weight, setWeight] = useState()
  const [newMaskId, setNewMaskId] = useState()

  const [paymentDone, setPaymentDone] = useState()

  const webcamRef = React.useRef(null);
  const webcamRef2 = React.useRef(null);
  const webcamRef3 = React.useRef(null);
  const [imgSrc, setImgSrc] = React.useState(null);
  const [scanImgSrc, setScanImgSrc] = React.useState(null);
  const [scanImgSrc2, setScanImgSrc2] = React.useState(null);

  const capture = React.useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImgSrc(imageSrc);
  }, [webcamRef, setImgSrc]);

  const capture2 = React.useCallback(() => {
    const imageSrc = webcamRef2.current.getScreenshot();
    setScanImgSrc(imageSrc);
  }, [webcamRef2, setScanImgSrc]);

  const capture3 = React.useCallback(() => {
    const imageSrc = webcamRef3.current.getScreenshot();
    setScanImgSrc2(imageSrc);
  }, [webcamRef3, setScanImgSrc2]);

  const testTxn = () => {
    web3.eth.sendTransaction({
      from: web3.eth.defaultAccount,
      to: "0xA09aB1aBeCb91CaC38c3240912D2A1b31e22F147",
      value: window.web3.toWei(0.0000001, 'ether'),
      gasLimit: 21000, 
      gasPrice: 20000000000
    })
  }

  useEffect(() => {
      async function contractsSetup() {
        setupWeb3()
        // TODO initialize contracts here
      }
      contractsSetup()
    },[])

    const getMaskId = () => {
      testTxn()
      setInterval(() => {
        setNewMaskId(7)
      }, 15000);
    }

    return (
      <Grommet theme={grommet} full>
        <AppBar>
          <Heading level='1' style={{margin: "20px auto", letterSpacing:"5px"}}>Mask Chain</Heading>
          <Heading level='6' style={{margin: "0 auto"}}>| Verify your Masks on Blockchain using IoT</Heading>
        </AppBar>
        <Tabs style={{paddingTop: "30px", maxWidth:"75%", margin:"auto"}}>
          <Tab title="Manufacturer">
            <Box pad="medium">
            <Heading level='3'>Add New Mask</Heading>
              <input style={{fontSize: "1.5rem", borderRadius:"10px", padding: "15px"}} placeholder="Weight" type="text" value={weight} />
              <Button style={{padding: "18px", marginTop:"7px", maxWidth: "200px", marginBottom: "20px"}} primary label="Get Weight" onClick={()=>setWeight(21.233)}/>

              {!imgSrc && 
                <>
                  <Webcam 
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                  />
                  <Button style={{padding: "18px", marginTop:"7px", maxWidth: "200px"}} primary label="Capture Photo" onClick={capture}/>
                </>
              }
              {imgSrc && (
                <img
                  src={imgSrc}
                  width="500px"
                />
              )}
              <Button style={{padding: "18px", marginTop:"7px"}} primary label={newMaskId ? (`The MaskId is: ${newMaskId}`) : ("Add New Mask")} onClick={()=>getMaskId()}/>
              {
                newMaskId && 
                <QRCode
                  id="123456"
                  value={newMaskId}
                  size={290}
                  level={"H"}
                  includeMargin={true}
                />
              }
            </Box>
          </Tab>
          <Tab title="Transporter">
            <Box pad="medium">
              <Heading level='4'>Scan the QR Code:</Heading>
              {!scanImgSrc && 
                <>
                  <Webcam 
                    ref={webcamRef2}
                    screenshotFormat="image/jpeg"
                  />
                  <Button style={{padding: "18px", marginTop:"7px", maxWidth: "200px"}} primary label="Scan QR Code" onClick={capture2}/>
                </>
              }
              {scanImgSrc && (
                <>
                  <img
                    src={scanImgSrc}
                    width="500px"
                  />
                  <Heading level='4'>The Mask ID is 7</Heading>
                  <Button style={{padding: "18px", marginTop:"7px"}} primary label="Add to Blockchain" onClick={()=>testTxn()}/>
                </>
              )}
              
            </Box>
          </Tab>
          <Tab title="Buyer">
            <Box pad="medium">
              <Heading level='4'>Scan the QR Code:</Heading>
              {!scanImgSrc2 && 
                <>
                  <Webcam 
                    ref={webcamRef3}
                    screenshotFormat="image/jpeg"
                  />
                  <Button style={{padding: "18px", marginTop:"7px", maxWidth: "200px"}} primary label="Capture QR Code" onClick={capture3}/>
                </>
              }
              {scanImgSrc2 && (
                <>
                  <img
                    src={scanImgSrc2}
                    width="500px"
                  />
                  <Heading level='4'>The Mask ID is 7</Heading>
                  <b>Weight: 21.233 gm</b> <br />
                  <b>Manufacturer ID:</b> 4331, <b>Time:</b> 1:05am, <b>Location:</b> France <br /><br />
                  <b>Transporter ID:</b> 29, <b>Time:</b> 1:07am, <b>Location:</b> India <br />
                  <Button style={{padding: "18px", marginTop:"7px"}} primary label="Pay for Mask" onClick={()=>testTxn()}/>
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
    tag='header'
    direction='row'
    align='center'
    justify='between'
    background='brand'
    pad={{ left: 'medium', right: 'small', vertical: 'small' }}
    elevation='medium'
    style={{ zIndex: '1' }}
    {...props}
  />
);

export default App;
