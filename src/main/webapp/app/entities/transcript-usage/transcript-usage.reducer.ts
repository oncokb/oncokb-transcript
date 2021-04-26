import axios from 'axios';
import { ICrudGetAction, ICrudGetAllAction, ICrudPutAction, ICrudDeleteAction } from 'react-jhipster';

import { cleanEntity } from 'app/shared/util/entity-utils';
import { REQUEST, SUCCESS, FAILURE } from 'app/shared/reducers/action-type.util';

import { ITranscriptUsage, defaultValue } from 'app/shared/model/transcript-usage.model';

export const ACTION_TYPES = {
  FETCH_TRANSCRIPTUSAGE_LIST: 'transcriptUsage/FETCH_TRANSCRIPTUSAGE_LIST',
  FETCH_TRANSCRIPTUSAGE: 'transcriptUsage/FETCH_TRANSCRIPTUSAGE',
  CREATE_TRANSCRIPTUSAGE: 'transcriptUsage/CREATE_TRANSCRIPTUSAGE',
  UPDATE_TRANSCRIPTUSAGE: 'transcriptUsage/UPDATE_TRANSCRIPTUSAGE',
  PARTIAL_UPDATE_TRANSCRIPTUSAGE: 'transcriptUsage/PARTIAL_UPDATE_TRANSCRIPTUSAGE',
  DELETE_TRANSCRIPTUSAGE: 'transcriptUsage/DELETE_TRANSCRIPTUSAGE',
  RESET: 'transcriptUsage/RESET',
};

const initialState = {
  loading: false,
  errorMessage: null,
  entities: [] as ReadonlyArray<ITranscriptUsage>,
  entity: defaultValue,
  updating: false,
  updateSuccess: false,
};

export type TranscriptUsageState = Readonly<typeof initialState>;

// Reducer

export default (state: TranscriptUsageState = initialState, action): TranscriptUsageState => {
  switch (action.type) {
    case REQUEST(ACTION_TYPES.FETCH_TRANSCRIPTUSAGE_LIST):
    case REQUEST(ACTION_TYPES.FETCH_TRANSCRIPTUSAGE):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        loading: true,
      };
    case REQUEST(ACTION_TYPES.CREATE_TRANSCRIPTUSAGE):
    case REQUEST(ACTION_TYPES.UPDATE_TRANSCRIPTUSAGE):
    case REQUEST(ACTION_TYPES.DELETE_TRANSCRIPTUSAGE):
    case REQUEST(ACTION_TYPES.PARTIAL_UPDATE_TRANSCRIPTUSAGE):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        updating: true,
      };
    case FAILURE(ACTION_TYPES.FETCH_TRANSCRIPTUSAGE_LIST):
    case FAILURE(ACTION_TYPES.FETCH_TRANSCRIPTUSAGE):
    case FAILURE(ACTION_TYPES.CREATE_TRANSCRIPTUSAGE):
    case FAILURE(ACTION_TYPES.UPDATE_TRANSCRIPTUSAGE):
    case FAILURE(ACTION_TYPES.PARTIAL_UPDATE_TRANSCRIPTUSAGE):
    case FAILURE(ACTION_TYPES.DELETE_TRANSCRIPTUSAGE):
      return {
        ...state,
        loading: false,
        updating: false,
        updateSuccess: false,
        errorMessage: action.payload,
      };
    case SUCCESS(ACTION_TYPES.FETCH_TRANSCRIPTUSAGE_LIST):
      return {
        ...state,
        loading: false,
        entities: action.payload.data,
      };
    case SUCCESS(ACTION_TYPES.FETCH_TRANSCRIPTUSAGE):
      return {
        ...state,
        loading: false,
        entity: action.payload.data,
      };
    case SUCCESS(ACTION_TYPES.CREATE_TRANSCRIPTUSAGE):
    case SUCCESS(ACTION_TYPES.UPDATE_TRANSCRIPTUSAGE):
    case SUCCESS(ACTION_TYPES.PARTIAL_UPDATE_TRANSCRIPTUSAGE):
      return {
        ...state,
        updating: false,
        updateSuccess: true,
        entity: action.payload.data,
      };
    case SUCCESS(ACTION_TYPES.DELETE_TRANSCRIPTUSAGE):
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

const apiUrl = 'api/transcript-usages';

// Actions

export const getEntities: ICrudGetAllAction<ITranscriptUsage> = (page, size, sort) => ({
  type: ACTION_TYPES.FETCH_TRANSCRIPTUSAGE_LIST,
  payload: axios.get<ITranscriptUsage>(`${apiUrl}?cacheBuster=${new Date().getTime()}`),
});

export const getEntity: ICrudGetAction<ITranscriptUsage> = id => {
  const requestUrl = `${apiUrl}/${id}`;
  return {
    type: ACTION_TYPES.FETCH_TRANSCRIPTUSAGE,
    payload: axios.get<ITranscriptUsage>(requestUrl),
  };
};

export const createEntity: ICrudPutAction<ITranscriptUsage> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.CREATE_TRANSCRIPTUSAGE,
    payload: axios.post(apiUrl, cleanEntity(entity)),
  });
  dispatch(getEntities());
  return result;
};

export const updateEntity: ICrudPutAction<ITranscriptUsage> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.UPDATE_TRANSCRIPTUSAGE,
    payload: axios.put(`${apiUrl}/${entity.id}`, cleanEntity(entity)),
  });
  return result;
};

export const partialUpdate: ICrudPutAction<ITranscriptUsage> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.PARTIAL_UPDATE_TRANSCRIPTUSAGE,
    payload: axios.patch(`${apiUrl}/${entity.id}`, cleanEntity(entity)),
  });
  return result;
};

export const deleteEntity: ICrudDeleteAction<ITranscriptUsage> = id => async dispatch => {
  const requestUrl = `${apiUrl}/${id}`;
  const result = await dispatch({
    type: ACTION_TYPES.DELETE_TRANSCRIPTUSAGE,
    payload: axios.delete(requestUrl),
  });
  dispatch(getEntities());
  return result;
};

export const reset = () => ({
  type: ACTION_TYPES.RESET,
});
