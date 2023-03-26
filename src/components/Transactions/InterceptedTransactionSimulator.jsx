import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import './prism-vsc-dark-plus.css'; //Example style, you can use another
import Editor from 'react-simple-code-editor';
import cross from '../../assets/img/cross.png';
import axios from 'axios';
import { ethers } from 'ethers';

const OpacityContainer = styled.div`
  position: fixed;
  width: 100%;
  right: 0;
  top: 0;
  height: 100%;
  background-color: black;
  opacity: 0.4;
  overflow: hidden;
`;

const SimulatorContainer = styled.div`
  background-color: #1c1c1c;
  width: 100%;
  right: 0;
  height: 100%;
  position: absolute;
  top: 0;
  border-left: 2px solid rgb(58, 58, 58);
  padding-left: 2%;
  padding-top: 2%;
  overflow-y: scroll;
  padding-top: calc(3.5vh + 6%);
  /* padding-bottom: 5vh; */
  overflow: hidden;

  @media (min-width: 900px) {
    width: 100%;
    padding-top: calc(3.5vh + 4%);
  }
`;

const DetailsScrollContainer = styled.div`
  overflow-y: scroll;
  padding-bottom: 20vh;
  padding-top: 2vh;
  height: -webkit-fill-available;
  padding-left: 2%;
`;

const Heading = styled.div`
  font-size: 3.5vh;
  text-align: left;
  color: white;
  background-color: #2d2d2d;
  border-bottom: 2px solid rgb(58, 58, 58);
  width: 100%;
  left: 0;
  position: absolute;
  top: 0;
  padding: 1.8%;
  padding-left: 4%;
`;

const TransactionDetailsContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  margin-top: 2vh;
`;

const TransactionDetail = styled.div`
  display: flex;
  flex-direction: row;
  margin-right: 1vw;
  margin-bottom: 0.8vh;
  font-size: 2.1vh;
  width: 40%;
  @media (min-width: 900px) {
    font-size: 1.8vh;
  }
`;

const TransactionDetailKey = styled.div`
  /* background-color: black; */
  color: #a09fa6;
  /* padding: 0.5vw; */
  text-align: center;
  border-top-left-radius: 5px;
  border-bottom-left-radius: 5px;
`;

const TransactionDetailValue = styled.div`
  /* background-color: #363636; */
  color: #ededef;
  display: flex;
  align-items: center;
  border-top-right-radius: 5px;
  border-bottom-right-radius: 5px;
  /* padding: 0.5vw; */
  margin-left: 0.5vw;
`;

const Subheading = styled.div`
  color: white;
  font-size: 3vh;
  text-align: left;
  /* margin-top: 3vh; */
`;

const CloseIcon = styled.img`
  position: fixed;
  top: 3%;
  right: 2%;
  width: 1.5vw;
  z-index: 1;
  cursor: pointer;
`;

const FunctionName = styled.div`
  font-size: 2.3vh;
  color: #b3b3b3;
  text-align: left;
  margin-top: 2%;
  margin-bottom: 2%;

  @media (min-width: 900px) {
    font-size: 1.8vh;
  }
`;

const SimulateButton = styled.div`
  right: 5%;
  top: 0%;
  z-index: 2;
  margin-top: 1.2%;
  background-color: white;
  color: black;
  border-radius: 50px;
  font-size: 2vh;
  font-family: GilmerMedium;
  padding-top: 1%;
  padding-bottom: 1%;
  padding-left: 2%;
  padding-right: 2%;
  position: absolute;
  top: 0%;
  right: 8%;
  cursor: pointer;

  :hover {
    background-color: #999999;
  }
`;

const simulationKeys = {
  from: { convertToNumber: false },
  to: { convertToNumber: false },
  value: { convertToNumber: true },
  input: { convertToNumber: false },
  gas: { convertToNumber: true },
  gasPrice: { convertToNumber: true },
};

const filterSimulatorKeys = (obj) => {
  let data = {};
  Object.entries(obj)
    .filter(([key, value]) => Object.keys(simulationKeys).includes(key))
    .map(([key, value]) => {
      data[key] = !simulationKeys[key].convertToNumber ? value : Number(value);
    });
  return JSON.stringify(data, null, 4);
};

const InterceptedTransactionSimulator = ({ transaction }) => {
  console.log('this is the simulator transaction - ', transaction);
  const [simulatorData, setSimulatorData] = useState(
    filterSimulatorKeys({ ...transaction, input: transaction.data })
  );
  const [decodedInputData, setDecodedInputData] = useState('{}');
  const [contractFunctionName, setContractFunctionName] = useState(false);
  const [contractAbi, setContractAbi] = useState([]);
  const [simulationResults, setSimulationResults] = useState('{}');

  useEffect(() => {
    (async () => {
      let abiResponse = await axios.get(
        `https://api.polygonscan.com/api?module=contract&action=getabi&address=${transaction.to}&apikey=DDZ33H8RZYENMTDX5KCM67FW1HBJD5CRUC`
      );
      console.log('inside the use effect - ', transaction.to, abiResponse);
      if (abiResponse.data.status == '0') {
        return;
      }
      let abi = JSON.parse(abiResponse.data.result);
      console.log('this is the abi - ', abi);
      setContractAbi(abi);
      let contractInterface = new ethers.Interface(abi);
      let decodedArgumentsProxy = contractInterface.decodeFunctionData(
        transaction.data.substring(0, 10),
        transaction.data
      );
      let decodedArguments = JSON.parse(
        JSON.stringify(
          decodedArgumentsProxy,
          (key, value) => (typeof value === 'bigint' ? value.toString() : value) // return everything else unchanged
        )
      );
      let functionData = contractInterface.getFunction(
        transaction.data.substring(0, 10)
      );

      console.log('this is function data - ', functionData, decodedArguments);

      let decodedObj = {};
      functionData.inputs.forEach((param, index) => {
        decodedObj[param.name] = decodedArguments[index];
      });
      setDecodedInputData(JSON.stringify(decodedObj, null, 4));
      setContractFunctionName(functionData.name);
    })();
  }, []);

  const decodedInputChange = (code) => {
    let data = JSON.parse(simulatorData);
    try {
      let contractInterface = new ethers.Interface(contractAbi);
      console.log(
        'going to get encoded function data - ',
        contractFunctionName,
        Object.values(JSON.parse(code))
      );
      let inputEncoded = contractInterface.encodeFunctionData(
        transaction.data.substring(0, 10),
        Object.values(JSON.parse(code))
      );
      data.input = inputEncoded;
    } catch (err) {
      console.error('error in getting input data - ', err);
      data.input = 'invalid_input';
    }
    setDecodedInputData(code);
    setSimulatorData(JSON.stringify(data, null, 4));
  };

  const simulateTransaction = async () => {
    try {
      let response = await axios.post(
        `https://api.tenderly.co/api/v1/account/apoorv77/project/simulation/simulate`,
        {
          save: false,
          save_if_fails: false,
          simulation_type: 'quick',
          network_id: '137',
          ...JSON.parse(simulatorData),
        },
        {
          headers: {
            'X-Access-Key': process.env.REACT_APP_TENDERLY_API_KEY,
          },
        }
      );
      setSimulationResults(JSON.stringify(response.data, null, 4));
    } catch (err) {
      console.error('Failed to simulate transaction - ', err);
      setSimulationResults(JSON.stringify(err.response.data, null, 4));
    }
  };

  const closeSimulator = async () => {
    await chrome.storage.sync.set({ walletMessage: false });
    window.close();
  };

  return (
    <>
      <OpacityContainer></OpacityContainer>
      <SimulatorContainer>
        <CloseIcon onClick={closeSimulator} src={cross}></CloseIcon>
        <Heading>Transaction Simulator</Heading>
        <SimulateButton onClick={simulateTransaction}>SIMULATE</SimulateButton>
        <DetailsScrollContainer>
          <Subheading>Transaction Details</Subheading>
          <Editor
            value={simulatorData}
            onValueChange={(code) => {
              setSimulatorData(code);
            }}
            highlight={(code) => highlight(code, languages.js)}
            padding={10}
            style={{
              fontFamily: '"Fira code", "Fira Mono", monospace',
              fontSize: 12,
              backgroundColor: 'black',
              marginTop: '2%',
              width: '90%',
              caretColor: 'white',
            }}
          />
          {contractFunctionName && (
            <>
              <Subheading style={{ marginTop: '3vh' }}>
                Input Decoded
              </Subheading>
              <FunctionName>{contractFunctionName}()</FunctionName>
              <Editor
                value={decodedInputData}
                onValueChange={decodedInputChange}
                highlight={(code) => highlight(code, languages.js)}
                padding={10}
                style={{
                  fontFamily: '"Fira code", "Fira Mono", monospace',
                  fontSize: 12,
                  backgroundColor: 'black',
                  marginTop: '0%',
                  width: '90%',
                  caretColor: 'white',
                }}
              />
            </>
          )}
          <Subheading style={{ marginTop: '3vh' }}>
            Simulation Results
          </Subheading>
          <Editor
            value={simulationResults}
            onValueChange={() => {}}
            highlight={(code) => highlight(code, languages.js)}
            padding={10}
            style={{
              fontFamily: '"Fira code", "Fira Mono", monospace',
              fontSize: 12,
              backgroundColor: 'black',
              marginTop: '0%',
              width: '90%',
              caretColor: 'black',
              marginTop: '2%',
            }}
          />
        </DetailsScrollContainer>
        {/* 
        <DetailsScrollContainer>
          <Subheading>All Details</Subheading>
          <TransactionDetailsContainer>
            {Object.entries(transaction)
              .filter(([_, value]) => value)
              .map(([key, value]) => (
                <TransactionDetail>
                  <TransactionDetailKey>{key}: </TransactionDetailKey>
                  <TransactionDetailValue>
                    {value.length > 20
                      ? value.substring(0, 10) +
                        '...' +
                        value.substring(value.length - 10, value.length)
                      : value}
                  </TransactionDetailValue>
                </TransactionDetail>
              ))}
          </TransactionDetailsContainer>
          <Subheading style={{ marginTop: '3vh' }}>
            Transaction Details
          </Subheading>
          <Editor
            value={simulatorData}
            onValueChange={(code) => {
              setSimulatorData(code);
            }}
            highlight={(code) => highlight(code, languages.js)}
            padding={10}
            style={{
              fontFamily: '"Fira code", "Fira Mono", monospace',
              fontSize: 12,
              backgroundColor: 'black',
              marginTop: '2%',
              width: '90%',
              caretColor: 'white',
            }}
          />
          {contractFunctionName && (
            <>
              <Subheading style={{ marginTop: '3vh' }}>
                Input Decoded
              </Subheading>
              <FunctionName>{contractFunctionName}()</FunctionName>
              <Editor
                value={decodedInputData}
                onValueChange={decodedInputChange}
                highlight={(code) => highlight(code, languages.js)}
                padding={10}
                style={{
                  fontFamily: '"Fira code", "Fira Mono", monospace',
                  fontSize: 12,
                  backgroundColor: 'black',
                  marginTop: '0%',
                  width: '90%',
                  caretColor: 'white',
                }}
              />
            </>
          )}
          <Subheading style={{ marginTop: '3vh' }}>
            Simulation Results
          </Subheading>
          <Editor
            value={simulationResults}
            onValueChange={() => {}}
            highlight={(code) => highlight(code, languages.js)}
            padding={10}
            style={{
              fontFamily: '"Fira code", "Fira Mono", monospace',
              fontSize: 12,
              backgroundColor: 'black',
              marginTop: '0%',
              width: '90%',
              caretColor: 'black',
              marginTop: '2%',
            }}
          />
        </DetailsScrollContainer> */}
      </SimulatorContainer>
    </>
  );
};

export default InterceptedTransactionSimulator;
