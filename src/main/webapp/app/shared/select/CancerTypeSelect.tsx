import React from 'react';
import { GroupBase, Props as SelectProps } from 'react-select';
import _ from 'lodash';
import { AsyncPaginate, LoadOptions, reduceGroupedOptions } from 'react-select-async-paginate';
import { defaultAdditional } from 'app/components/panels/CompanionDiagnosticDevicePanel';
import { DEFAULT_SORT_PARAMETER, SearchOptionType } from 'app/config/constants/constants';
import { IRootStore } from 'app/stores/createStore';
import { InjectProps, connect } from '../util/typed-inject';
import { ICancerType } from '../model/cancer-type.model';
import { ITEMS_PER_PAGE } from '../util/pagination.constants';
import { getCancerTypeName } from 'app/shared/util/utils';

interface ICancerTypeSelectProps<IsMulti extends boolean> extends SelectProps<CancerTypeSelectOption, IsMulti>, StoreProps {
  disabledOptions?: readonly CancerTypeSelectOption[];
}

export type CancerTypeSelectOption = {
  label: string;
  value: number;
  code: string;
  mainType: string;
  subtype: string;
  isDisabled?: boolean;
};

const getAllMainTypes = (cancerTypeList: ICancerType[]) => {
  return _.uniq(cancerTypeList.filter(cancerType => cancerType.level && cancerType.level <= 0)).sort();
};

const getAllSubtypes = (cancerTypeList: ICancerType[]) => {
  return _.uniq(cancerTypeList.filter(cancerType => cancerType.subtype)).sort();
};

const getAllCancerTypesOptions = (cancerTypeList: ICancerType[]) => {
  return [
    {
      label: 'Cancer Type',
      options: _.uniq(getAllMainTypes(cancerTypeList).filter(cancerType => cancerType.mainType && !cancerType.mainType.endsWith('NOS')))
        .sort()
        .map((cancerType): CancerTypeSelectOption => {
          return {
            value: cancerType.id ?? 0,
            label: getCancerTypeName(cancerType) ?? '',
            code: cancerType.code ?? '',
            mainType: cancerType.mainType ?? '',
            subtype: cancerType.subtype ?? '',
          };
        }),
    },
    {
      label: 'Cancer Type Detailed',
      options: _.sortBy(_.uniq(getAllSubtypes(cancerTypeList)), 'name').map((cancerType): CancerTypeSelectOption => {
        return {
          value: cancerType.id ?? 0,
          label: getCancerTypeName(cancerType) ?? '',
          code: cancerType.code ?? '',
          mainType: cancerType.mainType ?? '',
          subtype: cancerType.subtype ?? '',
        };
      }),
    },
  ];
};

const CancerTypeSelect = <IsMulti extends boolean>(props: ICancerTypeSelectProps<IsMulti>) => {
  const { getCancerTypes, searchCancerTypes, disabledOptions, ...selectProps } = props;
  const loadCancerTypeOptions: LoadOptions<
    CancerTypeSelectOption,
    GroupBase<CancerTypeSelectOption>,
    { page: number; type: SearchOptionType }
  > = async (searchWord, prevOptions, { page, type } = { page: 0, type: SearchOptionType.CDX }) => {
    let result: Awaited<ReturnType<typeof props.searchCancerTypes>> | undefined = undefined;
    let options: ReturnType<typeof getAllCancerTypesOptions> = [];
    if (searchWord) {
      result = await props.searchCancerTypes({
        query: searchWord,
        page: page - 1,
        size: ITEMS_PER_PAGE,
        sort: ['subtype,ASC', 'mainType,ASC'],
      });
    } else {
      result = await props.getCancerTypes({ page: page - 1, size: ITEMS_PER_PAGE, sort: ['subtype,ASC', 'mainType,ASC'] });
    }

    options = getAllCancerTypesOptions(result.data);
    options[0].options = _.uniqBy(options[0].options, 'label');
    options[1].options = _.uniqBy(options[1].options, 'label');

    if (searchWord) {
      // Since options are cached by react-select-async-paginate, we only include options that are
      // not present in prevOptions to avoid duplicates.
      options[0].options = _.differenceBy(options[0].options, 'options' in prevOptions[0] ? prevOptions[0]?.options ?? [] : [], 'label');
      options[1].options = _.differenceBy(options[1].options, 'options' in prevOptions[1] ? prevOptions[1]?.options ?? [] : [], 'label');
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
      {...selectProps}
      additional={{ ...defaultAdditional, type: SearchOptionType.CANCER_TYPE }}
      loadOptions={loadCancerTypeOptions}
      reduceOptions={reduceGroupedOptions}
      isOptionDisabled={option => disabledOptions?.some(disabled => disabled.value === option.value) || false}
      cacheUniqs={[props.value]}
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

export default function <IsMulti extends boolean = boolean>(props: InjectProps<ICancerTypeSelectProps<IsMulti>, StoreProps>) {
  const InjectedCancerTypeSelect = connect<ICancerTypeSelectProps<IsMulti>, StoreProps>(mapStoreToProps)(CancerTypeSelect);
  return <InjectedCancerTypeSelect {...props} />;
}
