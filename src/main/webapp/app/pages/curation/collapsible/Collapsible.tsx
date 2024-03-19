import { ReactElement, useEffect, useMemo, useState } from 'react';
import styles from './styles.module.scss';
import React from 'react';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { DANGER } from 'app/config/colors';
import { getHexColorWithAlpha } from 'app/shared/util/utils';
import { DISABLED_NEST_LEVEL_COLOR } from './NestLevel';
import { IBadgeGroupProps } from '../BadgeGroup';
import { IDefaultBadgeProps } from 'app/shared/badge/DefaultBadge';

export interface CollapsibleProps {
  title: React.ReactNode;
  disableLeftBorder?: boolean;
  borderLeftColor?: string;
  backgroundColor?: string;
  info?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  open?: boolean;
  disableCollapsible?: boolean;
  disableOpen?: boolean; // this prop is only used for the mutation collapsible, since it doesn't actually open when clicked
  isPendingDelete?: boolean;
  isReview?: boolean;
  onToggle?: (isOpen: boolean) => void;
  badge?: ReactElement<IBadgeGroupProps> | ReactElement<IDefaultBadgeProps>;
}

export default function Collapsible({
  title,
  disableLeftBorder = false,
  borderLeftColor,
  info,
  action,
  children,
  className,
  open = false,
  disableCollapsible = false,
  disableOpen = false,
  isPendingDelete = false,
  isReview = false,
  backgroundColor,
  onToggle,
  badge,
}: CollapsibleProps) {
  const [isOpen, setIsOpen] = useState(open);

  if (isPendingDelete) {
    disableCollapsible = true;
  }

  useEffect(() => {
    if (isPendingDelete) {
      setIsOpen(false);
    }
  }, [isPendingDelete]);

  const handleToggleCollapsible = () => {
    if (!disableCollapsible) {
      if (!disableOpen) {
        setIsOpen(_isOpen => !_isOpen);
      }
      onToggle && onToggle(!isOpen);
    }
  };

  const infoComponent = useMemo(() => {
    if (isReview || !isPendingDelete) {
      return info;
    }
  }, [info, isPendingDelete, isReview]);

  const actionComponent = useMemo(() => {
    if (action) {
      if (isReview || !isPendingDelete) {
        return (
          <>
            <div className={classNames(styles.divider)} />
            <div className={'collapsible-action all-children-margin'}>{action}</div>
          </>
        );
      }
    }
  }, [action]);

  return (
    <div className={classNames('card', className, styles.main)}>
      <div
        className={classNames(
          'd-flex align-items-center p-1 bg-transparent pr-2',
          styles.header,
          disableLeftBorder ? styles.hiddenHeaderLeftBorder : undefined
        )}
        ref={node => {
          if (node && borderLeftColor) {
            const hadBackgroundColor = backgroundColor;
            if (disableCollapsible) {
              borderLeftColor = DISABLED_NEST_LEVEL_COLOR;
              if (!hadBackgroundColor) {
                backgroundColor = DISABLED_NEST_LEVEL_COLOR;
              }
            }
            if (isPendingDelete) {
              borderLeftColor = DANGER;
              backgroundColor = DANGER;
            }

            if (!backgroundColor) {
              backgroundColor = borderLeftColor;
            }
            node.style.setProperty('background-color', getHexColorWithAlpha(backgroundColor, hadBackgroundColor ? 0 : 0.05), 'important');
            node.style.setProperty('border-left-color', borderLeftColor, 'important');
          }
        }}
      >
        <div style={{ flexGrow: 1 }} className="d-flex align-items-center">
          <div
            className={classNames(styles.collapsibleTitleWrapper, disableCollapsible && styles.disabledCollapsible)}
            onClick={handleToggleCollapsible}
          >
            <button
              disabled={disableCollapsible}
              style={{ opacity: disableCollapsible ? '0' : '1' }}
              type="button"
              className={classNames('btn', 'py-1')}
            >
              {isOpen ? <FontAwesomeIcon icon={faChevronDown} size={'sm'} /> : <FontAwesomeIcon icon={faChevronRight} size={'sm'} />}
            </button>
            <span
              className={classNames(
                disableLeftBorder ? undefined : 'font-weight-bold',
                isPendingDelete ? 'text-decoration-line-through' : undefined
              )}
            >
              {title}
            </span>
          </div>
          {badge}
          <div className="mr-auto" />
          <div className="d-flex align-items-center">
            {infoComponent}
            {actionComponent}
          </div>
        </div>
      </div>
      {isOpen && <div className={classNames('card-body', styles.body)}>{children}</div>}
    </div>
  );
}
