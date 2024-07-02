import React from 'react';
import { Props as SelectProps } from 'react-select';
import { IRootStore } from 'app/stores/createStore';
import { InjectProps, connect } from '../util/typed-inject';
import AsyncSelect from 'react-select/async';
import { INciThesaurus } from 'app/shared/model/nci-thesaurus.model';
import _ from 'lodash';
import { DrugSelectOption } from './DrugSelect';

type GetOptionFromNcitRtn = ReturnType<typeof getOptionFromNcit>;
export interface INcitCodeSelectProps<IsMulti extends boolean> extends SelectProps<GetOptionFromNcitRtn, IsMulti>, StoreProps {
  ncit: INciThesaurus | null | undefined;
}

const NCIT_UID_SEPARATOR = '-';
export const getNcitUniqId = (ncit: INciThesaurus) => {
  return `${ncit.id}${NCIT_UID_SEPARATOR}${ncit.code}`;
};
export const parseNcitUniqId = (ncitId: string): INciThesaurus | null => {
  const parts = ncitId.split(NCIT_UID_SEPARATOR);
  if (parts.length === 2) {
    return {
      id: Number(parts[0]),
      code: parts[1],
      preferredName: null,
      version: '',
      synonyms: null,
      displayName: null,
    };
  } else {
    return null;
  }
};

export function getOptionFromNcit(ncit: INciThesaurus): DrugSelectOption {
  return {
    value: getNcitUniqId(ncit),
    label: `${ncit.preferredName} (${ncit.code})`,
    synonyms: ncit.synonyms ?? undefined,
    ncit,
  };
}

const NcitCodeSelect = <IsMulti extends boolean>(props: INcitCodeSelectProps<IsMulti>) => {
  const { searchEntities, ...selectProps } = props;

  const onNcitChange: INcitCodeSelectProps<IsMulti>['onChange'] = (option, actionMeta) => {
    props.onChange?.(option, actionMeta);
  };

  const loadNcitOptions = _.debounce((searchWord: string, callback: (options: GetOptionFromNcitRtn[]) => void) => {
    if (searchWord) {
      searchEntities({ query: searchWord }).then(response => {
        callback(response.data.map(ncit => getOptionFromNcit(ncit)));
      });
    } else {
      callback([]);
    }
  }, 500);

  return (
    <AsyncSelect
      {...selectProps}
      name={'fdaSubmissions'}
      defaultValue={props.ncit ? getOptionFromNcit(props.ncit) : null}
      loadOptions={loadNcitOptions}
      onChange={onNcitChange}
      placeholder="Type to search NCI Thesaurus..."
      isClearable
    />
  );
};

const mapStoreToProps = ({ nciThesaurusStore }: IRootStore) => ({
  searchEntities: nciThesaurusStore.searchEntities,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default function <IsMulti extends boolean = false>(props: InjectProps<INcitCodeSelectProps<IsMulti>, StoreProps>) {
  const InjectedNcitCodeSelect = connect(mapStoreToProps)<INcitCodeSelectProps<IsMulti>>(NcitCodeSelect);
  return <InjectedNcitCodeSelect {...props} />;
}
