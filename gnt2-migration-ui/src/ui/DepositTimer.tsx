import React, {useEffect, useState} from 'react';
import {useAsync} from './hooks/useAsync';
import {useServices} from './hooks/useServices';
import {useProperty} from './hooks/useProperty';
import {DepositState} from '../services/TokensService';
import {Timer} from './commons/Timer';

export const DepositTimer = () => {
  const {tokensService, connectionService, contractAddressService, refreshService} = useServices();
  const account = useProperty(connectionService.account);
  const contractAddresses = useProperty(contractAddressService.contractAddresses);

  const [depositState] = useAsync<DepositState>(async () => tokensService.getDepositState(account), [contractAddresses, account]);
  const [depositText, setDepositText] = useState('');
  const [timeLeft] = useAsync(async () => tokensService.getDepositUnlockTime(account), [contractAddresses, account]);
  const [timer, setTimer] = useState<string | undefined>(undefined);
  const [flag, setFlag] = useState(false);

  useEffect(() => {
    setTimer('');
    let timerId: number;
    switch (depositState) {
      case DepositState.EMPTY:
        setDepositText('is empty');
        break;
      case DepositState.UNLOCKED:
        setDepositText('is unlocked');
        break;
      case DepositState.TIME_LOCKED:
        if (timeLeft) {
          timerId = Timer(timeLeft.toNumber() * 1000, setTimer);
        }
        setDepositText('is time-locked');
        break;
      default:
        setDepositText('is locked');
    }
    return () => { if (timerId) { clearInterval(timerId); } };
  }, [timeLeft, depositState, account, contractAddresses]);


  if (!flag && timer === '00:00:00') {
    refreshService.refresh();
    setFlag(true);
  }

  return (
    <>
      <div data-testid='deposit-status'>Deposit {depositText}</div>
      {timer && <div data-testid='deposit-timer'>Time left to unlock deposit: {timer}</div>}
    </>
  );
};
