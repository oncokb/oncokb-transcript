import React from 'react';
import Highlighter from 'react-highlight-words';
import { Link } from 'react-router-dom';

export type SelectText = {
  label?: string;
  searchWords?: string[];
  text: string;
};

export type EntitySelectAdditionalInfo = { isLink: true; path: string } | { isLink?: false; path?: never };

export interface IEntitySelectOption {
  title: SelectText;
  subTitles?: SelectText[];
  additional?: EntitySelectAdditionalInfo;
}

export const EntitySelectOption: React.FunctionComponent<IEntitySelectOption> = props => {
  const optionBody = (
    <>
      <div>
        <Highlighter searchWords={props.title.searchWords} textToHighlight={props.title.text} />
      </div>
      {props.subTitles &&
        props.subTitles.map((subTitle, index) => {
          return (
            subTitle.text && (
              <div style={{ color: 'grey', fontSize: '0.9em' }} key={index}>
                <span>{subTitle.label}</span>
                <Highlighter searchWords={subTitle.searchWords} textToHighlight={subTitle.text} />
              </div>
            )
          );
        })}
    </>
  );

  if (props.additional?.isLink) {
    return (
      <Link to={props.additional.path} style={{ textDecoration: 'none', color: 'black' }}>
        {optionBody}
      </Link>
    );
  } else {
    return optionBody;
  }
};
