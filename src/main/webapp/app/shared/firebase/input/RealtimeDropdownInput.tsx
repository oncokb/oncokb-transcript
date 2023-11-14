import classNames from 'classnames';
import React from 'react';
import { Label } from 'reactstrap';
import { Props as SelectProps } from 'react-select';
import Select from 'react-select';
import { ExtractPathExpressions } from '../../util/firebase/firebase-crud-store';
import { Gene } from '../../model/firebase/firebase.model';
import { IRootStore } from 'app/stores';
import { inject } from 'mobx-react';
import { getFirebasePath } from 'app/shared/util/firebase/firebase-utils';
import { RealtimeBasicLabel } from './RealtimeBasicInput';

export interface IRealtimeDropdownInput extends SelectProps, StoreProps {
  fieldKey: ExtractPathExpressions<Gene>;
  options: string[];
  labelClass?: string;
  label?: string;
}

const RealtimeDropdownInput = (props: IRealtimeDropdownInput) => {
  const { fieldKey, options, labelClass, label, updateReviewableContent, ...selectProps } = props;

  const selectOptions = options.map(o => ({ label: o, value: o }));

  const onChangeHandler = (newValue, actionMeta) => {
    updateReviewableContent(getFirebasePath('GENE', props.data.name), fieldKey, newValue.value);
    if (props.onChange) {
      props.onChange(newValue, actionMeta);
    }
  };
  return (
    <div className="flex d-flex mb-2">
      <div>{props.label && <RealtimeBasicLabel label={props.label} id={props.label} labelClass="mr-2 font-weight-bold" />}</div>
      <div className="flex-grow-1">
        <Select {...selectProps} onChange={onChangeHandler} options={selectOptions} />
      </div>
    </div>
  );
};

const mapStoreToProps = ({ firebaseGeneStore }: IRootStore) => ({
  data: firebaseGeneStore.data,
  updateReviewableContent: firebaseGeneStore.updateReviewableContent,
});

type StoreProps = {
  data?: Readonly<Gene>;
  updateReviewableContent?: (path: string, key: ExtractPathExpressions<Gene>, value: any) => void;
};

export default inject(mapStoreToProps)(RealtimeDropdownInput);
