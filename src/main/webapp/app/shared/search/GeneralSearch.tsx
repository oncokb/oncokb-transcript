import { faInfo, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { SearchOptionType } from 'app/config/constants';
import _ from 'lodash';
import React, { useState } from 'react';
import { components } from 'react-select';
import AsyncSelect from 'react-select/async';
import { Col, Row } from 'reactstrap';
import axiosInstance from '../api/axiosInstance';
import { SearchControllerApi, SearchResultDTO } from '../api/generated/api';
import DefaultTooltip from '../tooltip/DefaultTooltip';
import { SearchOption } from './SearchOptions';

export const SearchResultKeys: { [key in keyof SearchResultDTO]: SearchOptionType } = {
  companionDiagnosticDevices: SearchOptionType.CDX,
  fdaSubmissions: SearchOptionType.FDA_SUBMISSION,
  articles: SearchOptionType.ARTICLE,
  drugs: SearchOptionType.DRUG,
  genes: SearchOptionType.GENE,
  alterations: SearchOptionType.ALTERATION,
};

const getSearchResults = async (search: string) => {
  if (search) {
    const searchApiClient = new SearchControllerApi(null, '', axiosInstance);
    const searchResults: SearchResultDTO = (await searchApiClient.search(search)).data;
    const searchOptions = [
      { label: SearchOptionType.GENE, options: [] },
      { label: SearchOptionType.ALTERATION, options: [] },
      { label: SearchOptionType.ARTICLE, options: [] },
      { label: SearchOptionType.DRUG, options: [] },
      { label: SearchOptionType.CDX, options: [] },
      { label: SearchOptionType.FDA_SUBMISSION, options: [] },
    ];
    for (const key of Object.keys(searchResults)) {
      searchResults[key].slice(0, 5).forEach(result => {
        const index = searchOptions.findIndex(o => o.label === SearchResultKeys[key]);
        const type = Object.values(SearchOptionType).find(v => v === SearchResultKeys[key]);
        searchOptions[index].options.push({ value: result.content, type });
      });
    }
    return searchOptions;
  }
};

const debouncedSearch = _.debounce((searchTerm, callback) => {
  getSearchResults(searchTerm)
    .then(result => {
      return callback(result);
    })
    .catch((error: any) => callback(error, null));
}, 500);

const SearchInfoIconOverlay: JSX.Element = (
  <>
    <div className="mb-2">Searchable fields for each type are as follows:</div>
    <div>
      <b>Gene</b> - Hugo Symbol or Entrez Gene ID
    </div>
    <div>
      <b>Alteration</b> - Protein name
    </div>
    <div>
      <b>Article</b> - PMID
    </div>
    <div>
      <b>Drug</b> - Drug name, drug synonym, or drug brand name
    </div>
    <div>
      <b>CDx</b> - Name or manufacturer
    </div>
    <div>
      <b>Fda Submission</b> - Name, primary number, or supplement number
    </div>
  </>
);

export const GeneralSearch = props => {
  const [search, setSearch] = useState('');

  const Option: React.FunctionComponent<any> = (optionProps: any) => {
    return (
      <>
        <components.Option {...optionProps}>
          <SearchOption search={search} type={optionProps.data.type as SearchOptionType} data={optionProps.data.value} />
        </components.Option>
      </>
    );
  };

  const GroupHeading: React.FunctionComponent<any> = (groupHeadingProps: any) => {
    return (
      <>
        <components.GroupHeading {...groupHeadingProps}>
          <div style={{ color: 'black', fontSize: '16px' }} className="font-weight-bold">
            {groupHeadingProps.data.label}
          </div>
        </components.GroupHeading>
      </>
    );
  };
  return (
    <div style={{ display: 'flex' }}>
      <div style={{ flex: 1 }}>
        <AsyncSelect
          placeholder={'Search Gene / Alteration / Article / Drug / CDx / Fda Submission'}
          styles={{
            input(styles) {
              return {
                ...styles,
                lineHeight: '30px',
              };
            },
            placeholder(styles) {
              return {
                ...styles,
                width: '100%',
                lineHeight: '30px',
                textAlign: 'center',
              };
            },
          }}
          components={{
            GroupHeading,
            Option,
            DropdownIndicator: () => null,
            IndicatorSeparator: () => null,
          }}
          defaultOptions
          loadOptions={debouncedSearch}
          menuIsOpen={!!search}
          closeMenuOnSelect={false}
          isClearable
          inputValue={search}
          onInputChange={(query: string) => {
            setSearch(query);
          }}
        />
      </div>
      <div className={'ml-2'} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <DefaultTooltip placement="bottom" overlay={SearchInfoIconOverlay}>
          <FontAwesomeIcon icon={faInfoCircle} />
        </DefaultTooltip>
      </div>
    </div>
  );
};
