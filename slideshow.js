// Slideshow Navigation Controller
// Handles keyboard, click, touch navigation and slide transitions

(function() {
    'use strict';

    const Slideshow = {
        currentSlide: 0,
        totalSlides: 0,
        slides: [],
        isTransitioning: false,
        chartsInitialized: new Set(),

        init: function() {
            this.slides = document.querySelectorAll('.slide');
            this.totalSlides = this.slides.length;

            if (this.totalSlides === 0) {
                console.warn('No slides found');
                return;
            }

            // Check for hash in URL
            const hash = window.location.hash;
            if (hash) {
                const slideNum = parseInt(hash.replace('#slide-', ''));
                if (!isNaN(slideNum) && slideNum >= 0 && slideNum < this.totalSlides) {
                    this.currentSlide = slideNum;
                }
            }

            this.setupNavigation();
            this.setupKeyboard();
            this.setupTouch();
            this.setupProgressDots();
            this.goToSlide(this.currentSlide);

            console.log(`Slideshow initialized with ${this.totalSlides} slides`);
        },

        setupNavigation: function() {
            const prevBtn = document.getElementById('prev-btn');
            const nextBtn = document.getElementById('next-btn');

            if (prevBtn) {
                prevBtn.addEventListener('click', () => this.prev());
            }
            if (nextBtn) {
                nextBtn.addEventListener('click', () => this.next());
            }

            // Click on slide to advance (optional - can be disabled)
            this.slides.forEach((slide, index) => {
                slide.addEventListener('click', (e) => {
                    // Only advance if clicking on empty space, not links/buttons
                    if (e.target === slide || e.target.classList.contains('slide-content')) {
                        // Disabled for now - too easy to accidentally click
                        // this.next();
                    }
                });
            });
        },

        setupKeyboard: function() {
            document.addEventListener('keydown', (e) => {
                switch(e.key) {
                    case 'ArrowRight':
                    case 'ArrowDown':
                    case ' ':
                    case 'PageDown':
                        e.preventDefault();
                        this.next();
                        break;
                    case 'ArrowLeft':
                    case 'ArrowUp':
                    case 'PageUp':
                        e.preventDefault();
                        this.prev();
                        break;
                    case 'Home':
                        e.preventDefault();
                        this.goToSlide(0);
                        break;
                    case 'End':
                        e.preventDefault();
                        this.goToSlide(this.totalSlides - 1);
                        break;
                    case 'f':
                    case 'F':
                        if (!e.ctrlKey && !e.metaKey) {
                            e.preventDefault();
                            this.toggleFullscreen();
                        }
                        break;
                    case 'Escape':
                        if (document.fullscreenElement) {
                            document.exitFullscreen();
                        }
                        break;
                }
            });
        },

        setupTouch: function() {
            let touchStartX = 0;
            let touchStartY = 0;
            let touchEndX = 0;
            let touchEndY = 0;

            const container = document.querySelector('.slideshow-container');
            if (!container) return;

            container.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
                touchStartY = e.changedTouches[0].screenY;
            }, { passive: true });

            container.addEventListener('touchend', (e) => {
                touchEndX = e.changedTouches[0].screenX;
                touchEndY = e.changedTouches[0].screenY;
                this.handleSwipe(touchStartX, touchStartY, touchEndX, touchEndY);
            }, { passive: true });
        },

        handleSwipe: function(startX, startY, endX, endY) {
            const diffX = startX - endX;
            const diffY = startY - endY;
            const minSwipeDistance = 50;

            // Horizontal swipe is stronger than vertical
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > minSwipeDistance) {
                if (diffX > 0) {
                    this.next(); // Swipe left = next
                } else {
                    this.prev(); // Swipe right = prev
                }
            }
        },

        setupProgressDots: function() {
            const dotsContainer = document.querySelector('.progress-dots');
            if (!dotsContainer) return;

            dotsContainer.innerHTML = '';
            for (let i = 0; i < this.totalSlides; i++) {
                const dot = document.createElement('div');
                dot.className = 'progress-dot' + (i === this.currentSlide ? ' active' : '');
                dot.setAttribute('data-slide', i);
                dot.addEventListener('click', () => this.goToSlide(i));
                dotsContainer.appendChild(dot);
            }
        },

        updateProgressDots: function() {
            const dots = document.querySelectorAll('.progress-dot');
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === this.currentSlide);
            });
        },

        updateCounter: function() {
            const counter = document.querySelector('.slide-counter');
            if (counter) {
                counter.innerHTML = `<span class="current">${this.currentSlide + 1}</span> / ${this.totalSlides}`;
            }
        },

        updateNavButtons: function() {
            const prevBtn = document.getElementById('prev-btn');
            const nextBtn = document.getElementById('next-btn');

            if (prevBtn) {
                prevBtn.disabled = this.currentSlide === 0;
            }
            if (nextBtn) {
                nextBtn.disabled = this.currentSlide === this.totalSlides - 1;
            }
        },

        goToSlide: function(index) {
            if (index < 0 || index >= this.totalSlides || this.isTransitioning) {
                return;
            }

            this.isTransitioning = true;

            // Remove active from current slide
            this.slides.forEach(slide => slide.classList.remove('active'));

            // Add active to new slide
            this.currentSlide = index;
            this.slides[index].classList.add('active');

            // Scroll to top of new slide
            this.slides[index].scrollTop = 0;

            // Update URL hash
            history.replaceState(null, null, `#slide-${index}`);

            // Initialize charts for this slide if not already done
            if (!this.chartsInitialized.has(index)) {
                // Small delay to ensure slide is visible before chart init
                setTimeout(() => {
                    if (typeof window.initChartsForSlide === 'function') {
                        window.initChartsForSlide(index);
                    }
                    this.chartsInitialized.add(index);
                }, 100);
            }

            // Update UI
            this.updateProgressDots();
            this.updateCounter();
            this.updateNavButtons();

            // Reset transition lock
            setTimeout(() => {
                this.isTransitioning = false;
            }, 500);
        },

        next: function() {
            if (this.currentSlide < this.totalSlides - 1) {
                this.goToSlide(this.currentSlide + 1);
            }
        },

        prev: function() {
            if (this.currentSlide > 0) {
                this.goToSlide(this.currentSlide - 1);
            }
        },

        toggleFullscreen: function() {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(err => {
                    console.warn('Fullscreen not available:', err);
                });
            } else {
                document.exitFullscreen();
            }
        }
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => Slideshow.init());
    } else {
        Slideshow.init();
    }

    // Expose for external access
    window.Slideshow = Slideshow;
})();
