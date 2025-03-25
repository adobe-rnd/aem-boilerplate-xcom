export default function decorate(block) {
  // Get block properties from first rows
  const [layoutRow, columnsRow] = block.children;
  const layout = layoutRow?.querySelector('div > div')?.textContent?.trim() || 'grid';
  const rawColumns = parseInt(columnsRow?.querySelector('div > div')?.textContent?.trim(), 10) || 3;
  // Enforce min/max constraints for columns
  const columns = Math.min(Math.max(rawColumns, 1), 6);

  // Create gallery container
  const gallery = document.createElement('div');
  gallery.className = 'image-gallery';
  gallery.dataset.layout = layout;
  // Set CSS variable for columns
  gallery.style.setProperty('--columns', columns);

  // Create grid container
  const grid = document.createElement('div');
  grid.className = 'gallery-grid';
  grid.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;

  // Create lightbox container
  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  lightbox.innerHTML = `
    <div class="lightbox-content">
      <span class="close">&times;</span>
      <img src="" alt="">
      <div class="lightbox-caption"></div>
      <button class="prev">&lt;</button>
      <button class="next">&gt;</button>
    </div>
  `;

  // Get all gallery image blocks (excluding the first two rows which are settings)
  const images = [...block.children].slice(2);

  // Process each gallery image block
  images.forEach((imageBlock, index) => {
    const img = imageBlock.querySelector('img');
    const alt = imageBlock.querySelector('div:nth-child(2)')?.textContent || '';
    const caption = imageBlock.querySelector('div:nth-child(3)')?.textContent || '';

    // Move the gallery image block to the grid
    grid.appendChild(imageBlock);

    // Add click handler for lightbox if there's an image
    if (img) {
      imageBlock.addEventListener('click', () => {
        lightbox.querySelector('img').src = img.src;
        lightbox.querySelector('img').alt = alt;
        lightbox.querySelector('.lightbox-caption').textContent = caption;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
      });
    }
  });

  // Add carousel navigation if layout is carousel
  if (layout === 'carousel') {
    const prevButton = document.createElement('button');
    prevButton.className = 'carousel-nav prev';
    prevButton.innerHTML = '&lt;';
    prevButton.addEventListener('click', () => {
      const itemWidth = grid.offsetWidth / columns;
      grid.scrollBy({
        left: -itemWidth,
        behavior: 'smooth'
      });
    });

    const nextButton = document.createElement('button');
    nextButton.className = 'carousel-nav next';
    nextButton.innerHTML = '&gt;';
    nextButton.addEventListener('click', () => {
      const itemWidth = grid.offsetWidth / columns;
      grid.scrollBy({
        left: itemWidth,
        behavior: 'smooth'
      });
    });

    gallery.appendChild(prevButton);
    gallery.appendChild(nextButton);
  }

  // Add navigation handlers
  let currentIndex = 0;
  const prevButton = lightbox.querySelector('.prev');
  const nextButton = lightbox.querySelector('.next');
  const closeButton = lightbox.querySelector('.close');

  function updateLightboxImage() {
    const img = images[currentIndex].querySelector('img');
    const alt = images[currentIndex].querySelector('div:nth-child(2)')?.textContent || '';
    const caption = images[currentIndex].querySelector('div:nth-child(3)')?.textContent || '';
    if (img) {
      lightbox.querySelector('img').src = img.src;
      lightbox.querySelector('img').alt = alt;
      lightbox.querySelector('.lightbox-caption').textContent = caption;
    }
  }

  prevButton.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    updateLightboxImage();
  });

  nextButton.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % images.length;
    updateLightboxImage();
  });

  closeButton.addEventListener('click', () => {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  });

  // Close lightbox when clicking outside
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    }
  });

  // Add keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    
    if (e.key === 'ArrowLeft') {
      currentIndex = (currentIndex - 1 + images.length) % images.length;
      updateLightboxImage();
    } else if (e.key === 'ArrowRight') {
      currentIndex = (currentIndex + 1) % images.length;
      updateLightboxImage();
    } else if (e.key === 'Escape') {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    }
  });

  gallery.appendChild(grid);
  gallery.appendChild(lightbox);
  block.innerHTML = '';
  block.appendChild(gallery);
} 