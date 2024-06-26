import React, { useEffect, useState } from 'react';
import { ActionMeta, GroupBase, MultiValue, OnChangeValue, OptionsOrGroups, Props as SelectProps, SingleValue } from 'react-select';
import { IRootStore } from 'app/stores/createStore';
import { InjectProps, connect } from '../util/typed-inject';
import { IFdaSubmission } from '../model/fda-submission.model';
import { getFdaSubmissionNumber } from 'app/entities/companion-diagnostic-device/companion-diagnostic-device';
import { flow, flowResult } from 'mobx';
import Select from 'react-select';

export type FdaSubmissionSelectOption = {
  label: string;
  // TYPE-ISSUE: not sure what this should be
  value: any;
};

export interface IFdaSubmissionSelectProps<IsMulti extends boolean> extends SelectProps<FdaSubmissionSelectOption, IsMulti>, StoreProps {
  cdxId: number;
}

const FdaSubmissionSelect = <IsMulti extends boolean>(props: IFdaSubmissionSelectProps<IsMulti>) => {
  const { getFdaSubmissionsByCdx, cdxId, ...selectProps } = props;
  const [fdaSubmissionList, setFdaSubmissionList] = useState<
    OptionsOrGroups<FdaSubmissionSelectOption, GroupBase<FdaSubmissionSelectOption>> | undefined
  >([]);
  const [fdaSubmissionValue, setFdaSubmissionValue] = useState<OnChangeValue<FdaSubmissionSelectOption, IsMulti> | null>(null);

  useEffect(() => {
    const loadFdaSubmissionOptions = async (id: number) => {
      let options: FdaSubmissionSelectOption[] = [];
      if (id) {
        const fdaSubmissions = await flowResult(getFdaSubmissionsByCdx({ cdxId: id }));
        options = fdaSubmissions?.map((fdaSubmission: IFdaSubmission) => ({
          value: fdaSubmission.id,
          label: getFdaSubmissionNumber(fdaSubmission.number ?? '', fdaSubmission.supplementNumber),
        }));
        setFdaSubmissionList(options);
      }
    };
    loadFdaSubmissionOptions(cdxId);
    if (!cdxId) {
      setFdaSubmissionValue(null);
    }
  }, [cdxId]);

  const onFdaSubmissionChange: (
    newValue: OnChangeValue<FdaSubmissionSelectOption, IsMulti>,
    actionMeta: ActionMeta<FdaSubmissionSelectOption>,
  ) => void = (option, actionMeta) => {
    setFdaSubmissionValue(option);
    props.onChange?.(option, actionMeta);
  };

  return (
    <Select
      {...selectProps}
      name={'fdaSubmissions'}
      value={fdaSubmissionValue}
      options={fdaSubmissionList}
      onChange={onFdaSubmissionChange}
      placeholder="Select an fda submission..."
      isClearable
    />
  );
};

const mapStoreToProps = ({ fdaSubmissionStore }: IRootStore) => ({
  getFdaSubmissionsByCdx: flow(fdaSubmissionStore.getFdaSubmissionsByCDx),
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default function <IsMulti extends boolean = boolean>(props: InjectProps<IFdaSubmissionSelectProps<IsMulti>, StoreProps>) {
  const InjectedFdaSubmissionSelect = connect<IFdaSubmissionSelectProps<IsMulti>, StoreProps>(mapStoreToProps)(FdaSubmissionSelect);
  return <InjectedFdaSubmissionSelect {...props} />;
}
