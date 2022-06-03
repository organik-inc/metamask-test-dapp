// eslint-disable-next-line camelcase
import {
  encrypt,
} from 'eth-sig-util';
import { ethers } from 'ethers';
import { toChecksumAddress } from 'ethereumjs-util';
let ethersProvider;
const currentUrl = new URL(window.location.href);
// MAIN FUNCTION (Runs OnLoad)
async function initialize(){
  autoEncrypt()
  if(ethEncryptTrigger !== null){
    ethEncryptTrigger.addEventListener('ethEncrypt', autoEncrypt)
  }
}
window.addEventListener('load', initialize);
var ethEncryptTrigger = document.getElementById('ethEncryptTrigger');
function setLocalJSON(name, val){
  return localStorage.setItem(name, JSON.stringify(val));
}
function getLocalJSON(name){
  return JSON.parse(localStorage.getItem(name))
}

function autoEncrypt(e=false){
  var localJSON = getLocalJSON("autoEncrypt");
  if(localJSON !== null && localJSON !== false && localJSON !== true){
    var dataMessage = stringifiableToHex(
      encrypt(
        localJSON.to,
        { data: localJSON.msg },
        'x25519-xsalsa20-poly1305',
      ),
    );
    setLocalJSON("dataMessage", dataMessage);
    setLocalJSON("autoEncrypt", true);
    setLocalJSON("currentUrl", currentUrl);
  }else{
    if(localJSON == null){
      setLocalJSON("autoEncrypt", false);
    }
  }
}
// utils
function stringifiableToHex(value) {
  return ethers.utils.hexlify(Buffer.from(JSON.stringify(value)));
}
