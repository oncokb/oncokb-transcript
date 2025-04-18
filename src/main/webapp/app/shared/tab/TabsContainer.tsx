import React, { useMemo, useState } from 'react';
import './tabs-container.scss';

export type Tabs = {
  title: string;
  getContent: () => JSX.Element;
  key: string;
}[];

export type ToolbarMap<T extends Tabs> = {
  [K in T[number]['key']]?: React.ReactNode;
} & {
  // Toolbar shown on all tabs if no specific key matches
  default?: React.ReactNode;
};

export interface ITabsContainer {
  tabs: Tabs;
  toolbars?: ToolbarMap<Tabs>;
}

export default function TabsContainer({ tabs, toolbars }: ITabsContainer) {
  const [selectedTab, setSelectedTab] = useState(tabs[0].key);

  const activeToolbar = useMemo(() => {
    if (toolbars?.[selectedTab]) {
      return toolbars[selectedTab];
    }
    if (toolbars?.default) {
      return toolbars.default;
    }
    return <></>;
  }, []);

  const activeTabIndex = tabs.findIndex(value => value.key === selectedTab);

  return (
    <div className="comment-box card px-3 py-2">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <ul className="nav nav-tabs mb-0">
          {tabs.map(tab => (
            <li className="nav-item" key={tab.key}>
              <button className={`nav-link ${tab.key === selectedTab ? 'active' : ''}`} onClick={() => setSelectedTab(tab.key)}>
                {tab.title}
              </button>
            </li>
          ))}
        </ul>
        <div className="toolbar d-flex gap-1">{activeToolbar}</div>
      </div>

      <div className="mt-2">{activeTabIndex > -1 ? tabs[activeTabIndex].getContent() : <></>}</div>
    </div>
  );
}
