import React, { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import "./CardCarousel.css";

export default function CardCarousel({ items, renderItem, category }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
    skipSnaps: false,
    dragFree: false,
    containScroll: "trimSnaps",
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState([]);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  // Timer refs for rock-solid autoplay & pause management
  const carouselContainerRef = useRef(null);
  const autoplayTimerRef = useRef(null);
  const isHoveredRef = useRef(false);
  const isInViewRef = useRef(false);

  // Clear any existing autoplay timer
  const stopAutoplay = useCallback(() => {
    if (autoplayTimerRef.current) {
      clearTimeout(autoplayTimerRef.current);
      autoplayTimerRef.current = null;
    }
  }, []);

  // Update all carousel state (selected index, snap points, and scroll boundaries)
  const updateState = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setScrollSnaps(emblaApi.scrollSnapList());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  // Start autoplay timer (default: 3500ms, or custom delay like 6500ms after user interaction)
  const scheduleNextAutoplay = useCallback(
    (delay = 3500) => {
      stopAutoplay();

      // Only autoplay if carousel is currently visible in viewport
      if (!isInViewRef.current) return;

      // Only autoplay if there are multiple snaps and scrolling is possible
      if (!emblaApi) return;
      if (!emblaApi.canScrollNext() && !emblaApi.canScrollPrev()) return;
      if (emblaApi.scrollSnapList().length <= 1) return;

      autoplayTimerRef.current = setTimeout(() => {
        // Don't auto-advance if user's cursor is hovering or scrolled out of view
        if (!isInViewRef.current || isHoveredRef.current) return;

        if (emblaApi.canScrollNext()) {
          emblaApi.scrollNext();
          scheduleNextAutoplay(3500);
        } else {
          // Reached the last card: rewind back to slide 0, then continue
          emblaApi.scrollTo(0);
          scheduleNextAutoplay(3500);
        }
      }, delay);
    },
    [emblaApi, stopAutoplay]
  );

  // Handle any user interaction (click next, click prev, click dot, or touch drag):
  // 1. Immediately stops autoplay
  // 2. Waits 6.5 seconds of inactivity before restarting autoplay (if still in view)
  const handleUserInteraction = useCallback(() => {
    stopAutoplay();
    if (isInViewRef.current) {
      scheduleNextAutoplay(6500);
    }
  }, [stopAutoplay, scheduleNextAutoplay]);

  // User click handlers
  const scrollPrev = useCallback(() => {
    if (!emblaApi) return;
    emblaApi.scrollPrev();
    handleUserInteraction();
  }, [emblaApi, handleUserInteraction]);

  const scrollNext = useCallback(() => {
    if (!emblaApi) return;
    emblaApi.scrollNext();
    handleUserInteraction();
  }, [emblaApi, handleUserInteraction]);

  const scrollTo = useCallback(
    (index) => {
      if (!emblaApi) return;
      emblaApi.scrollTo(index);
      handleUserInteraction();
    },
    [emblaApi, handleUserInteraction]
  );

  // Hover handlers: pause while hovering, resume on mouse leave (if in view)
  const handleMouseEnter = useCallback(() => {
    isHoveredRef.current = true;
    stopAutoplay();
  }, [stopAutoplay]);

  const handleMouseLeave = useCallback(() => {
    isHoveredRef.current = false;
    if (isInViewRef.current) {
      scheduleNextAutoplay(3500);
    }
  }, [scheduleNextAutoplay]);

  // Viewport intersection observer: start autoplay ONLY when visible in viewport, pause when leaving
  useEffect(() => {
    const node = carouselContainerRef.current;
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      isInViewRef.current = true;
      scheduleNextAutoplay(3500);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const inView = Boolean(entry && entry.isIntersecting);
        isInViewRef.current = inView;

        if (inView) {
          scheduleNextAutoplay(3500);
        } else {
          stopAutoplay();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [scheduleNextAutoplay, stopAutoplay]);

  // Main effect to bind Embla events
  useEffect(() => {
    if (!emblaApi) return;

    updateState();

    emblaApi.on("select", updateState);
    emblaApi.on("reInit", updateState);
    emblaApi.on("settle", updateState);
    emblaApi.on("pointerDown", handleUserInteraction);

    if (isInViewRef.current) {
      scheduleNextAutoplay(3500);
    }

    return () => {
      stopAutoplay();
      emblaApi.off("select", updateState);
      emblaApi.off("reInit", updateState);
      emblaApi.off("settle", updateState);
      emblaApi.off("pointerDown", handleUserInteraction);
    };
  }, [emblaApi, updateState, handleUserInteraction, scheduleNextAutoplay, stopAutoplay]);

  // When category or items list changes, re-init, jump to start, and update state
  useEffect(() => {
    if (emblaApi) {
      const timer = setTimeout(() => {
        if (!emblaApi) return;
        emblaApi.reInit();
        emblaApi.scrollTo(0, true);
        updateState();
        if (isInViewRef.current) {
          scheduleNextAutoplay(3500);
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [category, items, emblaApi, updateState, scheduleNextAutoplay]);

  if (!items || items.length === 0) return null;

  // Show controls (buttons and dots) ONLY when scrolling is actually possible.
  // If all cards fit in view (no next or prev button needed), dots must also be hidden!
  const canScroll = canScrollPrev || canScrollNext;
  const showControls = items.length > 1 && scrollSnaps.length > 1 && canScroll;

  const modifierClass =
    items.length === 1
      ? "embla-single-item"
      : items.length === 2
      ? "embla-double-item"
      : "";

  return (
    <div
      ref={carouselContainerRef}
      className={`embla-carousel-wrapper ${modifierClass}`}
      role="region"
      aria-roledescription="carousel"
      aria-label="Projects Showcase Carousel"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Viewport & Track */}
      <div className="embla__viewport" ref={emblaRef}>
        <div className="embla__container" role="list">
          {items.map((item, index) => (
            <div
              className="embla__slide"
              key={item.title ? `${item.title}-${index}` : index}
              role="listitem"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${items.length}`}
            >
              {renderItem ? renderItem(item, index) : item}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons (Prev / Next) - Hides at boundaries */}
      {showControls && (
        <>
          <button
            type="button"
            className={`embla__button embla__button--prev ${
              !canScrollPrev ? "embla__button--hidden" : ""
            }`}
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            aria-label="Previous project slide"
          >
            <i className="fa-solid fa-chevron-left" aria-hidden="true"></i>
          </button>

          <button
            type="button"
            className={`embla__button embla__button--next ${
              !canScrollNext ? "embla__button--hidden" : ""
            }`}
            onClick={scrollNext}
            disabled={!canScrollNext}
            aria-label="Next project slide"
          >
            <i className="fa-solid fa-chevron-right" aria-hidden="true"></i>
          </button>
        </>
      )}

      {/* Pagination Dots */}
      {showControls && (
        <div
          className="embla__dots"
          role="tablist"
          aria-label="Project slide navigation"
        >
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              type="button"
              role="tab"
              aria-selected={index === selectedIndex}
              aria-label={`Go to slide ${index + 1}`}
              className={`embla__dot ${
                index === selectedIndex ? "embla__dot--selected" : ""
              }`}
              onClick={() => scrollTo(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
