# 반짝정원 · 멜로디와 아름이

두 아이에게 칭찬의 별을 선물하고, 모은 별을 골든티켓으로 바꾸는 모바일 웹앱입니다.

## 공개 웹앱

https://tidisung.github.io/melody-areum-star-garden/

- [멜로디](https://tidisung.github.io/melody-areum-star-garden/?page=melody)
- [아름이](https://tidisung.github.io/melody-areum-star-garden/?page=areum)
- [관리자](https://tidisung.github.io/melody-areum-star-garden/?page=admin)

GitHub Pages는 `gh-pages` 브랜치의 정적 파일을 제공합니다. `main`을 수정한 후 반영하려면 다음을 실행합니다.

```sh
git subtree split --prefix=dist -b pages-update
git push github pages-update:gh-pages
git branch -D pages-update
```

사이트 주소가 바뀌면 브라우저 저장 공간도 달라져 기존 Sites 주소의 기록은 자동으로 옮겨지지 않습니다.

## 실행

별도 설치나 빌드 없이 정적 파일을 제공합니다.

```sh
python3 -m http.server 8080 --directory dist
```

- 멜로디: http://localhost:8080/?page=melody
- 아름이: http://localhost:8080/?page=areum
- 관리자: http://localhost:8080/?page=admin

## 기능

- 아이별 별 보드, 하루에 받은 별 표시, 별을 골든티켓으로 교환
- 상대 캐릭터를 눌러 별 1·2·3개 보내기
- GS25 상품 사진으로 구성한 보상 가게, 주간 상품 교체, 사진 확대
- 직접 선택과 소원카드 룰렛으로 나뉜 보상 가게
- 룰렛 참가비 5장, 5등은 3장 반환
- 확률: 1등 3%, 2등 10%, 3등 20%, 4등·5등 각각 33.5%
- 1등 소원 입력·저장, 당첨 카드와 거래 기록 조회
- 관리자 별 지급, 보상 편집, 교환 기준 설정

## 데이터와 접근 방식

실제 사용 기록은 서버의 Cloudflare D1 데이터베이스에 저장됩니다. GitHub Pages는 화면을 제공하고, Sites에 배포한 Worker API가 인증과 거래를 처리합니다. 관리자 별 지급은 한 번에 1개입니다.

아빠는 전용 비밀 링크와 PIN으로 로그인합니다. 관리자 화면에서 아이별 일회용 연결 링크를 만들어 해당 아이패드에서 한 번 열면 됩니다. 기기별 접속 키만 브라우저에 저장되며, 별·티켓·소원·거래 기록은 서버에 계속 누적됩니다. 화면은 약 4초마다 갱신됩니다. 인터넷 연결이 끊기면 거래를 저장하지 않고 다시 연결하도록 안내합니다.

기존 브라우저 저장 기록은 로그인 화면에서 파일로 내려받아, 관리자 화면의 ‘기존 기록 파일 가져오기’로 비어 있는 서버에 한 번 옮길 수 있습니다. 관리자 화면에서 연결 기기를 해제하거나 전체 기록을 백업할 수 있습니다.

전용 관리자 링크는 `.private/`에만 보관하며 Git에 포함하지 않습니다. 자세한 서버 구성과 테스트는 `server/README.md`를 참고하세요.

## 파일

- `dist/index.html`, `dist/style.css`: 화면과 스타일
- `dist/app.js`: 별, 티켓, 보상, 소원 기록과 화면 동작
- `dist/catalogs.js`: 실제 상품 사진과 주간 상품 구성
- `dist/roulette.js`: 룰렛 확률과 티켓 정산
- `dist/access.js`: 관리자 로그인과 기기 연결
- `PRODUCT-IMAGES.md`: 현재 상품 이미지 출처
- `CHARACTERS.md`: 캐릭터 제작 기록
- `.openai/hosting.json`: 기존 Sites 배포 설정

상품 사진과 캐릭터 등 이미지의 재사용 권리는 별도입니다. 이 저장소는 해당 이미지의 자유 이용 권한을 부여하지 않습니다.
