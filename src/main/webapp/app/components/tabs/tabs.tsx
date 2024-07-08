import React, { useEffect, useState } from 'react';
import { Col, Container, Row } from 'reactstrap';
import * as styles from './styles.module.scss';
import classNames from 'classnames';

export type Tab = {
  id?: string;
  title: React.ReactNode;
  content: React.ReactNode;
};

export interface ITabsProps {
  tabs: Tab[];
  defaultOpenTabIndex?: number;
  isCollapsed?: boolean;
  className?: string;
  contentClassName?: string;
}

const Tabs = ({ tabs, isCollapsed = false, defaultOpenTabIndex = 0, className, contentClassName }: ITabsProps) => {
  const [openTabIndex, setOpenTabIndex] = useState(defaultOpenTabIndex);

  useEffect(() => {
    if (openTabIndex >= tabs.length) {
      setOpenTabIndex(tabs.length - 1);
    }
  }, [tabs.length]);

  return (
    <Container className={className ? className : 'me-3 ms-2 mt-1'} style={{ wordBreak: 'break-word' }}>
      <Row style={{ overflowX: 'auto', flexWrap: 'nowrap' }} className="border-bottom mb-3">
        {tabs.map((tab, index) => {
          return (
            <div
              id={tab.id}
              onClick={() => setOpenTabIndex(index)}
              key={index}
              style={{ marginRight: index !== tabs.length - 1 ? 16 : 0 }}
              className={`${styles.tab} ${index === openTabIndex ? styles.selected : ''} col-sm-auto`}
            >
              <h6>{tab.title}</h6>
            </div>
          );
        })}
      </Row>
      <Row>
        <Col className={classNames('px-0', contentClassName)}>{tabs[openTabIndex]?.content}</Col>
      </Row>
    </Container>
  );
};

export default Tabs;
