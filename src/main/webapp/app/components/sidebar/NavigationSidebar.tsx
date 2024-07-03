import React, { CSSProperties, useEffect, useState } from 'react';
import './navigation-sidebar.scss';
import oncokbLogo from 'oncokb-styles/dist/images/logo/oncokb.svg';
import oncokbSmallLogo from 'oncokb-styles/dist/images/oncogenic.svg';
import { observer } from 'mobx-react';
import {
  AUTHORITIES,
  DEFAULT_NAV_ICON_SIZE,
  ENTITY_INFO,
  ENTITY_TYPE,
  PAGE_ROUTE,
  PRIORITY_ENTITY_MENU_ITEM_KEY,
} from 'app/config/constants/constants';
import { IRootStore } from 'app/stores/createStore';
import { componentInject } from 'app/shared/util/typed-inject';
import { NavLink } from 'react-router-dom';
import { Menu, MenuItem, MenuItemProps, Sidebar, SubMenu } from 'react-pro-sidebar';
import { hasAnyAuthority } from 'app/stores';
import DefaultTooltip from 'app/shared/tooltip/DefaultTooltip';
import OptimizedImage from 'app/oncokb-commons/components/image/OptimizedImage';
import { Button, NavbarBrand } from 'reactstrap';
import { FiFileText } from 'react-icons/fi';
import { GoDatabase } from 'react-icons/go';
import { BiSearchAlt } from 'react-icons/bi';
import { FaSignOutAlt, FaUserCircle, FaExclamationTriangle } from 'react-icons/fa';
import { HiMiniBars3 } from 'react-icons/hi2';
import { IUser } from 'app/shared/model/user.model';
import { MskccLogo } from 'app/shared/logo/MskccLogo';
import { SIDEBAR_COLLAPSED_WIDTH, SIDEBAR_EXPANDED_WIDTH } from 'app/stores/layout.store';
import _ from 'lodash';
import classNames from 'classnames';
import { WHOLE_NUMBER_REGEX } from 'app/config/constants/regex';
import CustomCursor from '../../../content/images/oncogenic-black.svg';

const ENTITY_MENU_NAME: { [key in ENTITY_TYPE]?: string } = {
  [ENTITY_TYPE.ALTERATION]: 'Alteration',
  [ENTITY_TYPE.ARTICLE]: 'Article',
  [ENTITY_TYPE.CANCER_TYPE]: 'Cancer Type',
  [ENTITY_TYPE.CATEGORICAL_ALTERATION]: 'Categorical Alts',
  [ENTITY_TYPE.CLINICAL_TRIAL]: 'Clinical Trial',
  [ENTITY_TYPE.COMPANION_DIAGNOSTIC_DEVICE]: 'CDx',
  [ENTITY_TYPE.CONSEQUENCE]: 'Consequence',
  [ENTITY_TYPE.DRUG]: 'Drug',
  [ENTITY_TYPE.ENSEMBL_GENE]: 'Ensembl Gene',
  [ENTITY_TYPE.FDA_DRUG]: 'FDA Drug',
  [ENTITY_TYPE.FDA_SUBMISSION]: 'FDA Submission',
  [ENTITY_TYPE.FLAG]: 'Flag',
  [ENTITY_TYPE.GENE]: 'Gene',
  [ENTITY_TYPE.GENOMIC_INDICATOR]: 'Genomic Indicator',
  [ENTITY_TYPE.INFO]: 'Info',
  [ENTITY_TYPE.LEVEL_OF_EVIDENCE]: 'Level of Evidence',
  [ENTITY_TYPE.NCI_THESAURUS]: 'NCI Thesaurus',
  [ENTITY_TYPE.SEQ_REGION]: 'Seq Region',
  [ENTITY_TYPE.SEQUENCE]: 'Sequence',
  [ENTITY_TYPE.SPECIMEN_TYPE]: 'Specimen Type',
  [ENTITY_TYPE.SYNONYM]: 'Synonym',
  [ENTITY_TYPE.TRANSCRIPT]: 'Transcript',
};

const DEFAULT_ENTITY_MENU_ORDER: ENTITY_TYPE[] = [
  ENTITY_TYPE.ALTERATION,
  ENTITY_TYPE.ARTICLE,
  ENTITY_TYPE.CANCER_TYPE,
  ENTITY_TYPE.CATEGORICAL_ALTERATION,
  ENTITY_TYPE.CLINICAL_TRIAL,
  ENTITY_TYPE.COMPANION_DIAGNOSTIC_DEVICE,
  ENTITY_TYPE.CONSEQUENCE,
  ENTITY_TYPE.DRUG,
  ENTITY_TYPE.ENSEMBL_GENE,
  ENTITY_TYPE.FDA_DRUG,
  ENTITY_TYPE.FDA_SUBMISSION,
  ENTITY_TYPE.FLAG,
  ENTITY_TYPE.GENE,
  ENTITY_TYPE.GENOMIC_INDICATOR,
  ENTITY_TYPE.INFO,
  ENTITY_TYPE.LEVEL_OF_EVIDENCE,
  ENTITY_TYPE.NCI_THESAURUS,
  ENTITY_TYPE.SEQ_REGION,
  ENTITY_TYPE.SEQUENCE,
  ENTITY_TYPE.SPECIMEN_TYPE,
  ENTITY_TYPE.SYNONYM,
  ENTITY_TYPE.TRANSCRIPT,
];

const getDefaultEntityMenuFrequencies = () => {
  return DEFAULT_ENTITY_MENU_ORDER.slice()
    .reverse()
    .map((key, i) => ({ type: key, frequency: i }));
};

type NoSidebarAccessProps = {
  isCollapsed: boolean;
};

function NoSidebarAccess({ isCollapsed }: NoSidebarAccessProps) {
  const iconStyle: CSSProperties = {
    height: isCollapsed ? '2rem' : '5rem',
    width: isCollapsed ? '2rem' : '5rem',
  };
  const iconClasses = ['mb-5', 'text-warning'];
  if (!isCollapsed) {
    iconClasses.push('w-100');
  }

  const listItemClasses = ['d-flex', 'flex-column', 'align-items-center', 'm-3', 'h-100'];
  if (isCollapsed) {
    listItemClasses.push('justify-content-center');
  } else {
    listItemClasses.push('py-5');
  }
  const warningMessage = 'You do not have permission to access any menu items!';
  return (
    <li className={classNames(listItemClasses)}>
      <DefaultTooltip overlay={<p>{warningMessage}</p>}>
        <FaExclamationTriangle className={classNames(iconClasses)} style={iconStyle} />
      </DefaultTooltip>
      {!isCollapsed && <p className="p-2 text-center">{warningMessage}</p>}
    </li>
  );
}

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
      component={<NavLink to={ENTITY_INFO[props.type].pageRoute} />}
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

  const entityMenuLocalStorageKey = PRIORITY_ENTITY_MENU_ITEM_KEY;

  const handlePriorityMenuItemClick = (type: ENTITY_TYPE) => {
    if (DEFAULT_ENTITY_MENU_ORDER.includes(type)) {
      const targetIndex = entityMenuFrequencies.findIndex(e => e.type === type);
      entityMenuFrequencies[targetIndex] = {
        ...entityMenuFrequencies[targetIndex],
        frequency: entityMenuFrequencies[targetIndex].frequency + 1,
      };
      localStorage.setItem(entityMenuLocalStorageKey, JSON.stringify(entityMenuFrequencies));
    }
  };

  useEffect(() => {
    const frequencies = JSON.parse(localStorage.getItem(entityMenuLocalStorageKey));
    let parsedFrequencies = entityMenuFrequencies;
    if (frequencies) {
      parsedFrequencies = Object.keys(ENTITY_TYPE)
        .filter((key: ENTITY_TYPE) => DEFAULT_ENTITY_MENU_ORDER.includes(ENTITY_TYPE[key]))
        .map((key: ENTITY_TYPE) => {
          let frequency = 0;
          const target = _.find(frequencies, { type: ENTITY_TYPE[key] });
          frequency = target && WHOLE_NUMBER_REGEX.test(target.frequency) ? parseInt(target.frequency, 10) : 0;
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
          <NavbarBrand tag={NavLink} to={PAGE_ROUTE.HOME} style={{ cursor: 'url(' + CustomCursor + '), auto' }}>
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
            {!props.isCurator && !props.isUser && <NoSidebarAccess isCollapsed={props.isNavSidebarCollapsed} />}
          </Menu>
        </div>
        <MenuDivider />
        <Menu>
          <SubMenu label={props.account.firstName} icon={<FaUserCircle size={DEFAULT_NAV_ICON_SIZE} />}>
            <MenuItem component={<NavLink to={PAGE_ROUTE.ACCOUNT} />}>Account Settings</MenuItem>
            {props.isAdmin && <MenuItem component={<NavLink to={PAGE_ROUTE.USER} />}>User Management</MenuItem>}
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
