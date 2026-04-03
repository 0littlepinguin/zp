document.addEventListener('DOMContentLoaded', () => {
    const views = document.querySelectorAll('.view');
    const quoteView = document.getElementById('quote-view');
    const quoteTextElement = quoteView.querySelector('.quote-text');
    const photoGalleryView = document.getElementById('photo-gallery-view');
    const seriesTitleCnEl = document.getElementById('series-title-cn');
    const seriesTitleEnEl = document.getElementById('series-title-en');
    const seriesUnderstandingEl = document.getElementById('series-understanding');
    const photoGrid = photoGalleryView.querySelector('.photo-grid');

    const seriesData = [
        {
            id: 'to-see',
            folder: 'ToSeeWithCare',
            titleCn: '用心看',
            titleEn: 'To See, With Care',
            quoteLines: [
                '看见并不是自然发生的，而是一种选择。摄影不是占有瞬间，而是回应世界。'
            ],
            understandingLines: [
                '看见并不是自然发生的，而是一种选择。摄影不是占有瞬间，而是回应世界。'
            ],
        },
        {
            id: 'to-be-seen',
            folder: 'ToBeSeen',
            titleCn: '被看见的人',
            titleEn: 'To Be Seen',
            quoteLines: [
                '有些人并不是被我“捕捉”的，而是主动走进镜头。',
                '在这组系列中，被拍者让我意识到摄影更多面的力量。',
                '摄影并不只属于摄影者，它也会在他人的生活中继续发生。',
                '被看见，有时本身就是一种意义。',
            ],
            understandingLines: [
                '有些人并不是被我“捕捉”的，而是主动走进镜头。',
                '在这组系列中，被拍者让我意识到摄影更多面的力量。',
                '摄影并不只属于摄影者，它也会在他人的生活中继续发生。',
                '被看见，有时本身就是一种意义。',
            ],
        },
        {
            id: 'children',
            folder: 'ChildrenEverywhere',
            titleCn: '孩童',
            titleEn: 'Children, Everywhere',
            quoteLines: [
                '在不同的语言与文化中，孩童却以近乎相同的方式存在。',
                '他们尚未被完全塑形，因此更接近一种直接而真实的生命力。',
                '透过他们，我看见一种跨越文化的共通经验。',
            ],
            understandingLines: [
                '在不同的语言与文化中，孩童却以近乎相同的方式存在。他们尚未被完全塑形，因此更接近一种直接而真实的生命力。透过他们，我看见一种跨越文化的共通经验。',
            ],
        },
        {
            id: 'being-in-the-world',
            folder: 'BeingintheWorld',
            titleCn: '在世界之中',
            titleEn: 'Being in the World',
            quoteLines: [
                '摄影就是生命。',
                '眼睛是一种取景器，摄影是一种筛选和强调，但它有更长远的力量。',
            ],
            understandingLines: [
                '摄影就是生命。',
                '眼睛是一种取景器，摄影是一种筛选和强调，但它有更长远的力量。',
            ],
        },
    ];

    const seriesById = new Map(seriesData.map(s => [s.id, s]));

    let currentSeriesId = '';
    let quoteTimer = null;
    const IMAGE_EXTS = ['jpg', 'JPG', 'jpeg', 'JPEG'];

    function setAriaHiddenForViews(activeId) {
        views.forEach(v => {
            const isActive = v.id === activeId;
            v.setAttribute('aria-hidden', String(!isActive));
        });
    }

    function setQuoteLines(lines) {
        quoteTextElement.innerHTML = '';
        lines.forEach((line) => {
            const p = document.createElement('p');
            p.textContent = line;
            quoteTextElement.appendChild(p);
        });
    }

    function setUnderstandingLines(lines) {
        seriesUnderstandingEl.innerHTML = '';
        lines.forEach((line) => {
            const p = document.createElement('p');
            p.textContent = line;
            seriesUnderstandingEl.appendChild(p);
        });
    }

    window.navigateTo = (viewId, seriesId = null) => {
        if (quoteTimer) {
            clearTimeout(quoteTimer);
            quoteTimer = null;
        }

        views.forEach(view => view.classList.remove('active'));
        const targetView = document.getElementById(viewId);
        if (targetView) {
            targetView.classList.add('active');
        }
        setAriaHiddenForViews(viewId);

        if (viewId === 'quote-view' && seriesId) {
            currentSeriesId = seriesId;
            const data = seriesById.get(seriesId);
            if (data) {
                setQuoteLines(data.quoteLines);
                quoteTimer = setTimeout(() => {
                    navigateTo('photo-gallery-view', seriesId);
                }, 3000);
            }
        } else if (viewId === 'photo-gallery-view' && seriesId) {
            loadPhotoGallery(seriesId);
        }
    };

    function loadNumberedImage({ folder, titleCn, number }) {
        return new Promise((resolve) => {
            const img = new Image();
            // 这里必须 eager：我们是“先加载成功再插入 DOM”，lazy 会导致后续图片不触发加载。
            img.loading = 'eager';
            img.decoding = 'async';
            img.alt = `${titleCn} - ${number}`;
            img.classList.add('gallery-photo');

            let extIdx = 0;
            const tryNextExt = () => {
                if (extIdx >= IMAGE_EXTS.length) {
                    resolve({ ok: false, img: null });
                    return;
                }
                const ext = IMAGE_EXTS[extIdx++];
                img.src = encodeURI(`./${folder}/${number}.${ext}`);
            };

            img.onload = () => resolve({ ok: true, img });
            img.onerror = () => tryNextExt();

            tryNextExt();
        });
    }

    function loadPhotoGallery(seriesId) {
        photoGrid.innerHTML = ''; // Clear previous photos
        const data = seriesById.get(seriesId);
        if (data) {
            seriesTitleCnEl.textContent = data.titleCn;
            seriesTitleEnEl.textContent = data.titleEn;
            setUnderstandingLines(data.understandingLines);

            (async () => {
                // 假设命名连续：1、2、3... 直到最大数字为止；遇到第一个缺失数字即停止。
                for (let i = 1; i < 1000; i += 1) {
                    // eslint-disable-next-line no-await-in-loop
                    const { ok, img } = await loadNumberedImage({
                        folder: data.folder,
                        titleCn: data.titleCn,
                        number: i,
                    });
                    if (!ok) break;
                    photoGrid.appendChild(img);
                }
            })();
        }
    }

    function setupOverviewCovers() {
        document.querySelectorAll('.gallery-item').forEach(item => {
            const seriesId = item.dataset.series;
            const data = seriesById.get(seriesId);
            const imgEl = item.querySelector('img');
            if (data && imgEl) {
                const candidates = IMAGE_EXTS.map(ext => encodeURI(`./${data.folder}/1.${ext}`));
                let idx = 0;
                imgEl.src = candidates[idx];
                imgEl.onerror = () => {
                    idx += 1;
                    if (idx < candidates.length) imgEl.src = candidates[idx];
                };
            }
        });
    }

    function activateSeriesFromItem(item) {
        const seriesId = item.dataset.series;
        if (!seriesById.has(seriesId)) return;
        navigateTo('quote-view', seriesId);
    }

    document.querySelectorAll('.gallery-item').forEach(item => {
        item.addEventListener('click', () => activateSeriesFromItem(item));
        item.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                activateSeriesFromItem(item);
            }
        });
    });

    // Image modal functionality
    const imageModal = document.createElement('div');
    imageModal.classList.add('image-modal');
    imageModal.setAttribute('role', 'dialog');
    imageModal.setAttribute('aria-modal', 'true');
    const modalImg = document.createElement('img');
    imageModal.appendChild(modalImg);
    document.body.appendChild(imageModal);

    photoGrid.addEventListener('click', (e) => {
        if (e.target.tagName === 'IMG') {
            modalImg.src = e.target.src;
            imageModal.classList.add('active');
        }
    });

    imageModal.addEventListener('click', () => {
        imageModal.classList.remove('active');
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            imageModal.classList.remove('active');
        }
    });

    setupOverviewCovers();

    // Initialize with home view
    navigateTo('home-view');
});