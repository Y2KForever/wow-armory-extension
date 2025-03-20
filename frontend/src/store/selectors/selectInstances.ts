import { RootState } from '../store';

export const selectSelectedInstances = (state: RootState) => state.characters.instances;
