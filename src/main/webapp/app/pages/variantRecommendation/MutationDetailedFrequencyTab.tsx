import React, { useMemo, useState } from 'react';
import { Input } from 'reactstrap';
import OncoKBTable, { SearchColumn } from 'app/shared/table/OncoKBTable';
import { DetailedFrequencyData } from 'app/shared/model/variant-frequency.model';
import { formatPercentage } from 'app/shared/util/utils';
import TwoThumbSlider from 'app/oncokb-commons/components/twoThumbSlider/TwoThumbSlider';
import { inputFilterMethod, numberFilterMethod, silderFilterMethod } from './variant-recommendation-utils';

function MutationDetailedFrequencyTab(props) {
  const [cancerType, SetCancerType] = useState('');

  const detailedFre = useMemo(() => {
    if (props.data) {
      const detailedFrequencyDataList: DetailedFrequencyData[] = [];
      props.data.map(item => {
        const detailedFrequencyData: DetailedFrequencyData = {
          CANCER_TYPE: item.CANCER_TYPE,
          CANCER_TYPE_DETAILED: item.CANCER_TYPE_DETAILED,
          Hugo_Symbol: item.Hugo_Symbol,
          Entrez_Gene_Id: item.Entrez_Gene_Id,
          HGVSp_Short: item.HGVSp_Short,
          Number: Number(item.Number),
          Percentage: Number(item.Percentage),
        };
        detailedFrequencyDataList.push(detailedFrequencyData);
      });
      return detailedFrequencyDataList;
    } else {
      return [];
    }
  }, [props.data]);

  const cancerOptions = useMemo(() => {
    const uniqueCancerTypes = [...new Set(detailedFre.map(item => item.CANCER_TYPE))];
    return [
      <option key="" value="">
        All
      </option>,
      ...uniqueCancerTypes.map(item => (
        <option key={item} value={item}>
          {item}
        </option>
      )),
    ];
  }, [detailedFre]);

  const detailedCancerOptions = useMemo(() => {
    const uniqueDetailedCancerTypes = [
      ...new Set(detailedFre.filter(item => item.CANCER_TYPE === cancerType).map(item => item.CANCER_TYPE_DETAILED)),
    ];
    return [
      <option key="" value="">
        All
      </option>,
      ...uniqueDetailedCancerTypes.map(item => (
        <option key={item} value={item}>
          {item}
        </option>
      )),
    ];
  }, [cancerType]);

  const columns: SearchColumn<DetailedFrequencyData>[] = [
    {
      accessor: 'CANCER_TYPE',
      Header: 'Cancer Type',
      Filter({ filter, onChange }) {
        return (
          <Input
            type="select"
            value={filter ? filter.value : ''}
            onChange={event => {
              onChange(event.target.value);
              SetCancerType(event.target.value);
            }}
          >
            {cancerOptions}
          </Input>
        );
      },
      filterMethod: inputFilterMethod,
    },
    {
      accessor: 'CANCER_TYPE_DETAILED',
      Header: 'Detailed Cancer Type',
      Filter({ filter, onChange }) {
        return (
          <Input type="select" value={filter ? filter.value : ''} onChange={event => onChange(event.target.value)}>
            {detailedCancerOptions}
          </Input>
        );
      },
      filterMethod(filter, row) {
        if (!filter.value) return true;
        return String(row[filter.id]).toLowerCase().includes(filter.value.toLowerCase());
      },
    },
    {
      accessor: 'Hugo_Symbol',
      Header: 'Hugo Symbol',
      Filter({ filter, onChange }) {
        return <Input placeholder="Search" value={filter ? filter.value : ''} onChange={event => onChange(event.target.value)} />;
      },
      filterMethod: inputFilterMethod,
    },
    {
      accessor: 'Entrez_Gene_Id',
      Header: 'Entrez Gene Id',
      Filter({ filter, onChange }) {
        return <Input placeholder="Search" value={filter ? filter.value : ''} onChange={event => onChange(event.target.value)} />;
      },
      filterMethod: inputFilterMethod,
    },
    {
      accessor: 'HGVSp_Short',
      Header: 'Variant',
      Filter({ filter, onChange }) {
        return <Input placeholder="Search" value={filter ? filter.value : ''} onChange={event => onChange(event.target.value)} />;
      },
      filterMethod(filter, row) {
        if (!filter.value) return true;
        return String(row[filter.id]).toLowerCase().includes(filter.value.toLowerCase());
      },
    },
    {
      accessor: 'Number',
      Header: 'Number',
      Filter({ filter, onChange }) {
        const [minValue, maxValue] = filter ? filter.value : ['', ''];
        return (
          <div style={{ display: 'flex', gap: '10px' }}>
            <Input placeholder="Min" value={minValue} onChange={event => onChange([event.target.value, maxValue])} />
            <Input placeholder="Max" value={maxValue} onChange={event => onChange([minValue, event.target.value])} />
          </div>
        );
      },
      filterMethod: numberFilterMethod,
    },
    {
      accessor: 'Percentage',
      Header: 'Percentage',
      Cell: ({ value }) => formatPercentage(value),
      Filter({ filter, onChange }) {
        return <TwoThumbSlider min={0} max={1} range={[0, 1]} step={0.00001} onChange={event => onChange(event)} />;
      },
      filterMethod: silderFilterMethod,
    },
  ];

  return (
    <OncoKBTable
      disableSearch={true}
      data={detailedFre}
      columns={columns}
      showPagination
      filterable
      sortable
      defaultSorted={[
        {
          id: 'Percentage',
          desc: true,
        },
        {
          id: 'Hugo_Symbol',
          desc: false,
        },
      ]}
    />
  );
}

export default MutationDetailedFrequencyTab;
