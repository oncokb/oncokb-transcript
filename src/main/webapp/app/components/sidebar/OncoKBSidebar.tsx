import React, { useEffect, useRef, useState } from 'react';
import './oncokb-sidebar.scss';
import { observer } from 'mobx-react';
import { IRootStore } from 'app/stores';
import { componentInject } from 'app/shared/util/typed-inject';
import { ONCOKB_SIDEBAR_MIN_WIDTH } from 'app/stores/layout.store';
import { ONCOKB_BLUE } from 'app/config/colors';
import ActionIcon from 'app/shared/icons/ActionIcon';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { CLOSE_SIDEBAR_BUTTON_ID, EXPAND_SIDEBAR_BUTTON_ID, OPEN_SIDEBAR_BUTTON_ID } from 'app/config/constants/html-id';

export interface IOncoKBSidebarProps extends StoreProps {
  defaultOpen?: boolean;
  children: React.ReactNode;
}

const OncoKBSidebar = ({ showOncoKBSidebar, defaultOpen = false, ...props }: IOncoKBSidebarProps) => {
  useEffect(() => {
    if (defaultOpen) {
      props.toggleOncoKBSidebar?.(true);
    }
  }, []);

  return showOncoKBSidebar ? (
    <OncoKBSidebarExpanded {...props} />
  ) : (
    <div className="oncokb-sidebar-collapsed" style={{ marginTop: props.oncoKBSidebarMarginTop }}>
      <div style={{ position: 'absolute', right: '38px', top: '38px' }}>
        <ActionIcon
          size="lg"
          icon={faChevronLeft}
          onClick={() => {
            props.toggleOncoKBSidebar?.(true);
          }}
          data-testid={OPEN_SIDEBAR_BUTTON_ID}
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
    oncoKBSidebarMarginTop,
    sidebarHeight,
  }: Omit<IOncoKBSidebarProps, 'showOncoKBSidebar' | 'defaultOpen'>) => {
    const maxWidth = document.body.clientWidth * 0.5;
    const closeNavWidth = document.body.clientWidth * 0.45;

    const sidebarRef = useRef<HTMLDivElement>(null);
    const draggableRef = useRef<HTMLDivElement>(null);
    const sidebarHighlightTimer = useRef<NodeJS.Timeout>();

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
        const newWidth = (oncoKBSidebarWidth ?? 0) + startX - mouseMoveEvent.pageX;

        if (newWidth > (oncoKBSidebarWidth ?? 0) && newWidth > closeNavWidth) {
          closeNavigationSidebar?.();
        }

        if (newWidth <= ONCOKB_SIDEBAR_MIN_WIDTH) {
          setOncoKBSidebarWidth?.(ONCOKB_SIDEBAR_MIN_WIDTH);
        } else if (newWidth >= maxWidth) {
          setOncoKBSidebarWidth?.(maxWidth);
        } else {
          setOncoKBSidebarWidth?.((oncoKBSidebarWidth ?? 0) + startX - mouseMoveEvent.pageX);
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
      if (sidebarRef.current) {
        sidebarRef.current.style.borderLeftColor = ONCOKB_BLUE;
      }
      if (draggableRef.current) {
        draggableRef.current.style.opacity = '1';
      }
    }

    function unhighlightSidebarBorder() {
      if (sidebarRef.current) {
        sidebarRef.current.style.borderLeftColor = '';
      }
      if (draggableRef.current) {
        draggableRef.current.style.opacity = '';
      }
    }

    return (
      <div
        ref={sidebarRef}
        style={{ width: oncoKBSidebarWidth, marginTop: oncoKBSidebarMarginTop, height: sidebarHeight }}
        className="oncokb-sidebar-expanded"
      >
        <div
          ref={draggableRef}
          className="draggable"
          onMouseOver={handleMouseOver}
          onMouseOut={handleMouseOut}
          onMouseDown={handleMouseDown}
        />
        <div style={{ marginTop: '2.25rem' }}>
          {oncoKBSidebarWidth !== maxWidth && (
            <ActionIcon
              size="lg"
              icon={faChevronLeft}
              className="mb-1"
              onClick={() => {
                setOncoKBSidebarWidth?.(maxWidth);
                closeNavigationSidebar?.();
              }}
              data-testid={EXPAND_SIDEBAR_BUTTON_ID}
            />
          )}
          <ActionIcon
            size="lg"
            icon={faChevronRight}
            onClick={() => {
              toggleOncoKBSidebar?.(false);
              setOncoKBSidebarWidth?.(ONCOKB_SIDEBAR_MIN_WIDTH);
            }}
            data-testid={CLOSE_SIDEBAR_BUTTON_ID}
          />
        </div>
        <div style={{ marginTop: '2rem', display: 'flex', width: '100%', overflow: 'hidden' }}>{children}</div>
      </div>
    );
  },
);

const mapStoreToProps = ({ layoutStore }: IRootStore) => ({
  showOncoKBSidebar: layoutStore.showOncoKBSidebar,
  toggleOncoKBSidebar: layoutStore.toggleOncoKBSidebar,
  oncoKBSidebarWidth: layoutStore.oncoKBSidebarWidth,
  setOncoKBSidebarWidth: layoutStore.setOncoKBSidebarWidth,
  closeNavigationSidebar: layoutStore.closeNavigationSidebar,
  oncoKBSidebarMarginTop: layoutStore.oncoKBSidebarMarginTop,
  sidebarHeight: layoutStore.sidebarHeight,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(observer(OncoKBSidebar));
