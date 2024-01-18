import React, { useEffect, useState } from 'react';
import { Col, Container, Row } from 'reactstrap';
import { observer } from 'mobx-react-lite';
import classNames from 'classnames';
import { IRootStore } from 'app/stores/createStore';
import { componentInject } from 'app/shared/util/typed-inject';
import styles from './styles.module.scss';

export type Tab = {
  title: string;
  content: React.ReactNode;
};

export interface ITabsProps {
  tabs: Tab[];
  className?: string;
}

const Tabs = observer(({ tabs, className }: ITabsProps) => {
  const [openTab, setOpenTab] = useState(tabs[0]?.title);

  return (
    <Container className={className ? className : 'mr-3 ml-2 mt-1'} style={{ wordBreak: 'break-word' }}>
      <Row>
        <Col>
          <Row className="border-bottom mb-3">
            {tabs.map(tab => {
              return (
                <div
                  onClick={() => setOpenTab(tab.title)}
                  key={tab.title}
                  className={`${styles.tab} ${tab.title === openTab ? styles.selected : ''}`}
                >
                  <h6>{tab.title}</h6>
                </div>
              );
            })}
          </Row>
          <Row>
            <Col>{tabs.find(tab => tab.title === openTab)?.content}</Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
});

export default Tabs;
