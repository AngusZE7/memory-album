"""
Auth helper - run this first to generate token.json
"""
import sys
import os
sys.stdout.reconfigure(encoding='utf-8')

from google_auth_oauthlib.flow import InstalledAppFlow

SCOPES = ['https://www.googleapis.com/auth/drive.readonly']

flow = InstalledAppFlow.from_client_secrets_file('credentials.json', SCOPES)
print("Opening browser for Google login...")
print("If browser doesn't open, copy the URL below:")
creds = flow.run_local_server(open_browser=True, port=8090)

with open('token.json', 'w') as token:
    token.write(creds.to_json())

print("Authentication successful! token.json saved.")
