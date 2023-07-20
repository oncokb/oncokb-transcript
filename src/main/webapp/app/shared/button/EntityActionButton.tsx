import React from 'react';
import { Button, ButtonProps } from 'reactstrap';
import { Link } from 'react-router-dom';
import { ENTITY_ACTION, ENTITY_TYPE } from 'app/config/constants';
import { getEntityActionRoute } from '../util/RouteUtils';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export interface EntityActionButtonProps {
  entityId?: number | string;
  entityType: ENTITY_TYPE;
  entityAction: ENTITY_ACTION;
  showText?: boolean;
}

const ENTITY_ACTION_ICONS: { [key in ENTITY_ACTION]: IconProp } = {
  [ENTITY_ACTION.CREATE]: 'plus',
  [ENTITY_ACTION.VIEW]: 'eye',
  [ENTITY_ACTION.EDIT]: 'pencil-alt',
  [ENTITY_ACTION.CURATE]: 'user',
  [ENTITY_ACTION.DELETE]: 'trash',
};

const EntityActionButton: React.FunctionComponent<EntityActionButtonProps & ButtonProps & React.HTMLAttributes<HTMLButtonElement>> =
  props => {
    const { entityId, entityType, entityAction, showText = true, ...buttonProps } = props;
    const path = getEntityActionRoute(entityType, entityAction, entityId);

    return (
      <Button className="mr-2" tag={Link} to={path} {...buttonProps} size="sm">
        <FontAwesomeIcon icon={ENTITY_ACTION_ICONS[entityAction]} />
        {showText && <span className="ml-2">{entityAction}</span>}
      </Button>
    );
  };

export default EntityActionButton;
