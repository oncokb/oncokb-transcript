import React from 'react';
import { ICompanionDiagnosticDevice } from 'app/shared/model/companion-diagnostic-device.model';
import { IFdaSubmission } from 'app/shared/model/fda-submission.model';
import Highlighter from 'react-highlight-words';
import { Link } from 'react-router-dom';
import { IArticle } from 'app/shared/model/article.model';
import { IDrug } from 'app/shared/model/drug.model';
import { IGene } from 'app/shared/model/gene.model';
import { IAlteration } from 'app/shared/model/alteration.model';
import { PAGE_ROUTE, SearchOptionType } from 'app/config/constants';

type SearchText = {
  label?: string;
  searchWords: string[];
  textToHighlight: string;
};

interface IEntitySearchOption {
  path: string;
  title: SearchText;
  subTitles?: SearchText[];
}

export const EntitySearchOption: React.FunctionComponent<IEntitySearchOption> = props => {
  return (
    <Link to={props.path} style={{ textDecoration: 'none', color: 'black' }}>
      <div>
        <Highlighter searchWords={props.title.searchWords} textToHighlight={props.title.textToHighlight} />
      </div>
      {props.subTitles &&
        props.subTitles.map((subTitle, index) => {
          return (
            subTitle.textToHighlight && (
              <div style={{ color: 'grey', fontSize: '0.9em' }} key={index}>
                {subTitle.label}
                <Highlighter searchWords={subTitle.searchWords} textToHighlight={subTitle.textToHighlight} />
              </div>
            )
          );
        })}
    </Link>
  );
};

type SearchOptionProps = {
  search: string | undefined;
  type: SearchOptionType;
  data: any;
};

export const SearchOption: React.FunctionComponent<SearchOptionProps> = props => {
  const searchKeyword = props.search ? props.search : '';
  const getSearchOption = () => {
    let path = `/${props.data.id}`;
    let title: SearchText = undefined;
    let subTitles: SearchText[] = [];
    switch (props.type) {
      case SearchOptionType.FDA_SUBMISSION: {
        const data: IFdaSubmission = props.data;
        path = PAGE_ROUTE.FDA_SUBMISSION + path;
        title = { textToHighlight: data.deviceName, searchWords: [searchKeyword] };
        const number = data.number + (data.supplementNumber ? '/' + data.supplementNumber : '');
        subTitles = [{ label: 'Number: ', textToHighlight: number, searchWords: [searchKeyword] }];
        break;
      }
      case SearchOptionType.CDX: {
        const data: ICompanionDiagnosticDevice = props.data;
        path = PAGE_ROUTE.CDX + path;
        title = { textToHighlight: data.name, searchWords: [searchKeyword] };
        subTitles = [{ label: 'Manufactured by ', textToHighlight: data.manufacturer, searchWords: [searchKeyword] }];
        break;
      }
      case SearchOptionType.ARTICLE: {
        const data: IArticle = props.data;
        path = PAGE_ROUTE.ARTICLE + path;
        title = { label: 'PMID: ', textToHighlight: data.pmid, searchWords: [searchKeyword] };
        break;
      }
      case SearchOptionType.DRUG: {
        const data: IDrug = props.data;
        path = PAGE_ROUTE.DRUG + path;
        title = { textToHighlight: data.name, searchWords: [searchKeyword] };
        subTitles = [
          { label: 'Brands: ', textToHighlight: data.brands?.map(brand => brand.name).join(', '), searchWords: [searchKeyword] },
          {
            label: 'Also known as ',
            textToHighlight: data.synonyms?.map(synonyms => synonyms.name).join(', '),
            searchWords: [searchKeyword],
          },
        ];
        break;
      }
      case SearchOptionType.GENE: {
        const data: IGene = props.data;
        path = PAGE_ROUTE.GENE + path;
        title = { textToHighlight: `${data.hugoSymbol} (Entrez Gene: ${data.entrezGeneId})`, searchWords: [searchKeyword] };
        break;
      }
      case SearchOptionType.ALTERATION: {
        const data: IAlteration = props.data;
        path = PAGE_ROUTE.ALTERATION + path;
        title = { textToHighlight: data.name, searchWords: [searchKeyword] };
        break;
      }
      default:
        break;
    }
    return <EntitySearchOption path={path} title={title} subTitles={subTitles} />;
  };
  return <div>{getSearchOption()}</div>;
};
