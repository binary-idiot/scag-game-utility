<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { GoogleAuthService } from '@/services/GoogleAuth.service.ts'
import Response = google.picker.Response

const googleAuthService = new GoogleAuthService()

const content = ref()
const pickerInited = ref(false)

async function displaySheet(id: string): Promise<void> {
  let response
  try {
    // Fetch first 10 files
    response = await gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: id,
      range: 'Sheet1'
    })
  } catch (err: any) {
    content.value = err.message
    return
  }

  console.log(response)
  content.value = JSON.stringify(response.result, null, 2)
}

function loadPicker() {
  gapi.load('picker', () => {
    pickerInited.value = true
  })
}

function showPicker() {
  const accessToken = googleAuthService.GetToken()
  if (!accessToken) {
    throw new Error('Auth token not found')
  }

  const picker = new google.picker.PickerBuilder()
    .addView(google.picker.ViewId.SPREADSHEETS)
    .setOAuthToken(accessToken)
    .setDeveloperKey(googleAuthService.GAPIKey)
    .setAppId(googleAuthService.GAppID)
    .setCallback((data: google.picker.ResponseObject) => {
      const selectedDocs = data.docs
      if(selectedDocs !== undefined){
        displaySheet(selectedDocs[0]!.id)
      }
    })
    .build()
  picker.setVisible(true)
}

onMounted(() => {
  // listMajors();
  loadPicker()
})
</script>

<template>
  {{ content }}
  <button v-bind:disabled="!pickerInited" @click="showPicker">Show Picker</button>
</template>

<style scoped></style>
