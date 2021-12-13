pragma solidity >=0.8.0 <0.9.0;
//SPDX-License-Identifier: MIT

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
// import "@openzeppelin/contracts/access/Ownable.sol"; 
// https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol

contract YourContract {

  // event SetPurpose(address sender, string purpose);

  struct Profile {
        string name;
        string[3] images;
        string bio;
        uint256 created_ts;
        uint256 deleted_ts;
    }

    struct Message {
        string text;
        address sender;
        bool isPublic;
        uint256 created_ts;
        uint256 deleted_ts;
    }

    struct PublicMessage {
        Message message;
        uint256 votes;
        address author;
    }

    mapping(address => Profile) private _profiles; // profile for an address
    mapping(address => address[]) private _swipedAddresses; // addresses swiped on by address
    mapping(address => address[]) private _swipedRightAddresses; // addresses swiped right on by address
    mapping(address => address[]) private _matches; // addresses matched by address
    mapping(string => Message[]) private _messages; // message history by address pair concatenated into a string

    IERC20 private tinderCoin;

    PublicMessage[] private publicMessages; // list of public messages

  string public purpose = "Building Unstoppable Apps!!!";

  constructor() {
    // what should we do on deploy?
  }

  function setPurpose(string memory newPurpose) public {
      purpose = newPurpose;
      console.log(msg.sender,"set purpose to",purpose);
      // emit SetPurpose(msg.sender, purpose);
  }
}
