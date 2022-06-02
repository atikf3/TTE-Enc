import * as React from "react"
import {
  ChakraProvider,
  Box,
  Text,
  Link,
  VStack,
  Input,
  Code,
  Grid,
  Divider,
  theme,
  Textarea
} from "@chakra-ui/react"
import { ColorModeSwitcher } from "./ColorModeSwitcher"
import { create } from "ipfs-http-client";
import { Logo } from "./Logo"
import { useState, useEffect } from "react";
// import { create } from "ipfs-http-client";
import EthCrypto from 'eth-crypto';
import ButtonAppBar from "./components/Navbar";
import FileBase64 from './components/file-b64.js';
// @ts-ignore
import WalletConnectProvider from '@walletconnect/web3-provider';
import Column from './components/Column';
import Wrapper from './components/Wrapper';
import Header from './components/Header';
import Loader from './components/Loader';
import ConnectButton from './components/ConnectButton';
import styled from 'styled-components';
// @ts-ignore
import Web3Modal from 'web3modal';
import { Web3Provider } from '@ethersproject/providers';
import { getChainData } from './helpers/utilities';
import Web3 from 'web3';
// import sigUtil from '@metamask/eth-sig-util';
// import ethUtil from 'ethereumjs-util';

export const App = () => {
  const client = create({url: "https://ipfs.infura.io:5001/api/v0"});
  // const web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");
  const [file, setFile] = useState<Buffer | null>(null);
  const [urlArr, setUrlArr] = useState<String[]>([]);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [encodedFiles, setEncodedFiles] = useState<any[]>([]);
  const [address, setAddress] = useState('');
  const [connected, setConnected] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [chainId, setChainId] = useState(1);
  const [library, setLibrary] = useState<Web3Provider>({} as Web3Provider);
  const [usrPublicKey, setUsrPublicKey] = useState('');
  const [usrPrivateKey, setUsrPrivateKey] = useState('');
  const [encryptedContent, setEncryptedContent] = useState<any>('');
  const [decryptedContent, setDecryptedContent] = useState<any>('');
  const ethUtil = require('ethereumjs-util');
  const sigUtil = require('@metamask/eth-sig-util');

  var provider: any = null;
  var web3: Web3 = {} as Web3;

  const getNetwork = () => getChainData(chainId).network;
  const getProviderOptions = () => {
    const providerOptions = {
      walletconnect: {
        package: WalletConnectProvider,
        options: {
          infuraId: process.env.REACT_APP_INFURA_ID
        }
      }
    };
    return providerOptions;
  };

  const _web3Modal = new Web3Modal({
    network: getNetwork(),
    cacheProvider: true,
    providerOptions: getProviderOptions()
  });

  const retrieveFile = (e: any) => {
    const data = e.target.files[0];
    const reader = new window.FileReader();
    reader.readAsArrayBuffer(data);

    reader.onloadend = () => {
      // convert reader.result to base64
      let buffer = new Buffer(JSON.parse(reader.result !== null ? reader.result.toString() : ''));
      setFile(buffer);
    };

    e.preventDefault();
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      // @ts-ignore 
      const created = await client.add(file);
      const url = `https://ipfs.infura.io/ipfs/${created.path}`;
      setUrlArr((prev) => [...prev, url]);
      // add url to urlArr and set to localstorage
      localStorage.setItem("urls", JSON.stringify([...urlArr, url]));
      console.log('urls', urlArr, url)
    } catch (error: any) {
      console.log(error.message);
    }
  };

  const getEncryptionPublicKey = async () => {
    console.log('getEncryptionPublicKey: trying with address', address);
    
    return window.ethereum
      .request({
        method: 'eth_getEncryptionPublicKey',
        params: [address], // you must have access to the specified account
      })
      .then((result:any) => {
       return result;
      })
      .catch((error:any) => {
        if (error.code === 4001) {
          // EIP-1193 userRejectedRequest error
          console.log("We can't encrypt anything without the key.");
        } else {
          console.error(error);
        }
      });
    }

  const encrypt = async (e:any) => {
    e.preventDefault();
  //   const bob = EthCrypto.createIdentity();
  //   console.log('bob', bob,bob.publicKey);
    
  //   const publicKeyBuffer = Buffer.from(usrPublicKey, 'hex')
  //   console.log('attempting encryption with' , usrPublicKey, encodedFiles);
    
  //   const encrypted = await EthCrypto.encryptWithPublicKey(
  //     usrPublicKey, // publicKey
  //     JSON.stringify(encodedFiles) // message
  // );
  //   console.log('encrypted', encrypted)
  //   setEncryptedContent(encrypted);
  // let encryptionPublicKey =;

  getEncryptionPublicKey().then((result: any) => {
    console.log('resss', result);
    const publicKeyBuffer = Buffer.from(result, 'hex')
    console.log('attempting encryption with' , result, encodedFiles);
    const encryptedMessage = ethUtil.bufferToHex(
      Buffer.from(
        JSON.stringify(
          sigUtil.encrypt({
            publicKey: result,
            data: JSON.stringify(encodedFiles),
            version: 'x25519-xsalsa20-poly1305',
          })
        ),
        'utf8'
      )
    );
    setEncryptedContent(encryptedMessage);
    console.log('encrypted', encryptedMessage);  
    })
  }


  const decrypt = async (e:any) => {
    e.preventDefault();
    window.ethereum
      .request({
        method: 'eth_decrypt',
        params: [encryptedContent, address],
      })
      .then((decryptedMessage: any) => {
        console.log('The decrypted message is:', decryptedMessage)
        setDecryptedContent(JSON.parse(decryptedMessage || "JSON Parse errror"));
      })
      .catch((error:any) => {
        console.log(error.message)
        setDecryptedContent(error.message);
      });
  }

  const close = async () => resetApp();

  const unSubscribe = async (provider:any) => {
    // Workaround for metamask widget > 9.0.3 (provider.off is undefined);
    window.location.reload();
    if (!provider.off)
      return;
    provider.off("accountsChanged", changedAccount);
    provider.off("networkChanged", networkChanged);
    provider.off("close", close);
  }

  const resetApp = async () => {
    await _web3Modal.clearCachedProvider();
    localStorage.removeItem("WEB3_CONNECT_CACHED_PROVIDER");
    localStorage.removeItem("walletconnect");
    await unSubscribe(provider);
    // this.setState({ ...INITIAL_STATE });
  };

  useEffect(() => {
    const urls = JSON.parse(localStorage.getItem("urls") || "[]");  // on load, fetch urls from localstorage and set them to state
    if (urls) {
      setUrlArr(urls);
      localStorage.setItem("urls", JSON.stringify([]));
    }
  }, []);

  const changedAccount = async (accounts: string[]) => {
    if(!accounts.length) {
      await resetApp(); // Metamask Lock fire an empty accounts array 
    } else {
      await setAddress(accounts[0]);
    }
  }

  const networkChanged = async (networkId: number) => {
    const library = new Web3Provider(provider);
    web3 = new Web3(provider);
    const network = await library.getNetwork();
    const chainId = network.chainId;
    setChainId(chainId);
    setLibrary(library);
  }

  const subscribeToProviderEvents = async (provider:any) => {
    if (!provider.on) {
      return;
    }

    provider.on("accountsChanged", changedAccount);
    provider.on("networkChanged", networkChanged);
    provider.on("close", close);

    await _web3Modal.off('accountsChanged');
  };

  const onConnect = async () => {
    provider = await _web3Modal.connect();
    const library = new Web3Provider(provider);
    web3 = new Web3(provider);
    const network = await library.getNetwork();
    const address = provider.selectedAddress ? provider.selectedAddress : provider.accounts[0];
    setLibrary(library);
    setChainId(network.chainId);
    setAddress(address);
    setConnected(true);
    await subscribeToProviderEvents(provider);
  };

  const SContainer = styled.div`
    height: 100%;
    min-height: 200px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    word-break: break-word;
  `;
  const SLanding = styled(Column)`height: 600px;`;


  return (
  <ChakraProvider theme={theme}>
    <Header
      connected={connected}
      address={address}
      chainId={chainId}
      killSession={resetApp}
    />
    <Box textAlign="center" fontSize="xl">
      <Grid minH="90vh" p={3}>
        {fetching ? (
              <Column center>
                <SContainer>
                  <Loader />
                </SContainer>
              </Column>
            ) : (
                <SLanding center>
                  {!connected && <ConnectButton onClick={onConnect} />}
                  {connected && <div>
                    Encrypt a file:<br />
                  <div style={{ borderRadius: "10px", padding: "10px", borderWidth: "2px"}}>
                    <FileBase64
                      multiple={ true }
                      onDone={(files: any) => (setEncodedFiles(files))} />
                  </div>
                  {urlArr.length !== 0
                    ? urlArr.map((el: any) => { return (
                        <div id={el.split("/").pop()} className="display-item" key={el}><a href={el}><img src={el} alt="ipfs-image" style={{ maxWidth: "200px" }} /></a></div>
                    )}
                    ) : currentAccount ? (
                      <div className="display-item">No data to display</div>
                    ) : null}
                  <br />
                    {encodedFiles.length != 0 &&
                      <div style={{ marginTop: "3rem"}}>
                        <h3 className="text-center mt-25">Encryption callback:</h3>
                        <div style={{ borderRadius: "10px", padding: "10px", borderWidth: "2px"}} className="pre-container" onClick={() => { navigator.clipboard.writeText(JSON.stringify(encodedFiles, null, 2)) }}>
                          <Textarea
                            placeholder={JSON.stringify(encodedFiles, null, 2)}
                            size='sm' defaultValue={JSON.stringify(encodedFiles, null, 2)}
                          />
                          {/* <embed src={encodedFiles[0].base64} /> enable if you want a frame instead of download */}
                          <span style={{ fontSize: "10px" }}>(click here to copy) or</span> <a style={{ fontSize: "10px" }} href={encodedFiles[0].base64} download={encodedFiles[0].name}>here to download {encodedFiles[0].name}</a>
                        </div>
                        <Divider />
                        {/* <Input placeholder='Public key' size='xs' onChange={(e: any) => { setUsrPublicKey(e.target.value) }} value={usrPublicKey}/> */}
                        <button onClick={encrypt} className="button">Encrypt</button> or <button onClick={() => alert('WIP!')} className="button">Upload to IPFS</button> 
                        <Divider />
                        <Box mt={4}>Encrypted content:
                          <div style={{ borderRadius: "10px", padding: "10px", borderWidth: "2px"}} className="pre-container" onClick={() => { navigator.clipboard.writeText(JSON.stringify(encodedFiles, null, 2)) }}>
                            <Textarea
                              placeholder={JSON.stringify(encryptedContent, null, 2)}
                              size='sm' defaultValue={JSON.stringify(encryptedContent, null, 2)} value={encryptedContent} onChange={(e: any) => { setEncryptedContent(e.target.value) }}
                            />
                          </div>
                        </Box>
                        <Divider />
                        <button onClick={decrypt} className="button">Decrypt</button>
                        {decryptedContent !== "" &&
                          <Box style={{ borderRadius: "10px", padding: "10px", borderWidth: "2px"}} className="pre-container" onClick={() => { navigator.clipboard.writeText(JSON.stringify(encodedFiles, null, 2)) }}>
                            <Textarea
                              placeholder={JSON.stringify(decryptedContent, null, 2)}
                              size='sm' defaultValue={JSON.stringify(decryptedContent, null, 2)}
                            />
                            <span style={{ fontSize: "10px" }}>(click here to copy) or</span> <a style={{ fontSize: "10px" }} href={decryptedContent[0].base64} download={decryptedContent[0].name}>here to download {decryptedContent[0].name}</a>
                          </Box>
                        }
                      </div>
                    }
                  </div>
                  }
                </SLanding>
              )}
      </Grid>
    </Box>
  </ChakraProvider>
  )
}
