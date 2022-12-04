import Navbar from "./Navbar";
import Introduction from "./Introduction";
import Sale from "./Sale";
import About from "./About";
import { useEffect, useRef, useState } from "react";
import { useAccount } from "wagmi";
import Web3Modal from "web3modal";
import {
  getCollectionURIs,
  getCurrentDeployment,
  getSaleContract,
} from "../SmartContractsStuff/contractInteraction";
import { getTokensMetaData } from "../SmartContractsStuff/IpfsInteraction";
import ShowNFTs from "./ShowNFTs";

let myUrlAddress = "https://lets-sale.vercel.app";
let websiteType = "sale";
let Blockchain = "polygon";
let NetworkChain = "mumbai";

export default function Home() {
  const [currentpage, setCurrentPage] = useState("home");
  const { isConnected, isDisconnected, address } = useAccount();
  const [currentDeployment, setCurrentDeployment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [brandName, setBrandName] = useState(null);
  const [baseURI, setBaseURI] = useState(null);
  const [NFTs, setNFTs] = useState([]);
  const [walletAddress, setWalletAddress] = useState(null);
  const [totalNFTs, setTotalNFTs] = useState(10);
  const web3ModalRef = useRef();

  async function fetchCollection(deploymentAddress) {
    if (!isConnected) return null;
    console.log("making a sale contract ");

    let saleContract = await getSaleContract(
      Blockchain,
      NetworkChain,
      web3ModalRef,
      deploymentAddress
    );
    console.log("sale contract is ", saleContract);
    let name;
    try {
      name = await saleContract.name();
      console.log("name is ", name);
      setBrandName(name);
    } catch (e) {
      console.log("not to get name");
    }
    let baseURIs;
    try {
      baseURIs = await getCollectionURIs(
        Blockchain,
        NetworkChain,
        web3ModalRef,
        saleContract
      );
      console.log("base URIs ", baseURIs);
    } catch (e) {
      console.log("unable to get base uri");
    }
    try {
      setTotalNFTs(baseURIs.length);
      let _data = await getTokensMetaData(
        baseURIs,
        setNFTs,
        saleContract,
        () => {
          setLoading(false);
        }
      );
    } catch (e) {
      console.log("errror:getmetadata ");
      setLoading(false);
    }
  }
  async function fetchDeployment() {
    let _currentDeployment = await getCurrentDeployment(
      Blockchain,
      NetworkChain,
      web3ModalRef,
      myUrlAddress
    );
    if (!_currentDeployment) {
      return null;
    }
    return _currentDeployment.currentDeployment;
  }

  async function init() {
    if (!address) return null;
    let deploymentAddress = await fetchDeployment();
    // console.log("inside index", deploymentAddress);
    console.log("deployment", deploymentAddress);
    // deploymentAddress = '"0x25AA670175B334500f60f6b32Cf9d6354FF07f86"';
    if (deploymentAddress) {
      await fetchCollection(deploymentAddress);
      setCurrentDeployment(deploymentAddress);
    } else {
      setLoading(false);
    }
  }
  useEffect(() => {
    // if wallet is not connected, create a new instance of Web3Modal and connect the MetaMask wallet
    // Assign the Web3Modal class to the reference object by setting it's `current` value
    // The `current` value is persisted throughout as long as this page is open
    if (web3ModalRef.current === undefined) {
      web3ModalRef.current = new Web3Modal({
        network: NetworkChain,
        providerOptions: {},
        disableInjectedProvider: false,
      });
    }
    if (isConnected) {
      setWalletAddress(address);
    }
    init();
  }, [isConnected]);
  // console.log("NFTs are ", NFTs);
  return (
    <div
      style={{
        minHeight: "100vh",
        height: "fit-content",
        background: "black",
      }}
    >
      <Navbar
        image={
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQr7ZZQwTn5ClB5v8hOJTehixgGs5csluH-8WIUQEB2rdEaFFzXWOoXY4oOGK09US2CAdY&usqp=CAU"
        }
        brandName={brandName ? brandName : "Lets Sale"}
        func={setCurrentPage}
      />

      {currentDeployment == null ? (
        <div
          style={{
            height: "100vh",
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            background: "black",
            color: "white",
            fontSize: "20px",
            fontWeight: "700",
          }}
        >
          {!walletAddress
            ? "Connect Wallet First"
            : loading && !brandName
            ? "Loading Hosted Collection's details"
            : brandName
            ? brandName + " NFTs are coming.."
            : "Lets Sale is not rented for any sale yet"}
        </div>
      ) : (
        <>
          {" "}
          {currentpage === "about" && (
            <About
              heading="About us"
              description="The founder is an integral part of the brand’s origin story, so making her the star of the page works. Think about including additional elements that can strengthen your About Us page.Hello know us."
              discord="https://discord.com/invite/chainlink"
              linkdin="https://www.linkedin.com/in/umarkhatab456"
              email="mailto:seemalfrl@gmail.com"
              twitter="https://twitter.com/umarkhatab465"
            />
          )}
          {currentpage === "sale" && (
            <Sale
              heading="Mint Membership  "
              text="You will receive a special NFT as part of your membership, and you will be eligible for Early Access. NFTS are limited, and only NFT owners will get Early Access. You can help us create more tools by purchasing a membership. Join our community! Public access will be enabled in the end of 2022."
            />
          )}
          {currentpage === "home" && (
            <div>
              <Introduction
                intro="When buying an NFT, you will be instantly registered as the unique owner on the Blockchain. Exclusive NFT Collections. Buy NFT Art simply with a Credit Card. No digital wallet needed."
                heading="Collection NFT Sale"
                image={NFTs.length > 0 ? NFTs[0].image : undefined}
              />
              {NFTs.length == 0 ? (
                <div
                  style={{
                    height: "100vh",
                    width: "100vw",
                    display: "flex",
                    justifyContent: "center",
                    background: "black",
                    color: "white",
                    fontSize: "20px",
                    fontWeight: "700",
                  }}
                >
                  Fetching Collection...
                </div>
              ) : (
                <ShowNFTs contractAddress={currentDeployment} NFTs={NFTs} />
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
