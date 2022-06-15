import React from 'react';
import { components, Props as SelectProps } from 'react-select';
import { AsyncPaginate } from 'react-select-async-paginate';
import { defaultAdditional } from 'app/components/curationPanel/FdaSubmissionPanel';
import { DEFAULT_ENTITY_SORT_FIELD, DEFAULT_SORT_DIRECTION, ENTITY_TYPE, SearchOptionType } from 'app/config/constants';
import { IRootStore } from 'app/stores/createStore';
import { connect } from '../util/typed-inject';
import { IGene } from '../model/gene.model';
import { ITEMS_PER_PAGE } from '../util/pagination.constants';
import { getEntityPaginationSortParameter } from '../util/entity-utils';

export interface IGeneSelectProps extends SelectProps, StoreProps {}

const sortParamter = getEntityPaginationSortParameter(DEFAULT_ENTITY_SORT_FIELD[ENTITY_TYPE.GENE], DEFAULT_SORT_DIRECTION);

const GeneSelect = (props: IGeneSelectProps) => {
  const { getGenes, searchGenes, ...selectProps } = props;
  const loadGeneOptions = async (searchWord: string, prevOptions: any[], { page, type }: { page: number; type: SearchOptionType }) => {
    let result = undefined;
    let options = [];
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

  const Option: React.FunctionComponent<any> = (optionProps: any) => {
    const hasAliases = optionProps.data.geneAliases?.length > 0;
    return (
      <>
        <components.Option {...optionProps}>
          <div>{optionProps.data.label}</div>
          {hasAliases && (
            <div style={{ color: 'grey', fontSize: '0.9em' }}>
              <span>Also known as </span>
              <span>{optionProps.data.geneAliases.map(alias => alias.name).join(', ')}</span>
            </div>
          )}
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
