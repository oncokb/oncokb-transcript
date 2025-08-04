import { observer } from 'mobx-react';
import { componentInject } from '../util/typed-inject';
import { IRootStore } from 'app/stores';
import React, { useCallback, useState } from 'react';
import { ButtonProps } from 'reactstrap';
import { AsyncSaveButton } from './AsyncSaveButton';
import { notifyError, notifySuccess } from 'app/oncokb-commons/components/util/NotificationUtils';

type ISaveGeneButtonProps = StoreProps & {
  isGermline: boolean;
  hugoSymbol?: string;
} & ButtonProps &
  Omit<React.HTMLAttributes<HTMLButtonElement>, 'onClick' | 'disabled'>;

function SaveGeneButton({ isGermline, hugoSymbol, firebaseGeneService, ...buttonProps }: ISaveGeneButtonProps) {
  const [isSavePending, setIsSavePending] = useState(false);
  const onClickHandler = useCallback(async () => {
    setIsSavePending(true);
    try {
      if (hugoSymbol === undefined) {
        await firebaseGeneService?.saveAllGenes(isGermline);
        notifySuccess('All genes saved!');
      } else {
        await firebaseGeneService?.saveGene(isGermline, hugoSymbol);
        notifySuccess(`${hugoSymbol} was saved!`);
      }
    } catch (e) {
      console.error(e);
      notifyError(e);
    }
    setIsSavePending(false);
  }, [hugoSymbol]);

  const confirmText = hugoSymbol === undefined ? 'Save All Genes to Staging' : `Save ${hugoSymbol} to Staging`;
  return (
    <AsyncSaveButton
      {...buttonProps}
      confirmText={confirmText}
      isSavePending={isSavePending}
      disabled={isSavePending}
      color="primary"
      outline
      onClick={onClickHandler}
    />
  );
}

const mapStoreToProps = ({ firebaseGeneService }: IRootStore) => ({
  firebaseGeneService,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(observer(SaveGeneButton));
