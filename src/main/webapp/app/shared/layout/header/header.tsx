import './header.scss';

import React, { useState } from 'react';

import { Navbar, Nav, NavbarToggler, Collapse } from 'reactstrap';

import { Brand } from './header-components';
import { AccountMenu } from '../menus';
import { IRootStore } from 'app/shared/stores';
import { connect } from 'app/shared/util/typed-inject';

export interface IHeaderProps {
  isAuthenticated: boolean;
  isAdmin: boolean;
  isInProduction: boolean;
  isOpenAPIEnabled: boolean;
}

export const Header = (props: IHeaderProps & StoreProps) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  /* jhipster-needle-add-element-to-menu - JHipster will add new menu items here */

  return (
    <div id="app-header">
      <div className="simple__loading__container">
        <div className={'simple__loading__bar ' + (props.count === 0 ? 'simple__loading__bar--done ' : '')}></div>
      </div>
      <Navbar data-cy="navbar" dark expand="sm" fixed="top" className="jh-navbar">
        <NavbarToggler aria-label="Menu" onClick={toggleMenu} />
        <Brand />
        <Collapse isOpen={menuOpen} navbar>
          <Nav id="header-tabs" className="ml-auto" navbar>
            <AccountMenu isAuthenticated={props.isAuthenticated} isAdmin={props.isAdmin} />
          </Nav>
        </Collapse>
      </Navbar>
    </div>
  );
};

const mapStoreToProps = ({ loadingStore }: IRootStore) => ({
  count: loadingStore.count,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(Header);
