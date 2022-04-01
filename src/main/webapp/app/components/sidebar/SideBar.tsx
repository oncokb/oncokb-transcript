import React from 'react';
import './sidebar.scss';
import { observer } from 'mobx-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { PAGE_ROUTE } from 'app/config/constants';
import { IRootStore } from 'app/stores/createStore';
import { componentInject } from 'app/shared/util/typed-inject';
import { NavLink } from 'react-router-dom';
import { ProSidebar, Menu, MenuItem, SidebarContent } from 'react-pro-sidebar';
import { faBars, faBuilding, faSearch, faPills } from '@fortawesome/free-solid-svg-icons';

class SideBar extends React.Component<StoreProps> {
  render() {
    return (
      <div className="sidebar-wrapper">
        <ProSidebar collapsed={this.props.isSideBarCollapsed}>
          <SidebarContent>
            <Menu>
              <MenuItem icon={<FontAwesomeIcon size="lg" icon={faBars} />} onClick={this.props.toggleSideBar} />
            </Menu>
            <Menu>
              <MenuItem icon={<FontAwesomeIcon size="lg" icon={faSearch} />}>
                Article <NavLink to={PAGE_ROUTE.ARTICLES_SEARCH} />
              </MenuItem>
              <MenuItem icon={<b style={{ fontSize: '1.5em' }}>G</b>}>
                Gene <NavLink to={PAGE_ROUTE.GENE} />
              </MenuItem>
              <MenuItem icon={<b style={{ fontSize: '1.5em' }}>A</b>}>
                Alteration <NavLink to={PAGE_ROUTE.ALTERATION} />
              </MenuItem>
              <MenuItem icon={<FontAwesomeIcon size="lg" icon={faPills} />}>
                Drug <NavLink to={PAGE_ROUTE.DRUG} />
              </MenuItem>
              <MenuItem icon={<FontAwesomeIcon size="lg" icon={faBuilding} />}>
                CDD
                <NavLink to={PAGE_ROUTE.CDD} />
              </MenuItem>
              <MenuItem icon={<b style={{ fontSize: '1.2em' }}>FDA</b>}>
                Submission <NavLink to={PAGE_ROUTE.FDA_SUBMISSION} />
              </MenuItem>
            </Menu>
          </SidebarContent>
        </ProSidebar>
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
