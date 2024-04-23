import React, { useState } from 'react';
import { components, OptionProps, Props as SelectProps } from 'react-select';
import { AsyncPaginate } from 'react-select-async-paginate';
import { defaultAdditional } from 'app/components/panels/CompanionDiagnosticDevicePanel';
import { DEFAULT_ENTITY_SORT_FIELD, DEFAULT_SORT_DIRECTION, ENTITY_TYPE, SearchOptionType } from 'app/config/constants/constants';
import { IRootStore } from 'app/stores/createStore';
import { connect } from '../util/typed-inject';
import { IGene } from '../model/gene.model';
import { ITEMS_PER_PAGE } from '../util/pagination.constants';
import { getEntityPaginationSortParameter } from '../util/entity-utils';
import { EntitySelectOption } from './SelectOption';
import { ISynonym } from 'app/shared/model/synonym.model';

export interface IGeneSelectProps extends SelectProps, StoreProps {}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const sortParameter = getEntityPaginationSortParameter(DEFAULT_ENTITY_SORT_FIELD[ENTITY_TYPE.GENE], DEFAULT_SORT_DIRECTION);

interface GeneSelectOption {
  value: number;
  synonyms: ISynonym[];
  label: string;
}

const GeneSelect = (props: IGeneSelectProps) => {
  const { getGenes, searchGenes, ...selectProps } = props;

  const [searchInput, setSearchInput] = useState('');

  const loadGeneOptions = async (searchWord: string, prevOptions: any[], { page, type }: { page: number; type: SearchOptionType }) => {
    let result = undefined;
    let options: GeneSelectOption[] = [];
    if (searchWord) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      result = await searchGenes({ query: searchWord, page: page - 1, size: ITEMS_PER_PAGE, sort: sortParameter });
    } else {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      result = await getGenes({ page: page - 1, size: ITEMS_PER_PAGE, sort: sortParameter });
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    options = result?.data?.map((entity: IGene) => ({
      value: entity.id,
      synonyms: entity.synonyms,
      label: entity.hugoSymbol,
    }));

    return {
      options,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      hasMore: result.data.length > 0,
      additional: {
        page: page + 1,
        type,
      },
    };
  };

  const Option: React.FunctionComponent = (optionProps: OptionProps<GeneSelectOption>) => {
    const searchKeyword = searchInput || '';
    const subTitles = [];
    if (optionProps.data.synonyms?.length > 0) {
      subTitles.push({
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        label: 'Also known as ',
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        text: optionProps.data.synonyms.map(alias => alias.name).join(', '),
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        searchWords: [searchKeyword],
      });
    }
    return (
      <>
        {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          <components.Option {...optionProps}>
            <EntitySelectOption
              title={{
                text: optionProps.data.label,
                searchWords: [searchKeyword],
              }}
              subTitles={subTitles}
            />
          </components.Option>
        }
      </>
    );
  };

  return (
    <AsyncPaginate
      {...selectProps}
      components={{
        Option,
      }}
      additional={{ ...defaultAdditional, type: SearchOptionType.GENE }}
      loadOptions={loadGeneOptions}
      cacheUniqs={[props.value]}
      placeholder="Select a gene..."
      onInputChange={input => setSearchInput(input)}
      isClearable
    />
  );
};

const mapStoreToProps = ({ geneStore }: IRootStore) => ({
  getGenes: geneStore.getEntities,
  searchGenes: geneStore.searchEntities,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(GeneSelect);
