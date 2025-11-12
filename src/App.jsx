<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>IT 서비스 업데이트 피드</title>
    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        /* Inter 폰트 설정 및 기본 스타일 */
        body {
            font-family: 'Inter', sans-serif;
            background-color: #f0f2f5;
        }
        /* [수정됨] G열 텍스트 줄 제한 (6줄) - 목록 뷰에만 적용 */
        #main-view .content-container {
            max-height: 9rem; /* 6-line height */
            transition: max-height 0.3s ease-in-out;
            overflow: hidden;
        }
        /* 상세 뷰에서는 G열 제한 없음 */
        #detail-view .content-container {
            max-height: none;
            overflow: visible;
        }

        /* 피드 내 태그 스타일 */
        .tag {
            display: inline-block;
            padding: 0.1rem 0.4rem;
            margin-right: 0.5rem;
            border-radius: 0.375rem;
            font-size: 0.625rem; /* 10px */
            font-weight: 600;
            background-color: transparent; /* 배경색 제거 */
        }
        /* 태그 색상 */
        .tag-naver { color: #065f46; }
        .tag-toss { color: #0369a1; }
        .tag-danggeun { color: #9a3412; }
        .tag-google { color: #d93025; }
        .tag-default { color: #4f46e5; }
        .tag-coupang { color: #B90000; } /* [추가] 쿠팡 색상 */

        /* 회사 태그 클라우드 스타일 */
        .company-tag {
            cursor: pointer;
            padding: 0.3rem 0.7rem;
            border-radius: 0.375rem;
            font-size: 0.875rem;
            font-weight: 500;
            transition: background-color 0.2s;
            border: 1px solid transparent;
            background-color: transparent;
            flex-shrink: 0;
        }
        .company-tag:hover {
            opacity: 0.8;
            background-color: #f3f4f6;
        }
        .company-tag.active {
            font-weight: 700;
            border-color: currentColor;
            background-color: #eef2ff;
        }

        /* [추가됨] AI 필터 버튼 스타일 */
        #ai-filter-button {
            padding: 0.75rem 1rem; /* p-3 */
            border: 1px solid #d1d5db; /* border-gray-300 */
            border-radius: 0.75rem; /* rounded-xl */
            background-color: white;
            color: #374151; /* text-gray-700 */
            font-size: 0.875rem; /* text-sm */
            font-weight: 500; /* font-medium */
            box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); /* shadow-sm */
            transition: all 0.2s;
            cursor: pointer;
            flex-shrink: 0; /* 너비 고정 */
        }
        #ai-filter-button:hover {
            background-color: #f9fafb; /* hover:bg-gray-50 */
        }
        /* AI 필터 활성화 시 스타일 */
        #ai-filter-button.active {
            background-color: #4f46e5; /* bg-indigo-600 */
            color: white;
            border-color: #4f46e5;
            font-weight: 600; /* font-semibold */
        }

        /* 플리킹 컨테이너 */
        #company-tag-cloud-wrapper {
            overflow-x: scroll;
            white-space: nowrap;
            -webkit-overflow-scrolling: touch;
            padding-bottom: 5px;
        }
        #company-tag-cloud-wrapper::-webkit-scrollbar { display: none; }
        #company-tag-cloud-wrapper { -ms-overflow-style: none; scrollbar-width: none; }

        /* 이미지 스타일 */
        .feed-image {
            max-height: 200px;
            width: 100%;
            object-fit: contain;
            background-color: #f9fafb;
            cursor: pointer;
        }
        /* [수정] 상세 뷰에서의 이미지 갤러리 스타일 */
        .feed-image-gallery {
             max-height: 500px; /* 상세 뷰 이미지 높이 */
             object-fit: contain;
             width: 100%;
        }

        /* 동영상 미리보기 (아웃랜딩) */
        .video-thumbnail-preview {
            position: relative;
            cursor: pointer;
            margin-bottom: 1rem;
            border-radius: 0.5rem;
            overflow: hidden;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
            display: block; /* a 태그로 변경되어 block으로 설정 */
        }
        .video-thumbnail-preview img {
            width: 100%;
            height: auto;
            object-fit: cover;
            display: block;
        }
        .video-play-icon {
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: rgba(0, 0, 0, 0.3);
            transition: background-color 0.3s;
        }
        .video-thumbnail-preview:hover .video-play-icon {
            background-color: rgba(0, 0, 0, 0.5);
        }

        /* 이미지 뷰어 모달 */
        #image-viewer {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background-color: rgba(0, 0, 0, 0.9);
            display: none; justify-content: center; align-items: center;
            z-index: 1000; overflow-y: auto;
        }
        #image-viewer.active { display: flex; }
        #image-viewer img { max-width: 90%; max-height: 90%; object-fit: contain; }
        #close-btn {
            position: absolute; top: 20px; right: 30px;
            font-size: 30px; color: #fff; cursor: pointer; z-index: 1001;
        }

        /* 로그인 필요 모달 */
        #login-required-modal {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background-color: rgba(0, 0, 0, 0.6);
            display: none; justify-content: center; align-items: center;
            z-index: 1000;
        }
        #login-required-modal.active { display: flex; }

        /* [추가됨] 레이더 알림 모달 */
        #radar-alert-modal {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background-color: rgba(0, 0, 0, 0.6);
            display: none; justify-content: center; align-items: center;
            z-index: 1000;
        }
        #radar-alert-modal.active { display: flex; }

        /* 로딩 스피너 */
        .spinner {
            border: 4px solid rgba(0, 0, 0, 0.1);
            width: 36px; height: 36px; border-radius: 50%;
            border-left-color: #4f46e5;
            animation: spin 1s ease infinite;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        /* 레이더 아이콘 스타일 (주황색) */
        .radar-icon {
            color: #9ca3af; /* text-gray-400 */
            transition: color 0.2s;
            cursor: pointer;
        }
        .radar-icon:hover {
            color: #f97316; /* text-orange-500 */
        }
        .radar-icon.active {
            color: #f97316; /* text-orange-500 */
        }
        
        /* [추가] 댓글 입력창 별점 스타일 */
        .star-rating {
            display: flex;
            flex-direction: row-reverse;
            justify-content: flex-end;
        }
        .star-rating input[type="radio"] {
            display: none;
        }
        .star-rating label {
            font-size: 1.5rem; /* 24px */
            color: #d1d5db; /* text-gray-300 */
            cursor: pointer;
            transition: color 0.2s;
        }
        .star-rating input[type="radio"]:checked ~ label {
            color: #f59e0b; /* text-yellow-500 */
        }
        .star-rating label:hover,
        .star-rating label:hover ~ label {
            color: #f59e0b; /* text-yellow-500 */
        }
    </style>
    <script>
        // --- Google Sheets 설정 ---
        const SHEET_ID = "1TGkkWKPmOlkldBjeMvEQPKOwAYxTFNtZuCnX_2k0LTs";
        const SHEET_NAME = "launch";
        const API_KEY = "AIzaSyDIig_uUt8grXOehM3JyI_sabFBh3EuTS8";
        // [수정됨] N열(AI)까지 로드
        const BASE_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}!A:N?key=${API_KEY}`;

        // --- [수정] 리뷰 Mock 데이터 (프로필 형식 변경, 카카오/쿠팡 추가) ---
        const mockReviews = {
            '네이버': {
                rating: 4.8, count: 128,
                comments: [
                    { company: '카카오', job: '기획', nickname: '라이언', rating: 5.0, text: '네이버의 업데이트는 항상 퀄리티가 높네요. 잘 봤습니다.' },
                    { company: '토스', job: '개발', nickname: '익명', rating: 4.5, text: '유저 경험을 해치지 않는 선에서 잘 조절한 것 같아요.' }
                ]
            },
            '토스': {
                rating: 4.6, count: 81,
                comments: [
                    { company: '네이버', job: '커머스', nickname: 'neo', rating: 4.5, text: '토스의 행보는 정말 파격적이네요. 시장에 큰 영향을 줄 것 같습니다.' },
                    { company: '쿠팡', job: '마케터', nickname: '쿠팡맨', rating: 4.0, text: '결국 수익 모델로 전환하겠지만, 지금은 트래픽 확보가 우선이겠죠.' }
                ]
            },
            '당근': {
                rating: 4.0, count: 55,
                comments: [
                    { company: '배민', job: '사업개발', nickname: 'B마트', rating: 4.0, text: '동네생활 탭의 활용도를 높이려는 시도가 좋네요.' }
                ]
            },
             'Google': {
                rating: 4.9, count: 210,
                comments: [
                    { company: '네이버', job: 'AI 기획', nickname: '클로바', rating: 5.0, text: '대화형 검색은 역시 구글이네요. Grounding 기술이 인상적입니다.' }
                ]
            },
            '카카오': { // [추가]
                rating: 4.2, count: 30,
                comments: [
                    { company: '라인', job: '개발', nickname: '브라운', rating: 4.5, text: '카카오의 새로운 시도네요.' },
                    { company: '네이버', job: '기획', nickname: '제이', rating: 4.0, text: 'GPT를 활용한 점이 인상깊습니다.' }
                ]
            },
            '쿠팡': { // [추가]
                rating: 4.1, count: 45,
                comments: [
                    { company: '배민', job: '물류', nickname: '배달이', rating: 4.0, text: '쿠팡이츠의 퀵커머스 확장이네요.' }
                ]
            }
        };

        // --- [복구] 전역 상태 변수 ---
        let currentFilter = { searchQuery: '', companyTag: '', onlyAI: false };
        let allFeedData = {}; // 피드 데이터 저장소
        let allTimelineData = {}; // 히스토리 데이터 저장소
        // [복구] 모의 로그인 상태
        let mockUser = {
            isLoggedIn: false,
            nickname: '',
            company: '',
            job: ''
        };

        // --- 핵심 함수 정의 ---

        // [수정] 회사별 스타일 반환 (유연하게)
        function getCompanyStyling(company) {
            const key = (company || '').toLowerCase();
            if (key.includes('naver') || key.includes('네이버')) return { icon: 'N', bg: 'bg-green-500', tag: 'tag-naver' };
            if (key.includes('toss') || key.includes('토스')) return { icon: 'T', bg: 'bg-blue-600', tag: 'tag-toss' };
            if (key.includes('daangn') || key.includes('당근')) return { icon: '🥕', bg: 'bg-orange-500', tag: 'tag-danggeun' };
            if (key.includes('google') || key.includes('구글')) return { icon: 'G', bg: 'bg-red-600', tag: 'tag-google' };
            if (key.includes('kakao') || key.includes('카카오')) return { icon: 'K', bg: 'bg-yellow-400', tag: 'tag-default' }; // 카카오 스타일
            if (key.includes('coupang') || key.includes('쿠팡')) return { icon: 'C', bg: 'bg-red-700', tag: 'tag-coupang' }; // 쿠팡 스타일
            
            const firstLetter = (company && company.length > 0) ? company[0] : '?';
            return { icon: firstLetter, bg: 'bg-gray-500', tag: 'tag-default' };
        }

        // [수정됨] 피드 필터링 (AI 필터 로직 추가)
        function filterFeeds() {
            const query = currentFilter.searchQuery.toLowerCase();
            const company = currentFilter.companyTag;
            const onlyAI = currentFilter.onlyAI; // [추가]
            const feeds = document.querySelectorAll('main .feed-card');

            feeds.forEach(feed => {
                const feedId = feed.getAttribute('data-feed-id');
                const feedContent = feed.textContent.toLowerCase();
                const feedData = allFeedData[feedId]; // [수정]

                if (!feedData) return; // 데이터 로드 전 오류 방지

                const feedCompany = feedData.company;
                const feedIsAI = feedData.isAI; // [추가]

                const matchesSearch = feedContent.includes(query);
                const matchesCompany = !company || feedCompany === company;
                const matchesAI = !onlyAI || feedIsAI; // [추가]

                // [수정] AI 필터 포함
                feed.style.display = (matchesSearch && matchesCompany && matchesAI) ? 'block' : 'none';
            });

            document.querySelectorAll('.company-tag').forEach(tag => {
                tag.classList.toggle('active', tag.getAttribute('data-company') === company);
            });
        }

        // 검색 입력 핸들러
        function handleSearchInput(event) {
            currentFilter.searchQuery = event.target.value.trim();
            filterFeeds();
        }

        // 회사 태그 클릭 핸들러
        function handleCompanyTagClick(event, companyName) {
            currentFilter.companyTag = (currentFilter.companyTag === companyName) ? '' : companyName;
            filterFeeds();
        }

        // [추가됨] AI 필터 토글 핸들러
        function handleAiFilterToggle(buttonElement) {
            currentFilter.onlyAI = !currentFilter.onlyAI;
            buttonElement.classList.toggle('active', currentFilter.onlyAI);
            filterFeeds();
        }

        // YouTube URL에서 썸네일과 ID 추출
        function getYouTubeInfo(url) {
            if (!url) return null;
            const regex = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|live\/))([a-zA-Z0-9_-]{11})/;
            const match = url.match(regex);
            const videoId = match ? match[1] : null;
            if (videoId) {
                return {
                    id: videoId,
                    thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
                };
            }
            return null;
        }

        // 동영상 미리보기 HTML (아웃랜딩) 생성 - <a> 태그
        function getVideoPreviewHtml(url, feedId) {
            const videoInfo = getYouTubeInfo(url);
            if (!videoInfo) {
                // 유튜브가 아닌 다른 링크일 경우(L열에 값이 있다면) 일반 링크 제공
                if(url) {
                    return `
                        <a href="${url}" target="_blank" rel="noopener noreferrer" class="block p-4 bg-gray-100 text-indigo-600 font-semibold rounded-lg text-center hover:bg-gray-200" title="새 창에서 동영상 재생">
                            🔗 동영상 원본 보기 (새 창)
                        </a>
                    `;
                }
                return '';
            }

            // <a> 태그로 감싸서 새 창에서 열리도록 수정
            return `
                <a href="${url}" target="_blank" rel="noopener noreferrer" class="video-thumbnail-preview" title="새 창에서 동영상 재생">
                    <img src="${videoInfo.thumbnail}" alt="${feedId} 동영상 미리보기" loading="lazy">
                    <div class="video-play-icon">
                        <svg class="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M6 3l12 9-12 9V3z"/>
                        </svg>
                    </div>
                </a>
            `;
        }

        // [수정] 리뷰 HTML 생성 함수 (목록/상세 분리)
        function getReviewHtml(reviewKey, feedId, isExpandedDefault = false) {
            
            // [수정] 키 매칭 유연하게 변경
            let reviewData = null;
            const key = (reviewKey || '').toLowerCase(); // null 방지
            
            if (key.includes('naver') || key.includes('네이버')) reviewData = mockReviews['네이버'];
            else if (key.includes('toss') || key.includes('토스')) reviewData = mockReviews['토스'];
            else if (key.includes('daangn') || key.includes('당근')) reviewData = mockReviews['당근'];
            else if (key.includes('google') || key.includes('구글')) reviewData = mockReviews['Google'];
            else if (key.includes('kakao') || key.includes('카카오')) reviewData = mockReviews['카카오'];
            else if (key.includes('coupang') || key.includes('쿠팡')) reviewData = mockReviews['쿠팡'];
            // else reviewData = mockReviews[reviewKey]; // Fallback

            if (!reviewData) return ''; // 리뷰 데이터 없으면 반환

            // [수정] 상세 뷰 (isExpandedDefault = true) - 풀 목업
            if (isExpandedDefault) {
                const commentFormHtml = `
                    <div class="mt-6 p-4 border rounded-lg bg-gray-50">
                        <h4 class="font-semibold text-gray-800 mb-2">리뷰 작성하기</h4>
                        <!-- Mock Star Rating Input -->
                        <div class="star-rating mb-2">
                            <input type="radio" id="star5-${feedId}" name="rating-${feedId}" value="5"><label for="star5-${feedId}">★</label>
                            <input type="radio" id="star4-${feedId}" name="rating-${feedId}" value="4"><label for="star4-${feedId}">★</label>
                            <input type="radio" id="star3-${feedId}" name="rating-${feedId}" value="3"><label for="star3-${feedId}">★</label>
                            <input type="radio" id="star2-${feedId}" name="rating-${feedId}" value="2"><label for="star2-${feedId}">★</label>
                            <input type="radio" id="star1-${feedId}" name="rating-${feedId}" value="1"><label for="star1-${feedId}">★</label>
                        </div>
                        <textarea class="w-full p-2 border rounded-md text-sm" rows="3" placeholder="의견을 남겨주세요..."></textarea>
                        <button onclick="handleReviewSubmit()" 
                                class="w-full mt-2 bg-indigo-500 text-white font-semibold text-sm px-3 py-2 rounded-md hover:bg-indigo-600 shadow-sm">
                            댓글 등록
                        </button>
                    </div>
                `;
                
                return `
                    <hr class="my-4 border-gray-200">
                    <div class="review-lite-container">
                        <!-- [수정] 고정된 평점/투표수 -->
                        <div class="flex items-center gap-2 mb-3">
                            <span class="text-yellow-500">⭐️</span>
                            <span class="font-bold text-gray-800">4.3 점</span>
                            <span class="text-sm text-gray-500">(총 평가 32 개)</span>
                        </div>
                        
                        <!-- 댓글 입력창 -->
                        ${commentFormHtml}

                        <!-- [수정] 고정된 댓글 목업 (레이아웃 변경) -->
                        <div id="review-content-${feedId}" class="mt-6 space-y-4" data-comment-count="2">
                            <div class="p-4 bg-gray-50 rounded-lg border">
                                <div class="flex items-center justify-end mb-2"> <!-- 헤더: 별점만 -->
                                    <span class="text-xs font-bold text-gray-600 flex items-center">
                                        <span class="text-yellow-500 mr-1">⭐️</span>
                                        4.0
                                    </span>
                                </div>
                                <p class="text-sm text-gray-700">
                                    기대되는 기능이네요
                                    <span class="text-xs text-gray-500 ml-1">(카카오 _ 사업 _ 라이언)</span>
                                </p>
                            </div>
                            <div class="p-4 bg-gray-50 rounded-lg border">
                                <div class="flex items-center justify-end mb-2"> <!-- 헤더: 별점만 -->
                                    <span class="text-xs font-bold text-gray-600 flex items-center">
                                        <span class="text-yellow-500 mr-1">⭐️</span>
                                        4.5
                                    </span>
                                </div>
                                <p class="text-sm text-gray-700">
                                    이 기능은 저희도 검토했었는데, 아마존이 먼저 출시했군요. 잘 봤습니다.
                                    <span class="text-xs text-gray-500 ml-1">(네이버 _ 기획 _ 제이)</span>
                                </p>
                            </div>
                        </div>
                    </div>
                `;
            }

            // --- [신규] 목록 뷰 (isExpandedDefault = false) - 요약 목업 ---
            
            // Use the *actual* review data found
            const firstComment = reviewData.comments[0];
            if (!firstComment) return ''; // No comments to show

            // Truncate comment text
            let commentText = firstComment.text;
            if (commentText.length > 40) {
                commentText = commentText.substring(0, 40) + "...";
            }
            
            const commentAuthor = `${firstComment.company} _ ${firstComment.job} _ ${firstComment.nickname}`;

            return `
                <hr class="my-4 border-gray-200">
                <div class="review-summary-container">
                    <!-- 실제 평점/투표수 -->
                    <div class="flex items-center gap-2 mb-2">
                        <span class="text-yellow-500">⭐️</span>
                        <span class="font-bold text-gray-800 text-sm">${reviewData.rating} 점</span>
                        <span class="text-sm text-gray-500">(총 평가 ${reviewData.count} 개)</span>
                    </div>
                    
                    <!-- [수정] 실제 한 줄 의견 (레이아웃 변경) -->
                    <div class="text-sm text-gray-700">
                        <p class="truncate">
                            "${commentText}"
                            <span class="text-xs text-gray-500 ml-1">(${commentAuthor})</span>
                        </p>
                    </div>
                </div>
            `;
        }

        // [제거됨] 목록 뷰에서는 리뷰 토글이 필요 없음
        // function toggleReviews(buttonElement, reviewContainerId) { ... }

        // 이미지 뷰어
        function openImageViewer(imgElement) {
            const viewer = document.getElementById('image-viewer');
            if (viewer) {
                document.getElementById('viewer-image').src = imgElement.src;
                viewer.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        }
        function closeImageViewer() {
            const viewer = document.getElementById('image-viewer');
            if (viewer) {
                viewer.classList.remove('active');
                document.body.style.overflow = '';
            }
        }

        // 로그인 모달
        function showLoginModal() {
            const modal = document.getElementById('login-required-modal');
            if (modal) {
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        }
        function closeLoginModal() {
            const modal = document.getElementById('login-required-modal');
            if (modal) {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            }
        }

        // [추가됨] 레이더 알림 모달
        function showRadarModal() {
            const modal = document.getElementById('radar-alert-modal');
            if (modal) {
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        }
        function closeRadarModal() {
            const modal = document.getElementById('radar-alert-modal');
            if (modal) {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            }
        }

        // 레이더 아이콘 클릭 핸들러
        function handleRadarClick(element) {
            // [복구] 로그인 상태 확인
            if (!mockUser.isLoggedIn) {
                showLoginModal();
                return;
            }
            showRadarModal();
            element.classList.toggle('active');
        }

        // 피드 포커스 함수
        function goToFeedAndFocus(feedId) {
            // 1. 피드 리스트 뷰로 전환
            showFeedList();

            // 2. 필터 초기화 (해당 피드가 보이도록)
            currentFilter.searchQuery = '';
            currentFilter.companyTag = '';
            // [수정] AI 필터도 초기화
            currentFilter.onlyAI = false;

            const searchInput = document.getElementById('search-input');
            if (searchInput) searchInput.value = '';

            // [추가] AI 버튼도 초기화
            const aiButton = document.getElementById('ai-filter-button');
            if (aiButton) aiButton.classList.remove('active');

            filterFeeds(); // 모든 피드를 다시 표시

            // 3. 렌더링을 위해 잠시 대기 후 스크롤
            setTimeout(() => {
                const feedElement = document.getElementById(feedId);

                if (feedElement) {
                    // 4. 해당 피드로 스크롤
                    feedElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

                    // 5. 하이라이트 효과
                    feedElement.style.transition = 'background-color 0.5s ease-out';
                    feedElement.style.backgroundColor = '#f0f9ff'; // 밝은 파란색

                    setTimeout(() => {
                        feedElement.style.backgroundColor = '#ffffff'; // 원래 배경색
                    }, 2000); // 2초간 하이라이트
                } else {
                    console.warn('Focus failed: Feed element not found after view switch:', feedId);
                }
            }, 100); // 100ms 딜레이로 DOM 렌더링 시간 확보
        }

        // --- [복구] 뷰 전환 함수 ---
        function showView(viewId) {
            ['main-view', 'timeline-view', 'detail-view', 'signup-view'].forEach(id => {
                const el = document.getElementById(id);
                if(el) el.classList.add('hidden');
            });
            const view = document.getElementById(viewId);
            if(view) {
                view.classList.remove('hidden');
                window.scrollTo(0, 0);
            }
        }

        function showFeedList() { showView('main-view'); }
        function showSignupView() { showView('signup-view'); }

        function showTimelineView(serviceKey, serviceName) {
            showView('timeline-view');

            const titleEl = document.getElementById('timeline-header-title');
            const contentEl = document.getElementById('timeline-content');

            titleEl.textContent = `${serviceName} 히스토리`;

            const history = allTimelineData[serviceKey] || [];

            if (history.length === 0) {
                contentEl.innerHTML = '<p class="text-gray-500">이전 히스토리가 없습니다.</p>';
                return;
            }

            // [수정됨] 히스토리 순서 (최신이 위로)
            // const reversedHistory = [...history].reverse(); // .reverse() 제거

            // 타임라인 UI 생성 (더보기 버튼 추가)
            contentEl.innerHTML = history.map(feed => { // 'reversedHistory' -> 'history'
                // [수정됨] G열 내용 10줄 요약
                const fullContent = (feed.updateContent || '');
                const maxLines = 10;
                const maxChars = 600; // 10줄에 대한 대략적인 글자 수

                let summaryLines = fullContent.split('\n').slice(0, maxLines);
                let summary = summaryLines.join('\n');

                let wasTruncatedByLines = fullContent.split('\n').length > maxLines;
                let wasTruncatedByChars = false;

                if (summary.length > maxChars) {
                    summary = summary.substring(0, maxChars);
                    wasTruncatedByChars = true;
                }

                if (wasTruncatedByLines || wasTruncatedByChars) {
                    summary += '...';
                }

                return `
                    <div class="relative pl-8 pb-6 border-l-2 border-gray-200">
                        <span class="absolute -left-2 top-1 w-3.5 h-3.5 bg-indigo-500 rounded-full border-2 border-white"></span>
                        <p class="text-xs text-gray-500 mb-1">${feed.date}</p>
                        <h3 class="text-lg font-semibold text-gray-800">${feed.title}</h3>
                        <p class="text-sm text-gray-600 whitespace-pre-wrap">${summary}</p>
                        <!-- 피드 포커스 버튼 -->
                        <button onclick="goToFeedAndFocus('${feed.id}')"
                                class="text-indigo-500 hover:text-indigo-600 font-semibold text-sm mt-2">
                            피드에서 더보기 &rarr;
                        </button>
                    </div>
                `;
            }).join('') + '<div class="relative pl-8"><span class="absolute -left-2 top-1 w-3.5 h-3.5 bg-gray-300 rounded-full border-2 border-white"></span></div>'; // End marker
        }

        // [수정됨] 상세 뷰 표시 함수 (페이지 최적화 레이아웃)
        function showDetailView(feedId) {
            showView('detail-view');

            const detailContentEl = document.getElementById('detail-content');
            const feed = allFeedData[feedId];

            if (!feed) {
                detailContentEl.innerHTML = '<p class="text-red-500">오류: 피드 정보를 불러올 수 없습니다.</p>';
                return;
            }

            // 상세 뷰용 HTML 생성
            const styling = getCompanyStyling(feed.company);
            const tagHtml = feed.tags.map(tag => `<span class="tag ${styling.tag}">#${tag}</span>`).join('');

            // 1. Main Image (J-열)
            const currentImageUrl = feed.imageUrls[0] || '';
            const mainMediaHtml = currentImageUrl ? `
                <div class="mb-6 rounded-lg overflow-hidden border border-gray-200">
                    <img src="${currentImageUrl}" alt="${feed.title} 이미지"
                         class="w-full h-auto max-h-[400px] object-contain bg-gray-50"
                         onclick="openImageViewer(this)" loading="lazy"
                         onerror="this.onerror=null; this.src='https://placehold.co/600x300/e5e7eb/374151?text=No+Image'">
                </div>
            ` : '';

            // 2. Video (L-열)
            const videoPreviewHtml = feed.videoUrl ? getVideoPreviewHtml(feed.videoUrl, feed.id) : '';

            // 3. Other Images (K-열 and beyond)
            const otherImages = feed.imageUrls.slice(1); // Get all *except* the first
            const otherImagesHtml = otherImages.length > 0 ? `
                <div class="space-y-3">
                    <h3 class="text-lg font-bold text-gray-800 mb-2">추가 이미지</h3>
                    ${otherImages.map((url, i) => `
                        <img src="${url}" alt="${feed.title} 첨부 이미지 ${i+2}"
                             class="feed-image-gallery rounded-lg shadow-sm"
                             onerror="this.onerror=null; this.src='https://placehold.co/600x200/e5e7eb/374151?text=Image+${i+2}+Error'"
                             onclick="openImageViewer(this)" loading="lazy">
                    `).join('')}
                </div>
            ` : '';

            // 4. Reviews (Default Expanded)
            const reviewHtml = getReviewHtml(feed.reviewKey, feed.id, true); // true: 기본 펼침

            // [수정] 카드 테두리 제거 (bg-white, shadow 등 제거)
            detailContentEl.innerHTML = `
                <!-- [수정] 상세 뷰 컨텐츠 (카드 스타일 제거) -->
                <div class="pt-2"> <!-- Removed: bg-white p-6 rounded-xl shadow-lg border border-gray-100 -->

                    <!-- 1. Title (F-열) -->
                    <h1 class="text-3xl font-extrabold text-gray-900 mb-4">${feed.title}</h1>

                    <!-- 2. Metadata (A,B,E) -->
                    <div class="flex items-center gap-3 mb-2 text-sm text-gray-500">
                        <span class="w-6 h-6 ${styling.bg} rounded-full flex items-center justify-center text-white text-xs font-bold">${styling.icon}</span>
                        <span class="font-semibold text-gray-700">${feed.company} _ ${feed.service}</span>
                        <span>&bull;</span>
                        <span>${feed.date}</span>
                    </div>

                    <!-- Tags (C,D) -->
                    <div class="flex flex-wrap gap-2 mb-6 border-b border-gray-200 pb-6">
                        ${tagHtml}
                    </div>

                    <!-- 3. Main Media (J-열) -->
                    ${mainMediaHtml}

                    <!-- 4. Main Content (G-열) [수정] 스타일 적용 -->
                    <div class="mb-6 content-container p-4 bg-white rounded-lg border"> <!-- Apply same style as Change Purpose -->
                        <!-- [수정] 제목 변경 및 이모지 제거 -->
                        <h3 class="text-sm font-bold text-gray-800 mb-2 border-b pb-1">내용 설명</h3>
                        <!-- [수정] 텍스트 크기 text-sm으로 변경 -->
                        <p class="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">${feed.updateContent}</p>
                    </div>

                    <!-- 5. Change Purpose (H-열) -->
                    ${feed.changePurpose ? `
                        <div class="p-4 bg-white rounded-lg mb-6 border"> <!-- Slightly different bg for section clarity -->
                            <h3 class="text-sm font-bold text-gray-800 mb-2 border-b pb-1">변경 목적</h3>
                            <p class="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">${feed.changePurpose}</p>
                        </div>
                    ` : ''}

                    <!-- 6. Additional Media (L-열 Video, K-열 Images) -->
                    <div class="mb-6 space-y-6">
                        ${videoPreviewHtml}
                        ${otherImagesHtml}
                    </div>

                    <!-- 7. Insight (I-열) [수정] 스타일 적용 및 이모지 제거 -->
                    ${feed.insight ? `
                        <hr class="my-6 border-gray-200">
                        <div class="p-4 bg-white rounded-lg mb-6 border"> <!-- Apply same style as Change Purpose -->
                            <!-- [수정] 이모지 제거 -->
                            <p class="text-sm font-bold text-gray-700 mb-2 border-b pb-1">한 줄 시사점:</p>
                            <p class="text-sm text-gray-800 leading-relaxed">${feed.insight}</p>
                        </div>
                    ` : ''}

                    <!-- 8. Reviews (Default Expanded) -->
                    ${reviewHtml}
                </div>
            `;
        }


        // 피드 UI 초기화 ('더보기' 버튼 표시 여부)
        function initializeFeedUI() {
             document.querySelectorAll('#feeds-list .feed-card').forEach(feedElement => {
                const feedId = feedElement.getAttribute('data-feed-id');
                const contentContainer = document.getElementById(`content-${feedId}`);
                const buttonWrapper = feedElement.querySelector('.content-toggle-button-wrapper');
                const updateContentBody = document.getElementById(`update-content-body-${feedId}`);

                if (!updateContentBody) return;

                // [수정됨] 6줄 높이 계산 (9rem)
                const maxInitialHeight = 144; // 9rem (16px * 9)
                const fullHeight = updateContentBody.scrollHeight;
                const feed = allFeedData[feedId];

                // H, J/K(이미지 1개 초과), L열 중 하나라도 있거나 G열이 6줄을 넘으면 '더보기' 표시
                const shouldShowMoreButton = feed?.changePurpose || feed?.imageUrls?.length > 1 || feed?.videoUrl || fullHeight > maxInitialHeight;

                if (shouldShowMoreButton) {
                    if (buttonWrapper) buttonWrapper.style.display = 'flex';
                } else {
                    if (buttonWrapper) buttonWrapper.style.display = 'none';
                }
            });
        }

        // 회사 태그 클라우드 렌더링
        function renderCompanyTags(feeds) {
            const tagContainer = document.getElementById('company-tag-cloud');
            if (!tagContainer) return;

            const companies = new Set(feeds.map(feed => feed.company).filter(Boolean));
            tagContainer.innerHTML = Array.from(companies).map(company => {
                const styling = getCompanyStyling(company);
                const isActive = currentFilter.companyTag === company ? 'active' : '';
                return `
                    <button class="company-tag ${styling.tag} ${isActive}"
                            data-company="${company}"
                            onclick="handleCompanyTagClick(event, '${company}')">
                        #${company}
                    </button>
                `;
            }).join('');
        }

        // 날짜 파싱 함수 (YYYY년 MM월 DD일)
        function parseDate(dateStr) {
            const match = dateStr.match(/(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/);
            if (match) {
                // 월은 0부터 시작하므로 -1
                return new Date(match[1], match[2] - 1, match[3]);
            }
            // 형식이 맞지 않으면 유효하지 않은 날짜 반환
            return new Date('invalid');
        }

        // --- [복구] 로그인/가입 관련 함수 ---
        
        // 메뉴 토글
        function toggleMenu() {
            const menu = document.getElementById('auth-menu');
            if (menu) {
                menu.classList.toggle('hidden');
            }
        }
        
        // 가입 성공 메시지 렌더링
        function renderSignupSuccessMessage() {
            const messageEl = document.getElementById('signup-status-message');
            if (!messageEl) return;
            
            if (mockUser.isLoggedIn) {
                messageEl.innerHTML = `
                    <div class="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-lg" role="alert">
                        <p class="font-bold">환영합니다, ${mockUser.nickname}님!</p>
                        <p class="text-sm">(${mockUser.company} / ${mockUser.job}) 정보로 가입되었습니다.</p>
                    </div>
                `;
                messageEl.classList.remove('hidden');
            } else {
                messageEl.innerHTML = '';
                messageEl.classList.add('hidden');
            }
        }
        
        // 메뉴 아이템 렌더링 (로그인/로그아웃)
        function renderAuthMenu() {
            const menuItems = document.getElementById('auth-menu-items');
            if (!menuItems) return;
            
            if (mockUser.isLoggedIn) {
                menuItems.innerHTML = `
                    <a href="#" onclick="handleAuthAction('logout')" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">로그아웃</a>
                `;
            } else {
                menuItems.innerHTML = `
                    <a href="#" onclick="handleAuthAction('login')" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">로그인</a>
                    <a href="#" onclick="handleAuthAction('join')" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">회원가입</a>
                `;
            }
        }
        
        // 인증 액션 핸들러
        function handleAuthAction(action) {
            toggleMenu(); // 메뉴 닫기
            if (action === 'login') {
                showLoginModal();
            } else if (action === 'join') {
                showSignupView();
            } else if (action === 'logout') {
                mockUser = { isLoggedIn: false, nickname: '', company: '', job: '' };
                renderApp(); // 앱 UI 새로고침
            }
        }

        // 가입 처리
        function handleSignup(event) {
            event.preventDefault();
            const nickname = document.getElementById('nickname').value;
            const company = document.getElementById('company').value;
            const job = document.getElementById('job').value;

            if (!nickname || !company || !job) {
                alert('모든 항목을 입력해주세요.');
                return;
            }
            
            mockUser = {
                isLoggedIn: true,
                nickname: nickname,
                company: company,
                job: job
            };
            
            // 폼 초기화
            document.getElementById('signup-form').reset();
            
            // 메인 뷰로 돌아가기 및 UI 새로고침
            showFeedList();
            renderApp();
        }

        // [복구] 리뷰 등록 버튼 핸들러 (로그인 확인)
        function handleReviewSubmit() {
            if (!mockUser.isLoggedIn) {
                showLoginModal();
                return;
            }
            // 실제 등록 로직 (현재는 모의)
            alert('✅ 리뷰가 등록되었습니다! (모의)');
        }
        
        // [복구] 앱 상태 새로고침
        function renderApp() {
            renderSignupSuccessMessage();
            renderAuthMenu();
        }


        // --- 데이터 로딩 (AppSheet) ---
        async function fetchFeedData() {
            // [수정됨] 로딩 스피너 null 체크
            const spinner = document.getElementById('loading-spinner');
            if (spinner) spinner.style.display = 'flex';

            const feedList = document.getElementById('feeds-list');
            if (feedList) feedList.innerHTML = '';

            try {
                const response = await fetch(BASE_URL);
                if (!response.ok) throw new Error(`Google Sheets API Error: ${response.statusText}`);

                const data = await response.json();
                if (!data.values || data.values.length < 2) throw new Error("시트에 데이터가 없습니다.");

                let processedFeeds = data.values.slice(1).map((row, index) => {
                    const company = (row[0] || 'Unknown').trim();
                    const service = (row[1] || 'Service').trim();
                    // [수정됨] feedId에 "feed-" 접두사 추가 (id 속성 중복 방지)
                    const feedId = `feed-${company}${service}${index}`;
                    const serviceKey = `${company}_${service}`; // 히스토리용 키

                    const tags = [row[2], row[3]].filter(Boolean).map(t => t.trim()); // C, D열
                    const imageUrls = [row[9], row[10]].filter(Boolean).map(url => url.trim()); // J, K열

                    return {
                        id: feedId,
                        reviewKey: company, // 리뷰 키 (A열)
                        serviceKey: serviceKey, // 히스토리 키
                        company: company, // A
                        service: service, // B
                        date: row[4] || '날짜 미정', // E (정렬 키)
                        title: row[5] || '제목 없음', // F
                        updateContent: row[6] || '', // G
                        changePurpose: row[7] || '', // H
                        insight: row[8] || '', // I
                        videoUrl: (row[11] && row[11].trim()) ? row[11].trim() : null, // L
                        // [추가됨] N열(인덱스 13) AI 여부
                        isAI: (row[13] || '').trim().toLowerCase() === 'ai',
                        tags: tags,
                        imageUrls: imageUrls,
                        rowIndex: index // Sheets 순서
                    };
                });

                // 데이터 입력 순서의 역순으로 정렬 (가장 마지막 row가 맨 위로 오도록)
                processedFeeds.sort((a, b) => b.rowIndex - a.rowIndex);

                // 글로벌 데이터 저장소 업데이트
                allFeedData = {};
                processedFeeds.forEach(feed => {
                    allFeedData[feed.id] = feed;
                });

                // 타임라인 데이터 그룹화 (정렬된 상태로 그룹화됨 - 최신순)
                allTimelineData = {};
                processedFeeds.forEach(feed => {
                    if (!allTimelineData[feed.serviceKey]) {
                        allTimelineData[feed.serviceKey] = [];
                    }
                    allTimelineData[feed.serviceKey].push(feed);
                });


                renderFeeds(processedFeeds);

            } catch (error) {
                console.error("데이터 로딩 실패:", error);
                // [수정됨] feedList null 체크
                if (feedList) {
                    feedList.innerHTML = `
                        <div class="text-center p-10 bg-red-100 text-red-700 rounded-lg">
                            <p class="font-bold">⚠️ 피드 로딩 실패!</p>
                            <p class="text-sm">Google Sheets API 또는 네트워크 연결을 확인해주세요.</p>
                            <p class="text-xs mt-2">오류: ${error.message}</p>
                        </div>
                    `;
                }
            } finally {
                // [수정됨] 로딩 스피너 null 체크
                if (spinner) spinner.style.display = 'none';
            }
        }

        // --- 피드 렌더링 ---
        function renderFeeds(feeds) {
            const feedListElement = document.getElementById('feeds-list');
            // [수정됨] feedListElement null 체크
            if (!feedListElement) return;

            feedListElement.innerHTML = '';

            if (!feeds || feeds.length === 0) {
                 feedListElement.innerHTML = `<div class="text-center p-10 bg-yellow-100 text-yellow-700 rounded-lg"><p class="font-bold">표시할 피드 데이터가 없습니다.</p></div>`;
                 return;
            }

            feeds.forEach(feed => {
                const styling = getCompanyStyling(feed.company);
                const tagHtml = feed.tags.map(tag => `<span class="tag ${styling.tag}">#${tag}</span>`).join('');

                // 미디어: 첫 번째 이미지만 표시
                const currentImageUrl = feed.imageUrls[0] || '';
                let mediaHtml = currentImageUrl ? `
                    <div class="mb-4 rounded-lg overflow-hidden border border-gray-200 relative">
                        <img src="${currentImageUrl}"
                             alt="${feed.title} 이미지" class="feed-image"
                             onerror="this.onerror=null; this.src='https://placehold.co/600x300/e5e7eb/374151?text=No+Image'"
                             onclick="openImageViewer(this)" loading="lazy">
                    </div>
                ` : `<div class="mb-4 text-center p-8 text-gray-400 border border-gray-200 rounded-lg">첨부된 이미지가 없습니다.</div>`;

                // [수정] 피드 목록에서 리뷰 HTML 생성
                const reviewHtml = getReviewHtml(feed.reviewKey, feed.id, false);


                const cardHtml = `
                    <!-- 피드 카드에 ID 추가 -->
                    <div class="bg-white p-6 rounded-xl shadow-lg border border-gray-100 feed-card"
                         data-feed-id="${feed.id}"
                         id="${feed.id}">

                        <!-- [수정됨] 프로필 (아이콘 변경 및 이동) -->
                        <div class="flex items-center justify-between border-b border-gray-200 pb-4 mb-4">
                            <!-- 좌측: 프로필 (히스토리 클릭) -->
                            <div class="flex items-center cursor-pointer hover:opacity-75 transition-opacity"
                                 onclick="showTimelineView('${feed.serviceKey}', '${feed.company} _ ${feed.service}')">
                                <div class="w-10 h-10 ${styling.bg} rounded-full flex items-center justify-center text-white text-xl font-bold mr-3">${styling.icon}</div>
                                <div>
                                    <p class="font-semibold text-gray-800">
                                        ${feed.company} _ ${feed.service}
                                        <span class="text-indigo-600 text-xs font-bold ml-1 align-middle leading-none">히스토리 ></span>
                                    </p>
                                    <p class="text-xs text-gray-500">${feed.date} 업데이트</p>
                                </div>
                            </div>

                            <!-- [수정됨] 우측: 회전된 와이파이 아이콘 (주황색 토글) -->
                            <svg onclick="handleRadarClick(this)"
                                 class="w-6 h-6 radar-icon transform rotate-45"
                                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856a9.75 9.75 0 0113.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12 20.25a.75.75 0 100-1.5.75.75 0 000 1.5z"/>
                            </svg>
                        </div>

                        <!-- 제목 (F열) -->
                        <div class="flex justify-between items-start mb-2">
                            <h2 class="text-xl font-bold text-gray-900 leading-tight pr-4">${feed.title}</h2>
                        </div>

                        <!-- 태그 (C, D열) -->
                        <div class="flex justify-end mb-4">${tagHtml}</div>
                        <!-- 미디어 (J열 이미지) -->
                        ${mediaHtml}

                        <!-- [수정됨] G열 내용 (6줄 제한) -->
                        <div id="content-${feed.id}" class="content-container">
                            <div id="update-content-body-${feed.id}">
                                <p class="text-left text-gray-700 text-sm mb-2 leading-relaxed whitespace-pre-wrap">${feed.updateContent}</p>
                            </div>
                        </div>

                        <!-- [수정] 더보기 버튼 (페이지 전환) -->
                        <div class="flex justify-end items-center mt-1 content-toggle-button-wrapper" style="display: none;">
                            <button onclick="showDetailView('${feed.id}')"
                                    class="text-indigo-500 hover:text-indigo-600 font-semibold text-sm">
                                더보기
                            </button>
                        </div>

                        <!-- '더보기' 상세 영역 (제거됨) -->

                        <!-- 한 줄 시사점 (I열) -->
                        ${feed.insight ? `
                            <hr class="my-4 border-gray-200">
                            <div class="p-3 bg-transparent rounded-lg">
                                <p class="text-sm font-bold text-gray-700 mb-1">한 줄 시사점:</p> <!-- 이모지 제거 -->
                                <p class="text-sm text-gray-800">${feed.insight}</p>
                            </div>
                        ` : ''}

                        <!-- [수정] 피드 목록 리뷰 요약 표시 -->
                        ${reviewHtml}
                    </div>
                `;
                feedListElement.insertAdjacentHTML('beforeend', cardHtml);
            });

            // UI 초기화 및 필터링
            initializeFeedUI();
            renderCompanyTags(feeds);
            filterFeeds();
        }

        // --- 초기 로딩 ---
        window.onload = () => {
             // 1. 이벤트 리스너 간소화 (null 체크 추가)
            const imageViewer = document.getElementById('image-viewer');
            if (imageViewer) {
                imageViewer.addEventListener('click', (e) => {
                    if (e.target.id === 'image-viewer') closeImageViewer();
                });
            }

            // 로그인 모달 닫기
            const loginModal = document.getElementById('login-required-modal');
            if (loginModal) {
                loginModal.addEventListener('click', (e) => {
                    if (e.target.id === 'login-required-modal') closeLoginModal();
                });
            }

            // [추가됨] 레이더 알림 모달 닫기
            const radarModal = document.getElementById('radar-alert-modal');
            if (radarModal) {
                radarModal.addEventListener('click', (e) => {
                    if (e.target.id === 'radar-alert-modal') closeRadarModal();
                });
            }

            // [수정됨] 검색 입력 리스너 추가 (null 체크 포함)
            const searchInput = document.getElementById('search-input');
            if (searchInput) {
                searchInput.addEventListener('input', handleSearchInput);
            }
            
            // [복구] 가입 폼 이벤트 리스너
            const signupForm = document.getElementById('signup-form');
            if (signupForm) {
                signupForm.addEventListener('submit', handleSignup);
            }

            // [복구] 앱 상태 초기 렌더링
            renderApp();
            
            // 2. 비동기 데이터 로딩 시작 (페이지 렌더링을 막지 않음)
            fetchFeedData();
        };
    </script>
</head>
<body class="p-4 md:p-8">

    <!-- 이미지 뷰어 모달 -->
    <div id="image-viewer" onclick="closeImageViewer()">
        <span id="close-btn" class="hover:text-gray-300">&times;</span>
        <img id="viewer-image" src="" alt="확대 이미지">
    </div>

    <!-- 로그인 필요 모달 -->
    <div id="login-required-modal">
        <div class="bg-white p-8 rounded-xl shadow-2xl max-w-sm w-full mx-4" onclick="event.stopPropagation()">
            <div class="text-center">
                <svg class="w-16 h-16 text-indigo-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                <h3 class="text-lg font-bold text-gray-900 mb-2">알림</h3>
                <p class="text-gray-600 mb-6">로그인 후 이용해주세요.</p>
                <button onclick="closeLoginModal()"
                        class="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors">
                    확인
                </button>
            </div>
        </div>
    </div>

    <!-- [추가됨] 레이더 클릭 알림 모달 -->
    <div id="radar-alert-modal">
        <div class="bg-white p-8 rounded-xl shadow-2xl max-w-sm w-full mx-4" onclick="event.stopPropagation()">
            <div class="text-center">
                <!-- 아이콘 🛰️ 이모지 -->
                <span class="text-5xl" role="img" aria-label="satellite">🛰️</span>
                <h3 class="text-lg font-bold text-gray-900 mt-4 mb-2">알림</h3>
                <p class="text-gray-600 mb-6">서비스 업데이트 탐지를 시작합니다.</p>
                <button onclick="closeRadarModal()"
                        class="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors">
                    확인
                </button>
            </div>
        </div>
    </div>

    <!-- 로딩 스피너 -->
    <div id="loading-spinner" class="fixed inset-0 flex items-center justify-center bg-white z-50">
        <div class="spinner"></div>
        <p class="ml-3 text-gray-600">피드를 불러오는 중...</p>
    </div>

    <!-- 메인 뷰 (단일 뷰) -->
    <div id="main-view">
        <!-- [복구] 헤더 (햄버거 메뉴 포함) -->
        <header class="mb-6 relative max-w-3xl mx-auto"> <!-- 너비 변경 -->
            <div class="flex justify-center items-center relative pt-4">
                <!-- 제목 -->
                <div class="text-center">
                    <h1 class="text-2xl font-extrabold text-gray-800 mb-2">
                        <span class="mr-2 text-indigo-600">📡</span>Launched Detected
                    </h1>
                </div>
                
                <!-- [복구] 햄버거 메뉴 -->
                <div class="absolute top-4 right-0">
                    <button onclick="toggleMenu()" class="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
                    </button>
                    <!-- 드롭다운 메뉴 -->
                    <div id="auth-menu" class="hidden absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20">
                        <div id="auth-menu-items" class="py-1">
                            <!-- JS가 로그인/회원가입/로그아웃 메뉴를 여기에 삽입 -->
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- [복구] 가입 성공 메시지 표시 영역 -->
            <div id="signup-status-message" class="mt-4 hidden"></div>
        </header>

        <main class="max-w-3xl mx-auto"> <!-- 너비 변경 -->

            <!-- [수정됨] 검색 및 태그 필터 -->
            <div class="space-y-3 mb-2">
                <!-- [수정됨] 검색창 + AI 필터 Flex 컨테이너 -->
                <div class="flex items-center gap-3">
                    <!-- [수정됨] 검색창 (너비 가변) -->
                    <div class="relative flex-grow">
                        <input type="text" id="search-input"
                               placeholder="피드 검색 (제목, 내용, 시사점 포함)"
                               class="w-full p-3 pl-10 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 shadow-sm text-sm">
                        <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </div>
                    <!-- [추가됨] AI 클릭 버튼 -->
                    <button id="ai-filter-button"
                            onclick="handleAiFilterToggle(this)"
                            class="">
                        AI ✨
                    </button>
                </div>

                <!-- 회사명 태그 클라우드 -->
                <div id="company-tag-cloud-wrapper" class="w-full">
                    <div id="company-tag-cloud" class="flex gap-2 w-max">
                        <!-- 동적 태그 삽입 영역 -->
                    </div>
                </div>
            </div>

            <!-- 피드 카드 목록 -->
            <div id="feeds-list" class="space-y-8">
                <!-- 피드 카드 또는 로딩 스피너/에러가 여기에 삽입됩니다 -->
            </div>

        </main>
        <footer class="text-center text-sm text-gray-400 mt-10 p-4">
            &copy; 2025 IT Service Update Feed
        </footer>
    </div>

    <!-- [복구됨] 타임라인 뷰 -->
    <section id="timeline-view" class="hidden max-w-3xl mx-auto p-4 md:p-8"> <!-- 너비 변경 -->
        <!-- [수정됨] 헤더 레이아웃 변경 -->
        <header class="mb-4 pb-4 border-b">
            <button onclick="showFeedList()" class="text-indigo-600 hover:text-indigo-800 font-semibold text-sm">
                &larr; 피드 목록으로 돌아가기
            </button>
        </header>

        <!-- [수정됨] 서비스명 제목을 돌아가기 버튼 다음 줄로 이동 -->
        <h2 id="timeline-header-title" class="text-2xl font-bold text-gray-900 my-6">
            <!-- JavaScript가 여기에 제목을 삽입합니다 -->
        </h2>

        <div id="timeline-content" class="space-y-6">
            <!-- 타임라인 컨텐츠 동적 삽입 -->
        </div>
    </section>

    <!-- [추가됨] 상세 페이지 뷰 -->
    <section id="detail-view" class="hidden max-w-3xl mx-auto p-4 md:p-8"> <!-- 너비 변경 -->
        <header class="mb-4 pb-4 border-b">
            <button onclick="showFeedList()" class="text-indigo-600 hover:text-indigo-800 font-semibold text-sm">
                &larr; 피드 목록으로 돌아가기
            </button>
        </header>

        <div id="detail-content" class="mt-6">
            <!-- JavaScript가 여기에 상세 피드 내용을 삽입합니다. -->
        </div>
    </section>
    
    <!-- [복구됨] 회원가입 뷰 -->
    <section id="signup-view" class="hidden max-w-3xl mx-auto p-4 md:p-8">
        <header class="mb-4 pb-4 border-b">
            <button onclick="showFeedList()" class="text-indigo-600 hover:text-indigo-800 font-semibold text-sm">
                &larr; 피드 목록으로 돌아가기
            </button>
        </header>
        
        <div class="mt-6 bg-white p-8 rounded-xl shadow-lg">
            <h2 class="text-2xl font-bold text-gray-900 mb-6">회원가입</h2>
            <form id="signup-form" class="space-y-4">
                <div>
                    <label for="nickname" class="block text-sm font-medium text-gray-700">닉네임</label>
                    <input type="text" id="nickname" name="nickname" required
                           class="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                </div>
                <div>
                    <label for="company" class="block text-sm font-medium text-gray-700">회사명</label>
                    <input type="text" id="company" name="company" required
                           class="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                </div>
                <div>
                    <label for="job" class="block text-sm font-medium text-gray-700">직무</label>
                    <select id="job" name="job" required
                            class="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white">
                        <option value="">직무를 선택하세요</option>
                        <option value="기획">기획</option>
                        <option value="사업">사업</option>
                        <option value="개발">개발</option>
                        <option value="디자인">디자인</option>
                        <option value="스탭">스탭</option>
                        <option value="기타">기타</option>
                    </select>
                </div>
                <button type="submit" 
                        class="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors">
                    가입하기
                </button>
            </form>
        </div>
    </section>

</body>
</html>
