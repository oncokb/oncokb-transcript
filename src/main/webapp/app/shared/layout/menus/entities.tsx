import React from 'react';
import MenuItem from 'app/shared/layout/menus/menu-item';

import { NavDropdown } from './menu-components';

export const EntitiesMenu = props => (
  <NavDropdown icon="th-list" name="Entities" id="entity-menu" data-cy="entity" style={{ maxHeight: '80vh', overflow: 'auto' }}>
    <MenuItem icon="asterisk" to="/sequence">
      Sequence
    </MenuItem>
    <MenuItem icon="asterisk" to="/transcript">
      Transcript
    </MenuItem>
    <MenuItem icon="asterisk" to="/transcript-usage">
      Transcript Usage
    </MenuItem>
    <MenuItem icon="asterisk" to="/drug">
      Drug
    </MenuItem>
    <MenuItem icon="asterisk" to="/drug-synonym">
      Drug Synonym
    </MenuItem>
    <MenuItem icon="asterisk" to="/info">
      Info
    </MenuItem>
    <MenuItem icon="asterisk" to="/gene">
      Gene
    </MenuItem>
    <MenuItem icon="asterisk" to="/gene-alias">
      Gene Alias
    </MenuItem>
    {/* jhipster-needle-add-entity-to-menu - JHipster will add entities to the menu here */}
  </NavDropdown>
);
