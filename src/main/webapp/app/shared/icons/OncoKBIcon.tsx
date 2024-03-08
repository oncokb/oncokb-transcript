import React from 'react';
import { ONCOKB_LEVELS } from '../util/firebase/firebase-level-utils';
import { ONCOKB_STYLES_ONCOGENICITY_CLASSNAMES } from 'app/config/constants/firebase';
import classNames from 'classnames';

export interface IOncoKBIconProps {
  iconType: 'level' | 'oncogenicity';
  value: ONCOKB_LEVELS | ONCOKB_STYLES_ONCOGENICITY_CLASSNAMES;
}

export const OncoKBIcon = (props: IOncoKBIconProps) => {
  const classPrefix = props.iconType === 'level' ? 'level-' : '';
  return <span className={classNames('oncokb', 'icon', `${classPrefix}${props.value}`)}></span>;
};
