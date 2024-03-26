import React, { useState, useEffect, useRef } from "react";
import Web3Modal from "web3modal";
import { ethers } from "ethers";
import axios from "axios";
import {
  useConnectionStatus,
  useDisconnect,
  useAddress,
} from "@thirdweb-dev/react"; 
import { MarketAddress, MarketAddressABI, WETHAddress, WETHAddressABI } from "./constants";
import toast from "react-hot-toast";

export const NFTContext = React.createContext();
const fetchContract = (signerORProvider) =>
  new ethers.Contract(MarketAddress, MarketAddressABI, signerORProvider);

export const NFTProvider = ({ children }) => {
  // const [currentAccount, setCurrentAccount] = useState("");
  const [avatar, setAvatar] = useState("");
  const [isLoadingNFT, setIsLoadingNFT] = useState(false);
  // const nftCurrency = "MATIC";
  const disconnect = useDisconnect();
  const address = useAddress();
  const connectionStatus = useConnectionStatus();

  useEffect(() => {
    const userdata = window.localStorage.getItem("userdata");
    if (userdata) {
      let parsedData = JSON.parse(userdata);
      let avatarurl = parsedData.avatarurl;
      setAvatar(avatarurl);
    }
  }, []);

  const nftCurrency = (nft) => {
    if (nft.isWETH === 'true' || nft.isWETH === true) {
      return "WETH";
    }
    else
      return "MATIC";
  }

  const userOf = async (id) => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const contract = fetchContract(signer);

    const user = await contract.getUserOf(id);
    return user;
  };

  const createSale = async (
    url,
    isWETH,
    forminputPrice,
    forminputRentPrice,
    forSale,
    forRent
  ) => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const contract = fetchContract(signer);

    const priceInWei = ethers.utils.parseUnits(forminputPrice, "ether");
    const rentPriceInWei = ethers.utils.parseUnits(forminputRentPrice, "ether");

    const listingPrice = ethers.utils.parseUnits("0.01", "ether");
    const transaction = await contract.createToken(
      url,
      isWETH,
      priceInWei,
      rentPriceInWei,
      forSale,
      forRent,
      { value: listingPrice.toString() }
    );
    setIsLoadingNFT(true);
    await transaction.wait();
    setIsLoadingNFT(false);
  };

  const reSale = async (
    tokenId,
    isWETH,
    forminputPrice,
    forminputRentPrice,
    forRent,
    forSale
  ) => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const contract = fetchContract(signer);

    const priceInWei = ethers.utils.parseUnits(forminputPrice, "ether");
    const rentPriceInWei = ethers.utils.parseUnits(forminputRentPrice, "ether");

    const listingPrice = ethers.utils.parseUnits("0.01", "ether");
    const transaction = await contract.resellToken(
      tokenId,
      isWETH,
      priceInWei,
      rentPriceInWei,
      forRent,
      forSale,
      { value: listingPrice.toString() }
    );
    setIsLoadingNFT(true);
    await transaction.wait();
    setIsLoadingNFT(false);
  };

  // const buyNft = async (nft) => {
  //   const web3Modal = new Web3Modal();
  //   const connection = await web3Modal.connect();
  //   const provider = new ethers.providers.Web3Provider(connection);
  //   const signer = provider.getSigner();
  //   const contract = new ethers.Contract(
  //     MarketAddress,
  //     MarketAddressABI,
  //     signer
  //   );

  //   const price = ethers.utils.parseUnits(nft.price.toString(), "ether");

  //   const transaction = await contract.createMarketSale(nft.tokenId, {
  //     value: price,
  //   });
  //   setIsLoadingNFT(true);
  //   await transaction.wait();
  //   setIsLoadingNFT(false);
  // };

  const buyNft = async (nft) => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(
      MarketAddress,
      MarketAddressABI,
      signer
    );
    let transaction;
    const price = ethers.utils.parseUnits(nft.price.toString(), "ether");
    if (nft.isWETH === 'true' || nft.isWETH === true) {
      const wethContract = new ethers.Contract(
        WETHAddress,
        WETHAddressABI,
        signer
      );

      const approvalTx = await wethContract.approve(MarketAddress, price);
      await approvalTx.wait();
      transaction = await contract.createMarketSale(nft.tokenId);
    } else {
      transaction = await contract.createMarketSale(nft.tokenId, {
        value: price,
      });
    }

    setIsLoadingNFT(true);
    await transaction.wait();
    setIsLoadingNFT(false);
  };

  // const rentNFT = async (nft, rentalPeriodInDays) => {
  //   const web3Modal = new Web3Modal();
  //   const connection = await web3Modal.connect();
  //   const provider = new ethers.providers.Web3Provider(connection);
  //   const signer = provider.getSigner();
  //   const contract = new ethers.Contract(
  //     MarketAddress,
  //     MarketAddressABI,
  //     signer
  //   );

  //   const totalRentPrice = nft.rentPrice * rentalPeriodInDays;
  //   const rentPrice = ethers.utils.parseUnits(
  //     totalRentPrice.toString(),
  //     "ether"
  //   );
  //   // const expiry = Math.floor(Date.now() / 1000) + rentalPeriodInDays * 24 * 60 * 60;
  //   //for 2 minute
  //   const expiry = Math.floor(Date.now() / 1000) + 120;

  //   const transaction = await contract.rentOutToken(nft.tokenId, expiry, {
  //     value: rentPrice,
  //   });

  //   await transaction.wait();
  //   console.log(
  //     `NFT with tokenId ${nft.tokenId} rented successfully! to ${signer.address}`
  //   );
  // };

  const rentNFT = async (nft, rentalPeriodInDays) => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(
      MarketAddress,
      MarketAddressABI,
      signer
    );

    const totalRentPrice = nft.rentPrice * rentalPeriodInDays;
    const rentPrice = ethers.utils.parseUnits(
      totalRentPrice.toString(),
      "ether"
    );

    // const expiry = Math.floor(Date.now() / 1000) + rentalPeriodInDays * 24 * 60 * 60;
    //for 2 minute
    const expiry = Math.floor(Date.now() / 1000) + 120;
    let transaction;

    if (nft.isWETH === 'true' || nft.isWETH === true) {
      const wethContract = new ethers.Contract(
        WETHAddress,
        WETHAddressABI,
        signer
      );

      const approvalTx = await wethContract.approve(MarketAddress, rentPrice);
      await approvalTx.wait();
      transaction = await contract.rentOutToken(nft.tokenId, expiry);

    } else {
      transaction = await contract.rentOutToken(nft.tokenId, expiry, {
        value: rentPrice,
      });
    }

    setIsLoadingNFT(true);
    await transaction.wait();
    setIsLoadingNFT(false);
  };


  const fetchNFTs = async () => {
    console.log("Fetching assets...");
    setIsLoadingNFT(false);
    const RPC_URL =
      process.env.NEXT_PUBLIC_TESTNET === "true"
        ? process.env.NEXT_PUBLIC_RPC_URL
        : process.env.NEXT_PUBLIC_LOCAL_RPC_URL;

    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    const contract = fetchContract(provider);

    const data = await contract.fetchMarketItems();
    const items = await Promise.all(
      data.map(
        async ({
          tokenId,
          owner,
          isWETH,
          price: unformmattedPrice,
          rentPrice: unformmattedRentPrice,
          forRent,
          forSale,
          sold,
          rented,
        }) => {
          const tokenURI = await contract.tokenURI(tokenId);
          const {
            data: { name, id, description },
          } = await axios.get(`https://ipfs.io/ipfs/${tokenURI}`);
          const price = ethers.utils.formatUnits(
            unformmattedPrice.toString(),
            "ether"
          );
          const rentPrice = ethers.utils.formatUnits(
            unformmattedRentPrice.toString(),
            "ether"
          );
          return {
            tokenId: tokenId.toNumber(),
            owner,
            isWETH,
            price,
            rentPrice,
            forRent,
            forSale,
            sold,
            rented,
            name,
            id,
            description,
            tokenURI,
          };
        }
      )
    );
    setIsLoadingNFT(false);
    return items;
  };

  const fetchMyNFTs = async () => {
    setIsLoadingNFT(false);
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const contract = fetchContract(signer);

    const data = await contract.fetchMyNFTs();
    var i = 0;
    console.log(data.length);
    const items = await Promise.all(
      data.map(
        async ({
          tokenId,
          owner,
          isWETH,
          price: unformmattedPrice,
          rentPrice: unformmattedRentPrice,
          forRent,
          forSale,
          sold,
          rented,
        }) => {
          console.log(tokenId);
          const tokenURI = await contract.tokenURI(tokenId);

          console.log(tokenURI, i++, tokenId._hex);
          const {
            data: { name, id, description },
          } = await axios.get(`https://ipfs.io/ipfs/${tokenURI}`);
          const price = ethers.utils.formatUnits(
            unformmattedPrice.toString(),
            "ether"
          );
          const rentPrice = ethers.utils.formatUnits(
            unformmattedRentPrice.toString(),
            "ether"
          );

          return {
            tokenId: tokenId.toNumber(),
            owner,
            isWETH,
            price,
            rentPrice,
            forRent,
            forSale,
            sold,
            rented,
            name,
            id,
            description,
            tokenURI,
          };
        }
      )
    );

    return items;
  };

  const fetchMyRentedNFT = async () => {
    setIsLoadingNFT(false);

    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const contract = fetchContract(signer);

    const data = await contract.fetchMyRentedNFTs();

    const items = await Promise.all(
      data.map(
        async ({
          tokenId,
          owner,
          isWETH,
          price: unformmattedPrice,
          rentPrice: unformmattedRentPrice,
          forRent,
          forSale,
          sold,
          rented,
          renter,
          expires: unformmattedExpries,
        }) => {
          const tokenURI = await contract.tokenURI(tokenId);
          const {
            data: { name, id, description },
          } = await axios.get(`https://ipfs.io/ipfs/${tokenURI}`);
          const price = ethers.utils.formatUnits(
            unformmattedPrice.toString(),
            "ether"
          );
          const rentPrice = ethers.utils.formatUnits(
            unformmattedRentPrice.toString(),
            "ether"
          );
          // expires in string
          const expires = new Date(unformmattedExpries * 1000).toLocaleString();

          return {
            tokenId: tokenId.toNumber(),
            owner,
            isWETH,
            price,
            rentPrice,
            forRent,
            forSale,
            sold,
            rented,
            renter,
            expires,
            name,
            id,
            description,
            tokenURI,
          };
        }
      )
    );

    return items;
  };

  useEffect(async () => {
      // checkIfWalletIsConnected();
      if(!window.ethereum) {
        toast.error("Please Install Ethereum wallet first!", {
          position: "top-right",
          style: { marginTop: "70px" },
        });
        return;
      }
  }, []);

  return (
    <NFTContext.Provider
      value={{
        // checkIfWalletIsConnected,
        nftCurrency,
        // connectWallet,
        // currentAccount,
        // setCurrentAccount,
        fetchNFTs,
        buyNft,
        createSale,
        rentNFT,
        fetchMyNFTs,
        fetchMyRentedNFT,
        userOf,
        reSale,
        isLoadingNFT,
        avatar, 
        setAvatar
      }}
    >
      {children}
    </NFTContext.Provider>
  );
};
