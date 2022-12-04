import axios from "axios";
function embedGateway(_hash) {
  if (_hash.toString().startsWith("http")) return _hash;
  let hash = _hash;

  if (_hash.toString().startsWith("ipfs://")) {
    hash = _hash.slice(8);
  }
  if (_hash.toString().startsWith("ipfs:/")) {
    hash = _hash.slice(6);
  }

  if (_hash.toString().startsWith("/ipfs://")) {
    hash = _hash.slice(9);
  }
  //   console.log("modified hash is", hash);
  let link = "https://gateway.pinata.cloud/ipfs/" + hash;
  //   console.log("returning link ", link);
  return link;
}

export const getTokenMetadata = async (tokenUriHash, id) => {
  //   console.log("token uri is ",tokenUriHash);
  let tokenUri = embedGateway(tokenUriHash);
  //   console.log("token path ",tokenUri);
  const response = await axios.get(tokenUri);
  //   console.log("response is ",response)
  let metadata = response.data;
  let _token = { ...metadata };
  _token.image = embedGateway(metadata.image);
  // id should be there in metadata
  _token.id = id;
  //   console.log("metadata inside ipfs fetch is ", _token);

  return _token;
};

export const getTokensMetaData = async (
  tokenURIs,
  setter,
  contract,
  finisher
) => {
  let metadataArray = [];
  console.log("toke uri are ", tokenURIs);
  for (let index = 0; index < tokenURIs.length; index++) {
    let item = tokenURIs[index];
    let _metadata = await getTokenMetadata(item, index + 1);
    //   console.log("metadata is ", metadata);
    let tokenIsMinted = await contract.isTokenIdExists(_metadata.id);
    _metadata.price = await contract.getNFTPrice(_metadata.id);
    if (tokenIsMinted) {
      _metadata.owner = await contract.ownerOf(_metadata.id);
      metadataArray.push(_metadata);
    } else {
      _metadata.owner = "0000000000000";
      metadataArray.push(_metadata);
    }

    if (index + 1 == tokenURIs.length) {
      // console.log("metadata array is ", metadataArray);
      if (setter) {
        setter(metadataArray);
      }
      if (finisher) {
        finisher();
      }
      return metadataArray;
    }
  }
  return metadataArray;
};
