import Web3 from "web3";


//testing contract
const SplitPayment = artifacts.require("SplitPayment");

contract("SplitPayment", (accounts) => {

    let splitPayment = null;

    before(async() =>{
        splitPayment = await SplitPayment.deployed();
    })


    it ("Should SUCCESS to split payment", async () => {
        const recipients = [
            accounts[1],
            accounts[2],
            accounts[3],
        ]
        const amountsRecipients = [
            40, 10, 20
        ]

        const initialBalances = await Promisse.all(
            recipients.map( recipient => {
                return web3.eth.getBalance(recipient)})
        ) 

        await splitPayment.send(recipients, amountsRecipients, {from: accounts[0], value: 90});

        const finalBalances = await Promisse.all(
            recipients.map( recipient => {
                return web3.eth.getBalance(recipient)})
        );
        
        recipients.forEach((_item, i) => {
            const finalBalance = web3.utils.toBN(finalBalances[i]);
            const initialBalance = web3.utils.toBN(inicialBalances[i]);
            assert(finalBalance.sub(initialBalance).toNumber() === amounts[i]);
        })

    })

    it ("Should FAIL to split payment if array length mismatch", async () => {
        const recipients = [
            accounts[1],
            accounts[2],
            accounts[3],
        ]
        const amountsRecipients = [
            40, 10
        ]  
        try {
            await splitPayment.send(recipients, amountsRecipients, {from: accounts[0], value: 90});    
        } catch (error) {
            assert(e.message.includes("To and Amount array must have same length."));
            return;
        }   
        assert(false);
    })

    it ("Should FAIL to split payment if caller is not the owner", async () => {
        async() =>{
  
            const recipients = [
                accounts[1],
                accounts[2],
                accounts[3],
            ]
            const amountsRecipients = [
                40, 10, 20
            ]
    
            try {
                await splitPayment.send(recipients, amountsRecipients, {from: accounts[5], value: 90});    
            } catch (error) {
                assert(e.message.includes("You are not the owner"));
                return;
            }
            assert(false);
        }
    })
})