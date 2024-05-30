import React, { useEffect, useState } from 'react';
import ReactSelect, { NoticeProps, OptionProps, Props as SelectProps, components } from 'react-select';
import { DEFAULT_ENTITY_SORT_FIELD, DEFAULT_SORT_DIRECTION, ENTITY_TYPE, GET_ALL_DRUGS_PAGE_SIZE } from 'app/config/constants/constants';
import { IRootStore } from 'app/stores/createStore';
import { connect } from '../util/typed-inject';
import { IDrug } from '../model/drug.model';
import { getEntityPaginationSortParameter } from '../util/entity-utils';
import { ISynonym } from '../model/synonym.model';
import { EntitySelectOption } from './SelectOption';
import { FilterOptionOption } from 'react-select/dist/declarations/src/filters';
import { filterByKeyword } from '../util/utils';
import _ from 'lodash';
import { getOptionFromNcit } from './NcitCodeSelect';
import AsyncSelect from 'react-select/async';
import { INciThesaurus } from '../model/nci-thesaurus.model';

interface IDrugSelectProps extends SelectProps, StoreProps {
  drugList?: IDrug[];
}

export type DrugSelectOption = {
  label: string;
  value: any;
  drugName?: string;
  uuid?: string;
  synonyms?: ISynonym[];
  ncit?: INciThesaurus;
};

const sortParameter = getEntityPaginationSortParameter(DEFAULT_ENTITY_SORT_FIELD[ENTITY_TYPE.DRUG], DEFAULT_SORT_DIRECTION);

const DrugSelect: React.FunctionComponent<IDrugSelectProps> = props => {
  const { getDrugs, onInputChange, searchNciThesaurus, ...selectProps } = props;

  const [drugOptions, setDrugOptions] = useState<DrugSelectOption[]>([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    function getDrugSelectOptionsFromDrugs(drugs: IDrug[]): DrugSelectOption[] {
      return drugs?.map(entity => {
        return {
          value: entity.id,
          label: `${entity.name}${entity.nciThesaurus ? ` (${entity.nciThesaurus.code})` : ''}`,
          drugName: entity.name,
          uuid: entity.uuid,
          synonyms: entity.nciThesaurus?.synonyms,
        };
      });
    }

    async function fetchAllDrugs() {
      const drugs: IDrug[] = (await getDrugs({ page: 0, size: GET_ALL_DRUGS_PAGE_SIZE, sort: [sortParameter] }))?.['data'];
      setDrugOptions(getDrugSelectOptionsFromDrugs(drugs));
    }

    if (props.drugList) {
      setDrugOptions(getDrugSelectOptionsFromDrugs(props.drugList));
    } else {
      fetchAllDrugs();
    }
  }, []);

  function Option(optionProps: OptionProps<DrugSelectOption>) {
    const title = optionProps.data.label;
    const synonyms = optionProps.data.synonyms;
    synonyms?.sort((synonym1, synonym2) => synonym1.name?.length - synonym2.name?.length);
    const matchingSynonyms = synonyms?.filter(synonynm => synonynm.name?.toLowerCase().includes(input.trim().toLowerCase()));
    const matchingSynonymNames: string[] = [];
    if (matchingSynonyms) {
      for (const synonym of matchingSynonyms) {
        if (synonym.name) {
          matchingSynonymNames.push(synonym.name);
        }
      }
    }

    const subtitle = matchingSynonymNames.join(', ');

    return (
      <div>
        <components.Option {...optionProps}>
          <EntitySelectOption
            title={{
              text: title,
              searchWords: [input],
            }}
            subTitles={
              subtitle
                ? [
                    {
                      label: 'Also known as ',
                      text: subtitle,
                      isOneLine: true,
                      searchWords: [input],
                    },
                  ]
                : []
            }
          />
        </components.Option>
      </div>
    );
  }

  function filterOptions(option: FilterOptionOption<DrugSelectOption>, inputValue: string) {
    const values = [option.label];
    if (option.data.synonyms) {
      for (const synonym of option.data.synonyms) {
        synonym.name && values.push(synonym.name);
      }
    }

    for (const value of values) {
      if (filterByKeyword(value, inputValue.toLowerCase())) {
        return true;
      }
    }
    return false;
  }

  const loadOptions = _.debounce((searchWord: string, callback: (options) => void) => {
    const options = drugOptions.filter(drug => drug.label.toLowerCase().includes(searchWord.toLowerCase()));
    if (options.length > 0) {
      callback(options);
      return;
    }

    if (searchWord) {
      searchNciThesaurus({ query: searchWord }).then(response => {
        callback(response.data.map(ncit => getOptionFromNcit(ncit)));
      });
    } else {
      callback([]);
    }
  }, 500);

  return (
    <AsyncSelect
      {...selectProps}
      components={{
        Option,
      }}
      defaultOptions={drugOptions}
      filterOption={filterOptions}
      onInputChange={setInput}
      loadOptions={loadOptions}
      options={drugOptions}
      placeholder="Select a drug..."
      isClearable
    />
  );
};

const mapStoreToProps = ({ drugStore, nciThesaurusStore }: IRootStore) => ({
  getDrugs: drugStore.getEntities,
  searchNciThesaurus: nciThesaurusStore.searchEntities,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(DrugSelect);
