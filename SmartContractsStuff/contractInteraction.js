import { Contract } from "ethers/lib";
import { getProviderOrSigner } from "./accountsConnect";
import {
  SaleABI,
  WebsiteRentABI,
  WebsiteRentAddress,
} from "./contractMetdadata";
import { getTokensMetaData } from "./IpfsInteraction";

export const getWebsiteRentContract = async (
  Blockchain,
  networkChain,
  web3ModalRef
) => {
  if (Blockchain == "polygon") {
    let provider = await getProviderOrSigner(web3ModalRef);
    const websiteRentContract = new Contract(
      WebsiteRentAddress,
      WebsiteRentABI,
      provider
    );
    return websiteRentContract;
  } else if (Blockchain == "tron") {
  } else {
    //
  }
};
export const getSaleContract = async (
  Blockchain,
  NetworkChain,
  web3ModalRef,
  contractAddress
) => {
  if (Blockchain == "polygon") {
    let signer = await getProviderOrSigner(web3ModalRef, true);
    try {
      const saleContract = new Contract(contractAddress, SaleABI, signer);
      console.log("sale contract is ", saleContract);
      return saleContract;
    } catch (e) {
      console.log("error in making contract ", e);
    }
  } else if (Blockchain == "tron") {
  } else {
    //
  }
};
export async function mint(
  Blockchain,
  NetworkChain,
  web3ModalRef,
  contractAddress,
  tokenId,
  price,
  successCallback,
  failureCallback
) {
  let contract = await getSaleContract(
    Blockchain,
    NetworkChain,
    web3ModalRef,
    contractAddress
  );
  try {
    // console.log("sale contract to mint from ", contract);
    let tx = await contract.purchaseThisToken(tokenId, {
      value: price,
    });
  } catch (e) {
    console.log(e);
    if (e.data?.message?.toString().includes("insufficient funds")) {
      alert("Insufficient funds to mint token");

      return 0;
    }
    failureCallback();

    return 0;
  }
  await tx.wait();
  successCallback();
}
export async function getTokenOwner(Blockchain, contract) {
  if (Blockchain == "tron") {
    let owner = await contract.ownerOf(tokenId).call();
    return owner;
  } else if (Blockchain == "polygon") {
    let owner = await contract.ownerOf(tokenId);
    return owner;
  }
  return "0x0000000";
}

export async function getCollectionURIs(
  Blockchain,
  NetworkChain,
  web3ModalRef,
  contract
) {
  console.log({ Blockchain, NetworkChain, web3ModalRef, contract });
  let _totalSupply;
  try {
    _totalSupply = await contract.totalSupply();
  } catch (e) {
    console.log("supply error ", e);
  }

  let numNFTsToFetch = 0;
  numNFTsToFetch = parseInt(_totalSupply);
  console.log("supply is ", numNFTsToFetch);
  let baseURIs = [];

  //   console.log("Obtaining ", numNFTsToFetch, " NFTs");
  for (let index = 0; index < numNFTsToFetch; index++) {
    await contract
      .tokenURI(index + 1)
      .then((item) => {
        baseURIs.push(item);
      })
      .catch((e) => {
        console.log("error in fetching tokenURI of ", index + 1);
      });
  }
  //   console.log("base uris are ", baseURIs);
  return baseURIs;
}
function noDeployment(adr) {
  if (
    !adr ||
    adr?.toString().includes("0x0000") ||
    adr?.toString().includes("0X0000")
  )
    return true;

  return false;
}

export async function getCurrentDeployment(
  Blockchain,
  NetworkChain,
  web3ModalRef,
  websiteURL
) {
  //   console.log("inside getting current deployment");
  let contract = await getWebsiteRentContract(
    Blockchain,
    NetworkChain,
    web3ModalRef
  );
  //   console.log("contract is ", contract);
  console.log("checking Deployment of _" + websiteURL + "_");
  let _currentDeployment = await contract.websiteToDeployment(websiteURL);
  //   console.log("curremt deployment", _currentDeployment);
  if (noDeployment(_currentDeployment)) {
    console.log("No deployment");
    return null;
  }

  let rentTime = await contract.rentTime(websiteURL);

  let jsEpochRentTime = parseInt(rentTime * 1000);
  let currentTime = new Date().getTime();
  if (jsEpochRentTime <= currentTime) {
    _currentDeployment = null;
  }
  return { currentDeployment: _currentDeployment, rentTime };
}
