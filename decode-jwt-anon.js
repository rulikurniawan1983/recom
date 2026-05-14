const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mamFmaXNiYWVkdmRyY2tpanBtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0Njc2NTYsImV4cCI6MjA5NDA0MzY1Nn0.eguhCM6Nm4TXnwf45bh_rjjAXTiOTmw8U5Qf5ptcoU8'
const parts = token.split('.')
const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString())
console.log(payload)
