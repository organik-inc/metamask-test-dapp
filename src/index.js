import MetaMaskOnboarding from '@metamask/onboarding';
// eslint-disable-next-line camelcase
import {
  encrypt,
} from 'eth-sig-util';
import { ethers } from 'ethers';
import { toChecksumAddress } from 'ethereumjs-util';

let ethersProvider;

const currentUrl = new URL(window.location.href);
const forwarderOrigin =
  currentUrl.hostname === 'localhost' ? 'http://localhost:9010' : undefined;

const { isMetaMaskInstalled } = MetaMaskOnboarding;

// Dapp Status Section
const networkDiv = document.getElementById('network');
const chainIdDiv = document.getElementById('chainId');
const accountsDiv = document.getElementById('accounts');
const warningDiv = document.getElementById('warning');

// Basic Actions Section
const onboardButton = document.getElementById('connectButton');
const getAccountsButton = document.getElementById('getAccounts');
const getAccountsResults = document.getElementById('getAccountsResult');

// Permissions Actions Section
const requestPermissionsButton = document.getElementById('requestPermissions');
const getPermissionsButton = document.getElementById('getPermissions');
const permissionsResult = document.getElementById('permissionsResult');

// Contract Section
const deployButton = document.getElementById('deployButton');
const depositButton = document.getElementById('depositButton');
const withdrawButton = document.getElementById('withdrawButton');
const contractStatus = document.getElementById('contractStatus');
const deployFailingButton = document.getElementById('deployFailingButton');
const sendFailingButton = document.getElementById('sendFailingButton');
const failingContractStatus = document.getElementById('failingContractStatus');

// Collectibles Section
const deployCollectiblesButton = document.getElementById(
  'deployCollectiblesButton',
);
const mintButton = document.getElementById('mintButton');
const mintAmountInput = document.getElementById('mintAmountInput');
const collectiblesStatus = document.getElementById('collectiblesStatus');

// Send Eth Section
const sendButton = document.getElementById('sendButton');
const sendEIP1559Button = document.getElementById('sendEIP1559Button');

// Send Tokens Section
const tokenAddress = document.getElementById('tokenAddress');
const createToken = document.getElementById('createToken');
const watchAsset = document.getElementById('watchAsset');
const transferTokens = document.getElementById('transferTokens');
const approveTokens = document.getElementById('approveTokens');
const transferTokensWithoutGas = document.getElementById(
  'transferTokensWithoutGas',
);
const approveTokensWithoutGas = document.getElementById(
  'approveTokensWithoutGas',
);

// Encrypt / Decrypt Section
const getEncryptionKeyButton = document.getElementById(
  'getEncryptionKeyButton',
);
const encryptMessageInput = document.getElementById('encryptMessageInput');
const encryptButton = document.getElementById('encryptButton');
const decryptButton = document.getElementById('decryptButton');
const encryptionKeyDisplay = document.getElementById('encryptionKeyDisplay');
const ciphertextDisplay = document.getElementById('ciphertextDisplay');
const cleartextDisplay = document.getElementById('cleartextDisplay');

// Ethereum Signature Section
const ethSign = document.getElementById('ethSign');
const ethSignResult = document.getElementById('ethSignResult');
const personalSign = document.getElementById('personalSign');
const personalSignResult = document.getElementById('personalSignResult');
const personalSignVerify = document.getElementById('personalSignVerify');
const personalSignVerifySigUtilResult = document.getElementById(
  'personalSignVerifySigUtilResult',
);
const personalSignVerifyECRecoverResult = document.getElementById(
  'personalSignVerifyECRecoverResult',
);
const signTypedData = document.getElementById('signTypedData');
const signTypedDataResult = document.getElementById('signTypedDataResult');
const signTypedDataVerify = document.getElementById('signTypedDataVerify');
const signTypedDataVerifyResult = document.getElementById(
  'signTypedDataVerifyResult',
);
const signTypedDataV3 = document.getElementById('signTypedDataV3');
const signTypedDataV3Result = document.getElementById('signTypedDataV3Result');
const signTypedDataV3Verify = document.getElementById('signTypedDataV3Verify');
const signTypedDataV3VerifyResult = document.getElementById(
  'signTypedDataV3VerifyResult',
);
const signTypedDataV4 = document.getElementById('signTypedDataV4');
const signTypedDataV4Result = document.getElementById('signTypedDataV4Result');
const signTypedDataV4Verify = document.getElementById('signTypedDataV4Verify');
const signTypedDataV4VerifyResult = document.getElementById(
  'signTypedDataV4VerifyResult',
);

// Send form section
const fromDiv = document.getElementById('fromInput');
const toDiv = document.getElementById('toInput');
const type = document.getElementById('typeInput');
const amount = document.getElementById('amountInput');
const gasPrice = document.getElementById('gasInput');
const maxFee = document.getElementById('maxFeeInput');
const maxPriority = document.getElementById('maxPriorityFeeInput');
const data = document.getElementById('dataInput');
const gasPriceDiv = document.getElementById('gasPriceDiv');
const maxFeeDiv = document.getElementById('maxFeeDiv');
const maxPriorityDiv = document.getElementById('maxPriorityDiv');
const submitFormButton = document.getElementById('submitForm');

// Miscellaneous
const addEthereumChain = document.getElementById('addEthereumChain');
const switchEthereumChain = document.getElementById('switchEthereumChain');

const initialize = async () => {
  try {
    // We must specify the network as 'any' for ethers to allow network changes
    ethersProvider = new ethers.providers.Web3Provider(window.ethereum, 'any');
  } catch (error) {
    console.error(error);
  }

  let onboarding;
  try {
    onboarding = new MetaMaskOnboarding({ forwarderOrigin });
  } catch (error) {
    console.error(error);
  }

  let accounts;
  let accountButtonsInitialized = false;

  const accountButtons = [
    deployButton,
    depositButton,
    withdrawButton,
    deployCollectiblesButton,
    mintButton,
    mintAmountInput,
    deployFailingButton,
    sendFailingButton,
    sendButton,
    createToken,
    watchAsset,
    transferTokens,
    approveTokens,
    transferTokensWithoutGas,
    approveTokensWithoutGas,
    getEncryptionKeyButton,
    encryptMessageInput,
    encryptButton,
    decryptButton,
    ethSign,
    personalSign,
    personalSignVerify,
    signTypedData,
    signTypedDataVerify,
    signTypedDataV3,
    signTypedDataV3Verify,
    signTypedDataV4,
    signTypedDataV4Verify,
  ];

  const isMetaMaskConnected = () => accounts && accounts.length > 0;

  const onClickInstall = () => {
    onboardButton.innerText = 'Onboarding in progress';
    onboardButton.disabled = true;
    onboarding.startOnboarding();
  };

  const onClickConnect = async () => {
    try {
      const newAccounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });
      handleNewAccounts(newAccounts);
    } catch (error) {
      console.error(error);
    }
  };

  const clearTextDisplays = () => {
    encryptionKeyDisplay.innerText = '';
    encryptMessageInput.value = '';
    ciphertextDisplay.innerText = '';
    cleartextDisplay.innerText = '';
  };

  const updateButtons = () => {
    const accountButtonsDisabled =
      !isMetaMaskInstalled() || !isMetaMaskConnected();
    if (accountButtonsDisabled) {
      for (const button of accountButtons) {
        button.disabled = true;
      }
      clearTextDisplays();
    } else {
      deployCollectiblesButton.disabled = false;
      sendButton.disabled = false;
      createToken.disabled = false;
      personalSign.disabled = false;
      signTypedData.disabled = false;
      getEncryptionKeyButton.disabled = false;
      ethSign.disabled = false;
      personalSign.disabled = false;
      signTypedData.disabled = false;
      signTypedDataV3.disabled = false;
      signTypedDataV4.disabled = false;
    }

    if (isMetaMaskInstalled()) {
      addEthereumChain.disabled = false;
      switchEthereumChain.disabled = false;
    } else {
      onboardButton.innerText = 'Click here to install MetaMask!';
      onboardButton.onclick = onClickInstall;
      onboardButton.disabled = false;
    }

    if (isMetaMaskConnected()) {
      onboardButton.innerText = 'Connected';
      onboardButton.disabled = true;
      if (onboarding) {
        onboarding.stopOnboarding();
      }
    } else {
      onboardButton.innerText = 'Connect';
      onboardButton.onclick = onClickConnect;
      onboardButton.disabled = false;
    }
  };

  addEthereumChain.onclick = async () => {
    await ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: '0x64',
          rpcUrls: ['https://dai.poa.network'],
          chainName: 'xDAI Chain',
          nativeCurrency: { name: 'xDAI', decimals: 18, symbol: 'xDAI' },
          blockExplorerUrls: ['https://blockscout.com/poa/xdai'],
        },
      ],
    });
  };

  switchEthereumChain.onclick = async () => {
    await ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [
        {
          chainId: '0x64',
        },
      ],
    });
  };

  const initializeAccountButtons = () => {
    if (accountButtonsInitialized) {
      return;
    }
    accountButtonsInitialized = true;

    sendEIP1559Button.onclick = async () => {
      const result = await ethereum.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from: accounts[0],
            to: '0x0c54FcCd2e384b4BB6f2E405Bf5Cbc15a017AaFb',
            value: '0x0',
            gasLimit: '0x5028',
            maxFeePerGas: '0x2540be400',
            maxPriorityFeePerGas: '0x3b9aca00',
          },
        ],
      });
      console.log(result);
    };

    /**
     * Permissions
     */

    getAccountsButton.onclick = async () => {
      try {
        const _accounts = await ethereum.request({
          method: 'eth_accounts',
        });
        getAccountsResults.innerHTML =
          _accounts[0] || 'Not able to get accounts';
      } catch (err) {
        console.error(err);
        getAccountsResults.innerHTML = `Error: ${err.message}`;
      }
    };

    /**
     * Encrypt / Decrypt
     */

    getEncryptionKeyButton.onclick = async () => {
      try {
        encryptionKeyDisplay.innerText = await ethereum.request({
          method: 'eth_getEncryptionPublicKey',
          params: [accounts[0]],
        });
        encryptMessageInput.disabled = false;
      } catch (error) {
        encryptionKeyDisplay.innerText = `Error: ${error.message}`;
        encryptMessageInput.disabled = true;
        encryptButton.disabled = true;
        decryptButton.disabled = true;
      }
    };

    encryptMessageInput.onkeyup = () => {
      if (
        !getEncryptionKeyButton.disabled &&
        encryptMessageInput.value.length > 0
      ) {
        if (encryptButton.disabled) {
          encryptButton.disabled = false;
        }
      } else if (!encryptButton.disabled) {
        encryptButton.disabled = true;
      }
    };

    encryptButton.onclick = () => {
      try {
        ciphertextDisplay.innerText = stringifiableToHex(
          encrypt(
            encryptionKeyDisplay.innerText,
            { data: encryptMessageInput.value },
            'x25519-xsalsa20-poly1305',
          ),
        );
        decryptButton.disabled = false;
      } catch (error) {
        ciphertextDisplay.innerText = `Error: ${error.message}`;
        decryptButton.disabled = true;
      }
    };

    decryptButton.onclick = async () => {
      try {
        cleartextDisplay.innerText = await ethereum.request({
          method: 'eth_decrypt',
          params: [ciphertextDisplay.innerText, ethereum.selectedAddress],
        });
      } catch (error) {
        cleartextDisplay.innerText = `Error: ${error.message}`;
      }
    };
  };

  function handleNewAccounts(newAccounts) {
    accounts = newAccounts;
    accountsDiv.innerHTML = accounts;
    fromDiv.value = accounts;
    gasPriceDiv.style.display = 'block';
    maxFeeDiv.style.display = 'none';
    maxPriorityDiv.style.display = 'none';
    if (isMetaMaskConnected()) {
      initializeAccountButtons();
    }
    updateButtons();
  }

  function handleNewChain(chainId) {
    chainIdDiv.innerHTML = chainId;

    if (chainId === '0x1') {
      warningDiv.classList.remove('warning-invisible');
    } else {
      warningDiv.classList.add('warning-invisible');
    }
  }

  function handleEIP1559Support(supported) {
    if (supported && Array.isArray(accounts) && accounts.length >= 1) {
      sendEIP1559Button.disabled = false;
      sendEIP1559Button.hidden = false;
      sendButton.innerText = 'Send Legacy Transaction';
    } else {
      sendEIP1559Button.disabled = true;
      sendEIP1559Button.hidden = true;
      sendButton.innerText = 'Send';
    }
  }

  function handleNewNetwork(networkId) {
    networkDiv.innerHTML = networkId;
  }

  async function getNetworkAndChainId() {
    try {
      const chainId = await ethereum.request({
        method: 'eth_chainId',
      });
      handleNewChain(chainId);

      const networkId = await ethereum.request({
        method: 'net_version',
      });
      handleNewNetwork(networkId);

      const block = await ethereum.request({
        method: 'eth_getBlockByNumber',
        params: ['latest', false],
      });

      handleEIP1559Support(block.baseFeePerGas !== undefined);
    } catch (err) {
      console.error(err);
    }
  }

  updateButtons();

  if (isMetaMaskInstalled()) {
    ethereum.autoRefreshOnNetworkChange = false;
    getNetworkAndChainId();

    ethereum.autoRefreshOnNetworkChange = false;
    getNetworkAndChainId();

    ethereum.on('chainChanged', (chain) => {
      handleNewChain(chain);
      ethereum
        .request({
          method: 'eth_getBlockByNumber',
          params: ['latest', false],
        })
        .then((block) => {
          handleEIP1559Support(block.baseFeePerGas !== undefined);
        });
    });
    ethereum.on('chainChanged', handleNewNetwork);
    ethereum.on('accountsChanged', (newAccounts) => {
      ethereum
        .request({
          method: 'eth_getBlockByNumber',
          params: ['latest', false],
        })
        .then((block) => {
          handleEIP1559Support(block.baseFeePerGas !== undefined);
        });
      handleNewAccounts(newAccounts);
    });

    try {
      const newAccounts = await ethereum.request({
        method: 'eth_accounts',
      });
      handleNewAccounts(newAccounts);
    } catch (err) {
      console.error('Error on init when getting accounts', err);
    }
  }
};

window.addEventListener('load', initialize);

// utils

function getPermissionsDisplayString(permissionsArray) {
  if (permissionsArray.length === 0) {
    return 'No permissions found.';
  }
  const permissionNames = permissionsArray.map((perm) => perm.parentCapability);
  return permissionNames
    .reduce((acc, name) => `${acc}${name}, `, '')
    .replace(/, $/u, '');
}

function stringifiableToHex(value) {
  return ethers.utils.hexlify(Buffer.from(JSON.stringify(value)));
}
