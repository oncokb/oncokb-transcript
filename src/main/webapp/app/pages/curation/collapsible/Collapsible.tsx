import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import classnames from 'classnames';
import { LEVELS } from 'app/config/colors';
import styles from './styles.module.scss';

interface IProps {
  title: string;
  nestLevel: NestLevel;
  open?: boolean;
  className?: string;
}
export enum NestLevel {
  MUTATION = '1',
  MUTATION_EFFECT = '2',
  SOMATIC = '3',
  GERMLINE = '3',
  CANCER_TYPE = '2',
  BIOLOGICAL_EFFECT = '3',
  THERAPY = '3',
}

const NestLevelColor: { [keys in NestLevel]: string } = {
  '1': LEVELS['1'],
  '2': LEVELS['2'],
  '3': LEVELS['3'],
};

const Collapsible: React.FunctionComponent<IProps> = ({ open, children, title, className, nestLevel }) => {
  const [isOpen, setIsOpen] = useState(open);

  const handleFilterOpening = () => {
    setIsOpen(prev => !prev);
  };

  return (
    <>
      <div className={classnames('card', className, styles.main)}>
        <div
          className={classnames('card-header d-flex align-items-center border border-light p-1 bg-transparent', styles.header)}
          ref={node => {
            if (node) {
              node.style.setProperty('border-left-color', NestLevelColor[nestLevel], 'important');
            }
          }}
        >
          <button type="button" className="btn" onClick={handleFilterOpening}>
            {isOpen ? <FontAwesomeIcon icon={faChevronDown} size={'sm'} /> : <FontAwesomeIcon icon={faChevronRight} size={'sm'} />}
          </button>
          <span className="font-weight-bold font-weight-bold">{title}</span>
        </div>
        {isOpen && <div className={classnames('card-body', styles.body)}>{children}</div>}
      </div>
    </>
  );
};

export default Collapsible;
