import './header.scss';

import React, { useState } from 'react';
import { Navbar, Nav, NavbarToggler, Collapse, NavbarBrand, Container } from 'reactstrap';
import oncokbLogo from '../../../content/images/oncokb-white.svg';
import { AccountMenu } from '../menus';
import { NavLink } from 'react-router-dom';
import { PAGE_ROUTE } from 'app/config/constants';
import OptimizedImage from 'app/oncokb-commons/components/image/OptimizedImage';
import { action, makeObservable, observable } from 'mobx';

export interface IHeaderProps {
  isAuthenticated: boolean;
  isAdmin: boolean;
}

class Header extends React.Component<IHeaderProps> {
  isNavMenuExpanded = false;

  constructor(props: IHeaderProps) {
    super(props);
    makeObservable(this, {
      isNavMenuExpanded: observable,
      toggleNavMenu: action.bound,
    });
  }

  toggleNavMenu() {
    this.isNavMenuExpanded = !this.isNavMenuExpanded;
  }

  render() {
    return (
      <header className="sticky-top header">
        <Navbar dark expand="lg" className="navbar">
          <Container fluid>
            <NavbarBrand>
              <NavLink to={PAGE_ROUTE.HOME}>
                <OptimizedImage height={20} src={oncokbLogo} alt={'OncoKB'} />
              </NavLink>
            </NavbarBrand>
            <NavbarToggler aria-label="Menu" onClick={this.toggleNavMenu} />
            <Collapse isOpen={this.isNavMenuExpanded} navbar>
              <Nav className="ml-auto" navbar>
                <AccountMenu isAuthenticated={this.props.isAuthenticated} isAdmin={this.props.isAdmin} />
              </Nav>
            </Collapse>
          </Container>
        </Navbar>
      </header>
    );
  }
}

export default Header;
