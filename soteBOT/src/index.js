require('dotenv').config();
const HDWalletProvider = require('@truffle/hdwallet-provider');
const Web3 = require('web3');
const log = require('./log');
const NexusContractLoader = require('./nexus-contract-loader');
const { sleep, getEnv,toBN,toHex } = require('./utils');
const { getGasPrice, SPEED } = require('./gas-price');

const GWEI_IN_WEI = 1e9;

const PRIVATE_KEY = getEnv(`PRIVATE_KEY`);
const PROVIDER_URL = getEnv(`PROVIDER_URL`);
const POLL_INTERVAL_MILLIS = parseInt(getEnv(`POLL_INTERVAL_MILLIS`));
const DEFAULT_ITERATIONS = parseInt(getEnv(`DEFAULT_ITERATIONS`));
const MAX_GAS = parseInt(getEnv(`MAX_GAS`));
const MAX_GAS_PRICE_GWEI = parseInt(getEnv(`MAX_GAS_PRICE_GWEI`));
const NETWORK = getEnv('NETWORK', 'mainnet').toLowerCase();
const versionDataURL = getEnv(`version_Data`);

const MAX_GAS_PRICE = MAX_GAS_PRICE_GWEI * GWEI_IN_WEI;

// PoolStaking触发
async function init () {
  log.info(`Using MAX_GAS_PRICE of ${MAX_GAS_PRICE}`);

  log.info(`Connecting to node at ${PROVIDER_URL}.`);
  const web3 = new Web3(PROVIDER_URL);
  await web3.eth.net.isListening();
  const provider = new HDWalletProvider(PRIVATE_KEY, PROVIDER_URL);

  const [address] = provider.getAddresses();

  const startBalance = await web3.eth.getBalance(address);
  log.info(`Using first address ${address} for sending transactions. Current ETH balance: ${startBalance}`);
  log.info(`Loading latest master address for chain ${NETWORK} from ${versionDataURL}`);

  const nexusContractLoader = new NexusContractLoader(NETWORK, versionDataURL, provider, address);
  await nexusContractLoader.init();
  const pooledStaking = nexusContractLoader.instance('PS');

  while (true) {
    await sleep(100000);
    try {
      const hasPendingActions = await pooledStaking.hasPendingActions();

      if (!hasPendingActions) {
        log.info(`No pending actions present. Sleeping for ${POLL_INTERVAL_MILLIS} before checking again.`);
        await sleep(POLL_INTERVAL_MILLIS);
        continue;
      }

      log.info(`Has pending actions. Processing..`);
      const { gasEstimate, iterations } = await getGasEstimateAndIterations(pooledStaking, DEFAULT_ITERATIONS, MAX_GAS);
      const gasPrice = toBN('20000000000');

      if (gasPrice > MAX_GAS_PRICE) {
        log.warn(`Gas price ${gasPrice} exceeds MAX_GAS_PRICE=${MAX_GAS_PRICE}. Not executing the the transaction at this time.`);
        await sleep(POLL_INTERVAL_MILLIS);
        continue;
      }

      const increasedGasEstimate = Math.floor(gasEstimate * 1.3);
      const nonce = await web3.eth.getTransactionCount(address);
      log.info(JSON.stringify({ iterations, gasEstimate, increasedGasEstimate, gasPrice, nonce }));

      const tx = await pooledStaking.processPendingActions(iterations, {
        gas: increasedGasEstimate,
        gasPrice,
        nonce,
      });

      log.info(`Gas used: ${tx.receipt.gasUsed}.`);

    } catch (e) {
      log.error(`Failed to handle pending actions: ${e.stack}`);
      await sleep(POLL_INTERVAL_MILLIS);
    }
  }
}

async function getGasEstimateAndIterations (pooledStaking, defaultIterations, maxGas) {
  let iterations = defaultIterations;
  let gasEstimate;
  while (true) {
    try {
      log.info(`Estimating gas for iterations=${iterations} and maxGas=${maxGas}`);
      gasEstimate = await pooledStaking.processPendingActions.estimateGas(iterations, { gas: maxGas });
    } catch (e) {
      if (e.message.includes('base fee exceeds gas limit')) {
        log.info(`Gas estimate exceeds MAX_GAS=${maxGas}. Halving iterations amount..`);
        iterations = Math.floor(iterations / 2);
        continue;
      } else {
        throw e;
      }
    }

    return {
      gasEstimate,
      iterations,
    };
  }
}

init().catch(error => {
  log.error(`Unhandled app error: ${error.stack}`);
  process.exit(1);
});

function getNowFormatDate() {
  var date = new Date();
  var seperator1 = "";
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var strDate = date.getDate();
  if (month >= 1 && month <= 9) {
      month = "0" + month;
  }
  if (strDate >= 0 && strDate <= 9) {
      strDate = "0" + strDate;
  }
  var currentdate = year + seperator1 + month + seperator1 + strDate;
  return currentdate;
}

// 每天10点提交mcr
async function mcr() {
  log.info(`Using MAX_GAS_PRICE of ${MAX_GAS_PRICE}`);

  log.info(`Connecting to node at ${PROVIDER_URL}.`);
  const web3 = new Web3(PROVIDER_URL);
  await web3.eth.net.isListening();
  const provider = new HDWalletProvider(PRIVATE_KEY, PROVIDER_URL);

  const [address] = provider.getAddresses();

  const startBalance = await web3.eth.getBalance(address);
  log.info(`Using first address ${address} for sending transactions. Current ETH balance: ${startBalance}`);
  log.info(`Loading latest master address for chain ${NETWORK} from ${versionDataURL}`);

  const nexusContractLoader = new NexusContractLoader(NETWORK, versionDataURL, provider, address);
  await nexusContractLoader.init();
  const mcrInst = nexusContractLoader.instance('MC');
  const pdInst = nexusContractLoader.instance('PD');
  
  try {
    const minCap = await pdInst.minCap();
    
    const sum = await mcrInst.getAllSumAssurance();

    //bnb 30000
    var bnb7000 = toBN('30000000000000000000000');
    var mcrdata =await mcrInst.calVtpAndMCRtp();
    log.info(`mcr data ${mcrdata[0].toString()} from ${mcrdata[1].toString()}`);
    if(mcrdata[0].gt(bnb7000)){
      bnb7000 = mcrdata[0];
    }

    var threshold = await mcrInst.getThresholdValues(mcrdata[0].toString(),bnb7000,sum.toString(),minCap.toString());
    // log.info(JSON.stringify(`${threshold.lowerThreshold}   ${threshold.upperThreshold}`));

    var lowTh = parseInt(threshold.lowerThreshold.toString())+1;
    // log.info(JSON.stringify(`${lowTh}`));
    var gasEstimate = await mcrInst.addMCRData.estimateGas(lowTh.toString(), mcrdata[0].toString(), bnb7000, [toHex('BNB')], [100], getNowFormatDate(), { gas: MAX_GAS });
    const gasPrice = toBN('20000000000');

    const increasedGasEstimate = Math.floor(gasEstimate * 1.3);
    const nonce = await web3.eth.getTransactionCount(address);
    log.info(JSON.stringify({ gasEstimate, increasedGasEstimate, gasPrice, nonce }));

    const tx = await mcrInst.addMCRData(lowTh.toString(), mcrdata[0].toString(), bnb7000, [toHex('BNB')], [100], getNowFormatDate(),{
      gas: increasedGasEstimate,
      gasPrice,
      nonce,
    });

    log.info(`Gas used: ${tx.receipt.gasUsed}.`);

  } catch (e) {
    log.error(`Failed to handle mcr post: ${e.stack}`);
  }
  
}

var schedule = require('node-schedule');
function scheduleCronstyle(){
  // 每天10点定时提交MCR数据
  schedule.scheduleJob('00 00 22 * * *',function(){
    mcr().catch(error => {
      log.error(`Unhandled app error: ${error.stack}`);
      process.exit(1);
    });
  });
  
};
  
scheduleCronstyle();

// trigger
async function trigger() {
  log.info(`Using MAX_GAS_PRICE of ${MAX_GAS_PRICE}`);

  log.info(`Connecting to node at ${PROVIDER_URL}.`);
  const web3 = new Web3(PROVIDER_URL);
  await web3.eth.net.isListening();
  const provider = new HDWalletProvider(PRIVATE_KEY, PROVIDER_URL);

  const [address] = provider.getAddresses();

  const startBalance = await web3.eth.getBalance(address);
  log.info(`Using first address ${address} for sending transactions. Current ETH balance: ${startBalance}`);
  log.info(`Loading latest master address for chain ${NETWORK} from ${versionDataURL}`);

  const nexusContractLoader = new NexusContractLoader(NETWORK, versionDataURL, provider, address);
  await nexusContractLoader.init();
  const pdInst = nexusContractLoader.instance('PD');
  const maInst = nexusContractLoader.instance('NXMASTER');
  const clInst = nexusContractLoader.instance('CL');
  
  while(true){
    await sleep(100000);
    try {
      
        const len = await pdInst.getApilCallLength();
        // log.info(`address ${pdInst.address.toString()}.`);
        // log.info(`len ${len.toString()}.`);
        for (let index = 0; index < len; index++) {
          var callid = await pdInst.allAPIcall(index);
          log.info(`api call id: ${callid.toString()}.`);

          var apicall = await pdInst.allAPIid(callid.toString());
          log.info(`api call type: ${apicall[0].toString()}.`);

          const cov = "0x434f5600";
          const cla = "0x434c4100";
          const mcrf = "0x4d435246";
          // cov == apicall[0].toString() ||
          if(cov == apicall[0].toString() || cla == apicall[0].toString() || mcrf == apicall[0].toString()){
            // log.info(`time : ${apicall[3].toString()}.${apicall[4].toString()}`);
            if(apicall[3].toString() == apicall[4].toString()){
              try {
                if(cla == apicall[0].toString()){
                  const isClose = await clInst.checkVoteClosing(apicall[2].toString());
                  if(isClose.toString() != 1){
                    continue;
                  }
                }

                const gasEstimate = await maInst.delegateCallBack.estimateGas(callid, { gas: MAX_GAS })
                
                const increasedGasEstimate = Math.floor(gasEstimate * 1.3);
                const gasPrice = '20000000000';
                const nonce = await web3.eth.getTransactionCount(address);
                const tx = await maInst.delegateCallBack(callid, {
                  gas: increasedGasEstimate,
                  gasPrice,
                  nonce,
                });

                log.info(`Gas used: ${tx.receipt.gasUsed}.`);
              } catch (error) {
                log.error(`Failed to handle trigger gasEstimate apiid: ${callid.toString()}`);
                continue;
              }
              
              
            }
          }
        }
      

    } catch (e) {
      log.error(`Failed to handle trigger post: ${e.stack}`);
    }
  }
  
}

trigger().catch(error => {
  log.error(`Unhandled app error: ${error.stack}`);
  process.exit(1);
});