import React, { useState } from 'react';
import { components, OptionProps, Props as SelectProps } from 'react-select';
import { AsyncPaginate } from 'react-select-async-paginate';
import { defaultAdditional } from 'app/components/curationPanel/CompanionDiagnosticDevicePanel';
import { DEFAULT_ENTITY_SORT_FIELD, DEFAULT_SORT_DIRECTION, ENTITY_TYPE, SearchOptionType } from 'app/config/constants';
import { IRootStore } from 'app/stores/createStore';
import { connect } from '../util/typed-inject';
import { IGene } from '../model/gene.model';
import { ITEMS_PER_PAGE } from '../util/pagination.constants';
import { getEntityPaginationSortParameter } from '../util/entity-utils';
import { EntitySelectOption } from './SelectOption';
import { IGeneAlias } from '../model/gene-alias.model';

export interface IGeneSelectProps extends SelectProps, StoreProps {}

const sortParamter = getEntityPaginationSortParameter(DEFAULT_ENTITY_SORT_FIELD[ENTITY_TYPE.GENE], DEFAULT_SORT_DIRECTION);

interface GeneSelectOption {
  value: number;
  geneAliases: IGeneAlias[];
  label: string;
}

const GeneSelect = (props: IGeneSelectProps) => {
  const { getGenes, searchGenes, ...selectProps } = props;

  const [searchInput, setSearchInput] = useState('');

  const loadGeneOptions = async (searchWord: string, prevOptions: any[], { page, type }: { page: number; type: SearchOptionType }) => {
    let result = undefined;
    let options: GeneSelectOption[] = [];
    if (searchWord) {
      result = await searchGenes({ query: searchWord, page: page - 1, size: ITEMS_PER_PAGE, sort: sortParamter });
    } else {
      result = await getGenes({ page: page - 1, size: ITEMS_PER_PAGE, sort: sortParamter });
    }

    options = result?.data?.map((entity: IGene) => ({
      value: entity.id,
      geneAliases: entity.geneAliases,
      label: entity.hugoSymbol,
    }));

    return {
      options,
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
    if (optionProps.data.geneAliases?.length > 0) {
      subTitles.push({
        label: 'Also known as ',
        text: optionProps.data.geneAliases.map(alias => alias.name).join(', '),
        searchWords: [searchKeyword],
      });
    }
    return (
      <>
        <components.Option {...optionProps}>
          <EntitySelectOption
            title={{
              text: optionProps.data.label,
              searchWords: [searchKeyword],
            }}
            subTitles={subTitles}
          />
        </components.Option>
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
