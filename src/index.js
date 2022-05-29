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


/** */
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

// Send form section
const fromDiv = document.getElementById('fromInput');

// Miscellaneous
const addEthereumChain = document.getElementById('addEthereumChain');
const switchEthereumChain = document.getElementById('switchEthereumChain');


// MAIN FUNCTION (Runs OnLoad)

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
    getEncryptionKeyButton,
    encryptMessageInput,
    encryptButton,
    decryptButton,
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
      getEncryptionKeyButton.disabled = false;
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
      /** *!/
      A
      /** */
    } else {
      /** *!/
      B
      /** */
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
