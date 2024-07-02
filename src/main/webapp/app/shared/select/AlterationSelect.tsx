import React, { useEffect, useState } from 'react';
import { ActionMeta, OnChangeValue, Props as SelectProps, SingleValue } from 'react-select';
import { IRootStore } from 'app/stores/createStore';
import { InjectProps, connect } from '../util/typed-inject';
import { IAlteration } from '../model/alteration.model';
import Select from 'react-select';
import { flow, flowResult } from 'mobx';

export type AlterationSelectOption = {
  value: number;
  label: string;
};

interface IAlterationSelectProps extends SelectProps<AlterationSelectOption, true>, StoreProps {
  geneId: string;
}

const AlterationSelect = (props: IAlterationSelectProps) => {
  const { geneId, getAlterationsByGeneId, ...selectProps } = props;
  const [alterationList, setAlterationList] = useState<OnChangeValue<AlterationSelectOption, true>>([]);
  const [alterationValue, setAlterationValue] = useState<OnChangeValue<AlterationSelectOption, true> | null>(null);

  useEffect(() => {
    const loadAlterationOptions = async (id: string) => {
      let options: AlterationSelectOption[] = [];
      if (id) {
        const alterations: IAlteration[] = await flowResult(getAlterationsByGeneId({ geneId: parseInt(id, 10) }));
        alterations?.sort((a: IAlteration, b: IAlteration) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0));
        options = alterations?.map(
          (alteration: IAlteration): AlterationSelectOption => ({
            value: alteration.id,
            label: alteration.name,
          }),
        );
        setAlterationList(options);
      }
    };
    loadAlterationOptions(geneId);
    if (!geneId) {
      setAlterationValue(null);
    }
  }, [geneId]);

  const onAlterationChange: (
    newValue: OnChangeValue<AlterationSelectOption, true>,
    actionMeta: ActionMeta<AlterationSelectOption>,
  ) => void = (option, actionMeta) => {
    setAlterationValue(option);
    props.onChange?.(option, actionMeta);
  };

  return (
    <Select
      {...selectProps}
      isMulti
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

export default function (props: InjectProps<IAlterationSelectProps, StoreProps>) {
  const InjectedAlterationSelect = connect(mapStoreToProps)<Omit<IAlterationSelectProps, 'isMulti'>>(AlterationSelect);
  return <InjectedAlterationSelect {...props} />;
}
