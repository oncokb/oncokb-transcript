import { faRedo } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { DANGER, GREY, SUCCESS } from 'app/config/colors';
import { notifyError, notifySuccess } from 'app/oncokb-commons/components/util/NotificationUtils';
import Collapsible from 'app/pages/curation/collapsible/Collapsible';
import OncoKBTable, { SearchColumn } from 'app/shared/table/OncoKBTable';
import React, { DependencyList, useCallback, useEffect } from 'react';
import { Col, Form, FormGroup, Input, Row, Label, Button, Spinner } from 'reactstrap';
import Tabs from './tabs';

type ValidationResultFilter = {
  success: boolean;
  error: boolean;
};

type ValidationSearchFormProps = {
  onChange: (validationResultFilter: ValidationResultFilter) => void;
  className?: string;
  disabled?: boolean;
};

function ValidationSearchForm({ onChange, className, disabled }: ValidationSearchFormProps) {
  const [validationResultFilter, setValidationResultFilter] = React.useState<ValidationResultFilter>({
    success: false,
    error: true,
  });
  useEffect(() => {
    onChange(validationResultFilter);
  }, [validationResultFilter]);

  const successId = 'data-validation-cb-success';
  const errorId = 'data-validation-cb-error';

  return (
    <Form className={className}>
      <FormGroup inline check>
        <Input
          type="checkbox"
          name="validationResult"
          id={successId}
          value="Success"
          checked={validationResultFilter.success}
          disabled={disabled}
          onChange={event => {
            setValidationResultFilter(x => ({ ...x, success: event.target.checked }));
          }}
        />
        <Label check for={successId}>
          Success
        </Label>
      </FormGroup>
      <FormGroup inline check>
        <Input
          type="checkbox"
          name="validationResult"
          id={errorId}
          value="Error"
          checked={validationResultFilter.error}
          disabled={disabled}
          onChange={event => {
            setValidationResultFilter(x => ({ ...x, error: event.target.checked }));
          }}
        />
        <Label check for={errorId}>
          Error
        </Label>
      </FormGroup>
    </Form>
  );
}

function relativeWebsocketUrlToAbsolute(relativeUrl: string) {
  const loc = window.location;
  const proto = loc.protocol === 'https:' ? 'wss' : 'ws';
  return `${proto}://${loc.host}${relativeUrl}`;
}

type useWebSocketProps = {
  onOpen: (sendMessage: (x: string) => void) => void;
  onClose: () => void;
  onError: (error: Event) => void;
  allowConnection: boolean;
  url: string;
};

function useWebSocket<T>({ onOpen, onClose, allowConnection, url, onError }: useWebSocketProps, deps: DependencyList) {
  const [messages, setMessages] = React.useState<T[]>([]);
  const wsRef = React.useRef<WebSocket | null>(null);

  const sendMessage = useCallback((message: string) => {
    wsRef.current?.send(message);
  }, []);

  useEffect(() => {
    if (!allowConnection) return;
    try {
      setMessages([]);
      const ws = new WebSocket(url);
      wsRef.current = ws;
      ws.onmessage = event => {
        const data = JSON.parse(event.data) as T;
        setMessages(x => [...x, data]);
      };
      ws.onopen = () => onOpen(sendMessage);
      ws.onclose = () => onClose();
      ws.onerror = error => onError(error);
      return () => {
        ws.close();
      };
    } catch (error) {
      console.error(error);
      return;
    }
  }, [...deps, sendMessage, onOpen, onClose, allowConnection, url]);
  return messages;
}

type ValidationType = 'TEST' | 'INFO';
type ValidationStatus = 'IS_PENDING' | 'IS_ERROR' | 'IS_COMPLETE';
type ValidationData = {
  target: string | null | undefined;
  reason: string | null | undefined;
};

type ValidationResult = {
  key: string;
  type: ValidationType;
  status: ValidationStatus;
  data: ValidationData[];
};

const validationColumns: SearchColumn<ValidationData>[] = [
  {
    accessor: 'target',
    Header: 'Biomarker',
    onFilter(data: ValidationData, keyword: string) {
      return data.target?.toLowerCase().includes(keyword) ?? false;
    },
  },
  {
    accessor: 'reason',
    Header: 'Issue',
    onFilter(data: ValidationData, keyword: string) {
      return data.reason?.toLowerCase().includes(keyword) ?? false;
    },
  },
];

type ValidationResultsProps = {
  filter: ValidationResultFilter;
  validationType: ValidationType;
  messages: ValidationResult[];
};

function ValidationResults({ filter, validationType, messages }: ValidationResultsProps) {
  const grouped: Record<string, ValidationResult> = {};
  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];
    if (!grouped[message.key] || grouped[message.key].status === 'IS_PENDING') {
      grouped[message.key] = message;
    }
  }
  const validationResults = Object.values(grouped).filter(x => {
    if (x.type !== validationType) {
      return false;
    }
    const noFilterFlags = !filter.success && !filter.error;
    const successCheck = noFilterFlags || (filter.success && x.status === 'IS_COMPLETE');
    const errorCheck = noFilterFlags || (filter.error && x.status === 'IS_ERROR');
    return successCheck || errorCheck || x.status === 'IS_PENDING';
  });

  validationResults.sort((a, b) => {
    if ((a.status === 'IS_ERROR' && b.status !== 'IS_ERROR') || (a.status === 'IS_COMPLETE' && b.status === 'IS_PENDING')) {
      return -1;
    } else if ((a.status !== 'IS_ERROR' && b.status === 'IS_ERROR') || (a.status === 'IS_PENDING' && b.status === 'IS_COMPLETE')) {
      return 1;
    } else {
      return 0;
    }
  });

  return (
    <div className="d-flex flex-column" style={{ gap: '0.25rem' }}>
      {validationResults.map(validationResult => {
        const disableCollapsible = validationResult.data.length === 0;
        const { status } = validationResult;
        const color = status === 'IS_COMPLETE' ? SUCCESS : status === 'IS_ERROR' ? DANGER : GREY;
        const showLoadingSpinner = status === 'IS_PENDING';
        const isLarge = validationResult.data.length > 10;
        return (
          <Collapsible
            title={validationResult.key}
            colorOptions={{
              borderLeftColor: color,
              forceLeftColor: true,
            }}
            showLoadingSpinner={showLoadingSpinner}
            displayOptions={{
              disableCollapsible,
            }}
            key={validationResult.key}
          >
            <div className="py-3">
              <OncoKBTable
                data={validationResult.data}
                columns={validationColumns}
                showPagination={isLarge}
                disableSearch={!isLarge}
                defaultSorted={[
                  {
                    id: 'target',
                    desc: false,
                  },
                ]}
              />
            </div>
          </Collapsible>
        );
      })}
    </div>
  );
}

function CurationDataValidationTab() {
  const [validationResultFilter, setValidationResultFilter] = React.useState<ValidationResultFilter>({
    success: false,
    error: false,
  });

  const [isValidating, setIsValidating] = React.useState(false);
  const [validationCounter, setValidationCounter] = React.useState(0);

  useEffect(() => {
    setIsValidating(validationCounter > 0);
  }, [validationCounter]);

  const onClose = useCallback(() => {
    setIsValidating(false);
    notifySuccess('Validation completed!');
  }, []);
  const onOpen = useCallback(() => {
    return;
  }, []);
  const onError = useCallback(() => {
    notifyError(new Error('Error while attempting to validate. Please try again.'));
  }, []);
  const url = relativeWebsocketUrlToAbsolute('/websocket/curation/validation');
  const messages = useWebSocket<ValidationResult>({ onOpen, onClose, onError, allowConnection: isValidating, url }, [validationCounter]);

  return (
    <>
      <Row>
        <Col className="d-flex flex-wrap align-content-center justify-content-between">
          {validationCounter > 0 && (
            <div className={'d-flex flex-wrap align-items-baseline'}>
              <span className="fs-3 fw-bold" style={{ margin: '0px' }}>
                Validation Result
              </span>
              <ValidationSearchForm className="ms-4" disabled={isValidating} onChange={setValidationResultFilter} />
              <div className="flex-grow-1"></div>
            </div>
          )}
          <div className="d-flex justify-content-center align-items-center">
            <Button disabled={isValidating} outline color="primary" type="submit" onClick={() => setValidationCounter(x => x + 1)}>
              {validationCounter > 0 && (
                <span className="pe-2">{isValidating ? <Spinner size="sm" /> : <FontAwesomeIcon icon={faRedo} />}</span>
              )}
              <span>{isValidating ? 'Validating' : 'Validate'}</span>
            </Button>
          </div>
        </Col>
      </Row>
      {validationCounter > 0 && (
        <>
          <Row className="pt-4">
            <Col>
              <Tabs
                tabs={[
                  {
                    title: 'Test',
                    content: (
                      <ValidationResults
                        key={validationCounter}
                        filter={validationResultFilter}
                        validationType="TEST"
                        messages={messages}
                      />
                    ),
                  },
                  {
                    title: 'Info',
                    content: (
                      <ValidationResults
                        key={validationCounter}
                        filter={validationResultFilter}
                        validationType="INFO"
                        messages={messages}
                      />
                    ),
                  },
                ]}
              />
            </Col>
          </Row>
        </>
      )}
    </>
  );
}

export default CurationDataValidationTab;
