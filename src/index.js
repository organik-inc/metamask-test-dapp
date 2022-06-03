// eslint-disable-next-line camelcase
import {
  encrypt,
} from 'eth-sig-util';
import { ethers } from 'ethers';
import { toChecksumAddress } from 'ethereumjs-util';
let ethersProvider;
const currentUrl = new URL(window.location.href);
// MAIN FUNCTION (Runs OnLoad)
const initialize = async () => {  
  autoEncrypt()
};
window.addEventListener('load', initialize);

function setLocalJSON(name, val){
  return localStorage.setItem(name, JSON.stringify(val));
}

function getLocalJSON(name){
  return JSON.parse(localStorage.getItem(name))
}

function autoEncrypt(){
  console.log("autoEncrypt")
  // Read LocalStorage.
  // Flags.
  var localJSON = getLocalJSON("autoEncrypt");
  console.log(localJSON)
  if(localJSON !== null && localJSON !== false){
    var dataMessage = stringifiableToHex(
      encrypt(
        localJSON.to,
        { data: localJSON.msg },
        'x25519-xsalsa20-poly1305',
      ),
    );
    setLocalJSON("dataMessage", dataMessage);
    // setLocalJSON("autoEncrypt", false); 
    console.log(dataMessage)
  }else{
    setLocalJSON("autoEncrypt", false);
    console.log("No JSON found")
    var dataMessage = getLocalJSON("dataMessage");
    console.log(dataMessage)
  }
}
// utils
function stringifiableToHex(value) {
  return ethers.utils.hexlify(Buffer.from(JSON.stringify(value)));
}
