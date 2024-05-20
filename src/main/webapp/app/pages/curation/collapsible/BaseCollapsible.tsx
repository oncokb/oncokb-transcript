import { ReactElement, useEffect, useMemo, useState } from 'react';
import * as styles from './styles.module.scss';
import React from 'react';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { getHexColorWithAlpha } from 'app/shared/util/utils';
import { IBadgeGroupProps } from '../BadgeGroup';
import { IDefaultBadgeProps } from 'app/shared/badge/DefaultBadge';
import LoadingIndicator, { LoaderSize } from 'app/oncokb-commons/components/loadingIndicator/LoadingIndicator';
import { Spinner } from 'reactstrap';

export type CollapsibleColorProps =
  | { hideLeftBorder: true; backgroundColor?: string }
  | { hideLeftBorder?: false; borderLeftColor: string; backgroundColor?: string; forceLeftColor?: boolean };

export type CollapsibleDisplayProps = {
  disableCollapsible?: boolean;
  hideToggle?: boolean;
  hideInfo?: boolean;
  hideAction?: boolean;
};

export interface BaseCollapsibleProps {
  children: React.ReactNode;
  title: React.ReactNode;
  titleClassName?: string; // classname for title
  collapsibleClassName?: string; // classname for wrapper around collapsible
  badge?: ReactElement<IBadgeGroupProps> | ReactElement<IDefaultBadgeProps>;
  info?: React.ReactNode;
  action?: React.ReactNode;
  defaultOpen?: boolean;
  disableOpen?: boolean;
  onToggle?: () => void;
  colorOptions?: CollapsibleColorProps;
  displayOptions?: CollapsibleDisplayProps;
  showLoadingSpinner?: boolean;
}

export default function BaseCollapsible({
  children,
  title,
  titleClassName,
  collapsibleClassName,
  badge,
  info,
  action,
  defaultOpen,
  disableOpen,
  onToggle,
  colorOptions,
  displayOptions,
  showLoadingSpinner = false,
}: BaseCollapsibleProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen || false);

  const handleToggle = () => {
    if (!disableOpen) {
      setIsOpen(_isOpen => !_isOpen);
    }
    onToggle?.();
  };

  const infoComponent = useMemo(() => {
    if (!displayOptions?.hideInfo) {
      return info;
    }
  }, [displayOptions]);

  const actionComponent = useMemo(() => {
    if (action) {
      if (!displayOptions?.hideAction) {
        return (
          <>
            <div className={classNames(styles.divider)} />
            <div className={'collapsible-action all-children-margin'}>{action}</div>
          </>
        );
      }
    }
  }, [action]);

  const collapsibleRef = node => {
    if (!node) return;

    if (colorOptions.hideLeftBorder === false && colorOptions.borderLeftColor) {
      const borderLeftColor = colorOptions.borderLeftColor;
      // By default use the borderLeft color as the backgroundColor if backgroundColor is not passed in
      const backgroundColor = colorOptions?.backgroundColor ? colorOptions.backgroundColor : borderLeftColor;
      let backgroundColorAlpha = 0.05;
      if (colorOptions?.backgroundColor) {
        backgroundColorAlpha = 0;
      }
      node.style.setProperty('background-color', getHexColorWithAlpha(backgroundColor, backgroundColorAlpha), 'important');
      node.style.setProperty('border-left-color', borderLeftColor, 'important');
    }
  };

  return (
    <div className={classNames('card', collapsibleClassName, styles.main)}>
      <div
        className={classNames(
          'd-flex align-items-center p-1 bg-transparent pe-2',
          styles.header,
          colorOptions.hideLeftBorder ? styles.hiddenHeaderLeftBorder : undefined,
        )}
        ref={collapsibleRef}
      >
        <div style={{ flexGrow: 1 }} className="d-flex align-items-center">
          <div
            className={classNames(styles.collapsibleTitleWrapper, displayOptions?.disableCollapsible && styles.disabledCollapsible)}
            onClick={handleToggle}
          >
            <button
              disabled={displayOptions?.disableCollapsible || displayOptions?.hideToggle}
              style={{ opacity: displayOptions?.disableCollapsible || displayOptions?.hideToggle ? '0' : '1' }}
              type="button"
              className={classNames('btn', 'py-1')}
            >
              {isOpen ? <FontAwesomeIcon icon={faChevronDown} size={'sm'} /> : <FontAwesomeIcon icon={faChevronRight} size={'sm'} />}
            </button>
            <span className={classNames(titleClassName ? titleClassName : 'fw-bold')}>
              {title}
              {badge}
            </span>
          </div>

          <div className="me-auto" />
          <div className="d-flex align-items-center">
            {infoComponent}
            {actionComponent}
            {showLoadingSpinner && (
              <span className="ps-2">
                <Spinner
                  style={{ color: colorOptions.hideLeftBorder === true ? colorOptions.backgroundColor : colorOptions.borderLeftColor }}
                  size="sm"
                />
              </span>
            )}
          </div>
        </div>
      </div>
      {isOpen && <div className={classNames('card-body', styles.body)}>{children}</div>}
    </div>
  );
}
