import React from 'react';
import { Props as SelectProps } from 'react-select';
import { IRootStore } from 'app/stores/createStore';
import { connect } from '../util/typed-inject';
import AsyncSelect from 'react-select/async';
import { INciThesaurus } from 'app/shared/model/nci-thesaurus.model';
import _ from 'lodash';

export interface INcitCodeSelectProps extends SelectProps, StoreProps {
  ncit: INciThesaurus;
}

const NCIT_UID_SEPARATOR = '-';
export const getNcitUniqId = (ncit: INciThesaurus) => {
  return `${ncit.id}${NCIT_UID_SEPARATOR}${ncit.code}`;
};
export const parseNcitUniqId = (ncitId: string) => {
  const parts = ncitId.split(NCIT_UID_SEPARATOR);
  if (parts.length === 2) {
    return {
      id: Number(parts[0]),
      code: parts[1],
    };
  } else {
    return null;
  }
};

export function getOptionFromNcit(ncit: INciThesaurus) {
  return {
    value: getNcitUniqId(ncit),
    label: `${ncit.preferredName} (${ncit.code})`,
    synonyms: ncit.synonyms,
    ncit,
  };
}

const NcitCodeSelect: React.FunctionComponent<INcitCodeSelectProps> = props => {
  const { searchEntities, ...selectProps } = props;

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const onNcitChange = (option, actionMeta) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    props.onChange(option, actionMeta);
  };

  const loadNcitOptions = _.debounce((searchWord: string, callback: (options) => void) => {
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

export default connect(mapStoreToProps)(NcitCodeSelect);
