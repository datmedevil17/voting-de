import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { ethers } from "ethers";
import MetaMaskLogo from "./images/metamask-logo.png"; 
import abi from "../../artifacts/contracts/Vote.sol/Vote.json"
import Vote from "../components/Vote";
import AddCandidate from "../components/AddCandidate";

const App = () => {
  const [account, setAccount] = useState(null);
  const [state, setState] = useState({
    provider: null,
    signer: null,
    contract: null,
    address: null,
  });

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("MetaMask is not installed");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      if (accounts.length === 0) {
        console.log("No account found");
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setAccount(address);

      // Initialize contract
      const contractAddress = "0x67Fd5B62A71CF7521A01898BC2E721AA95C2B260";
      const contractABI = abi.abi; // Make sure you define `abi` or import it properly
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      setState({ provider, signer, contract, address });
      console.log("Wallet connected:", address);
    } catch (error) {
      console.error("Error connecting to MetaMask:", error);
    }
  };

  useEffect(() => {
    const handleAccountChange = () => window.location.reload();
    const handleChainChange = () => window.location.reload();

    if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountChange);
      window.ethereum.on("chainChanged", handleChainChange);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", handleAccountChange);
        window.ethereum.removeListener("chainChanged", handleChainChange);
      }
    };
  }, []);

  return (
    <Router>
      <div className="flex flex-col items-center space-y-4 p-4">
        {account ? (
          <div className="flex items-center space-x-2">
            <img src={MetaMaskLogo} alt="MetaMask Logo" className="w-6 h-6" />
            <span className="font-semibold">
              Connected: {`${account.slice(0, 6)}...${account.slice(-4)}`}
            </span>
            <div className="space-x-4">
              <Link to="/" className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                Vote
              </Link>
              <Link to="/add-candidate" className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600">
                Add as Candidate
              </Link>
            </div>
          </div>
        ) : (
          <button
            onClick={connectWallet}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Connect Wallet
          </button>
        )}
        
        <Routes>
          <Route path="/vote" element={<Vote state={state} account={account} />} />
          <Route path="/add-candidate" element={<AddCandidate state={state} account={account} />} />
          <Route path="/" element={<div className="text-center"><h1>Welcome to the Voting App</h1><p>Please connect your wallet to get started.</p></div>} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
