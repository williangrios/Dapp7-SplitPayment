import "bootstrap/dist/css/bootstrap.min.css";
import { useEffect, useState } from 'react';
import WRHeader from 'wrcomponents/dist/WRHeader';
import WRFooter from 'wrcomponents/dist/WRFooter';
import WRInfo from 'wrcomponents/dist/WRInfo';
import WRContent from 'wrcomponents/dist/WRContent';
import WRTools from 'wrcomponents/dist/WRTools';
import { ethers } from "ethers";
import './App.css';
import {ToastContainer, toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { _toEscapedUtf8String } from "ethers/lib/utils";

function App() {

  const [connected, setConnected] = useState(false);
  const [addressConnected, setAddressConnected] = useState('');
  const [to, setTo] = useState('');
  const [value, setValue] = useState('');
  const [totalValue, setTotalValue] = useState(0);
  const [listTo, setListTo] = useState([]);
  const [listAmount, setListAmount] = useState([]);

  const addressContract = '0x14dD69e10a3c1C26F03672A57670ED214dcbA3BA';

  const abi = [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "address payable[]",
          "name": "to",
          "type": "address[]"
        },
        {
          "internalType": "uint256[]",
          "name": "amount",
          "type": "uint256[]"
        }
      ],
      "name": "send",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function",
      "payable": true
    }
  ];

  let contractDeployed = null;
  let contractDeployedSigner = null;
  
  async function connectMetaMask (){
    if(typeof window.ethereum !== "undefined"){
        try
        {
            let resp = await window.ethereum.request({ method: "eth_requestAccounts" });
            setAddressConnected(resp[0]);
            setConnected(true)
            toastMessage("You are connected");
        }
        catch (error) {
            console.log(error);
            setConnected(false);
            toastMessage("Oops.. An error, sorry..");
        }
    }
    else {
        setConnected(false)
        toastMessage("Conect your metamask.")
      }
  }

  function getProvider(){
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    if (contractDeployed == null){
      contractDeployed = new ethers.Contract(addressContract, abi, provider)
    }
    if (contractDeployedSigner == null){
      contractDeployedSigner = new ethers.Contract(addressContract, abi, provider.getSigner());
    }
  }

  function toastMessage(text) {
    toast.info(text)  ;
  }

  function handleAdd(_to, _value){
    setListTo([...listTo, _to]);
    setListAmount([...listAmount, _value]);
    let total = parseInt(totalValue) + parseInt(_value);
    setValue('');
    setTo('');
    setTotalValue(total);
  }

  async function handleDeposit(){
    
    if (listTo.length==0){
      toastMessage("Add at least one address to the list.");
      return;
    }
    console.log(listTo.length);
    console.log(listAmount.length);
    console.log(addressConnected);
    getProvider();
    const resp = await contractDeployedSigner.send( listTo, listAmount, {from: addressConnected, value: (totalValue).toString()});
    toastMessage (`Deposited`);
    setListAmount([])
    setListTo([])
    setTotalValue(0);
  }

  return (
    <div className="App">
      <ToastContainer position="top-center" autoClose={5000}/>
      <WRHeader title="Split Payment" image={true} />
      <WRInfo chain="Goerli testnet" />
      <WRContent>

        {connected ? 
          <>
          <h2>Your address: {addressConnected}</h2>
          <h3>Add to list</h3>
          <input type="text" placeholder="Address to" onChange={(e) => setTo(e.target.value)} value={to}/>
          <input type="text" placeholder="Value" onChange={(e) => setValue(e.target.value)} value={value}/>
          <button onClick={() => handleAdd(to, value)}>Add in list</button>
          <hr/>
          <h3>Payment List</h3>
          {listTo.length !=0 ? <>
            <ul>
            {
              listTo.map((item, i) => (
                <li style={{listStyle: "none"}} key={i}>To: {listTo[i]}  /  Value: {listAmount[i]}</li>
              ))
            }
            </ul>
            <span>Total value: {totalValue}</span></>
            :
            <span>Empty List</span>
          }
          
          <hr/>
          <h3>Pay</h3>
          <button onClick={handleDeposit}>Deposit funds</button>        </>
        : <>
          <button onClick={connectMetaMask}>Connect your metamask</button>
        </>  
        }

       
       

      </WRContent>
      <WRTools react={true} truffle={true} bootstrap={true} solidity={true} css={true} javascript={true} ganache={true} ethersjs={true} />
      <WRFooter />    
    </div>
  );
}

export default App;
