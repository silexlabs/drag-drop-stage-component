import * as DomMetrics from '../utils/DomMetrics';

const SET = 'SET';

export const set = scroll => ({
  type: SET,
  scroll,
});

export const scroll = (state, action) => {
  switch(action.type) {
    case SET:
      return action.scroll;
    default:
      return state;
  }
};

export const getDefaultState = (doc, hooks) => {
  return DomMetrics.getScroll(doc);
}