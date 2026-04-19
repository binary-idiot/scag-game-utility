<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { GoogleAuthService } from '@/services/GoogleAuth.service.ts'

const googleAuthService = new GoogleAuthService();

const content = ref();
const pickerInited = ref(false);

async function listMajors(): Promise<void> {
  let response
  try {
    // Fetch first 10 files
    response = await gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
      range: 'Class Data!A2:E',
    })
  } catch (err: any) {
    content.value = err.message
    return
  }
  const range = response.result
  if (!range || !range.values || range.values.length == 0) {
    content.value = 'No values found.'
    return
  }
  // Flatten to string to display
  const output = range.values.reduce((str: string, row: any[]) => `${str}${row[0]}, ${row[4]}\n`, 'Name, Major:\n')
  content.value = output
}

function loadPicker() {
  gapi.load('picker', () => {
    pickerInited.value = true;
  });
}

function showPicker() {
  const accessToken = googleAuthService.GetToken();
  if(!accessToken) {
    throw new Error('Auth token not found')
  }

  const picker = new google.picker.PickerBuilder()
    .addView(google.picker.ViewId.SPREADSHEETS)
    .setOAuthToken(accessToken)
    .setDeveloperKey(googleAuthService.GAPIKey)
    .setAppId(googleAuthService.GAppID)
    .setCallback((data) => {
      content.value = JSON.stringify(data, null, 2)
    })
    .build()
  picker.setVisible(true)
}

onMounted(() => {
  // listMajors();
  loadPicker();
})
</script>

<template>
  {{ content }}
  <button v-bind:disabled="!pickerInited" @click="showPicker">Show Picker</button>
</template>

<style scoped></style>
