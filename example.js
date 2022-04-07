import Web3 from 'web3';
import HDWalletProvider from '@truffle/hdwallet-provider';
import fs from 'fs';

var RequestJSON = './build/contracts/Polygonscan_Request.json';
var ResponseJSON = './build/contracts/Polygonscan_Response.json';

const RequestContract = JSON.parse(fs.readFileSync(RequestJSON));
const ResponseContract = JSON.parse(fs.readFileSync(ResponseJSON));

//Add wallet mnenomnic to environment - uncomment to use
//const mnemonic = fs.readFileSync(".secret").toString().trim();

//Add wallet mnenomnic as environment variable ($env:process.env.WALLET_MNEMONIC) - comment to use .secret
const mnemonic = process.env.WALLET_MNEMONIC.toString().trim();
const walletProvider = new HDWalletProvider(mnemonic, "https://rpc-mainnet.matic.network");


const init = async () => {
	try {

		let web3_wallet = new Web3(walletProvider);
		let web3 = new Web3(new Web3.providers.WebsocketProvider('wss://rpc-mainnet.matic.network'));
		const addresses = await web3_wallet.eth.getAccounts();

		const requestContract = new web3_wallet.eth.Contract(RequestContract.abi, '0x29cb522462F0c100e23C1562a4979F293e2db71c');
		const responseContract = new web3.eth.Contract(ResponseContract.abi, '0x8726E7f2B75bC3C2F6993ABc612672169b0Fb2EE');

		//Send request to Oracle		
		await requestContract.methods.sendPolygonscanParams("contract","getabi","0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270").send({
			from: addresses[0],
			gasPrice: 35000000000,
			value: "10000000000000000"
		});

		//Await for response from Oracle then prints result
		responseContract.events.polygonscanData({})
			.on('data', function (event) {
				console.log(event);
			}).on('error', console.error)


	} catch (error) {
		console.error(error);

	}
}

init();