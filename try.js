const provider = new ethers.providers.Web3Provider(window.ethereum);

(async () => {
  var bn = await provider.getBlockNumber();
  console.log(bn);
})();

addr_GapSwpFactory = "0x2155BF51d3c1783cDABdcd3d58842bB90dd1fC40";
addr_token1 = "0x391e2a8208794EF76Ab741DAC478eDfD4284d2DD";
addr_token2 = "0x8820097CE5BF1d0E517D0a801c4B36c5a4AaFEFf";
addr_dao = "0xeC7d68AC885b46d3d0b28C7F6753aE28285360e9";
gap_size = 3;

const abi = ["function createPair(address tokenA, address tokenB, address daoAddress, uint8 gap_size) external returns (address pair)"];

(async () => {
  await provider.send("eth_requestAccounts", []);
})();
const signer = provider.getSigner();
const contract = new ethers.Contract(addr_GapSwpFactory, abi, signer);

console.log("NOW CREATING PAIR");
(async () => {
  try {
    pair = await contract.createPair(addr_token1, addr_token2, addr_dao, gap_size);
    console.log("Pair created successfully at ");
  } catch (e) {
    console.log("ERROR: " + e.data.message);
  }
})();
