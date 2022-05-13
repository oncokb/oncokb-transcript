import React from 'react';
import { Props as SelectProps } from 'react-select';
import _ from 'lodash';
import { AsyncPaginate, reduceGroupedOptions } from 'react-select-async-paginate';
import { defaultAdditional } from 'app/components/curationPanel/FdaSubmissionPanel';
import { SearchOptionType } from 'app/config/constants';
import { IRootStore } from 'app/stores/createStore';
import { connect } from '../util/typed-inject';
import { ICancerType } from '../model/cancer-type.model';

interface ICancerTypeSelectProps extends SelectProps, StoreProps {
  tumorType?: string;
  cancerTypeValue: any;
  onCancerTypeChange: any;
}

const getAllMainTypes = (cancerTypeList: ICancerType[]) => {
  return _.uniq(cancerTypeList.filter(cancerType => cancerType.level >= 0)).sort();
};

const getAllSubtypes = (cancerTypeList: ICancerType[]) => {
  return _.uniq(cancerTypeList.filter(cancerType => cancerType.subtype)).sort();
};

const getAllTumorTypesOptions = (cancerTypeList: ICancerType[], prevOptions) => {
  return [
    {
      label: 'Cancer Type',
      options: _.uniq(getAllMainTypes(cancerTypeList).filter(cancerType => !cancerType.mainType.endsWith('NOS')))
        .sort()
        .map(tumorType => {
          return {
            value: tumorType.id,
            label: tumorType.mainType,
          };
        }),
    },
    {
      label: 'Cancer Type Detailed',
      options: _.sortBy(_.uniq(getAllSubtypes(cancerTypeList)), 'name').map(tumorType => {
        return {
          value: tumorType.id,
          label: `${tumorType.subtype} (${tumorType.code})`,
        };
      }),
    },
  ];
};

const CancerTypeSelect: React.FunctionComponent<ICancerTypeSelectProps> = props => {
  const loadOptions = async (searchWord: string, prevOptions: any[], { page, type }: { page: number; type: SearchOptionType }) => {
    let result = undefined;
    let options = [];
    if (searchWord) {
      result = await props.searchCancerTypes({ query: searchWord, page: page - 1, size: 5, sort: 'id,ASC' });
    } else {
      result = await props.getCancerTypes({ page: page - 1, size: 5, sort: 'id,ASC' });
    }

    options = getAllTumorTypesOptions(result.data, prevOptions);

    if (searchWord) {
      // Since options are cached by react-select-async-paginate, we only include options that are
      // not present in prevOptions to avoid duplicates.
      options[0].options = _.xorBy(prevOptions[0]?.options || [], options[0].options, 'label');
      options[1].options = _.xorBy(prevOptions[1]?.options || [], options[1].options, 'label');
    }

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
      additional={{ ...defaultAdditional, type: SearchOptionType.CANCER_TYPE }}
      loadOptions={loadOptions}
      reduceOptions={reduceGroupedOptions}
      value={props.cancerTypeValue}
      onChange={props.onCancerTypeChange}
      cacheUniqs={[props.cancerTypeValue]}
      placeholder="Select a cancer type..."
      isClearable
    />
  );
};

const mapStoreToProps = ({ cancerTypeStore }: IRootStore) => ({
  getCancerTypes: cancerTypeStore.getEntities,
  searchCancerTypes: cancerTypeStore.searchEntities,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(CancerTypeSelect);
