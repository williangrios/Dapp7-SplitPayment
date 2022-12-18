import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";
import './App.css';

import {  useState, useEffect } from 'react';
import { ethers } from "ethers";
import {ToastContainer, toast} from "react-toastify";

import WRHeader from 'wrcomponents/dist/WRHeader';
import WRFooter from 'wrcomponents/dist/WRFooter';
import WRInfo from 'wrcomponents/dist/WRInfo';
import WRContent from 'wrcomponents/dist/WRContent';
import WRTools from 'wrcomponents/dist/WRTools';


function App() {

  const [connected, setConnected] = useState(false);
  const [addressConnected, setAddressConnected] = useState('');
  const [to, setTo] = useState('');
  const [value, setValue] = useState('');
  const [totalValue, setTotalValue] = useState(0);
  const [listTo, setListTo] = useState([]);
  const [listAmount, setListAmount] = useState([]);
  const [userAccount, setUserAccount] = useState('');

  const contractAddress = '0x96CDa6BcCE4d44964Ce597e073A14F0DbfdbbFF8';

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

  async function getProvider(connect = false){
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      if (contractDeployed == null){
        contractDeployed = new ethers.Contract(contractAddress, abi, provider)
      }
      if (contractDeployedSigner == null){
        contractDeployedSigner = new ethers.Contract(contractAddress, abi, provider.getSigner());
      }
      if (connect && userAccount==''){
        let userAcc = await provider.send('eth_requestAccounts', []);
        setUserAccount(userAcc[0]);
      }  
    } catch (error) {
      toastMessage(error.reason)
    }
  }

  useEffect(() => {
    getData()
  }, [])

  async function getData(connect = false) {
    await getProvider(connect);
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

    await getProvider(true);

    try {
        const resp = await contractDeployedSigner.send( listTo, listAmount, {from: addressConnected, value: (totalValue).toString()});
        toastMessage (`Deposited`);
        setListAmount([])
        setListTo([])
        setTotalValue(0);
      } catch (error) {
        toastMessage(error.reason);
      }

  }

  return (
    <div className="App">
      <ToastContainer position="top-center" autoClose={5000}/>
      <WRHeader title="Split Payment" image={true} />
      <WRInfo chain="Goerli testnet" />
      <WRContent>

        {userAccount != '' ? 
          <>
          <h2>Your address: {addressConnected}</h2>
          <h3>Add to list</h3>
          <input type="text" className="col-3" placeholder="Address to" onChange={(e) => setTo(e.target.value)} value={to}/>
          <input type="number" className="mb-1 col-3" placeholder="Value" onChange={(e) => setValue(e.target.value)} value={value}/>
          <button className="btn btn-primary col-3" onClick={() => handleAdd(to, value)}>Add in list</button>
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
            <label>Total value: {totalValue}</label></>
            :
            <label>Empty List</label>
          }
          
          <hr/>
          <h3>Pay</h3>
          <button className="btn btn-primary col-3" onClick={handleDeposit}>Deposit funds</button>        </>
        : <>
          <button className="btn btn-primary col-3" onClick={getData}>Start</button>
        </>  
        }
      </WRContent>
      <WRTools react={true} truffle={true} bootstrap={true} solidity={true} css={true} javascript={true} ganache={true} ethersjs={true} />
      <WRFooter />    
    </div>
  );
}

export default App;