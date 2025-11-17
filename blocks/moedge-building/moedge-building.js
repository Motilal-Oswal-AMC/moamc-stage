import dataMapMoObj from '../../scripts/constant.js';

export default function decorate(block) {
  // --- 1. Add Indexed Classes ---
  dataMapMoObj.CLASS_PREFIXES = [
    'moedge-build-cont',
    'moedge-build-sec',
    'moedge-build-sub',
    'moedge-build-inner-text',
    'moedge-build-list',
    'moedge-build-list-content',
  ];
  dataMapMoObj.addIndexed(block);

  Array.from(block.children).forEach((container) => {
    if (container.querySelector('.moedge-build-sec4 .moedge-build-sub1')) {
      const txtletter = container
        .querySelector('.moedge-build-sec4');
      const txtdup = txtletter.textContent.trim();
      container.classList.add(txtdup);
      txtletter.remove();
    }
  });
  // --- 2. Wrap Sections ---
  // allCards is a NodeList of all card containers in this block
  const allCards = block.querySelectorAll(':scope > div[class*="moedge-build-cont"]');

  allCards.forEach((container) => {
    const sec1 = container.querySelector('.moedge-build-sec1');
    const sec2 = container.querySelector('.moedge-build-sec2');

    if (sec1 && sec2 && sec1.parentNode === sec2.parentNode) {
      const parent = sec1.parentNode;
      const wrapperDiv = document.createElement('div');
      wrapperDiv.classList.add('secs-wrapper');
      parent.insertBefore(wrapperDiv, sec1);
      wrapperDiv.appendChild(sec1);
      wrapperDiv.appendChild(sec2);
    }
  });

  // // --- 3. NEW "View All / View Less" Toggle Logic ---
  // const cardsToShowInitially = 9;
  // // -> Convert NodeList to Array to use array methods like .slice()
  // const allCardsArray = Array.from(allCards);

  // const buttonWrapper = block.parentElement.nextElementSibling;
  // const viewAllButton = buttonWrapper?.querySelector('a[title="View All"]');

  // // Check if a button exists and if toggling is needed
  // if (viewAllButton && allCardsArray.length > cardsToShowInitially) {
  //   // -> Store only the cards that need to be toggled
  //   const hiddenCards = allCardsArray.slice(cardsToShowInitially);

  //   // 1. Initially hide the extra cards
  //   hiddenCards.forEach((card) => {
  //     card.classList.add('hidden');
  //   });

  //   // 2. Accessibility: Control the list and set initial state
  //   const listId = block.id || `cards-list-${Math.random().toString(36).slice(2, 8)}`;
  //   block.id = listId; // Ensure the list has an ID
  //   viewAllButton.setAttribute('aria-controls', listId);
  //   viewAllButton.setAttribute('aria-expanded', 'false');
  //   viewAllButton.setAttribute('role', 'button');

  //   // 3. Add a state variable to track if cards are expanded
  //   let isExpanded = false;

  //   // 4. Add the toggle click listener
  //   viewAllButton.addEventListener('click', (e) => {
  //     e.preventDefault();

  //     if (!isExpanded) {
  //       // --- If it's collapsed, EXPAND it ---
  //       hiddenCards.forEach((hiddenCard) => {
  //         hiddenCard.classList.remove('hidden');
  //       });

  //       // Change button text to "View Less"
  //       viewAllButton.textContent = 'View Less';
  //       viewAllButton.setAttribute('title', 'View Less');
  //       viewAllButton.setAttribute('aria-expanded', 'true');
  //       isExpanded = true;
  //     } else {
  //       // --- If it's expanded, COLLAPSE it ---
  //       hiddenCards.forEach((hiddenCard) => {
  //         hiddenCard.classList.add('hidden');
  //       });

  //       // Change button text back to "View All"
  //       viewAllButton.textContent = 'View All';
  //       viewAllButton.setAttribute('title', 'View All');
  //       viewAllButton.setAttribute('aria-expanded', 'false');
  //       isExpanded = false;

  //       // -> Optional: Scroll user back to the top of the card block
  //       block.scrollIntoView({ behavior: 'smooth', block: 'start' });
  //     }
  //   });

  //   // 5. -> Bonus: Add keyboard support for accessibility
  //   viewAllButton.addEventListener('keydown', (e) => {
  //     if (e.key === 'Enter' || e.key === ' ') {
  //       e.preventDefault();
  //       viewAllButton.click(); // Trigger the click event
  //     }
  //   });
  // }

  /**
   * Helper function to create pagination buttons and logic.
   * @param {Element} block The main block element.
   * @param {Array<Element>} items An array of all card items.
   * @param {number} itemsPerPage The number of items to show per page.
   */
  function setupPagination(block, items, itemsPerPage) {
    const totalPages = Math.ceil(items.length / itemsPerPage);
    if (totalPages <= 1) return; // No pagination needed

    let currentPage = 1;

    // Find the block's main container
    const mainContainer = block.closest('.section');
    if (!mainContainer) return;

    // 1. Remove the default static list
    const defaultPagination = mainContainer.querySelector('.default-content-wrapper');
    if (defaultPagination) defaultPagination.remove();

    // 2. Create the new pagination wrapper
    const paginationWrapper = document.createElement('div');
    paginationWrapper.className = 'pagination-wrapper';

    // --- HELPER: Generate the array of numbers/dots ---
    // Returns arrays like [1, 2, 3, 4, 5, '...', 10] or [1, '...', 5, 6, 7, '...', 10]
    function generatePageList(current, total) {
      const delta = 2; // How many numbers to show on left/right of current
      const range = [];
      const rangeWithDots = [];
      let l;

      for (let i = 1; i <= total; i += 1) {
      // Always show first, last, or pages within the "delta" range of current
        if (i === 1 || i === total || (i >= current - delta && i < current + delta + 1)) {
          range.push(i);
        }
      }

      // Insert ellipsis where there are gaps
      range.forEach((i) => {
        if (l) {
          if (i - l === 2) {
          // If the gap is only 1 number (e.g., 1 [gap] 3), just print the number (2)
            rangeWithDots.push(l + 1);
          } else if (i - l !== 1) {
          // If the gap is larger, print '...'
            rangeWithDots.push('...');
          }
        }
        rangeWithDots.push(i);
        l = i;
      });

      return rangeWithDots;
    }

    // --- CORE FUNCTION: Render Buttons & Handle Logic ---
    function goToPage(page) {
    // Update State
      currentPage = page;
      const start = (page - 1) * itemsPerPage;
      const end = start + itemsPerPage;

      // 1. Show/Hide Items (Card Visibility)
      items.forEach((item, index) => {
        item.classList.toggle('hidden-item', index < start || index >= end);
      });

      // 2. Scroll to top of section (Optional UX improvement)
      // block.scrollIntoView({ behavior: 'smooth' });

      // 3. Re-render the Pagination Controls (The dynamic part)
      renderPaginationControls();
    }

    function renderPaginationControls() {
    // Clear existing buttons to rebuild them
      paginationWrapper.innerHTML = '';

      // A. Create "Previous" Arrow
      const prevBtn = document.createElement('button');
      prevBtn.innerHTML = '&lsaquo;';
      prevBtn.className = 'pagination-arrow prev-btn';
      prevBtn.ariaLabel = 'Previous Page';
      prevBtn.disabled = currentPage === 1; // Disable if on first page
      prevBtn.addEventListener('click', () => {
        if (currentPage > 1) goToPage(currentPage - 1);
      });
      paginationWrapper.appendChild(prevBtn);

      // B. Generate Dynamic Numbers
      const pagesToShow = generatePageList(currentPage, totalPages);

      pagesToShow.forEach((item) => {
        if (item === '...') {
          const ellipsis = document.createElement('span');
          ellipsis.textContent = '...';
          ellipsis.className = 'pagination-ellipsis';
          paginationWrapper.appendChild(ellipsis);
        } else {
          const btn = document.createElement('button');
          btn.textContent = item;
          btn.className = 'pagination-btn';
          // Add 'active' class if this is the current page
          if (item === currentPage) btn.classList.add('active');

          btn.addEventListener('click', () => goToPage(item));
          paginationWrapper.appendChild(btn);
        }
      });

      // C. Create "Next" Arrow
      const nextBtn = document.createElement('button');
      nextBtn.innerHTML = '&rsaquo;';
      nextBtn.className = 'pagination-arrow next-btn';
      nextBtn.ariaLabel = 'Next Page';
      nextBtn.disabled = currentPage === totalPages; // Disable if on last page
      nextBtn.addEventListener('click', () => {
        if (currentPage < totalPages) goToPage(currentPage + 1);
      });
      paginationWrapper.appendChild(nextBtn);
    }

    // 4. Append wrapper to DOM
    mainContainer.appendChild(paginationWrapper);

    // 5. Initial Load
    goToPage(1);
  }
  // function setupPagination(block, items, itemsPerPage) {
  //   const totalPages = Math.ceil(items.length / itemsPerPage);
  //   if (totalPages <= 1) return; // No pagination needed

  //   let currentPage = 1;

  //   // Find the block's main container (.section)
  //   const mainContainer = block.closest('.section');
  //   if (!mainContainer) return;

  //   // 1. Remove the default static list
  //   const defaultPagination = mainContainer.querySelector('.default-content-wrapper');
  //   if (defaultPagination) defaultPagination.remove();

  //   // 2. Create the new pagination wrapper
  //   const paginationWrapper = document.createElement('div');
  //   paginationWrapper.className = 'pagination-wrapper';

  //   // 3. Helper function to show/hide items and update buttons
  //   function goToPage(page) {
  //     currentPage = page;
  //     const start = (page - 1) * itemsPerPage;
  //     const end = start + itemsPerPage;

  //     // Show/hide card items
  //     items.forEach((item, index) => {
  //       // Toggle class based on whether the item is in the current page's range
  //       item.classList.toggle('hidden-item', index < start || index >= end);
  //     });

  //     // Update button active states
  //     const currentButtons = paginationWrapper.querySelectorAll('.pagination-btn');
  //     currentButtons.forEach((btn) => {
  //       btn.classList.toggle('active', parseInt(btn.dataset.page, 10) === currentPage);
  //     });

  //     // Update arrow disabled states
  //     const prevBtn = paginationWrapper.querySelector('.prev-btn');
  //     const nextBtn = paginationWrapper.querySelector('.next-btn');
  //     if (prevBtn) prevBtn.disabled = (currentPage === 1);
  //     if (nextBtn) {
  //       nextBtn.disabled = (currentPage === totalPages);
  //       window.scrollTo({
  //         top: 0,
  //         behavior: 'smooth',
  //       });
  //     }

  //     const buttons = [];
  //     const maxPagesToShow = Math.floor((totalPages / 2)) + 1;
  //     // Total items to show (1, 2, 3, 4, 5, ..., 8)

  //     if (totalPages <= maxPagesToShow) {
  //     // If 7 or fewer pages, show all numbers
  //       for (let i = 1; i <= totalPages; i += 1) {
  //         buttons.push(i);
  //       }
  //     } else {
  //     // If more than 7 pages, show 1, 2, 3, 4, 5, ..., [lastPage]
  //     // This matches the Figma design `1 2 3 4 5 ... 8`
  //       for (let i = 1; i <= totalPages; i += 1) {
  //         if (i === 5) {
  //         // Add the ellipsis
  //           buttons.push('...');
  //         } else if (i <= totalPages) {
  //         // Add the last page number
  //           buttons.push(i);
  //         }
  //       // All other pages (7, 8, etc. until the last) are skipped
  //       }
  //     }

  //     buttons.forEach((pageNumber) => {
  //       if (pageNumber === '...') {
  //         const ellipsis = document.createElement('span');
  //         ellipsis.textContent = '...';
  //         ellipsis.className = 'pagination-ellipsis';
  //         paginationWrapper.appendChild(ellipsis);
  //       } else {
  //         const btn = document.createElement('button');
  //         btn.textContent = pageNumber;
  //         btn.className = 'pagination-btn';
  //         btn.dataset.page = pageNumber;
  //         btn.addEventListener('click', () => goToPage(pageNumber));
  //         paginationWrapper.appendChild(btn);
  //       }
  //     });
  //   }

  //   // 4. Create Previous Arrow
  //   const prevBtn = document.createElement('button');
  //   prevBtn.innerHTML = '&lsaquo;'; // <
  //   prevBtn.className = 'pagination-arrow prev-btn';
  //   prevBtn.setAttribute('aria-label', 'Previous Page');
  //   prevBtn.addEventListener('click', () => {
  //     if (currentPage > 1) goToPage(currentPage - 1);
  //   });
  //   paginationWrapper.appendChild(prevBtn);

  //   // 5. Create Number Buttons (and ... for ellipsis)
  //   // This logic will show 1, 2, 3, 4, 5, ..., [lastPage] (e.g., 8)
  //   const buttons = [];
  //   const maxPagesToShow = Math.floor((totalPages / 2)) + 1;
  //   // Total items to show (1, 2, 3, 4, 5, ..., 8)

  //   if (totalPages <= maxPagesToShow) {
  //     // If 7 or fewer pages, show all numbers
  //     for (let i = 1; i <= totalPages; i += 1) {
  //       buttons.push(i);
  //     }
  //   } else {
  //     // If more than 7 pages, show 1, 2, 3, 4, 5, ..., [lastPage]
  //     // This matches the Figma design `1 2 3 4 5 ... 8`
  //     for (let i = 1; i <= totalPages; i += 1) {
  //       if (i === 5) {
  //         // Add the ellipsis
  //         buttons.push('...');
  //       } else if (i <= totalPages) {
  //         // Add the last page number
  //         buttons.push(i);
  //       }
  //       // All other pages (7, 8, etc. until the last) are skipped
  //     }
  //   }

  //   buttons.forEach((pageNumber) => {
  //     if (pageNumber === '...') {
  //       const ellipsis = document.createElement('span');
  //       ellipsis.textContent = '...';
  //       ellipsis.className = 'pagination-ellipsis';
  //       paginationWrapper.appendChild(ellipsis);
  //     } else {
  //       const btn = document.createElement('button');
  //       btn.textContent = pageNumber;
  //       btn.className = 'pagination-btn';
  //       btn.dataset.page = pageNumber;
  //       btn.addEventListener('click', () => goToPage(pageNumber));
  //       paginationWrapper.appendChild(btn);
  //     }
  //   });

  //   // 6. Create Next Arrow
  //   const nextBtn = document.createElement('button');
  //   nextBtn.innerHTML = '&rsaquo;'; // >
  //   nextBtn.className = 'pagination-arrow next-btn';
  //   nextBtn.setAttribute('aria-label', 'Next Page');
  //   nextBtn.addEventListener('click', () => {
  //     if (currentPage < totalPages) goToPage(currentPage + 1);
  //   });
  //   paginationWrapper.appendChild(nextBtn);

  //   // 7. Append the new pagination bar to the main container
  //   mainContainer.appendChild(paginationWrapper);

  //   // 8. Initial setup
  //   goToPage(1);
  // }

  /**
   * Decorates the moedge-building block.
   * @param {Element} block The block element
   */

  // Find the container that has your special classes
  const mainContainer = block.closest('.pr-news-list.moedge-building-container');

  // Only run this pagination logic if we are in the correct block
  if (mainContainer) {
    // Select all the card items
    const items = Array.from(block.querySelectorAll(':scope > [class*="moedge-build-cont"]'));
    const itemsPerPage = items.slice(0, 12).length;

    if (items.length > itemsPerPage) {
      setupPagination(block, items, itemsPerPage);
    }
  }

  // ... any other decoration code you have ...
}
