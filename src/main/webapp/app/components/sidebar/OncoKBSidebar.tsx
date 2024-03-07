import React, { useEffect, useRef, useState } from 'react';
import './oncokb-sidebar.scss';
import { observer } from 'mobx-react';
import { IRootStore } from 'app/stores';
import { componentInject } from 'app/shared/util/typed-inject';
import { ONCOKB_SIDEBAR_MIN_WIDTH } from 'app/stores/layout.store';
import { ONCOKB_BLUE } from 'app/config/colors';
import ActionIcon from 'app/shared/icons/ActionIcon';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

export interface IOncoKBSidebarProps extends StoreProps {
  defaultOpen?: boolean;
  children: React.ReactNode;
}

const OncoKBSidebar = ({ showOncoKBSidebar, defaultOpen = false, ...props }: IOncoKBSidebarProps) => {
  useEffect(() => {
    if (defaultOpen) {
      props.toggleOncoKBSidebar(true);
    }
  }, []);

  return showOncoKBSidebar ? (
    <OncoKBSidebarExpanded {...props} />
  ) : (
    <div className="oncokb-sidebar-collapsed">
      <div style={{ position: 'absolute', right: '38px', top: '38px' }}>
        <ActionIcon
          size="lg"
          icon={faChevronLeft}
          onClick={() => {
            props.toggleOncoKBSidebar(true);
          }}
        />
      </div>
    </div>
  );
};

const OncoKBSidebarExpanded = observer(
  ({
    children,
    toggleOncoKBSidebar,
    oncoKBSidebarWidth,
    setOncoKBSidebarWidth,
    closeNavigationSidebar,
  }: Omit<IOncoKBSidebarProps, 'showOncoKBSidebar' | 'defaultOpen'>) => {
    const maxWidth = document.body.clientWidth * 0.5;
    const closeNavWidth = document.body.clientWidth * 0.45;

    const sidebarRef = useRef<HTMLDivElement>(null);
    const draggableRef = useRef<HTMLDivElement>(null);
    const sidebarHighlightTimer = useRef(null);

    const [sidebarBorderHovered, setSidebarBorderHovered] = useState(false);
    const [sidebarBorderLongHovered, setSidebarBorderLongHovered] = useState(false);
    const [holdingSidebarBorder, setHoldingSidebarBorder] = useState(false);

    useEffect(() => {
      if (sidebarRef.current && draggableRef.current) {
        if (sidebarBorderHovered || sidebarBorderLongHovered || holdingSidebarBorder) {
          document.body.style.cursor = 'col-resize';
        } else {
          document.body.style.cursor = '';
        }

        if (sidebarBorderLongHovered || holdingSidebarBorder) {
          highlightSidebarBorder();
        } else {
          unhighlightSidebarBorder();
        }
      }
    }, [sidebarBorderHovered, sidebarBorderLongHovered, holdingSidebarBorder]);

    function handleMouseDown(mouseDownEvent: React.MouseEvent<HTMLDivElement, MouseEvent>) {
      mouseDownEvent.preventDefault();

      setHoldingSidebarBorder(true);

      const startX = mouseDownEvent.pageX;

      function onMouseMove(mouseMoveEvent: MouseEvent) {
        const newWidth = oncoKBSidebarWidth + startX - mouseMoveEvent.pageX;

        if (newWidth > oncoKBSidebarWidth && newWidth > closeNavWidth) {
          closeNavigationSidebar();
        }

        if (newWidth <= ONCOKB_SIDEBAR_MIN_WIDTH) {
          setOncoKBSidebarWidth(ONCOKB_SIDEBAR_MIN_WIDTH);
        } else if (newWidth >= maxWidth) {
          setOncoKBSidebarWidth(maxWidth);
        } else {
          setOncoKBSidebarWidth(oncoKBSidebarWidth + startX - mouseMoveEvent.pageX);
        }
      }

      function onMouseUp() {
        setHoldingSidebarBorder(false);
        document.body.removeEventListener('mousemove', onMouseMove);
      }

      document.body.addEventListener('mousemove', onMouseMove);
      document.body.addEventListener('mouseup', onMouseUp, { once: true });
    }

    function handleMouseOver() {
      setSidebarBorderHovered(true);
      sidebarHighlightTimer.current = setTimeout(() => {
        setSidebarBorderLongHovered(true);
      }, 250);
    }

    function handleMouseOut() {
      clearTimeout(sidebarHighlightTimer.current);
      setSidebarBorderHovered(false);
      setSidebarBorderLongHovered(false);
    }

    function highlightSidebarBorder() {
      sidebarRef.current.style.borderLeftColor = ONCOKB_BLUE;
      draggableRef.current.style.opacity = '1';
    }

    function unhighlightSidebarBorder() {
      sidebarRef.current.style.borderLeftColor = '';
      draggableRef.current.style.opacity = '';
    }

    return (
      <div ref={sidebarRef} style={{ width: oncoKBSidebarWidth }} className="oncokb-sidebar-expanded">
        <div
          ref={draggableRef}
          className="draggable"
          onMouseOver={handleMouseOver}
          onMouseOut={handleMouseOut}
          onMouseDown={handleMouseDown}
        />
        <div className="pl-1" style={{ marginTop: '2.25rem' }}>
          {oncoKBSidebarWidth !== maxWidth && (
            <ActionIcon
              size="lg"
              icon={faChevronLeft}
              className="mb-1"
              onClick={() => {
                setOncoKBSidebarWidth(maxWidth);
                closeNavigationSidebar();
              }}
            />
          )}
          <ActionIcon
            size="lg"
            icon={faChevronRight}
            onClick={() => {
              toggleOncoKBSidebar(false);
              setOncoKBSidebarWidth(ONCOKB_SIDEBAR_MIN_WIDTH);
            }}
          />
        </div>
        <div style={{ marginTop: '2rem', marginLeft: '1rem', display: 'flex', width: '100%' }}>{children}</div>
      </div>
    );
  }
);

const mapStoreToProps = ({ layoutStore }: IRootStore) => ({
  showOncoKBSidebar: layoutStore.showOncoKBSidebar,
  toggleOncoKBSidebar: layoutStore.toggleOncoKBSidebar,
  oncoKBSidebarWidth: layoutStore.oncoKBSidebarWidth,
  setOncoKBSidebarWidth: layoutStore.setOncoKBSidebarWidth,
  closeNavigationSidebar: layoutStore.closeNavigationSidebar,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(observer(OncoKBSidebar));
