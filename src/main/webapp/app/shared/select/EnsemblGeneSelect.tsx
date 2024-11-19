import React from 'react';
import { GroupBase, Props as SelectProps } from 'react-select';
import { DEFAULT_ENTITY_SORT_FIELD, DEFAULT_SORT_DIRECTION, ENTITY_TYPE } from 'app/config/constants/constants';
import { IRootStore } from 'app/stores/createStore';
import { InjectProps, connect } from '../util/typed-inject';
import { getEntityPaginationSortParameter } from '../util/entity-utils';
import { AsyncPaginate, LoadOptions } from 'react-select-async-paginate';
import { ITEMS_PER_PAGE } from '../util/pagination.constants';
import { IEnsemblGene } from '../model/ensembl-gene.model';

interface IEnsemblGeneSelect<IsMulti extends boolean> extends SelectProps<EnsemblGeneSelectOption, IsMulti>, StoreProps {}

export type EnsemblGeneSelectOption = {
  label: string;
  value: IEnsemblGene;
};

export const getEnsemblGeneSelectLabel = (ensemblGene: IEnsemblGene) => {
  return `${ensemblGene.ensemblGeneId} (${ensemblGene.referenceGenome})`;
};

const sortParameter = getEntityPaginationSortParameter(DEFAULT_ENTITY_SORT_FIELD[ENTITY_TYPE.ENSEMBL_GENE] ?? '', DEFAULT_SORT_DIRECTION);

const EnsemblGeneSelect = <IsMulti extends boolean>(props: IEnsemblGeneSelect<IsMulti>) => {
  const { getEnsemblGenes, onInputChange, searchEnsemblGenes, ...selectProps } = props;

  const loadEnsemblGeneOptions: LoadOptions<EnsemblGeneSelectOption, GroupBase<EnsemblGeneSelectOption>, { page: number }> = async (
    searchWord,
    _,
    { page } = { page: 1 },
  ) => {
    let result: Awaited<ReturnType<typeof getEnsemblGenes>> | undefined = undefined;
    let options: EnsemblGeneSelectOption[] = [];
    if (searchWord) {
      result = await searchEnsemblGenes({ query: searchWord, page: page - 1, size: ITEMS_PER_PAGE, sort: [sortParameter] });
    } else {
      result = await getEnsemblGenes({ page: page - 1, size: ITEMS_PER_PAGE, sort: [sortParameter] });
    }

    options =
      result?.data?.map(
        (entity: IEnsemblGene): EnsemblGeneSelectOption => ({
          value: entity,
          label: getEnsemblGeneSelectLabel(entity),
        }),
      ) ?? [];

    return {
      options,
      hasMore: result.data.length > 0,
      additional: {
        page: page + 1,
      },
    };
  };

  return (
    <AsyncPaginate
      placeholder="Select ensembl gene"
      cacheUniqs={[props.value]}
      loadOptions={loadEnsemblGeneOptions}
      isClearable
      {...selectProps}
    />
  );
};

const mapStoreToProps = ({ ensemblGeneStore }: IRootStore) => ({
  getEnsemblGenes: ensemblGeneStore.getEntities,
  searchEnsemblGenes: ensemblGeneStore.searchEntities,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default function <IsMulti extends boolean = false>(props: InjectProps<IEnsemblGeneSelect<IsMulti>, StoreProps>) {
  const InjectedEnsemblGeneSelect = connect(mapStoreToProps)<IEnsemblGeneSelect<IsMulti>>(EnsemblGeneSelect);
  return <InjectedEnsemblGeneSelect {...props} />;
}
