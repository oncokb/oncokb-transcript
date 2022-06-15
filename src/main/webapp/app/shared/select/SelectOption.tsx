import React from 'react';

type SelectText = {
  label: string;
  text: string;
};

interface IEntitySelectOption {
  title: string;
  subTitles?: SelectText[];
}

export const EntitySelectOption: React.FunctionComponent<IEntitySelectOption> = props => {
  return (
    <>
      <div>{props.title}</div>
      {props.subTitles && props.subTitles.length > 0 && (
        <div style={{ color: 'grey', fontSize: '0.9em' }}>
          {props.subTitles &&
            props.subTitles.map((subTitle, index) => {
              return (
                <div style={{ color: 'grey', fontSize: '0.9em' }} key={index}>
                  <span>{subTitle.label}</span>
                  <span>{subTitle.text}</span>
                </div>
              );
            })}
        </div>
      )}
    </>
  );
};
