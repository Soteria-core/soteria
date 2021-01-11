const { toHex, ether } = require('../test/utils/ethTools');
const assert = require('assert');

const Claims = artifacts.require('Claims');
const ClaimsData = artifacts.require('ClaimsData');
const ClaimsReward = artifacts.require('ClaimsReward');
const SOTEMaster = artifacts.require('SOTEMaster');
const MCR = artifacts.require('MCR');
const SOTEToken = artifacts.require('SOTEToken');
const TokenData = artifacts.require('TokenData');
const TokenFunctions = artifacts.require('TokenFunctions');
const TokenController = artifacts.require('TokenController');
const Pool1 = artifacts.require('Pool1');
const Pool2 = artifacts.require('Pool2');
const PoolData = artifacts.require('PoolData');
const Quotation = artifacts.require('Quotation');
const QuotationData = artifacts.require('QuotationData');
const MemberRoles = artifacts.require('MemberRoles');
const OwnedUpgradeabilityProxy = artifacts.require('OwnedUpgradeabilityProxy');
const WSOTE = artifacts.require('wSOTE');

const INITIAL_SUPPLY = '1500000000000000000000000'; // 150万SOTE
const mainAddr = '0x5409ED021D9299bf6814279A6A1411A7e866A631';
const kycAddr = '0x5409ED021D9299bf6814279A6A1411A7e866A631';

module.exports = function(deployer, network, accounts) {
  deployer.then(async () => {

    console.log('Migrations: soteria contracts deployment started');

    let founderAddress = accounts[0];

    //这三个地址不需要修改，保持默认。BSC没用到。
    let factory = "0xc0a47dFe034B400B47bDaD5FecDa2621de6c4d95";
    let dsv = '0x17e76d3fcf40fa8acffdffe192bf4e8fb264d9fb';
    let cad = '0x6b175474e89094c44da98b954eedeac495271d0f';
    await deployer.deploy(Claims);
    await deployer.deploy(ClaimsData);
    await deployer.deploy(ClaimsReward);
    await deployer.deploy(Pool1);
    await deployer.deploy(Pool2, factory);

    // 这里的founderAddress为notarise MCR地址，表示该地址有像链上定时提交MCR数据的权限
    await deployer.deploy(PoolData, founderAddress, dsv, cad);
    await deployer.deploy(MCR);
    await deployer.deploy(TokenController);

    // 这里给founderAddress初始铸造150万SOTE币
    await deployer.deploy(SOTEToken, founderAddress, INITIAL_SUPPLY);

    // 这里的founderAddress为walletAddress，用于接收用户注册会员0.1bnb的加入会费。
    await deployer.deploy(TokenData, founderAddress);
    await deployer.deploy(TokenFunctions);
    await deployer.deploy(Quotation);

    // 这里第一个founderAddress为authQuoteEngine的地址，为报价引擎配置的私钥对数据进行签名，链上对签名数据进行验证。
    // 这里第二个founderAddress为kycAuthAddress，目前注册会员不需要kyc认证，所以随便填写一个。
    await deployer.deploy(QuotationData, founderAddress, founderAddress);
    await deployer.deploy(MemberRoles);
    await deployer.deploy(SOTEMaster);

    console.log('Migrations: soteria contracts deployment finished');

    console.log('Migrations: initialization started');

    const owner = accounts[0];
    const masterImpl = await SOTEMaster.deployed();
    const proxyMaster = await OwnedUpgradeabilityProxy.new(masterImpl.address);
    const master = await SOTEMaster.at(proxyMaster.address);

    console.log("------master-----");
    console.log(master.address);
    console.log("------master-----");
    const tk = await SOTEToken.deployed();
    const td = await TokenData.deployed();
    const tf = await TokenFunctions.deployed();
    const p1 = await Pool1.deployed();
    const p2 = await Pool2.deployed();
    const pd = await PoolData.deployed();
    const qt = await Quotation.deployed();
    const qd = await QuotationData.deployed();
    const cl = await Claims.deployed();
    const cr = await ClaimsReward.deployed();
    const cd = await ClaimsData.deployed();
    const mc = await MCR.deployed();

    // 部署wSOTE
    await deployer.deploy(WSOTE, tk.address);
    const ws = await WSOTE.deployed();

    // deploy proxy implementations
    const mrImpl = await MemberRoles.deployed();
    const tcImpl = await TokenController.deployed();

    // initiate master
    // 使govnance为私钥地址owner
    await master.initiateMaster(tk.address,owner);
    console.log("------initiate master-----");

    // add contracts to master 
    await master.addNewInternalContract(toHex('QD'),qd.address,99);
    await master.addNewInternalContract(toHex('TD'),td.address,99);
    await master.addNewInternalContract(toHex('CD'),cd.address,99);
    await master.addNewInternalContract(toHex('PD'),pd.address,99);
    console.log("------add contracts to master 99-----");

    await master.addNewInternalContract(toHex('QT'),qt.address,1);
    await master.addNewInternalContract(toHex('TF'),tf.address,1);
    await master.addNewInternalContract(toHex('TC'),tcImpl.address,2);
    await master.addNewInternalContract(toHex('CL'),cl.address,1);
    await master.addNewInternalContract(toHex('CR'),cr.address,1);
    await master.addNewInternalContract(toHex('P1'),p1.address,1);
    await master.addNewInternalContract(toHex('P2'),p2.address,1);
    await master.addNewInternalContract(toHex('MC'),mc.address,1);
    await master.addNewInternalContract(toHex('MR'),mrImpl.address,2);
    console.log("------add contracts to master-----");

    // MemberRoles 初始化
    const mrProxyAddress = await master.getLatestAddress(toHex('MR'));
    const mrAdd = await MemberRoles.at(mrProxyAddress);

    const tfProxyAddress = await master.getLatestAddress(toHex('TF'));
    const tfAdd = await TokenFunctions.at(tfProxyAddress);
    
    await mrAdd.memberRolesInitiate(owner,tfAdd.address);
    await mrAdd.addMembersBeforeLaunch([],[]);

    // Token控制权给TC
    const tcProxyAddress = await master.getLatestAddress(toHex('TC'));
    const tcAdd = await TokenController.at(tcProxyAddress);
    await tcAdd.changeOperator(tcAdd.address);

    // wSOTE加入协议白名单
    tcAdd.addToWhitelist(ws.address);

    const p1ProxyAddress = await master.getLatestAddress(toHex('P1'));
    const p1Add = await Pool1.at(p1ProxyAddress);
    const p2ProxyAddress = await master.getLatestAddress(toHex('P2'));
    const p2Add = await Pool2.at(p2ProxyAddress);
    const mcProxyAddress = await master.getLatestAddress(toHex('MC'));
    const mcAdd = await MCR.at(mcProxyAddress);


    // update contract all address
    await mrAdd.changeDependentContractAddress();
    await tfAdd.changeDependentContractAddress();
    await tcAdd.changeDependentContractAddress();

    await qd.changeDependentContractAddress();
    await td.changeDependentContractAddress();
    await cd.changeDependentContractAddress();
    await pd.changeDependentContractAddress();

    await mcAdd.changeDependentContractAddress();
    await p1Add.changeDependentContractAddress();
    await p2Add.changeDependentContractAddress();
    await qt.changeDependentContractAddress();

    //给pool1转账1BNB

    //  打印所有SOTEMaster注册的合约地址
    console.log("------ALL Address-----");
    console.log("CD "+cd.address);
    console.log("CL "+cl.address);
    console.log("CR "+cr.address);
    console.log("MC "+mc.address);
    console.log("MR "+mrAdd.address);
    console.log("SOTEMASTER "+master.address);
    console.log("SOTETOKEN "+tk.address);
    console.log("P1 "+p1.address);
    console.log("P2 "+p2.address);
    console.log("PD "+pd.address);
    console.log("QD "+qd.address);
    console.log("QT "+qt.address);
    console.log("TC "+tcAdd.address);
    console.log("TD "+td.address);
    console.log("TF "+tf.address);
    console.log("wSOTE "+ws.address);


    console.log("------INIT mcr-----");
     // fund pools
     await p1.sendEther({ from: owner, value: 1000000000000000000 });

     // add mcr and ia details
     const currencies = [toHex('BNB')];
     await p2.saveIADetails(currencies, [100], 20201124, true);
     await mc.addMCRData(13000, ether('100'), ether('7000'), currencies, [100], 20201124);
    

    console.log('Migrations: initialization finished');
  });
};