import { observer } from 'mobx-react';
import { componentInject } from '../util/typed-inject';
import { IRootStore } from 'app/stores';
import React, { useCallback, useState } from 'react';
import { Button, ButtonProps } from 'reactstrap';

type ISaveGeneButtonProps = StoreProps & {
  hugoSymbol?: string;
} & ButtonProps &
  Omit<React.HTMLAttributes<HTMLButtonElement>, 'onClick' | 'disabled'>;

function SaveGeneButton({ hugoSymbol, firebaseGeneService, ...buttonProps }: ISaveGeneButtonProps) {
  const [disabled, setDisabled] = useState(false);
  const onClickHandler = useCallback(async () => {
    setDisabled(true);
    try {
      const isGermline = false;
      if (hugoSymbol === undefined) {
        await firebaseGeneService.saveAllGenes(isGermline);
      } else {
        await firebaseGeneService.saveGene(isGermline, hugoSymbol);
      }
    } catch (e) {
      console.error(e);
    }
    setDisabled(false);
  }, [hugoSymbol]);
  return (
    <Button {...buttonProps} color="primary" outline onClick={onClickHandler} disabled={disabled}>
      {hugoSymbol === undefined ? 'Save All Genes' : `Save ${hugoSymbol}`}
    </Button>
  );
}

const mapStoreToProps = ({ firebaseGeneService }: IRootStore) => ({
  firebaseGeneService,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(observer(SaveGeneButton));
