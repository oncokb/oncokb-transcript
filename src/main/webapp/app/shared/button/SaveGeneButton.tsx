import { observer } from 'mobx-react';
import { componentInject } from '../util/typed-inject';
import { IRootStore } from 'app/stores';
import React, { useCallback, useState, useRef, useEffect } from 'react';
import { ButtonProps } from 'reactstrap';
import { AsyncSaveButton } from './AsyncSaveButton';
import { notifyError, notifySuccess } from 'app/oncokb-commons/components/util/NotificationUtils';
import { IGene } from '../model/gene.model';
import { dataReleaseClient } from '../api/clients';

type ISaveGeneButtonProps = StoreProps & {
  gene?: IGene;
} & ButtonProps &
  Omit<React.HTMLAttributes<HTMLButtonElement>, 'onClick' | 'disabled'>;

function SaveGeneButton({ gene, firebaseGeneService, ...buttonProps }: ISaveGeneButtonProps) {
  const [isPending, setIsPending] = useState(false);
  const [progressPercent, setProgressPercent] = useState<number | undefined>(undefined);
  const [isQueued, setIsQueued] = useState(false);
  const [lastStatus, setLastStatus] = useState<string | undefined>();
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const hugoSymbol = gene?.hugoSymbol;
  const entrezGeneId = gene?.entrezGeneId;

  const resetState = () => {
    setProgressPercent(undefined);
    setIsPending(false);
    setIsQueued(false);
  };

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  const pollStatus = async (entrez: number) => {
    try {
      if (!pollIntervalRef.current) {
        return;
      }
      const statusResp = await dataReleaseClient.getGeneStatus(entrez);
      if (!statusResp?.data) return;

      const { stepIndex, stepTotal, status } = statusResp.data;
      const prevStatus = lastStatus;
      setLastStatus(status);

      if (status === 'running' || status === 'queued') {
        setIsPending(true);
      }

      if (status === 'queued') {
        setIsQueued(true);
        setProgressPercent(0);
      } else {
        setIsQueued(false);
        const percent = Math.round((stepIndex / stepTotal) * 100);
        setProgressPercent(percent);
      }

      if (status === 'succeeded') {
        stopPolling();
        resetState();
        if (prevStatus !== 'succeeded') {
          notifySuccess(`${hugoSymbol ?? 'All genes'} saved successfully`);
        }
      }

      if (status === 'failed') {
        stopPolling();
        resetState();
        notifyError(`Failed saving ${hugoSymbol ?? 'genes'}`);
      }
    } catch (e) {
      stopPolling();
      resetState();
      notifyError(e);
    }
  };

  const startPolling = (entrez: number) => {
    stopPolling();
    const interval = setInterval(() => pollStatus(entrez), 1000);
    pollIntervalRef.current = interval;
  };

  useEffect(() => {
    const checkInProgressSave = async () => {
      if (!entrezGeneId) return;

      try {
        const statusResp = await dataReleaseClient.getGeneStatus(entrezGeneId);
        if (!statusResp?.data) return;

        const { stepIndex, stepTotal, status } = statusResp.data;
        setLastStatus(status);

        startPolling(entrezGeneId);

        if (status === 'running' || status === 'queued') {
          setIsPending(true);

          if (status === 'queued') {
            setIsQueued(true);
            setProgressPercent(0);
          } else if (stepIndex && stepTotal) {
            setIsQueued(false);
            const percent = Math.round((stepIndex / stepTotal) * 100);
            setProgressPercent(percent);
          }
        }
      } catch (e) {
        resetState();
      }
    };

    checkInProgressSave();

    return () => {
      stopPolling();
    };
  }, [entrezGeneId, lastStatus]);

  const onClickHandler = async () => {
    setIsPending(true);
    try {
      const isGermline = false;

      if (!hugoSymbol || !entrezGeneId) {
        await firebaseGeneService?.saveAllGenes(isGermline);
        notifySuccess('All genes saved!');
        setIsPending(false);
        return;
      }

      await firebaseGeneService?.saveGene(isGermline, hugoSymbol);
      setProgressPercent(0);
      startPolling(entrezGeneId);
    } catch (e) {
      notifyError(e);
      setIsPending(false);
      setProgressPercent(undefined);
    }
  };

  const confirmText = hugoSymbol === undefined ? 'Save All Genes to Staging' : `Save ${hugoSymbol} to Staging`;

  return (
    <>
      <AsyncSaveButton
        {...buttonProps}
        confirmText={confirmText}
        isSavePending={isPending}
        disabled={isPending || buttonProps.disabled}
        color="primary"
        outline
        onClick={onClickHandler}
      />

      {progressPercent !== undefined && entrezGeneId && (
        <div className="progress mt-2" style={{ maxWidth: '300px', height: '30px' }}>
          <div
            className={`progress-bar progress-bar-striped progress-bar-animated ${isQueued ? 'bg-warning' : ''}`}
            role="progressbar"
            style={{ width: isQueued ? '100%' : `${progressPercent}%` }}
          >
            {isQueued ? 'Queued, waiting to start...' : `${progressPercent}%`}
          </div>
        </div>
      )}
    </>
  );
}

const mapStoreToProps = ({ firebaseGeneService }: IRootStore) => ({
  firebaseGeneService,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(observer(SaveGeneButton));
