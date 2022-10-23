import { createStore } from 'vuex';
import controls from './controls';
import status from "./status"
export default createStore({
  modules: {
    controls,
    status
  }
});
