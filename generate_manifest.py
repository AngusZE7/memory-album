"""
Google Drive 回憶錄照片掃描腳本

使用方式:
  1. 先完成 Google Cloud 設定 (見 README)
  2. pip install google-api-python-client google-auth-httplib2 google-auth-oauthlib
  3. python generate_manifest.py

首次執行會要求 Google 帳號授權，之後會快取 token。
"""

import os
import json
import re
from datetime import datetime, date
from pathlib import Path

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

SCOPES = ['https://www.googleapis.com/auth/drive.readonly']

# ═══════════════════════════════════════════
# 在這裡填入你的 Google Drive 資料夾 ID
# 從網址列複製: https://drive.google.com/drive/folders/FOLDER_ID_HERE
# ═══════════════════════════════════════════
FOLDER_ID = '1PEQnVDRPRj4Uxb79daN8crnfnF2kTM4j'

# ═══════════════════════════════════════════
# 交往紀念日（在一起的第一天）
# 用這個日期當基準來計算「在一起的天數」
# ═══════════════════════════════════════════
ANNIVERSARY = '2024-11-14'


def get_credentials():
    creds = None
    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file('credentials.json', SCOPES)
            creds = flow.run_local_server(open_browser=False, port=8090)
        with open('token.json', 'w') as token:
            token.write(creds.to_json())
    return creds


def list_files(service, folder_id):
    files = []
    page_token = None

    while True:
        result = service.files().list(
            q=f"'{folder_id}' in parents and trashed = false",
            fields="nextPageToken, files(id, name, mimeType, createdTime, size)",
            pageToken=page_token,
            orderBy="name"
        ).execute()

        files.extend(result.get('files', []))
        page_token = result.get('nextPageToken')
        if not page_token:
            break

    return files


def list_subfolders(service, folder_id):
    result = service.files().list(
        q=f"'{folder_id}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false",
        fields="files(id, name)",
        orderBy="name"
    ).execute()
    return result.get('files', [])


def get_direct_url(file_id):
    return f"https://lh3.googleusercontent.com/d/{file_id}"


def extract_special_title(name):
    """沒有日期的資料夾，若名稱以 Special 開頭且有文字，取後面的文字當標題"""
    m = re.match(r'(?i)^special[-_ ]*(.*)', name.strip())
    if m and m.group(1).strip():
        return m.group(1).strip()
    return '【special】'


def parse_filename(filename):
    """從檔名解析日期和描述
    格式: YYYYMMDD_描述 或 YYYYMMDD-HHMMSS
    """
    name = Path(filename).stem

    # 匹配 YYYYMMDD 開頭
    m = re.match(r'^(\d{8})[-_](.*)', name)
    if not m:
        return None, name

    date_str = m.group(1)
    desc = m.group(2).strip()

    try:
        d = datetime.strptime(date_str, '%Y%m%d').date()
    except ValueError:
        return None, name

    # 如果描述只是時間 (如 164907)，視為無描述
    if re.match(r'^\d{6}$', desc):
        desc = ''

    return d.isoformat(), desc


def build_manifest(service, folder_id):
    events = []
    photo_counter = 0

    # 1. 掃描根目錄的檔案
    root_files = list_files(service, folder_id)
    image_files = [f for f in root_files if f['mimeType'].startswith('image/')]

    # 把根目錄照片按日期分組
    date_groups = {}
    for f in image_files:
        date_str, desc = parse_filename(f['name'])
        if date_str:
            key = date_str
        else:
            key = 'unknown'

        if key not in date_groups:
            # 無法解析日期的照片集中成一個「special」事件
            title = '【special】' if key == 'unknown' else (desc or date_str)
            date_groups[key] = {'title': title, 'photos': []}

        date_groups[key]['photos'].append({
            'id': f['id'],
            'name': f['name'],
            'url': get_direct_url(f['id'])
        })
        photo_counter += 1

    for date_str, group in sorted(date_groups.items()):
        events.append({
            'id': f"event_{date_str}_{len(events)}",
            'date': date_str if date_str != 'unknown' else '',
            'title': group['title'],
            'photos': group['photos']
        })

    # 2. 掃描子資料夾
    subfolders = list_subfolders(service, folder_id)
    for folder in subfolders:
        folder_name = folder['name']

        # 從資料夾名解析日期和描述
        date_str, desc = parse_filename(folder_name)

        sub_files = list_files(service, folder['id'])
        sub_images = [f for f in sub_files if f['mimeType'].startswith('image/')]

        if not sub_images:
            continue

        photos = []
        for f in sub_images:
            photos.append({
                'id': f['id'],
                'name': f['name'],
                'url': get_direct_url(f['id'])
            })
            photo_counter += 1

        events.append({
            'id': f"event_{date_str or folder_name}_{len(events)}",
            'date': date_str or '',
            # 無法從資料夾名解析日期的，改用 special 標題（有文字取文字）
            'title': (desc or folder_name) if date_str else extract_special_title(folder_name),
            'photos': photos
        })

    # 3. 分類：有日期的照日期排序；沒日期的 special 有標題在前、沒標題在後
    dated = [e for e in events if e['date']]
    titled_special = [e for e in events if not e['date'] and e['title'] != '【special】']
    untitled_special = [e for e in events if not e['date'] and e['title'] == '【special】']

    dated.sort(key=lambda e: e['date'])

    # 沒標題的一頁最多 12 張，超過就拆成多頁
    split_special = []
    for e in untitled_special:
        photos = e['photos']
        for i in range(0, len(photos), 12):
            split_special.append({
                'id': f"{e['id']}_p{len(split_special) + 1}",
                'date': '永遠',
                'title': '【special】',
                'photos': photos[i:i + 12]
            })

    # 沒標題的加上編號
    for n, e in enumerate(split_special, 1):
        e['title'] = f'【special】 {n}'

    # 沒日期的日期標示都是「永遠」
    for e in titled_special:
        e['date'] = '永遠'

    events = dated + titled_special + split_special

    # 計算在一起的天數（以交往紀念日為基準）
    total_days = 0
    try:
        anniv = datetime.strptime(ANNIVERSARY, '%Y-%m-%d').date()
        # +1 表示含交往當天（第 1 天）
        total_days = (date.today() - anniv).days + 1
    except ValueError:
        print(f"[WARN] 無法解析 ANNIVERSARY: {ANNIVERSARY}")

    manifest = {
        'generated_at': datetime.now().isoformat(),
        'total_photos': photo_counter,
        'total_days': total_days,
        'events': events
    }

    return manifest


def main():
    if FOLDER_ID == '在此貼上你的資料夾ID':
        print("[ERROR] FOLDER_ID is not set!")
        return

    if not os.path.exists('credentials.json'):
        print("[ERROR] credentials.json not found!")
        return

    print("Authenticating with Google...")
    creds = get_credentials()
    service = build('drive', 'v3', credentials=creds)

    print(f"Scanning folder: {FOLDER_ID}")
    manifest = build_manifest(service, FOLDER_ID)

    output_file = 'photos.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)

    print(f"Done! {manifest['total_photos']} photos, {len(manifest['events'])} events")
    print(f"   Days together: {manifest['total_days']}")
    print(f"   Output: {output_file}")


if __name__ == '__main__':
    main()
