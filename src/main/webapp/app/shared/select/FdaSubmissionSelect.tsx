import React, { useEffect, useState } from 'react';
import { Props as SelectProps } from 'react-select';
import { IRootStore } from 'app/stores/createStore';
import { connect } from '../util/typed-inject';
import { IFdaSubmission } from '../model/fda-submission.model';
import { getFdaSubmissionNumber } from 'app/entities/companion-diagnostic-device/companion-diagnostic-device';
import { flow, flowResult } from 'mobx';
import Select from 'react-select';

export interface IFdaSubmissionSelectProps extends SelectProps, StoreProps {
  cdxId: number;
}

const FdaSubmissionSelect: React.FunctionComponent<IFdaSubmissionSelectProps> = props => {
  const { getFdaSubmissionsByCdx, cdxId, ...selectProps } = props;
  const [fdaSubmissionList, setFdaSubmissionList] = useState([]);
  const [fdaSubmissionValue, setFdaSubmissionValue] = useState(null);

  useEffect(() => {
    const loadFdaSubmissionOptions = async (id: number) => {
      let options = [];
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
    if (!cdxId) {
      setFdaSubmissionValue(null);
    }
  }, [cdxId]);

  const onFdaSubmissionChange = (option, actionMeta) => {
    setFdaSubmissionValue(option);
    props.onChange(option, actionMeta);
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

export default connect(mapStoreToProps)(FdaSubmissionSelect);
