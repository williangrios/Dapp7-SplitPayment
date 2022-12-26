import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";
import './App.css';

import {  useState, useEffect } from 'react';
import { ethers } from "ethers";
import {ToastContainer, toast} from "react-toastify";

import WRHeader from 'wrcomponents/dist/WRHeader';
import WRFooter, { async } from 'wrcomponents/dist/WRFooter';
import WRInfo from 'wrcomponents/dist/WRInfo';
import WRContent from 'wrcomponents/dist/WRContent';
import WRTools from 'wrcomponents/dist/WRTools';
import Button from "react-bootstrap/Button";

import { format6FirstsAnd6LastsChar } from "./utils";
import meta from "./assets/metamask.png";

function App() {
  
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState({});
  const [provider, setProvider] = useState();
  const [signer, setSigner] = useState();

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

  async function handleConnectWallet (){
    try {
      setLoading(true)
      let prov =  new ethers.providers.Web3Provider(window.ethereum);
      setProvider(prov);

      let userAcc = await prov.send('eth_requestAccounts', []);
      setUser({account: userAcc[0], connected: true});

      const contrSig = new ethers.Contract(contractAddress, abi, prov.getSigner())
      setSigner( contrSig)

    } catch (error) {
      toastMessage(error.reason)
    } finally{
      setLoading(false);
    }
  }

  useEffect(() => {
    
    async function getData() {
      try {
        const {ethereum} = window;
        if (!ethereum){
          toastMessage('Metamask not detected');
        }
  
        const goerliChainId = "0x5";
        const currentChainId = await window.ethereum.request({method: 'eth_chainId'})
        if (goerliChainId != currentChainId){
          toastMessage('Change to goerli testnet')
        }    
      } catch (error) {
        toastMessage(error.reason)        
      }
      
    }

    getData()  
    
  }, [])
  
  async function isConnected(){
    if (!user.connected){
      toastMessage('You are not connected!')
      return false;
    }
    return true;
  }

  async function handleDisconnect(){
    try {
      setUser({});
      setSigner(null);
      setProvider(null);
    } catch (error) {
      toastMessage(error.reason)
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

    try {
      if (!isConnected()) {
        return;
      }
      setLoading(true);
      const resp = await signer.send( listTo, listAmount, {from: userAccount, value: (totalValue).toString()});
      await resp.wait();
      toastMessage (`Deposited`);
      setListAmount([])
      setListTo([])
      setTotalValue(0);
    } catch (error) {
      toastMessage(error.reason);
    } finally{
      setLoading(false);
    }

  }

  return (
    <div className="App">
      <ToastContainer position="top-center" autoClose={5000}/>
      <WRHeader title="Split Payment" image={true} />
      <WRInfo chain="Goerli testnet" />
      <WRContent>

        <h1>SPLIT PAYMENT</h1>

        {loading && 
          <h1>Loading....</h1>
        }
        { !user.connected ?<>
            <Button className="commands" variant="btn btn-primary" onClick={handleConnectWallet}>
              <img src={meta} alt="metamask" width="30px" height="30px"/>Connect to Metamask
            </Button></>
          : <>
            <label>Welcome {format6FirstsAnd6LastsChar(user.account)}</label>
            <button className="btn btn-primary commands" onClick={handleDisconnect}>Disconnect</button>
          </>
        }
        <hr/>
        {user.connected  && 
          <>
          <h2>Your address: { format6FirstsAnd6LastsChar( user.account)}</h2>
          <h3>Add to list</h3>
          <input type="text" className="commands" placeholder="Address to" onChange={(e) => setTo(e.target.value)} value={to}/>
          <input type="number" className="commands" placeholder="Value" onChange={(e) => setValue(e.target.value)} value={value}/>
          <button className="btn btn-primary commands" onClick={() => handleAdd(to, value)}>Add in list</button>
          <hr/>
          <h3>Payment List</h3>
          {listTo.length !=0 ? <>
            <ul>
            {
              listTo.map((item, i) => (
                <li style={{listStyle: "none"}} key={i}>To: {format6FirstsAnd6LastsChar( listTo[i])}  /  Value: {listAmount[i]}</li>
              ))
            }
            </ul>
            <label>Total value: {totalValue}</label></>
            :
            <label>Empty List</label>
          }
          
          <hr/>
          <h3>Pay</h3>
          <button className="btn btn-primary commands" onClick={handleDeposit}>Deposit funds</button>        </>
        }
      </WRContent>
      <WRTools react={true} truffle={true} bootstrap={true} solidity={true} css={true} javascript={true} ganache={true} ethersjs={true} />
      <WRFooter />    
    </div>
  );
}

export default App;