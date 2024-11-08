import React, { FunctionComponent } from 'react';
import classnames from 'classnames';
import * as styles from './genetic-type-tag.module.scss';
import { GENETIC_TYPE } from '../geneticTypeTabs/GeneticTypeTabs';
import _ from 'lodash';

const GeneticTypeTag: FunctionComponent<{
  geneticType: GENETIC_TYPE;
  className?: string;
}> = props => {
  return (
    <span className={classnames(props.className, props.geneticType === GENETIC_TYPE.GERMLINE ? styles.germlineTag : styles.somaticTag)}>
      {_.capitalize(props.geneticType)}
    </span>
  );
};

export default GeneticTypeTag;
