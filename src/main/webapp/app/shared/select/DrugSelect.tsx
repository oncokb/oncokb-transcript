import React from 'react';
import { Props as SelectProps } from 'react-select';
import { AsyncPaginate } from 'react-select-async-paginate';
import { defaultAdditional } from 'app/components/curationPanel/FdaSubmissionPanel';
import { DEFAULT_SORT_PARAMETER, SearchOptionType } from 'app/config/constants';
import { IRootStore } from 'app/stores/createStore';
import { connect } from '../util/typed-inject';
import { IDrug } from '../model/drug.model';
import { ITEMS_PER_PAGE } from '../util/pagination.constants';

interface IDrugSelectProps extends SelectProps, StoreProps {}

const DrugSelect: React.FunctionComponent<IDrugSelectProps> = props => {
  const { getDrugs, searchDrugs, ...selectProps } = props;
  const loadDrugOptions = async (searchWord: string, prevOptions: any[], { page, type }: { page: number; type: SearchOptionType }) => {
    let result = undefined;
    let options = [];
    if (searchWord) {
      result = await searchDrugs({ query: searchWord, page: page - 1, size: ITEMS_PER_PAGE, sort: DEFAULT_SORT_PARAMETER });
    } else {
      result = await getDrugs({ page: page - 1, size: ITEMS_PER_PAGE, sort: 'name,ASC' });
    }

    options = result?.data?.map((entity: IDrug) => ({
      value: entity.id,
      label: entity.name,
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
      additional={{ ...defaultAdditional, type: SearchOptionType.DRUG }}
      loadOptions={loadDrugOptions}
      cacheUniqs={[props.value]}
      placeholder="Select a drug..."
      isClearable
    />
  );
};

const mapStoreToProps = ({ drugStore }: IRootStore) => ({
  getDrugs: drugStore.getEntities,
  searchDrugs: drugStore.searchEntities,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(DrugSelect);
