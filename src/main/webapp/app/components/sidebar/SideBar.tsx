import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faArrowDown, faBars, faCartArrowDown, faChevronDown, faDna, faLongArrowAltDown } from '@fortawesome/free-solid-svg-icons';
import { faSearch } from '@fortawesome/free-solid-svg-icons/faSearch';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { PAGE_ROUTE } from 'app/config/constants';
import { IRootStore } from 'app/stores/createStore';
import { componentInject } from 'app/shared/util/typed-inject';
import { observer } from 'mobx-react';
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Nav } from 'reactstrap';
import './sidebar.scss';

type SideBarMenuItemProps = {
  icon: IconProp;
  name: string;
  linkTo?: string;
  onClick?: () => void;
};

const SideBarMenuItem: React.FunctionComponent<SideBarMenuItemProps> = props => {
  const menuItem = (
    <div className="menu-item" onClick={props.onClick}>
      <FontAwesomeIcon icon={props.icon} size="lg" className="mr-2" />
      <span className="menu-text">{props.name}</span>
    </div>
  );
  if (props.linkTo) {
    return (
      <NavLink to={props.linkTo} className="nav-item" exact>
        {menuItem}
      </NavLink>
    );
  }
  return menuItem;
};

class SideBar extends React.Component<StoreProps> {
  render() {
    return (
      <div className={`sidebar ${this.props.isSideBarCollapsed ? 'sidebar--collapse' : ''}`}>
        <Nav vertical>
          <SideBarMenuItem name="Menu" icon={faBars} onClick={this.props.toggleSideBar} />
          <div className="border-top">
            <h6 className="panel-title">Navigation Panel</h6>
            <SideBarMenuItem name="Search" icon={faSearch} linkTo={PAGE_ROUTE.ARTICLES_SEARCH} />
            <SideBarMenuItem name="Genes" icon={faDna} linkTo={PAGE_ROUTE.GENE} />
          </div>
        </Nav>
      </div>
    );
  }
}

const mapStoreToProps = ({ navigationControlStore }: IRootStore) => ({
  isSideBarCollapsed: navigationControlStore.isSideBarCollapsed,
  toggleSideBar: navigationControlStore.toggleSideBar,
});

type StoreProps = {
  isSideBarCollapsed?: boolean;
  toggleSideBar?: () => void;
};

export default componentInject(mapStoreToProps)(observer(SideBar));
