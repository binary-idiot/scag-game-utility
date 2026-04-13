<script setup lang="ts">
import { onMounted, ref } from 'vue'

const content = ref()

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

onMounted(() => {
  listMajors();
})
</script>

<template>
  {{ content }}
</template>

<style scoped></style>
