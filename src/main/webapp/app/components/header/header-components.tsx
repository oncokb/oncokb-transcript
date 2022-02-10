import React from 'react';

import { NavbarBrand } from 'reactstrap';
import { NavLink as Link } from 'react-router-dom';

export const Brand = () => (
  <NavbarBrand tag={Link} to="/" className="brand-logo">
    <span className="brand-title">OncoKB</span>
  </NavbarBrand>
);
