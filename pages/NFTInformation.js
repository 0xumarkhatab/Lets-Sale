import React, { useEffect, useRef, useState } from "react";
import {
  getSaleContract,
  getTokenOwner,
  mint,
} from "../SmartContractsStuff/contractInteraction";
import styles from "../styles/NFTInformation.module.css";
import Web3Modal from "web3modal";
import { useAccount } from "wagmi";

let Blockchain = "polygon";
let NetworkChain = "mumbai";

function NFTInformation(props) {
  const { isConnected, isDisconnected, address } = useAccount();
  const [owner, setOwner] = useState(null);
  const [mintingStatus, setMintingStatus] = useState("mint now");

  let nft = props.NFT;
  let toggler = props.toggler;
  let contractAddress = props.contractAddress;
  let nftPrice = parseInt(nft?.price);
  let nftOwner = nft.owner;
  if (Blockchain == "polygon") {
    nftPrice = nftPrice / 10 ** 18;
  } else if (Blockchain == "tron") {
    nftPrice = nftPrice / 10 ** 6;
  } else {
    // we dont support this blockchain yet
  }

  let web3ModalRef = useRef();
  async function mintNFT(tokenId) {
    if (owner == address) {
      alert("You already own it ..");
      return null;
    }
    alert("Stated Minting ...");
    if (web3ModalRef.current === undefined) {
      web3ModalRef.current = new Web3Modal({
        network: NetworkChain,
        providerOptions: {},
        disableInjectedProvider: false,
      });
    }

    console.log({
      Blockchain,
      NetworkChain,
      web3ModalRef,
      contractAddress,
      tokenId,
      price: nftPrice,
    });
    setMintingStatus("Minting..");

    setMintingStatus("Please Wait..");
    await mint(
      Blockchain,
      NetworkChain,
      web3ModalRef,
      contractAddress,
      tokenId,
      nft?.price,
      successCallback,
      failureFallback
    );
  }
  async function successCallback() {
    setMintingStatus("Purchased Successfully 🥳");
    setOwner(address);
  }
  async function failureFallback() {
    setMintingStatus("Purchased Failed!");
    setOwner(null);
  }

  function getCurrency() {
    return Blockchain == "ethereum"
      ? "ETH"
      : Blockchain == "tron"
      ? "TRX"
      : Blockchain == "polygon"
      ? "MATIC"
      : "Un-supported";
  }

  function getMinimalAddress(adr) {
    if (!adr) return "Fetching..";
    if (adr.toString().includes("0000")) {
      return null;
    }
    return adr.slice(0, 5) + "..." + adr.slice(40);
  }

  useEffect(() => {
    setOwner(nftOwner);
  }, []);

  return (
    <div className={styles.nft__information__wrapper}>
      <div className={styles.nft__information__content}>
        <img
          className={styles.nft__information__content__image}
          src={nft.image}
        />
        <p className={styles.nft__information__content__name}>
          <p className={styles.property}>name</p>
          <p className={styles.value}>{nft.name}</p>
        </p>
        <p className={styles.nft__information__content__price}>
          <p className={styles.property}>price</p>
          <p className={styles.value}>
            {nftPrice} {getCurrency()}
          </p>
        </p>
        <p className={styles.nft__information__content__owner}>
          <p className={styles.property}>owner</p>
          <p className={styles.value}>
            {getMinimalAddress(nftOwner) == null
              ? "No Owner"
              : getMinimalAddress(nftOwner)}
          </p>
        </p>

        <button
          className={styles.nft__information__content__button}
          onClick={() => mintNFT(nft.id)}
          disabled={mintingStatus !== "mint now"}
        >
          {owner == address ? "you own it " : mintingStatus}
        </button>
        <button
          className={styles.nft__information__content__button}
          onClick={() => {
            toggler(null);
          }}
        >
          Cancel{" "}
        </button>
      </div>
    </div>
  );
}

export default NFTInformation;
