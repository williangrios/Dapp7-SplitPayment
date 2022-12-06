//SPDX-License-Identifier: MIT

pragma solidity 0.8.6;

contract SplitPayment{

    address public owner;

    constructor(){
        owner = msg.sender;
    }

    function send(address payable[] memory to, uint[] memory amount ) onlyOwner() public payable {
        require( to.length == amount.length , "To and Amount array must have same length.");
        for (uint256 i = 0; i< to.length; i++){
            to[i].transfer(amount[i]);
        }
    }

    modifier onlyOwner(){
        require(msg.sender == owner, "You are not the owner");
        _;
    }

}