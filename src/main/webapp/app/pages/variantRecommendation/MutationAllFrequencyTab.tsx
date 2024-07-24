import React, { useMemo } from 'react';
import { Input } from 'reactstrap';
import formatPercentage from './FormatPercentage';
import LoadingIndicator, { LoaderSize } from 'app/oncokb-commons/components/loadingIndicator/LoadingIndicator';
import { AllFrequencyData } from 'app/shared/model/variant-frequency.model';
import OncoKBTable, { SearchColumn } from 'app/shared/table/OncoKBTable';
import TwoRangeSlider from 'app/oncokb-commons/components/twoRangeSlider/TwoRangeSlider';

function MutationAllFrequencyTab(props) {
  const allFre = useMemo(() => {
    if (props.data) {
      const allFrequencyDataList: AllFrequencyData[] = [];
      props.data.map(item => {
        const allFrequencyData: AllFrequencyData = {
          Hugo_Symbol: item.Hugo_Symbol,
          Entrez_Gene_Id: item.Entrez_Gene_Id,
          HGVSp_Short: item.HGVSp_Short,
          Number: Number(item.Number),
          Percentage: Number(item.Percentage),
        };
        allFrequencyDataList.push(allFrequencyData);
      });
      return allFrequencyDataList;
    } else {
      return [];
    }
  }, [props.data]);

  const maxPercentage = useMemo(() => {
    const percentages = allFre.map(item => item.Percentage);
    return Math.max(...percentages);
  }, [allFre]);

  const columns: SearchColumn<AllFrequencyData>[] = [
    {
      accessor: 'Hugo_Symbol',
      Header: 'Hugo Symbol',
      Filter({ filter, onChange }) {
        return <Input placeholder="Search" value={filter ? filter.value : ''} onChange={event => onChange(event.target.value)} />;
      },
      filterMethod(filter, row) {
        if (!filter.value) return true;
        return String(row[filter.id]).toLowerCase().includes(filter.value.toLowerCase());
      },
    },
    {
      accessor: 'Entrez_Gene_Id',
      Header: 'Entrez Gene Id',
      Filter({ filter, onChange }) {
        return <Input placeholder="Search" value={filter ? filter.value : ''} onChange={event => onChange(event.target.value)} />;
      },
      filterMethod(filter, row) {
        if (!filter.value) return true;
        return String(row[filter.id]).toLowerCase().includes(filter.value.toLowerCase());
      },
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
        const filterValue = filter ? filter.value : ['', ''];
        return (
          <div style={{ display: 'flex', gap: '10px' }}>
            <Input placeholder="Min" value={filterValue[0]} onChange={event => onChange([event.target.value, filterValue[1]])} />
            <Input placeholder="Max" value={filterValue[1]} onChange={event => onChange([filterValue[0], event.target.value])} />
          </div>
        );
      },
      filterMethod(filter, row) {
        if (!filter.value) return true;
        return (
          (!filter.value[0] || Number(row[filter.id]) >= filter.value[0]) && (!filter.value[1] || Number(row[filter.id]) <= filter.value[1])
        );
      },
    },
    {
      accessor: 'Percentage',
      Header: 'Percentage',
      Cell: ({ value }) => formatPercentage(value),
      Filter({ filter, onChange }) {
        return <TwoRangeSlider min={0} max={maxPercentage} range={[0, maxPercentage]} step={0.00001} onChange={event => onChange(event)} />;
      },
      filterMethod(filter, row) {
        return row[filter.id] >= filter.value[0] && row[filter.id] <= filter.value[1];
      },
    },
  ];

  return (
    <>
      {allFre.length > 0 ? (
        <OncoKBTable
          disableSearch={true}
          data={allFre}
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
      ) : (
        <LoadingIndicator size={LoaderSize.LARGE} center={true} isLoading />
      )}
    </>
  );
}

export default MutationAllFrequencyTab;
