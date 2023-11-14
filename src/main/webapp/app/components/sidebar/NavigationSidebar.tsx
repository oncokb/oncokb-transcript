import React, { useEffect, useState } from 'react';
import './navigation-sidebar.scss';
import oncokbLogo from 'oncokb-styles/dist/images/logo/oncokb.svg';
import oncokbSmallLogo from 'oncokb-styles/dist/images/oncogenic.svg';
import { observer } from 'mobx-react';
import {
  AUTHORITIES,
  DEFAULT_NAV_ICON_SIZE,
  ENTITY_BASE_PATHS,
  ENTITY_TYPE,
  INTEGER_REGEX,
  PAGE_ROUTE,
} from 'app/config/constants/constants';
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
import _ from 'lodash';

const PRIORITY_ENTITY_MENU_ITEM_KEY = 'oncokbCurationEntityMenuPriorityKey';

const ENTITY_MENU_NAME: { [key in ENTITY_TYPE]?: string } = {
  [ENTITY_TYPE.GENE]: 'Gene',
  [ENTITY_TYPE.ALTERATION]: 'Alteration',
  [ENTITY_TYPE.COMPANION_DIAGNOSTIC_DEVICE]: 'CDx',
  [ENTITY_TYPE.FDA_SUBMISSION]: 'FDA Submission',
  [ENTITY_TYPE.DRUG]: 'Drug',
  [ENTITY_TYPE.TRANSCRIPT]: 'Transcript',
  [ENTITY_TYPE.ENSEMBL_GENE]: 'Ensembl Gene',
  [ENTITY_TYPE.ARTICLE]: 'Article',
  [ENTITY_TYPE.SPECIMEN_TYPE]: 'Specimen Type',
  [ENTITY_TYPE.CT_GOV_CONDITION]: 'CT Condition',
};

const DEFAULT_ENTITY_MENU_ORDER = [
  ENTITY_TYPE.GENE,
  ENTITY_TYPE.ALTERATION,
  ENTITY_TYPE.COMPANION_DIAGNOSTIC_DEVICE,
  ENTITY_TYPE.FDA_SUBMISSION,
  ENTITY_TYPE.DRUG,
  ENTITY_TYPE.TRANSCRIPT,
  ENTITY_TYPE.ENSEMBL_GENE,
  ENTITY_TYPE.ARTICLE,
  ENTITY_TYPE.SPECIMEN_TYPE,
  ENTITY_TYPE.CT_GOV_CONDITION,
];

const getDefaultEntityMenuFrequencies = () => {
  return DEFAULT_ENTITY_MENU_ORDER.slice()
    .reverse()
    .map((key, i) => ({ type: key, frequency: i }));
};

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

interface IPriorityEntityMenuItem extends MenuItemProps {
  type: ENTITY_TYPE;
  handlePriorityMenuItemClick: (entityType: ENTITY_TYPE) => void;
}

const PriorityEntityMenuItem = (props: IPriorityEntityMenuItem) => {
  const { handlePriorityMenuItemClick, ...otherProps } = props;
  return (
    <MenuItem
      {...otherProps}
      component={<NavLink to={ENTITY_BASE_PATHS[props.type]} />}
      onClick={() => {
        props.handlePriorityMenuItemClick(props.type);
      }}
    />
  );
};

export type EntityMenuFrequency = {
  type: ENTITY_TYPE;
  frequency: number;
};

const MenuDivider: React.FunctionComponent = () => {
  return <div className="nav-menu-divider"></div>;
};

export const NavigationSidebar: React.FunctionComponent<StoreProps> = props => {
  const [entityMenuFrequencies, setEntityMenuFrequencies] = useState(getDefaultEntityMenuFrequencies() as EntityMenuFrequency[]);
  const [entityMenuOrder, setEntityMenuOrder] = useState(DEFAULT_ENTITY_MENU_ORDER);

  const handlePriorityMenuItemClick = (type: ENTITY_TYPE) => {
    if (DEFAULT_ENTITY_MENU_ORDER.includes(type)) {
      const targetIndex = entityMenuFrequencies.findIndex(e => e.type === type);
      entityMenuFrequencies[targetIndex] = {
        ...entityMenuFrequencies[targetIndex],
        frequency: entityMenuFrequencies[targetIndex].frequency + 1,
      };
      localStorage.setItem(PRIORITY_ENTITY_MENU_ITEM_KEY, JSON.stringify(entityMenuFrequencies));
    }
  };

  useEffect(() => {
    const frequencies = JSON.parse(localStorage.getItem(PRIORITY_ENTITY_MENU_ITEM_KEY));
    let parsedFrequencies = entityMenuFrequencies;
    if (frequencies) {
      parsedFrequencies = Object.keys(ENTITY_TYPE)
        .filter((key: ENTITY_TYPE) => DEFAULT_ENTITY_MENU_ORDER.includes(ENTITY_TYPE[key]))
        .map((key: ENTITY_TYPE) => {
          let frequency = 0;
          const target = _.find(frequencies, { type: ENTITY_TYPE[key] });
          frequency = target && INTEGER_REGEX.test(target.frequency) ? parseInt(target.frequency, 10) : 0;
          return { type: ENTITY_TYPE[key], frequency };
        });
      setEntityMenuFrequencies(parsedFrequencies);
    }
    const order = _.chain(parsedFrequencies)
      .sortBy(e => e.frequency)
      .reverse()
      .map(item => item.type)
      .value();

    setEntityMenuOrder(order);
  }, []);

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
        <div className="nav-collapse-btn-wrapper">
          <Button size="sm" color="light" onClick={props.toggleNavigationSidebar}>
            <HiMiniBars3 size={DEFAULT_NAV_ICON_SIZE} />
          </Button>
        </div>
        <MenuDivider />

        <div style={{ flex: '1 1 0%', overflowY: 'auto', minHeight: '200px' }}>
          <Menu>
            {props.isCurator && (
              <MenuItemCollapsible
                isCollapsed={props.isNavSidebarCollapsed}
                text="Curation"
                icon={<FiFileText size={DEFAULT_NAV_ICON_SIZE} />}
                nav={<NavLink to={PAGE_ROUTE.CURATION} />}
              />
            )}
            {props.isUser && (
              <>
                <MenuItemCollapsible
                  isCollapsed={props.isNavSidebarCollapsed}
                  text={'Search'}
                  icon={<BiSearchAlt size={DEFAULT_NAV_ICON_SIZE} />}
                  nav={<NavLink to={PAGE_ROUTE.SEARCH} />}
                />
                <SubMenu defaultOpen label="Entities" icon={<GoDatabase size={DEFAULT_NAV_ICON_SIZE} />}>
                  {entityMenuOrder.map(entityType => (
                    <PriorityEntityMenuItem key={entityType} type={entityType} handlePriorityMenuItemClick={handlePriorityMenuItemClick}>
                      {ENTITY_MENU_NAME[entityType]}
                    </PriorityEntityMenuItem>
                  ))}
                </SubMenu>
              </>
            )}
          </Menu>
        </div>
        <MenuDivider />
        <Menu>
          <SubMenu label={props.account.firstName} icon={<FaUserCircle size={DEFAULT_NAV_ICON_SIZE} />}>
            <MenuItem component={<NavLink to={PAGE_ROUTE.ACCOUNT} />}>Account Settings</MenuItem>
            {props.isAdmin && <MenuItem component={<NavLink to={PAGE_ROUTE.ADMIN_USER_MANAGEMENT} />}>User Management</MenuItem>}
          </SubMenu>
          <MenuItemCollapsible
            isCollapsed={props.isNavSidebarCollapsed}
            text={'Sign out'}
            icon={<FaSignOutAlt size={DEFAULT_NAV_ICON_SIZE} />}
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
  isCurator: hasAnyAuthority(authStore.account.authorities, [AUTHORITIES.CURATOR]),
  isUser: hasAnyAuthority(authStore.account.authorities, [AUTHORITIES.USER]),
  account: authStore.account,
});

type StoreProps = {
  toggleNavigationSidebar?: () => void;
  isNavSidebarCollapsed?: boolean;
  navigationSidebarWidth?: number;
  isAuthenticated?: boolean;
  isAdmin?: boolean;
  isCurator?: boolean;
  isUser?: boolean;
  account?: IUser;
};

export default componentInject(mapStoreToProps)(observer(NavigationSidebar));
