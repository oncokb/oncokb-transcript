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

  useEffect(() => {
    const loadFdaSubmissionOptions = async (id: number) => {
      let options: FdaSubmissionSelectOption[] = [];
      if (id) {
        const fdaSubmissions = await flowResult(getFdaSubmissionsByCdx({ cdxId: id }));
        options = fdaSubmissions?.map((fdaSubmission: IFdaSubmission) => ({
          value: fdaSubmission.id,
          label: getFdaSubmissionNumber(fdaSubmission.number, fdaSubmission.supplementNumber),
        }));
        setFdaSubmissionList(options);
      }
    };
    loadFdaSubmissionOptions(cdxId);
  }, [cdxId]);

  return <Select placeholder="Select FDA submission" name={'fdaSubmissions'} options={fdaSubmissionList} isClearable {...selectProps} />;
};

const mapStoreToProps = ({ fdaSubmissionStore }: IRootStore) => ({
  getFdaSubmissionsByCdx: flow(fdaSubmissionStore.getFdaSubmissionsByCDx),
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default function <IsMulti extends boolean = false>(props: InjectProps<IFdaSubmissionSelectProps<IsMulti>, StoreProps>) {
  const InjectedFdaSubmissionSelect = connect(mapStoreToProps)<IFdaSubmissionSelectProps<IsMulti>>(FdaSubmissionSelect);
  return <InjectedFdaSubmissionSelect {...props} />;
}
