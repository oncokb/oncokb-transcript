import React, { useMemo } from 'react';
import { Input } from 'reactstrap';
import OncoKBTable, { SearchColumn } from 'app/shared/table/OncoKBTable';
import { TypeFrequencyData } from 'app/shared/model/variant-frequency.model';
import TwoThumbSlider from 'app/oncokb-commons/components/twoThumbSlider/TwoThumbSlider';
import { formatPercentage } from 'app/shared/util/utils';
import { inputFilterMethod, numberFilterMethod, silderFilterMethod } from './variant-recommendation-utils';

function MutationTypeFrequencyTab(props) {
  const typeFre = useMemo(() => {
    if (props.data) {
      const typeFrequencyDataList: TypeFrequencyData[] = [];
      props.data.map(item => {
        const typeFrequencyData: TypeFrequencyData = {
          CANCER_TYPE: item.CANCER_TYPE,
          Hugo_Symbol: item.Hugo_Symbol,
          Entrez_Gene_Id: item.Entrez_Gene_Id,
          HGVSp_Short: item.HGVSp_Short,
          Number: Number(item.Number),
          Percentage: Number(item.Percentage),
        };
        typeFrequencyDataList.push(typeFrequencyData);
      });
      return typeFrequencyDataList;
    } else {
      return [];
    }
  }, [props.data]);

  const options = useMemo(() => {
    const uniqueCancerType = [...new Set(typeFre.map(item => item.CANCER_TYPE))];
    return [
      <option key="" value="">
        All
      </option>,
      ...uniqueCancerType.map(item => (
        <option key={item} value={item}>
          {item}
        </option>
      )),
    ];
  }, [typeFre]);

  const columns: SearchColumn<TypeFrequencyData>[] = [
    {
      accessor: 'CANCER_TYPE',
      Header: 'Cancer Type',
      Filter({ filter, onChange }) {
        return (
          <Input type="select" value={filter ? filter.value : ''} onChange={event => onChange(event.target.value)}>
            {options}
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
      filterMethod: inputFilterMethod,
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
      data={typeFre}
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

export default MutationTypeFrequencyTab;
