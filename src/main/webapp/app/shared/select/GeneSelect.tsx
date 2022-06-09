import React from 'react';
import { Props as SelectProps } from 'react-select';
import { AsyncPaginate } from 'react-select-async-paginate';
import { defaultAdditional } from 'app/components/curationPanel/FdaSubmissionPanel';
import { DEFAULT_SORT_PARAMETER, SearchOptionType } from 'app/config/constants';
import { IRootStore } from 'app/stores/createStore';
import { connect } from '../util/typed-inject';
import { IGene } from '../model/gene.model';
import { ITEMS_PER_PAGE } from '../util/pagination.constants';

export interface IGeneSelectProps extends SelectProps, StoreProps {}

const GeneSelect = (props: IGeneSelectProps) => {
  const { getGenes, searchGenes, ...selectProps } = props;
  const loadGeneOptions = async (searchWord: string, prevOptions: any[], { page, type }: { page: number; type: SearchOptionType }) => {
    let result = undefined;
    let options = [];
    if (searchWord) {
      result = await searchGenes({ query: searchWord, page: page - 1, size: ITEMS_PER_PAGE, sort: DEFAULT_SORT_PARAMETER });
    } else {
      result = await getGenes({ page: page - 1, size: ITEMS_PER_PAGE, sort: 'hugoSymbol,ASC' });
    }

    options = result?.data?.map((entity: IGene) => ({
      value: entity.id,
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

  return (
    <AsyncPaginate
      {...selectProps}
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
