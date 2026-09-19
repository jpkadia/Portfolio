import React, { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import "./CardCarousel.css";

// Helper to detect true mouse / fine pointer devices (desktop/laptop)
const isFinePointer = () => {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
};

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
  const isUserInteractingRef = useRef(false);

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

  // Start autoplay timer (default: 3500ms, or 6500ms after user interaction)
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
        // Don't auto-advance if scrolled out of view, user is interacting, or mouse is hovering on desktop
        if (!isInViewRef.current) return;
        if (isUserInteractingRef.current) return;
        if (isFinePointer() && isHoveredRef.current) return;

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

  // Handle button or dot click: pause and restart autoplay after 6.5 seconds of inactivity
  const handleUserInteraction = useCallback(() => {
    stopAutoplay();
    isUserInteractingRef.current = false;
    isHoveredRef.current = false;
    if (isInViewRef.current) {
      scheduleNextAutoplay(6500);
    }
  }, [stopAutoplay, scheduleNextAutoplay]);

  // Embla drag/touch gestures:
  // When user touches/clicks to drag, pause autoplay
  const handlePointerDown = useCallback(() => {
    isUserInteractingRef.current = true;
    isHoveredRef.current = false;
    stopAutoplay();
  }, [stopAutoplay]);

  // When user releases finger or mouse button after drag, schedule autoplay in 6.5s
  const handlePointerUp = useCallback(() => {
    isUserInteractingRef.current = false;
    isHoveredRef.current = false;
    if (isInViewRef.current) {
      scheduleNextAutoplay(6500);
    }
  }, [scheduleNextAutoplay]);

  // When slide finishes settling after drag or programmatic scroll
  const handleSettle = useCallback(() => {
    updateState();
    // If settled after user drag gesture, ensure 6.5s restart is armed
    if (isUserInteractingRef.current) {
      isUserInteractingRef.current = false;
      isHoveredRef.current = false;
      if (isInViewRef.current) {
        scheduleNextAutoplay(6500);
      }
    }
  }, [updateState, scheduleNextAutoplay]);

  // User click handlers for Prev / Next / Dot
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

  // Desktop mouse hover handlers: pause on hover, resume on mouse leave
  // Note: Ignored on touch devices (mobile/tablet) to prevent hover freeze
  const handleMouseEnter = useCallback(() => {
    if (!isFinePointer()) return;
    isHoveredRef.current = true;
    stopAutoplay();
  }, [stopAutoplay]);

  const handleMouseLeave = useCallback(() => {
    if (!isFinePointer()) return;
    isHoveredRef.current = false;
    if (isInViewRef.current) {
      scheduleNextAutoplay(3500);
    }
  }, [scheduleNextAutoplay]);

  // Direct touch handlers on carousel wrapper for maximum mobile/tablet responsiveness
  const handleTouchStart = useCallback(() => {
    isUserInteractingRef.current = true;
    isHoveredRef.current = false;
    stopAutoplay();
  }, [stopAutoplay]);

  const handleTouchEnd = useCallback(() => {
    isUserInteractingRef.current = false;
    isHoveredRef.current = false;
    if (isInViewRef.current) {
      scheduleNextAutoplay(6500);
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
    emblaApi.on("settle", handleSettle);
    emblaApi.on("pointerDown", handlePointerDown);
    emblaApi.on("pointerUp", handlePointerUp);

    if (isInViewRef.current) {
      scheduleNextAutoplay(3500);
    }

    return () => {
      stopAutoplay();
      emblaApi.off("select", updateState);
      emblaApi.off("reInit", updateState);
      emblaApi.off("settle", handleSettle);
      emblaApi.off("pointerDown", handlePointerDown);
      emblaApi.off("pointerUp", handlePointerUp);
    };
  }, [
    emblaApi,
    updateState,
    handleSettle,
    handlePointerDown,
    handlePointerUp,
    scheduleNextAutoplay,
    stopAutoplay,
  ]);

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
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
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
