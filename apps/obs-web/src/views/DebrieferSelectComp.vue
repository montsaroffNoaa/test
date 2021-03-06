<template>
  <q-select
    v-model="valueHolder"
    :options="filteredOptions"
    :label="label"
    use-input
    hide-selected
    fill-input
    @input="select"
    @filter="filterFn"
  >
      <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey">
                <div>
                  {{ emptyMessage }}
                </div>
              </q-item-section>
            </q-item>
          </template>
  </q-select>
</template>
<script lang="ts">
import {
  createComponent,
  ref,
  watch
} from '@vue/composition-api';
import { couchService } from '@boatnet/bn-couch';
import { Client, CouchDoc, ListOptions } from 'davenport';
import { useAsync } from 'vue-async-function';
import Vue, { WatchOptions } from 'vue';
import { filter, get, startsWith } from 'lodash';
import Multiselect from 'vue-multiselect';

Vue.component('multiselect', Multiselect);

export default createComponent({
  props: {
    label: String,
    val: String,
    lookupView: String,
    lookupLabel: String,
    lookupValue: String,
    lookupQueryOptions: Object,
    multiple: Boolean,
    emptyMessage: String
  },

  setup(props, context) {
    const options: any = ref([]);
    const valueHolder: any = ref('');
    const filteredOptions: any = ref(null);

    const watcherOptions: WatchOptions = {
      immediate: true
    };

    watch(() => props.lookupQueryOptions, populateLookups, watcherOptions);

    async function filterFn(val: any, update: any) {
      if (options.value === null) {
        await populateLookups();
      }
      update(() => {
        const needle = val.toLowerCase();
        filteredOptions.value = filter(options.value, (option: any) => {
          const currLabel = option.label.toLowerCase();
          return currLabel.includes(needle);
        });
      });
    }

    function select(values: any) {
      if (props.multiple) {
        const ids: string[] = [];
        for (const val of values) {
          ids.push(val.value);
        }
        context.emit('select', ids);
      } else {
        values = values ? values.value : values;
        context.emit('select', values);
        context.emit('update:val', values);
      }
    }

    async function getLookups(
      view: string,
      label: string,
      value: string,
      queryOptions: any
    ) {
      const lookupVals: any[] = [];
      const masterDB: Client<any> = couchService.masterDB;
      try {
        const results = await masterDB
          .view<any>('obs_web', view, queryOptions)
          .then((response: any) => {
            for (const row of response.rows) {
              lookupVals.push({ label: get(row, label), value: row[value] });
            }
            lookupVals.sort((a: any, b: any) => {
              if (a.label > b.label) {
                return 1;
              }
              if (b.label > a.label) {
                return -1;
              }
              return 0;
            });
          });
        options.value = lookupVals;
      } catch (err) {
        console.log(err);
      }
    }

    async function populateLookups() {
      const view = props.lookupView ? props.lookupView : '';
      const llabel = props.lookupLabel ? props.lookupLabel : '';
      const llvalue = props.lookupValue ? props.lookupValue : '';
      const lQueryOptions = props.lookupQueryOptions
        ? props.lookupQueryOptions
        : {};
      return await getLookups(view, llabel, llvalue, lQueryOptions);
    }

    return {
      select,
      filteredOptions,
      options,
      valueHolder,
      filterFn
    };
  }
});
</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>