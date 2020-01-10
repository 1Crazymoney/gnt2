import React, {useState} from 'react';
import {useServices} from './useServices';
import {formatValue} from '../utils/formatter';
import styled from 'styled-components';
import {BigNumber} from 'ethers/utils';
import {useAsyncEffect} from './hooks/useAsyncEffect';
import {useProperty} from './hooks/useProperty';
import '../types';

export const Account = () => {
  const [address, setAddress] = useState<string | undefined>(undefined);
  const [balance, setBalance] = useState<BigNumber | undefined>(undefined);
  const [oldTokensBalance, setOldTokensBalance] = useState<BigNumber | undefined>(undefined);
  const [newTokensBalance, setNewTokensBalance] = useState<BigNumber | undefined>(undefined);
  const [batchingTokensBalance, setBatchingTokensBalance] = useState<BigNumber | undefined>(undefined);
  const [refresh, setRefresh] = useState(false);

  const {accountService, tokensService, contractAddressService, connectionService} = useServices();
  const tokenAdresses = useProperty(contractAddressService.golemNetworkTokenAddress);
  const account = useProperty(connectionService.account);

  useAsyncEffect(async () => {
    const account = await accountService.getDefaultAccount();
    setAddress(account);
    setBalance(await accountService.balanceOf(account));
    setOldTokensBalance(await tokensService.balanceOfOldTokens(account));
    setNewTokensBalance(await tokensService.balanceOfNewTokens(account));
    setBatchingTokensBalance(await tokensService.balanceOfBatchingTokens(account));
  }, [refresh, account, tokenAdresses]);

  const migrateTokens = async () => {
    await tokensService.migrateTokens((await tokensService.balanceOfOldTokens(await accountService.getDefaultAccount())).toString());
    setRefresh(!refresh);
  };

  const format = (value: BigNumber, digits = 3) => formatValue(value.toString(), digits);

  return (
    <div>
      <div>Your address:</div>
      <div>{address}</div>
      <div>Your NGNT balance:</div>
      {newTokensBalance && <div data-testid='NGNT-balance'>{format(newTokensBalance)}</div>}
      <div>Your GNT balance:</div>
      {oldTokensBalance && <div data-testid='GNT-balance'>{format(oldTokensBalance)}</div>}
      <div>Your GNTB balance:</div>
      {batchingTokensBalance && <div data-testid='GNTB-balance'>{format(batchingTokensBalance)}</div>}
      <div>Your ETH balance:</div>
      {balance && <div data-testid='ETH-balance'>{format(balance, 4)}</div>}
      <Migrate data-testid="button" onClick={migrateTokens} disabled={oldTokensBalance?.eq(new BigNumber('0'))}>
          Migrate
      </Migrate>
    </div>
  );
};

const Migrate = styled.button`
  background-color: #181EA9;
  border: none;
  color: white;
  padding: 15px 32px;
  margin: 12px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  border-radius: 8px;
  &:disabled {
    opacity: 0.3;
    background: grey;
  }
`;
