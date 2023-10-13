import React from 'react';
import './navigation-sidebar.scss';
import oncokbLogo from 'oncokb-styles/dist/images/logo/oncokb.svg';
import oncokbSmallLogo from 'oncokb-styles/dist/images/oncogenic.svg';
import { observer } from 'mobx-react';
import { AUTHORITIES, PAGE_ROUTE } from 'app/config/constants';
import { IRootStore } from 'app/stores/createStore';
import { componentInject } from 'app/shared/util/typed-inject';
import { NavLink } from 'react-router-dom';
import { Sidebar, Menu, MenuItem, SubMenu, MenuItemProps } from 'react-pro-sidebar';
import { hasAnyAuthority } from 'app/stores';
import DefaultTooltip from 'app/shared/tooltip/DefaultTooltip';
import OptimizedImage from 'app/oncokb-commons/components/image/OptimizedImage';
import { Button, NavbarBrand } from 'reactstrap';
import { FiFileText } from 'react-icons/fi';
import { GoDatabase } from 'react-icons/go';
import { BiSearchAlt } from 'react-icons/bi';
import { FaSignOutAlt, FaUserCircle } from 'react-icons/fa';
import { HiMiniBars3 } from 'react-icons/hi2';
import { IUser } from 'app/shared/model/user.model';
import { MskccLogo } from 'app/shared/logo/MskccLogo';
import { SIDEBAR_COLLAPSED_WIDTH, SIDEBAR_EXPANDED_WIDTH } from 'app/stores/layout.store';

type MenuItemCollapsibleProps = {
  isCollapsed: boolean;
  text: string;
  icon: JSX.Element;
  nav: JSX.Element;
} & MenuItemProps;

const MenuItemCollapsible: React.FunctionComponent<MenuItemCollapsibleProps> = props => {
  const { isCollapsed, text, icon, nav, ...otherProps } = props;
  const menuItem = (
    <MenuItem icon={icon} component={nav} {...otherProps}>
      {props.text}
    </MenuItem>
  );
  if (props.isCollapsed) {
    return (
      <DefaultTooltip overlayInnerStyle={{ padding: '4px 5px' }} overlay={text} placement="right" mouseEnterDelay={0}>
        {menuItem}
      </DefaultTooltip>
    );
  }
  return menuItem;
};

const MenuDivider: React.FunctionComponent = () => {
  return <div className="ps-menu-divider"></div>;
};

export const NavigationSidebar: React.FunctionComponent<StoreProps> = props => {
  return (
    <Sidebar collapsed={props.isNavSidebarCollapsed} width={`${SIDEBAR_EXPANDED_WIDTH}px`} collapsedWidth={`${SIDEBAR_COLLAPSED_WIDTH}px`}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ lineHeight: '5rem', display: 'flex', justifyContent: 'center' }}>
          <NavbarBrand as={NavLink} to={PAGE_ROUTE.HOME}>
            {props.isNavSidebarCollapsed ? (
              <OptimizedImage height={30} src={oncokbSmallLogo} alt={'OncoKB'} />
            ) : (
              <OptimizedImage height={30} src={oncokbLogo} alt={'OncoKB'} />
            )}
          </NavbarBrand>
        </div>
        <div className="ps-collapse-btn-wrapper">
          <Button size="sm" color="light" onClick={props.toggleNavigationSidebar}>
            <HiMiniBars3 size={25} />
          </Button>
        </div>
        <MenuDivider />

        <div style={{ flex: '1 1 0%' }}>
          <Menu>
            <MenuItemCollapsible
              isCollapsed={props.isNavSidebarCollapsed}
              text="Curation"
              icon={<FiFileText size={25} />}
              nav={<NavLink to={PAGE_ROUTE.CURATION} />}
            />
            <MenuItemCollapsible
              isCollapsed={props.isNavSidebarCollapsed}
              text={'Search'}
              icon={<BiSearchAlt size={25} />}
              nav={<NavLink to={PAGE_ROUTE.SEARCH} />}
            />
            <SubMenu defaultOpen label="Entities" icon={<GoDatabase size={25} />}>
              <MenuItem component={<NavLink to={PAGE_ROUTE.GENE} />}>Gene</MenuItem>
              <MenuItem component={<NavLink to={PAGE_ROUTE.ALTERATION} />}>Alteration</MenuItem>
              <MenuItem component={<NavLink to={PAGE_ROUTE.ARTICLE} />}>Article</MenuItem>
              <MenuItem component={<NavLink to={PAGE_ROUTE.DRUG} />}>Drug</MenuItem>
              <MenuItem component={<NavLink to={PAGE_ROUTE.CDX} />}>CDx</MenuItem>
              <MenuItem component={<NavLink to={PAGE_ROUTE.FDA_SUBMISSION} />}>FDA Submission</MenuItem>
              <MenuItem component={<NavLink to={PAGE_ROUTE.SPECIMEN_TYPE} />}>Specimen Type</MenuItem>
              <MenuItem component={<NavLink to={PAGE_ROUTE.CT_GOV_CONDITION} />}>CT Condition</MenuItem>
              <MenuItem component={<NavLink to={PAGE_ROUTE.ENSEMBL_GENE} />}>Ensembl Gene</MenuItem>
              <MenuItem component={<NavLink to={PAGE_ROUTE.TRANSCRIPT} />}>Transcript</MenuItem>
            </SubMenu>
          </Menu>
        </div>
        <MenuDivider />
        <Menu>
          <SubMenu label={props.account.firstName} icon={<FaUserCircle size={25} />}>
            <MenuItem component={<NavLink to={PAGE_ROUTE.ACCOUNT} />}>Account Settings</MenuItem>
            <MenuItem component={<NavLink to={PAGE_ROUTE.ADMIN_USER_MANAGEMENT} />}>User Management</MenuItem>
          </SubMenu>
          <MenuItemCollapsible
            isCollapsed={props.isNavSidebarCollapsed}
            text={'Sign out'}
            icon={<FaSignOutAlt size={25} />}
            nav={<NavLink to={PAGE_ROUTE.LOGOUT} />}
          />
        </Menu>
        <MenuDivider />
        <div style={{ lineHeight: '5rem', display: 'flex', justifyContent: 'center' }}>
          {props.isNavSidebarCollapsed ? (
            <MskccLogo className="navbar-brand" size={'sm'} />
          ) : (
            <MskccLogo className="navbar-brand" size={'lg'} />
          )}
        </div>
      </div>
    </Sidebar>
  );
};

const mapStoreToProps = ({ layoutStore, authStore }: IRootStore) => ({
  toggleNavigationSidebar: layoutStore.toggleNavigationSidebar,
  isNavSidebarCollapsed: layoutStore.isNavigationSidebarCollapsed,
  navigationSidebarWidth: layoutStore.navigationSidebarWidth,
  isAuthenticated: authStore.isAuthenticated,
  isAdmin: hasAnyAuthority(authStore.account.authorities, [AUTHORITIES.ADMIN]),
  account: authStore.account,
});

type StoreProps = {
  toggleNavigationSidebar?: () => void;
  isNavSidebarCollapsed?: boolean;
  navigationSidebarWidth?: number;
  isAuthenticated?: boolean;
  isAdmin?: boolean;
  account?: IUser;
};

export default componentInject(mapStoreToProps)(observer(NavigationSidebar));
