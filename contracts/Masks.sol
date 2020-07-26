pragma solidity ^0.6.6;

// "SPDX-License-Identifier: MIT"
// @description Smart Contract for "Mask Chain"
// @author Apoorv Lathey

contract Masks {
    // Mask Details
    struct Mask {
        uint256 maskID;
        string imageIPFS;
        
        address manufacturer;
        uint256 manuTime;
        string manuLocation;
        uint256 manuFees;
        
        address transporter;
        uint256 transportTime;
        uint256 transportFees;
        
        address buyer;
        bool payementDone;
    }
    
    // Store Masks Details
    Mask[] public masks;
    
    // Manufacturer Registers New Mask
    function newMask(string calldata _imageIPFS, string calldata _manuLocation, uint256 _manuFees, address _transporter) external {
        Mask memory m = Mask(masks.length, _imageIPFS, msg.sender, now, _manuLocation, _manuFees, _transporter, 0, 0, address(0), false);
        
        masks.push(m);
    }
    
    // Transporter confirms delivery
    function deliver(uint256 _maskID, uint256 _transportFees) external {
        // can only be called by authorized transporter
        require(masks[_maskID].transporter == msg.sender, "Err: Not Authorized");
        
        masks[_maskID].transportTime = _transportFees;
        masks[_maskID].transportFees = _transportFees;
    }
    
    function pay(uint256 _maskID) external payable {
        // check payment is for correct amount
        require(msg.value == masks[_maskID].manuFees + masks[_maskID].transportFees, "Err: Incorrect Amount");
        
        // Pay to respective addresses of Manufacturer and Transporter
        (bool success1, ) = masks[_maskID].manufacturer.call{value: masks[_maskID].manuFees}("");
        (bool success2, ) = masks[_maskID].transporter.call{value: masks[_maskID].transportFees}("");
        
        require(success1 && success2, "Err: Transferring Funds");
        masks[_maskID].payementDone = true;
    }
    
    function getMasksCount() external view returns(uint256) {
        return masks.length;
    }
    
}