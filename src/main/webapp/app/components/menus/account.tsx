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
        <MenuItem icon="search" to="/admin/cache-management">
          Cache management
        </MenuItem>
      </>
    ) : null}
    <MenuItem icon="wrench" to="/account/settings">
      Settings
    </MenuItem>
    <MenuItem icon="sign-out-alt" to="/logout">
      Sign out
    </MenuItem>
  </>
);

const AccountMenuItems: React.FunctionComponent = props => (
  <>
    <MenuItem id="login-item" icon="sign-in-alt" to="/login">
      Sign in
    </MenuItem>
  </>
);

export const AccountMenu: React.FunctionComponent<{
  isAuthenticated: boolean;
  isAdmin: boolean;
}> = props => (
  <NavDropdown icon="user" name="Account" id="account-menu">
    {props.isAuthenticated ? <AccountMenuItemsAuthenticated isAdmin={props.isAdmin} /> : <AccountMenuItems />}
  </NavDropdown>
);

export default AccountMenu;
