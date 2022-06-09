import React, { useEffect, useState } from 'react';
import { Props as SelectProps } from 'react-select';
import { IRootStore } from 'app/stores/createStore';
import { connect } from '../util/typed-inject';
import { IAlteration } from '../model/alteration.model';
import Select from 'react-select';
import { flow, flowResult } from 'mobx';

interface IAlterationSelectProps extends SelectProps, StoreProps {
  geneId: string;
}

const AlterationSelect: React.FunctionComponent<IAlterationSelectProps> = props => {
  const { geneId, getAlterationsByGeneId, ...selectProps } = props;
  const [alterationList, setAlterationList] = useState([]);
  const [alterationValue, setAlterationValue] = useState(null);

  useEffect(() => {
    const loadAlterationOptions = async (id: string) => {
      let options = [];
      if (id) {
        const alterations: IAlteration[] = await flowResult(getAlterationsByGeneId({ geneId: parseInt(id, 10) }));
        alterations?.sort((a: IAlteration, b: IAlteration) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0));
        options = alterations?.map((alteration: IAlteration) => ({
          value: alteration.id,
          label: alteration.name,
        }));
        setAlterationList(options);
      }
    };
    loadAlterationOptions(geneId);
    if (!geneId) {
      setAlterationValue(null);
    }
  }, [geneId]);

  const onAlterationChange = (option, actionMeta) => {
    setAlterationValue(option);
    props.onChange(option, actionMeta);
  };

  return (
    <Select
      {...selectProps}
      name={'alterations'}
      value={alterationValue}
      options={alterationList}
      onChange={onAlterationChange}
      placeholder="Select an alteration..."
      isDisabled={!geneId}
      isClearable
    />
  );
};

const mapStoreToProps = ({ alterationStore }: IRootStore) => ({
  getAlterationsByGeneId: flow(alterationStore.getAlterationsByGeneId),
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(AlterationSelect);
