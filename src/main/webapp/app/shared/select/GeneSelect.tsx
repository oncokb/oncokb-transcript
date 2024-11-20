import React, { useState } from 'react';
import { components, GroupBase, OptionProps, Props as SelectProps } from 'react-select';
import { AsyncPaginate, LoadOptions } from 'react-select-async-paginate';
import { defaultAdditional } from 'app/components/panels/CompanionDiagnosticDevicePanel';
import { DEFAULT_ENTITY_SORT_FIELD, DEFAULT_SORT_DIRECTION, ENTITY_TYPE, SearchOptionType } from 'app/config/constants/constants';
import { IRootStore } from 'app/stores/createStore';
import { connect, InjectProps } from '../util/typed-inject';
import { IGene } from '../model/gene.model';
import { ITEMS_PER_PAGE } from '../util/pagination.constants';
import { getEntityPaginationSortParameter } from '../util/entity-utils';
import { EntitySelectOption, SelectText } from './SelectOption';
import { ISynonym } from 'app/shared/model/synonym.model';

export interface IGeneSelectProps<IsMulti extends boolean> extends SelectProps<GeneSelectOption, IsMulti>, StoreProps {}

const sortParameter = getEntityPaginationSortParameter(DEFAULT_ENTITY_SORT_FIELD[ENTITY_TYPE.GENE] ?? '', DEFAULT_SORT_DIRECTION);

export interface GeneSelectOption {
  value?: number;
  synonyms?: ISynonym[];
  label?: string;
}

const GeneSelect = <IsMulti extends boolean>(props: IGeneSelectProps<IsMulti>) => {
  const { getGenes, searchGenes, ...selectProps } = props;

  const [searchInput, setSearchInput] = useState('');

  const loadGeneOptions: LoadOptions<GeneSelectOption, GroupBase<GeneSelectOption>, { page: number; type: SearchOptionType }> = async (
    searchWord,
    _,
    { page, type } = { page: 0, type: SearchOptionType.GENE },
  ) => {
    let result: Awaited<ReturnType<typeof getGenes>> | undefined = undefined;
    let options: GeneSelectOption[] = [];
    if (searchWord) {
      result = await searchGenes({ query: searchWord, page: page - 1, size: ITEMS_PER_PAGE, sort: [sortParameter] });
    } else {
      result = await getGenes({ page: page - 1, size: ITEMS_PER_PAGE, sort: [sortParameter] });
    }

    options =
      result?.data?.map(
        (entity: IGene): GeneSelectOption => ({
          value: entity.id,
          synonyms: entity.synonyms ?? [],
          label: entity.hugoSymbol,
        }),
      ) ?? [];

    return {
      options,
      hasMore: result.data.length > 0,
      additional: {
        page: page + 1,
        type,
      },
    };
  };

  const Option: React.FunctionComponent<OptionProps<GeneSelectOption>> = optionProps => {
    const searchKeyword = searchInput || '';
    const subTitles: SelectText[] = [];
    if (optionProps.data.synonyms && optionProps.data.synonyms?.length > 0) {
      subTitles.push({
        label: 'Also known as ',
        text: optionProps.data.synonyms.map(alias => alias.name).join(', '),
        searchWords: [searchKeyword],
      });
    }
    return (
      <>
        <components.Option {...optionProps}>
          <EntitySelectOption
            title={{
              text: optionProps.data.label ?? '',
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
      placeholder="Select gene"
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

export default function <IsMulti extends boolean = false>(props: InjectProps<IGeneSelectProps<IsMulti>, StoreProps>) {
  const InjectedGeneSelect = connect(mapStoreToProps)<IGeneSelectProps<IsMulti>>(GeneSelect);
  return <InjectedGeneSelect {...props} />;
}
