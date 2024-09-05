import React, { useMemo } from 'react';
import { Input } from 'reactstrap';
import { formatPercentage } from 'app/shared/util/utils';
import LoadingIndicator, { LoaderSize } from 'app/oncokb-commons/components/loadingIndicator/LoadingIndicator';
import { AllFrequencyData } from 'app/shared/model/variant-frequency.model';
import OncoKBTable, { SearchColumn } from 'app/shared/table/OncoKBTable';
import TwoThumbSlider from 'app/oncokb-commons/components/twoThumbSlider/TwoThumbSlider';
import { inputFilterMethod, numberFilterMethod, silderFilterMethod } from './variant-recommendation-utils';

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
        return <TwoThumbSlider min={0} max={maxPercentage} range={[0, maxPercentage]} step={0.00001} onChange={event => onChange(event)} />;
      },
      filterMethod: silderFilterMethod,
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
