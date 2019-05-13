import Vue from 'vue';
import Vuex, { Module, ActionTree, MutationTree, GetterTree } from 'vuex';
import { Base } from '@boatnet/bn-models';
import {
  TallyState,
  RootState,
  TallyButtonLayoutData,
  TallyLayoutRecordTypeName,
  TallyLayoutRecord,
  TallyCountData,
  TallyDataRecordTypeName,
  TallyDataRecord,
  TallyOperationMode
} from '@/_store/types';

import { pouchService } from '@boatnet/bn-pouch';

import moment from 'moment';
import { authService } from '@boatnet/bn-auth';
import { stringify } from 'querystring';

/* tslint:disable:no-var-requires  */
const defaultTemplate = require('../assets/tally-templates/default.json');

Vue.use(Vuex);

export const state: TallyState = {
  tallyLayout: {
    recordName: 'Default',
    type: TallyLayoutRecordTypeName,
    layoutData: [],
    vertButtonCount: 4,
    horizButtonCount: 8
  },
  tallyDataRec: { type: TallyDataRecordTypeName, data: [] },
  incDecValue: 1,
  operationMode: TallyOperationMode.Tally
};

// TODO: Other Color Schemes
const reasonButtonColors: any[] = [
  { name: 'SFTY', color: { bg: 'blue-2', text: 'black' } },
  { name: 'DOCK', color: { bg: 'blue-3', text: 'black' } },
  { name: 'ACCI', color: { bg: 'blue-4', text: 'black' } },
  { name: 'USED', color: { bg: 'blue-5', text: 'black' } },
  { name: 'OTHR', color: { bg: 'blue-6', text: 'white' } },
  { name: 'REG', color: { bg: 'blue-7', text: 'white' } },
  { name: 'DROP', color: { bg: 'blue-8', text: 'white' } },
  { name: 'PRED', color: { bg: 'red-5', text: 'white' } },
  { name: 'MKT', color: { bg: 'light-green', text: 'black' } },
  { name: 'RET', color: { bg: 'green-9', text: 'white' } }
];

const actions: ActionTree<TallyState, RootState> = {
  reset({ commit }: any) {
    commit('reset');
  },
  connectDB({ commit }: any) {
    commit('initialize');
  },
  updateButtonData(
    { commit }: any,
    params: {
      button: TallyButtonLayoutData;
      skipLayoutUpdate: boolean;
      data: TallyCountData;
      skipDataUpdate: boolean;
    }
  ) {
    commit('updateButtonData', params);
  },
  setTallyIncDec({ commit }: any, value: number) {
    commit('setTallyIncDec', value);
  },
  setTallyOpMode({ commit }: any, value: TallyOperationMode) {
    commit('setTallyOpMode', value);
  },
  assignNewButton(
    { commit }: any,
    value: {
      species: any;
      reason: string;
      index: number;
    }
  ) {
    commit('assignNewButton', value);
  },
  deleteButton({ commit }: any, button: TallyButtonLayoutData) {
    commit('deleteButton', button);
  }
};

function getBtnColor(reason: string): { bg?: string; text?: string } {
  const rbcVal: any = reasonButtonColors.filter((rbc: any) => {
    return rbc.name === reason;
  });
  if (rbcVal[0]) {
    return rbcVal[0].color;
  } else {
    console.log('WARNING: no button color for', reason);
    return { bg: 'gray-4', text: 'black' };
  }
}

function createDefaultButtonData(): TallyDataRecord {
  const newData: TallyDataRecord = {
    type: TallyDataRecordTypeName,
    data: []
  };
  const template = defaultTemplate.templateData;
  template.forEach((item: { code?: string; reason: string }, index: number) => {
    if (item.code) {
      const data = {
        // species:  //TODO look up full species record?
        shortCode: item.code,
        reason: item.reason,
        count: 0
      };
      newData.data!.push(data);
    }
  });
  return newData;
}

function createDefaultLayoutRecord(): TallyLayoutRecord {
  const newLayout: TallyLayoutRecord = {
    recordName: 'Default',
    type: TallyLayoutRecordTypeName,
    layoutData: [],
    vertButtonCount: 4,
    horizButtonCount: 8
  };
  const template = defaultTemplate.templateData;
  template.forEach((item: { code?: string; reason: string }, index: number) => {
    if (item.reason === 'INVIS') {
      newLayout.layoutData.push({
        index,
        blank: true
      });
    } else {
      newLayout.layoutData.push({
        index,
        color: getBtnColor(item.reason!).bg,
        'text-color': getBtnColor(item.reason!).text,
        labels: {
          shortCode: item.code,
          reason: item.reason
        }
      });
    }
  });
  newLayout.createdDate = moment().format();
  newLayout.createdBy = authService.getCurrentUser()!.username;
  return newLayout;
}

const mutations: MutationTree<TallyState> = {
  async initialize(newState: any) {
    /**
     * Initialize tally data if none exists
     * TODO refactor to combine with reset
     */


    if (!newState.tallyLayout._id) {
      newState.tallyLayout = createDefaultLayoutRecord();
      console.warn('[Tally Module] NEW LAYOUT INITIALIZATION');
      await updateLayoutDB(newState.tallyLayout); // ignore retval for now
    } else {
      console.log(
        '[Tally Module] Already have tally layout, skip template init. DB ID=',
        newState.tallyLayout._id
      );
      console.log('TODO verify pouchdb vs vuex data');
    }

    if (!newState.tallyDataRec._id) {
      newState.tallyDataRec = createDefaultButtonData();
      console.warn('[Tally Module] NEW TALLY DATA INITIALIZATION');
      await updateTallyDataDB(newState.tallyDataRec); // ignore retval for now
    } else {
      console.log(
        '[Tally Module] Already have tally data, skip template init. DB ID=',
        newState.tallyDataRec._id
      );
      console.log('TODO verify pouchdb vs vuex data');
    }
  },
  async reset(newState: any, createNewRecord = false) {
    /**
     * Reset data for tally to default template.
     * @param createNewRecord Create a new CouchDB record, otherwise overwrite existing _id
     */
    console.log('[Tally Module] Reset Tally Button Data');
    // Keep old IDs
    const oldIdLayout = newState.tallyLayout._id;
    newState.tallyLayout = createDefaultLayoutRecord();
    if (!createNewRecord && oldIdLayout) {
      newState.tallyLayout._id = oldIdLayout;
    }

    newState.tallyDataRec = createDefaultButtonData();
    const oldIdData = newState.tallyDataRec._id;
    if (!createNewRecord && oldIdData) {
      newState.tallyDataRec._id = oldIdData;
    }

    updateLayoutDB(newState.tallyLayout);
    updateTallyDataDB(newState.tallyDataRec);
  },
  async updateButtonData(
    newState: any,
    params: {
      button: TallyButtonLayoutData;
      skipLayoutUpdate?: boolean;
      data: TallyCountData;
      skipDataUpdate?: boolean;
    }
  ) {
    if (params.data.shortCode) {
      const targetRecIdx = newState.tallyDataRec.data.findIndex(
        (rec: TallyCountData) => {
          return (
            rec.shortCode === params.data.shortCode &&
            rec.reason === params.data.reason
          );
        }
      );
      if (targetRecIdx >= 0) {
        newState.tallyDataRec.data.splice(targetRecIdx, 1, params.data);
        console.log('[Tally Module] Updated', params.data, targetRecIdx);
      } else {
        newState.tallyDataRec.data.push(params.data);
        console.warn('[Tally Module] WARN: Unexpectedly inserted new tally data', params.data);
      }
    }

    if (params.button.index === undefined) {
      console.log(
        '[Tally Module] Button has no index, cannot update.',
        params.button
      );
      return;
    }
    newState.tallyLayout.layoutData.splice(
      params.button.index,
      1,
      params.button
    );

    if (!params.skipLayoutUpdate) {
      try {
        updateLayoutDB(newState.tallyLayout);
      } catch (err) {
        console.log('TODO Fix Layout', err);
      }
    } else {
      // console.log('[Tally Module] Skipped Layout DB Update');
    }

    if (!params.skipDataUpdate) {
      try {
        updateTallyDataDB(newState.tallyDataRec);
      } catch (err) {
        console.log('TODO Fix Data', err);
      }
    } else {
      console.warn('[Tally Module] Warning: Skipped Tally Data DB Update');
    }
  },
  setTallyIncDec(newState: any, value: number) {
    newState.incDecValue = value;
  },
  setTallyOpMode(newState: any, value: TallyOperationMode) {
    newState.operationMode = value;
    // TODO: Set/Reset all button.tempState if "Tally"?
  },
  async assignNewButton(
    newState: any,
    value: { species: any; reason: string; index: number }
  ) {
    const newColor = getBtnColor(value.reason);
    const newButton: TallyButtonLayoutData = {
      index: value.index,
      color: newColor.bg,
      'text-color': newColor.text,
      labels: {
        shortCode: value.species.shortCode,
        reason: value.reason
      }
    };

    newState.tallyLayout.layoutData.splice(value.index, 1, newButton);
    // Add to tallyDataRec
    const targetRecIdx = newState.tallyDataRec.data.findIndex(
      (rec: TallyCountData) => {
        return (
          rec.shortCode === newButton.labels!.shortCode &&
          rec.reason === newButton.labels!.reason
        );
      }
    );
    if (targetRecIdx >= 0) {
      console.log('[Tally Module] Data already exists in record.');
    } else {
      const newData: TallyCountData = {
        species: value.species,
        shortCode: value.species.shortCode,
        reason: value.reason,
        count: 0
      };
      console.log('[Tally Module] Inserted new tally data', newData);
      newState.tallyDataRec.data.push(newData);
      updateTallyDataDB(newState.tallyDataRec);
    }

    updateLayoutDB(newState.tallyLayout);
  },
  async deleteButton(newState: any, button: TallyButtonLayoutData) {
    const blankRecord: TallyButtonLayoutData = {
      index: button.index,
      blank: true
    };
    newState.tallyLayout.layoutData.splice(button.index, 1, blankRecord);
    updateLayoutDB(newState.tallyLayout);
  }
};

async function updateLayoutDB(layout: TallyLayoutRecord): Promise<TallyLayoutRecord> {
  const result = await updateDB(layout);
  if (result) {
    layout._id = result.id;
    layout._rev = result.rev;
    layout.updatedDate = moment().format();
    layout.updatedBy = authService.getCurrentUser()!.username;
  }
  return layout;
}

async function updateTallyDataDB(tallyData: TallyDataRecord): Promise<TallyDataRecord> {
  const result = await updateDB(tallyData);
  if (result) {
    tallyData._id = result.id;
    tallyData._rev = result.rev;
    tallyData.updatedDate = moment().format();
    tallyData.updatedBy = authService.getCurrentUser()!.username;
  }
  return tallyData;
}

/**
 * updateLayout standalone helper function
 * @param record Record to update in Database
 */
async function updateDB(record: Base) {
  try {
    if (record._id) {
      const result = await pouchService.db.put(pouchService.userDBName, record);
      console.log('[Tally Module] Updated record.', record.type, result);
      return result;
    } else {
      const result = await pouchService.db.post(
        pouchService.userDBName,
        record
      );
      console.log('[Tally Module] Created new record.', record.type, result);
      return result;
    }
  } catch (err) {
    if (err.status === 409) {
      try {
        const newerDoc = await pouchService.db.get(
          pouchService.userDBName,
          record._id
        );
        record._rev = newerDoc._rev;
        const result = await pouchService.db.put(
          pouchService.userDBName,
          record
        );
        console.log(
          '[Tally Module] Handled doc conflict, updated record',
          record.type,
          result
        );
        return result;
      } catch (errRetry) {
        if (errRetry.status === 404) {
          delete record._id;
          delete record._rev;
          const result = await pouchService.db.put(
            pouchService.userDBName,
            record
          );
          console.log(
            '[Tally Module] Handled doc deletion, created record',
            record.type,
            result
          );
          return result;
        } else {
          // TODO Alert Module
          throw errRetry;
        }
      }
    } else {
      // TODO Alert Module
      // console.log('ERROR!', err);
      throw err;
    }
  }
}

const getters: GetterTree<TallyState, RootState> = {
  horizButtonCount(getState: TallyState) {
    return getState.tallyLayout.horizButtonCount;
  },
  vertButtonCount(getState: TallyState) {
    return getState.tallyLayout.vertButtonCount;
  },
  incDecValue(getState: TallyState) {
    return getState.incDecValue;
  },
  tallyMode(getState: TallyState) {
    return getState.operationMode;
  },
  reasonButtonColors() {
    return reasonButtonColors;
  }
};

export const tallyState: Module<TallyState, RootState> = {
  namespaced: true,
  state,
  actions,
  mutations,
  getters
};