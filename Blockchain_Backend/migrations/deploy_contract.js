
const maincontract = artifacts.require("FootballManagement");

module.exports = async function(deployer) {
  
  await deployer.deploy(maincontract);
};