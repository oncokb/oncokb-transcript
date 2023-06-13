import React from 'react';
import { ICompanionDiagnosticDevice } from 'app/shared/model/companion-diagnostic-device.model';
import { IFdaSubmission } from 'app/shared/model/fda-submission.model';
import { IArticle } from 'app/shared/model/article.model';
import { IDrug } from 'app/shared/model/drug.model';
import { IGene } from 'app/shared/model/gene.model';
import { IAlteration } from 'app/shared/model/alteration.model';
import { PAGE_ROUTE, SearchOptionType } from 'app/config/constants';
import { EntitySelectOption, SelectText } from '../select/SelectOption';

type SearchOptionProps = {
  search: string | undefined;
  type: SearchOptionType;
  data: any;
};

export const SearchOption: React.FunctionComponent<SearchOptionProps> = props => {
  const searchKeyword = props.search ? props.search : '';
  const getSearchOption = () => {
    /* eslint-disable no-console */
    console.log(props);
    let path = `/${props.data.id}`;
    let title: SelectText = undefined;
    let subTitles: SelectText[] = [];
    switch (props.type) {
      case SearchOptionType.FDA_SUBMISSION: {
        const data: IFdaSubmission = props.data;
        path = PAGE_ROUTE.FDA_SUBMISSION + path;
        title = { text: data.deviceName, searchWords: [searchKeyword] };
        const number = data.number + (data.supplementNumber ? '/' + data.supplementNumber : '');
        subTitles = [{ label: 'Number: ', text: number, searchWords: [searchKeyword] }];
        break;
      }
      case SearchOptionType.CDX: {
        const data: ICompanionDiagnosticDevice = props.data;
        path = PAGE_ROUTE.CDX + path;
        title = { text: data.name, searchWords: [searchKeyword] };
        subTitles = [{ label: 'Manufactured by ', text: data.manufacturer, searchWords: [searchKeyword] }];
        break;
      }
      case SearchOptionType.ARTICLE: {
        const data: IArticle = props.data;
        path = PAGE_ROUTE.ARTICLE + path;
        title = { label: 'PMID: ', text: data.pmid, searchWords: [searchKeyword] };
        break;
      }
      case SearchOptionType.DRUG: {
        const data: IDrug = props.data;
        path = PAGE_ROUTE.DRUG + path;
        title = { text: data.name, searchWords: [searchKeyword] };
        subTitles = [
          { label: 'Brands: ', text: data.brands?.map(brand => brand.name).join(', '), searchWords: [searchKeyword] },
          {
            label: 'Also known as ',
            text: data.synonyms?.map(synonyms => synonyms.name).join(', '),
            searchWords: [searchKeyword],
          },
        ];
        break;
      }
      case SearchOptionType.GENE: {
        const data: IGene = props.data;
        path = PAGE_ROUTE.GENE + path;
        title = { text: `${data.hugoSymbol} (Entrez Gene: ${data.entrezGeneId})`, searchWords: [searchKeyword] };
        subTitles = [
          { label: 'Also known as ', text: data.geneAliases?.map(alias => alias.name).join(', '), searchWords: [searchKeyword] },
        ];
        break;
      }
      case SearchOptionType.ALTERATION: {
        const data: IAlteration = props.data;
        path = PAGE_ROUTE.ALTERATION + path;
        title = { text: data.name, searchWords: [searchKeyword] };
        break;
      }
      default:
        break;
    }
    return <EntitySelectOption additional={{ isLink: true, path }} title={title} subTitles={subTitles} />;
  };
  return <div>{getSearchOption()}</div>;
};
