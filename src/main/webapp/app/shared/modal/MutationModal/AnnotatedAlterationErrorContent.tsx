import React from 'react';
import { AlterationData } from '../NewAddMutationModal';
import { IRootStore } from 'app/stores';
import { componentInject } from 'app/shared/util/typed-inject';
import { Alert, Button } from 'reactstrap';
import _ from 'lodash';

const ERROR_SUGGGESTION_REGEX = new RegExp('The alteration name is invalid, do you mean (.+)\\?');

export interface IAnnotatedAlterationErrorContent extends StoreProps {
  alterationData: AlterationData;
  alterationIndex: number;
  excludingIndex?: number;
  declineSuggestionCallback?: () => void;
}

const AnnotatedAlterationErrorContent = ({
  alterationData,
  alterationIndex,
  excludingIndex,
  declineSuggestionCallback,
  addMutationModalStore,
}: IAnnotatedAlterationErrorContent) => {
  const suggestion = ERROR_SUGGGESTION_REGEX.exec(alterationData.error ?? '')?.[1];

  function handleNoClick() {
    const newAlterationStates = _.cloneDeep(addMutationModalStore?.alterationStates ?? []);
    if (!_.isNil(excludingIndex)) {
      newAlterationStates[alterationIndex].excluding.splice(excludingIndex, 1);
    } else {
      newAlterationStates.splice(alterationIndex, 1);
    }
    addMutationModalStore?.setAlterationStates(newAlterationStates);

    declineSuggestionCallback?.();
  }

  function handleYesClick() {
    if (!suggestion) return;
    const newAlterationData = _.cloneDeep(alterationData);
    newAlterationData.alteration = suggestion;
  }

  return (
    <div>
      <Alert color="danger" className="alteration-message" fade={false}>
        {alterationData.error}
      </Alert>
      {suggestion && (
        <div className="d-flex justify-content-end" style={{ marginTop: '-10px' }}>
          <Button className="me-1" color="danger" outline size="sm" onClick={handleNoClick}>
            No
          </Button>
          <Button onClick={handleYesClick} color="success" outline size="sm">
            Yes
          </Button>
        </div>
      )}
    </div>
  );
};

const mapStoreToProps = ({ addMutationModalStore }: IRootStore) => ({
  addMutationModalStore,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(AnnotatedAlterationErrorContent);
