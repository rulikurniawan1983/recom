$serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mamFmaXNiYWVkdmRyY2tpanBtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODQ2NzY1NiwiZXhwIjoyMDk0MDQzNjU2fQ.SSX5_lPOdeTsHRw6Nk_KDlaSjb31uU_SnUaYdUIFJFc'
$url = 'https://mfjafisbaedvdrckijpm.supabase.co/rest/v1/nkv_registrations?select=id&limit=1'
$headers = @{
  'apikey' = $serviceKey
  'Authorization' = "Bearer $serviceKey"
}
try {
  $resp = Invoke-WebRequest -Uri $url -Headers $headers -Method Get
  Write-Host 'Status:' $resp.StatusCode
  Write-Host 'Body:' $resp.Content
} catch {
  Write-Host 'Error:' $_.Exception.Message
  if ($_.Exception.Response) {
    $stream = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    $reader.BaseStream.Position = 0
    $reader.DiscardBufferedData()
    $body = $reader.ReadToEnd()
    Write-Host 'Response:' $body
  }
}
