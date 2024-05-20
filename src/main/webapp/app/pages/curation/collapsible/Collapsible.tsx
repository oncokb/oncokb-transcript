import React, { useMemo } from 'react';
import BaseCollapsible, { BaseCollapsibleProps, CollapsibleColorProps, CollapsibleDisplayProps } from './BaseCollapsible';
import { DANGER } from 'app/config/colors';
import { DISABLED_COLLAPSIBLE_COLOR } from 'app/config/constants/constants';

export interface CollapsibleProps extends BaseCollapsibleProps {
  title: React.ReactNode;
  disableLeftBorder?: boolean;
  backgroundColor?: string;
  info?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  open?: boolean;
  disableOpen?: boolean; // this prop is only used for the mutation collapsible, since it doesn't actually open when clicked
  isPendingDelete?: boolean;
}

export default function Collapsible({
  isPendingDelete = false,
  colorOptions,
  displayOptions,
  disableOpen,
  ...baseCollapsibleProps
}: CollapsibleProps) {
  const defaultColorOptions: CollapsibleColorProps = {
    hideLeftBorder: colorOptions?.hideLeftBorder ? colorOptions.hideLeftBorder : false,
    ...colorOptions,
  };

  const defaultDisplayOptions: CollapsibleDisplayProps = {
    disableCollapsible: displayOptions?.disableCollapsible || false,
    hideAction: displayOptions?.hideAction || false,
    hideInfo: displayOptions?.hideInfo || false,
    hideToggle: displayOptions?.hideToggle || false,
  };

  const displayOptionsOverride = createDisplayOptions(isPendingDelete, defaultDisplayOptions, displayOptions);
  const colorOptionsOverride = createColorOptions(colorOptions, displayOptionsOverride, defaultColorOptions, isPendingDelete);
  const disableOpenOverride = shouldDisableOverride(isPendingDelete, displayOptionsOverride, disableOpen);

  return (
    <BaseCollapsible
      {...baseCollapsibleProps}
      colorOptions={colorOptionsOverride}
      displayOptions={displayOptionsOverride}
      disableOpen={disableOpenOverride}
    />
  );
}

function shouldDisableOverride(isPendingDelete: boolean, displayOptionsOverride: CollapsibleDisplayProps, disableOpen: boolean) {
  if (isPendingDelete) {
    return true;
  }
  if (displayOptionsOverride.disableCollapsible) {
    return true;
  }
  if (displayOptionsOverride.hideToggle) {
    return true;
  }
  return disableOpen;
}

function createColorOptions(
  colorOptions: CollapsibleColorProps,
  displayOptionsOverride: CollapsibleDisplayProps,
  defaultColorOptions: CollapsibleColorProps,
  isPendingDelete: boolean,
) {
  const forceLeftColor = colorOptions.hideLeftBorder !== true && colorOptions.forceLeftColor;
  if (displayOptionsOverride.disableCollapsible && !forceLeftColor) {
    if (defaultColorOptions.hideLeftBorder === false) {
      defaultColorOptions.borderLeftColor = DISABLED_COLLAPSIBLE_COLOR;
    }
  }
  if (isPendingDelete) {
    if (defaultColorOptions.hideLeftBorder === false) {
      defaultColorOptions.borderLeftColor = DANGER;
    }
  }
  return defaultColorOptions;
}

function createDisplayOptions(
  isPendingDelete: boolean,
  defaultDisplayOptions: CollapsibleDisplayProps,
  displayOptions: CollapsibleDisplayProps,
) {
  if (isPendingDelete) {
    defaultDisplayOptions.disableCollapsible = true;
    defaultDisplayOptions.hideAction = displayOptions?.hideAction || false;
    defaultDisplayOptions.hideInfo = displayOptions?.hideInfo || false;
  }
  return defaultDisplayOptions;
}
