const CORS_PROXY_URL = 'https://cors.timie.workers.dev/?url=';

// Hàm gọi API với CORS Proxy
async function fetchData(url) {
    const proxyUrl = CORS_PROXY_URL + encodeURIComponent(url);
    try {
        const response = await fetch(proxyUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Lỗi khi gọi API:", error);
    }
}

// Hàm lấy tham số từ URL
function getUrlParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Hàm render danh sách chương
function renderChapters(containerId, contents) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = ''; // Xóa nội dung cũ
    contents.forEach(group => {
        if (group.streams && group.streams.length > 0) {
            const groupTitle = document.createElement('h3');
            groupTitle.textContent = group.name;
            container.appendChild(groupTitle);

            const chapterList = document.createElement('ul');
            chapterList.className = 'chapter-list';
            
            group.streams.forEach(chapter => {
                const chapterItem = document.createElement('li');
                // Tạo link đến trang đọc truyện, truyền URL của chapter
                chapterItem.innerHTML = `<a href="chapter-reader.html?url=${encodeURIComponent(chapter.remote_data.url)}">${chapter.name}</a>`;
                chapterList.appendChild(chapterItem);
            });
            container.appendChild(chapterList);
        }
    });
}

// Hàm tải dữ liệu chi tiết truyện
async function loadComicDetail() {
    const comicUrl = getUrlParam('url');
    if (!comicUrl) {
        document.getElementById('comicDetailContainer').innerHTML = '<p>Không tìm thấy URL truyện.</p>';
        return;
    }

    const comicData = await fetchData(comicUrl);

    if (comicData) {
        document.getElementById('comic-image').src = comicData.image.url;
        document.getElementById('comic-title').textContent = comicData.name;
        document.getElementById('comic-description').innerHTML = comicData.description;
        document.getElementById('comic-subtitle').textContent = comicData.subtitle;

        // Xử lý render danh sách các tags
        const tagsContainer = document.getElementById('comic-tags');
        if (tagsContainer) {
            tagsContainer.innerHTML = '';
            comicData.tags.forEach(tag => {
                const tagSpan = document.createElement('span');
                tagSpan.className = 'tag';
                tagSpan.textContent = tag.text;
                tagsContainer.appendChild(tagSpan);
            });
        }
        
        // Render danh sách chương
        if (comicData.sources && comicData.sources.length > 0) {
            renderChapters('chapterList', comicData.sources[0].contents);
        }
    } else {
        document.getElementById('comicDetailContainer').innerHTML = '<p>Không thể tải dữ liệu truyện.</p>';
    }
}

// Tải dữ liệu khi trang được load
window.addEventListener('load', loadComicDetail);
