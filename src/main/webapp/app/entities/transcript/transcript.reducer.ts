import axios from 'axios';
import { ICrudGetAction, ICrudGetAllAction, ICrudPutAction, ICrudDeleteAction } from 'react-jhipster';

import { cleanEntity } from 'app/shared/util/entity-utils';
import { REQUEST, SUCCESS, FAILURE } from 'app/shared/reducers/action-type.util';

import { ITranscript, defaultValue } from 'app/shared/model/transcript.model';

export const ACTION_TYPES = {
  FETCH_TRANSCRIPT_LIST: 'transcript/FETCH_TRANSCRIPT_LIST',
  FETCH_TRANSCRIPT: 'transcript/FETCH_TRANSCRIPT',
  CREATE_TRANSCRIPT: 'transcript/CREATE_TRANSCRIPT',
  UPDATE_TRANSCRIPT: 'transcript/UPDATE_TRANSCRIPT',
  PARTIAL_UPDATE_TRANSCRIPT: 'transcript/PARTIAL_UPDATE_TRANSCRIPT',
  DELETE_TRANSCRIPT: 'transcript/DELETE_TRANSCRIPT',
  RESET: 'transcript/RESET',
};

const initialState = {
  loading: false,
  errorMessage: null,
  entities: [] as ReadonlyArray<ITranscript>,
  entity: defaultValue,
  updating: false,
  updateSuccess: false,
};

export type TranscriptState = Readonly<typeof initialState>;

// Reducer

export default (state: TranscriptState = initialState, action): TranscriptState => {
  switch (action.type) {
    case REQUEST(ACTION_TYPES.FETCH_TRANSCRIPT_LIST):
    case REQUEST(ACTION_TYPES.FETCH_TRANSCRIPT):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        loading: true,
      };
    case REQUEST(ACTION_TYPES.CREATE_TRANSCRIPT):
    case REQUEST(ACTION_TYPES.UPDATE_TRANSCRIPT):
    case REQUEST(ACTION_TYPES.DELETE_TRANSCRIPT):
    case REQUEST(ACTION_TYPES.PARTIAL_UPDATE_TRANSCRIPT):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        updating: true,
      };
    case FAILURE(ACTION_TYPES.FETCH_TRANSCRIPT_LIST):
    case FAILURE(ACTION_TYPES.FETCH_TRANSCRIPT):
    case FAILURE(ACTION_TYPES.CREATE_TRANSCRIPT):
    case FAILURE(ACTION_TYPES.UPDATE_TRANSCRIPT):
    case FAILURE(ACTION_TYPES.PARTIAL_UPDATE_TRANSCRIPT):
    case FAILURE(ACTION_TYPES.DELETE_TRANSCRIPT):
      return {
        ...state,
        loading: false,
        updating: false,
        updateSuccess: false,
        errorMessage: action.payload,
      };
    case SUCCESS(ACTION_TYPES.FETCH_TRANSCRIPT_LIST):
      return {
        ...state,
        loading: false,
        entities: action.payload.data,
      };
    case SUCCESS(ACTION_TYPES.FETCH_TRANSCRIPT):
      return {
        ...state,
        loading: false,
        entity: action.payload.data,
      };
    case SUCCESS(ACTION_TYPES.CREATE_TRANSCRIPT):
    case SUCCESS(ACTION_TYPES.UPDATE_TRANSCRIPT):
    case SUCCESS(ACTION_TYPES.PARTIAL_UPDATE_TRANSCRIPT):
      return {
        ...state,
        updating: false,
        updateSuccess: true,
        entity: action.payload.data,
      };
    case SUCCESS(ACTION_TYPES.DELETE_TRANSCRIPT):
      return {
        ...state,
        updating: false,
        updateSuccess: true,
        entity: {},
      };
    case ACTION_TYPES.RESET:
      return {
        ...initialState,
      };
    default:
      return state;
  }
};

const apiUrl = 'api/transcripts';

// Actions

export const getEntities: ICrudGetAllAction<ITranscript> = (page, size, sort) => ({
  type: ACTION_TYPES.FETCH_TRANSCRIPT_LIST,
  payload: axios.get<ITranscript>(`${apiUrl}?cacheBuster=${new Date().getTime()}`),
});

export const getEntity: ICrudGetAction<ITranscript> = id => {
  const requestUrl = `${apiUrl}/${id}`;
  return {
    type: ACTION_TYPES.FETCH_TRANSCRIPT,
    payload: axios.get<ITranscript>(requestUrl),
  };
};

export const createEntity: ICrudPutAction<ITranscript> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.CREATE_TRANSCRIPT,
    payload: axios.post(apiUrl, cleanEntity(entity)),
  });
  dispatch(getEntities());
  return result;
};

export const updateEntity: ICrudPutAction<ITranscript> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.UPDATE_TRANSCRIPT,
    payload: axios.put(`${apiUrl}/${entity.id}`, cleanEntity(entity)),
  });
  return result;
};

export const partialUpdate: ICrudPutAction<ITranscript> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.PARTIAL_UPDATE_TRANSCRIPT,
    payload: axios.patch(`${apiUrl}/${entity.id}`, cleanEntity(entity)),
  });
  return result;
};

export const deleteEntity: ICrudDeleteAction<ITranscript> = id => async dispatch => {
  const requestUrl = `${apiUrl}/${id}`;
  const result = await dispatch({
    type: ACTION_TYPES.DELETE_TRANSCRIPT,
    payload: axios.delete(requestUrl),
  });
  dispatch(getEntities());
  return result;
};

export const reset = () => ({
  type: ACTION_TYPES.RESET,
});
