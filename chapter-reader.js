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

// Hàm tải và hiển thị nội dung chapter
async function loadChapter() {
    const chapterUrl = getUrlParam('url');
    if (!chapterUrl) {
        document.getElementById('chapter-reader-container').innerHTML = '<p>Không tìm thấy URL của chương.</p>';
        return;
    }

    // Hiển thị tên chapter dựa trên URL
    const chapterNameMatch = chapterUrl.match(/chapter-(\d+)/);
    if (chapterNameMatch) {
        document.getElementById('chapter-title').textContent = `Chapter ${chapterNameMatch[1]}`;
        document.title = `Đọc truyện - Chapter ${chapterNameMatch[1]}`;
    }

    const chapterData = await fetchData(chapterUrl);
    const imagesContainer = document.getElementById('comic-images-container');
    
    if (chapterData && chapterData.files && chapterData.files.length > 0) {
        imagesContainer.innerHTML = ''; // Xóa nội dung cũ
        chapterData.files.forEach(file => {
            const imgElement = document.createElement('img');
            imgElement.src = file.url;
            imgElement.alt = "Comic Page";
            imgElement.className = "comic-page-image";
            imagesContainer.appendChild(imgElement);
        });
    } else {
        imagesContainer.innerHTML = '<p>Không thể tải hình ảnh của chương này.</p>';
    }
}

// Tải dữ liệu khi trang được load
window.addEventListener('load', loadChapter);
