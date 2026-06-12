import { useEffect, useRef, useState } from 'react';

export const useAutoScroll = (dependencies = []) => {
  const scrollContainerRef = useRef(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    
    // Check if the user is scrolled near the bottom (with a 60px tolerance buffer)
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 60;
    
    setShouldAutoScroll(isNearBottom);
  };

  const scrollToBottom = (behavior = 'smooth') => {
    if (!scrollContainerRef.current) return;
    scrollContainerRef.current.scrollTo({
      top: scrollContainerRef.current.scrollHeight,
      behavior
    });
  };

  // Scroll to bottom when dependencies change, if auto-scroll is enabled
  useEffect(() => {
    if (shouldAutoScroll) {
      scrollToBottom('smooth');
    }
  }, dependencies);

  // Instantly force scrolling to bottom (useful right when user sends a new message)
  const forceScrollToBottom = () => {
    setShouldAutoScroll(true);
    setTimeout(() => {
      scrollToBottom('auto');
    }, 50);
  };

  return {
    scrollContainerRef,
    handleScroll,
    forceScrollToBottom
  };
};
