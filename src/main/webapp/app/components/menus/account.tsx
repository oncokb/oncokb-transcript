import React from 'react';
import MenuItem from 'app/components/menus/menu-item';

import { NavDropdown } from './menu-components';

const AccountMenuItemsAuthenticated: React.FunctionComponent<{
  isAdmin: boolean;
}> = props => (
  <>
    {props.isAdmin ? (
      <>
        <MenuItem icon="users" to="/admin/user-management">
          User management
        </MenuItem>
      </>
    ) : null}
    <MenuItem icon="wrench" to="/account/settings" data-cy="settings">
      Settings
    </MenuItem>
    <MenuItem icon="sign-out-alt" to="/logout" data-cy="logout">
      Sign out
    </MenuItem>
  </>
);

const AccountMenuItems: React.FunctionComponent = props => (
  <>
    <MenuItem id="login-item" icon="sign-in-alt" to="/login" data-cy="login">
      Sign in
    </MenuItem>
  </>
);

export const AccountMenu: React.FunctionComponent<{
  isAuthenticated: boolean;
  isAdmin: boolean;
}> = props => (
  <NavDropdown icon="user" name="Account" id="account-menu" data-cy="accountMenu">
    {props.isAuthenticated ? <AccountMenuItemsAuthenticated isAdmin={props.isAdmin} /> : <AccountMenuItems />}
  </NavDropdown>
);

export default AccountMenu;
