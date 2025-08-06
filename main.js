const CORS_PROXY_URL = 'https://cors.timie.workers.dev/?url=';
const API_URL = 'https://iptv.hangtruyen.net/';

// Hàm gọi API và xử lý dữ liệu với CORS Proxy
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

// Hàm render danh sách truyện
function renderComics(containerId, comics) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = ''; // Xóa nội dung cũ
    comics.forEach(comic => {
        const comicItem = document.createElement('div');
        comicItem.className = 'comic-item';
        // Sử dụng encodeURIComponent để mã hóa các tham số URL
        const comicUrl = `comic-detail.html?id=${encodeURIComponent(comic.id)}&url=${encodeURIComponent(comic.remote_data.url)}`;
        comicItem.innerHTML = `
            <a href="${comicUrl}">
                <img src="${comic.image.url}" alt="${comic.name}">
                <p>${comic.name}</p>
            </a>
        `;
        container.appendChild(comicItem);
    });
}

// Hàm tải dữ liệu trang chủ
async function loadHomePage() {
    const data = await fetchData(API_URL);

    if (data && data.groups) {
        // Lấy dữ liệu cho "Top thịnh hành"
        const popularGroup = data.groups.find(group => group.id === 'popular');
        if (popularGroup && popularGroup.channels) {
            renderComics('popularComicsList', popularGroup.channels);
        }

        // Lấy dữ liệu cho "Truyện đã hoàn thành"
        const completedGroup = data.groups.find(group => group.id === 'completed');
        if (completedGroup && completedGroup.channels) {
            renderComics('completedComicsList', completedGroup.channels);
        }
    }
}

// Xử lý tìm kiếm khi click nút
document.getElementById('searchButton').addEventListener('click', async () => {
    const query = document.getElementById('searchInput').value.trim();
    if (query) {
        // Xây dựng URL tìm kiếm
        const searchUrl = `${API_URL}truyen-tranh/search?q=${encodeURIComponent(query)}`;
        const searchData = await fetchData(searchUrl);

        // Xóa kết quả tìm kiếm cũ nếu có
        const oldResultsSection = document.getElementById('searchResultsSection');
        if (oldResultsSection) {
            oldResultsSection.remove();
        }

        // Tạo và hiển thị kết quả tìm kiếm mới
        const resultsSection = document.createElement('section');
        resultsSection.id = 'searchResultsSection';
        resultsSection.innerHTML = `<h2>Kết quả tìm kiếm cho "${query}"</h2>`;
        
        const resultsList = document.createElement('div');
        resultsList.className = 'comic-list horizontal-scroll';
        resultsList.id = 'searchResultsList';
        resultsSection.appendChild(resultsList);

        document.querySelector('main').prepend(resultsSection);
        
        if (searchData && searchData.channels && searchData.channels.length > 0) {
            renderComics('searchResultsList', searchData.channels);
        } else {
            resultsList.innerHTML = '<p>Không tìm thấy kết quả nào phù hợp.</p>';
        }
    }
});

// Tải trang chủ khi trang được load
window.addEventListener('load', loadHomePage);
