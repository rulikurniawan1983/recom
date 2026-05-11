-- UPDATE ROLE TO ADMIN (karena profile sudah dibuat otomatis oleh trigger)
UPDATE profiles SET role = 'admin', full_name = 'Administrator' WHERE email = 'admin@recom.com';