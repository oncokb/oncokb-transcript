import { Location } from 'history';
import React, { useEffect, useRef, useState } from 'react';
import { Prompt, useHistory } from 'react-router-dom';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';

interface RouterPromptProps {
  when: boolean | undefined;
  message?: string | JSX.Element;
}
const RouterPrompt = ({ when, message }: RouterPromptProps) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [lastLocation, setLastLocation] = useState<Location | null>(null);
  const [confirmedNavigation, setConfirmedNavigation] = useState(false);

  const history = useHistory();
  const eventListenerRef = useRef(undefined);

  const closeModal = () => {
    setModalVisible(false);
  };

  const handleBlockedNavigation = (nextLocation: Location): boolean => {
    if (!confirmedNavigation && when) {
      setModalVisible(true);
      setLastLocation(nextLocation);
      return false;
    }
    return true;
  };

  const handleConfirmNavigationClick = () => {
    setModalVisible(false);
    setConfirmedNavigation(true);
  };

  const getMessage = () => {
    const defaultMessage = 'You have unsaved changes. Are you sure you want to leave?';
    return message || defaultMessage;
  };

  // Show the default browser prompt when user tries to reload page, leave site, or close browser
  // by listening for the beforeunload event.
  useEffect(() => {
    eventListenerRef.current = event => {
      if (when) {
        event.preventDefault();
        event.returnValue = 'false';
        return 'false';
      }
    };
  }, [when]);

  useEffect(() => {
    const eventListener = event => eventListenerRef.current(event);
    window.addEventListener('beforeunload', eventListener);
    return () => {
      window.removeEventListener('beforeunload', eventListener);
    };
  }, []);

  useEffect(() => {
    if (confirmedNavigation && lastLocation) {
      history.push(lastLocation.pathname);
    }
  }, [confirmedNavigation, lastLocation]);

  return (
    <>
      <Prompt when={true} message={handleBlockedNavigation} />
      <Modal isOpen={modalVisible} toggle={closeModal}>
        <ModalHeader toggle={closeModal}>Leave page?</ModalHeader>
        <ModalBody>{getMessage()}</ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={handleConfirmNavigationClick}>
            Leave
          </Button>
          <Button color="primary" onClick={closeModal}>
            Stay on page
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};
export default RouterPrompt;
