# 충청영업팀 입주박람회 관리

비밀번호로 잠긴 모바일 웹앱 (GitHub Pages). 데이터는 `data.enc.json`에 AES-256-GCM으로 암호화되어 있고, 비밀번호를 아는 사람만 열 수 있습니다.

- 원본 데이터(`data/data.json`)는 **업로드하지 않습니다** (.gitignore)
- 데이터 수정: `data/data.json 수정 (복원 후)` → `PASSWORD='비번' node tools/encrypt.mjs`
- 원본 복원: `PASSWORD='비번' node tools/encrypt.mjs --decrypt`
