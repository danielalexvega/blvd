import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

type BlogPost = {
  imageSrc?: string;
  title: string;
  summary: string;
  readMoreLink: string;
  itemId: string;
  tags?: string[];
};

type BlogCarouselProps = {
  blogs: BlogPost[];
};

const BlogCarousel: React.FC<BlogCarouselProps> = ({ blogs }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-advance carousel every 5 seconds
  useEffect(() => {
    if (!isAutoPlaying || blogs.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % blogs.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, blogs.length]);

  // Pause auto-play on hover
  const handleMouseEnter = () => setIsAutoPlaying(false);
  const handleMouseLeave = () => setIsAutoPlaying(true);

  // Manual navigation
  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (blogs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No blog posts available for carousel.</p>
      </div>
    );
  }

  const currentBlog = blogs[currentIndex];

  if (!currentBlog) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No blog post available.</p>
      </div>
    );
  }

  return (
    <div 
      className="relative bg-white rounded-lg overflow-hidden shadow-lg"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex flex-col lg:flex-row min-h-[400px]">
        {/* Image Section */}
        <div className="lg:w-1/2 relative">
          {currentBlog.imageSrc ? (
            <img
              src={currentBlog.imageSrc}
              alt={currentBlog.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500">No image available</span>
            </div>
          )}
          
          {/* Navigation Arrows */}
          {/* {blogs.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all duration-200"
                aria-label="Previous blog post"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all duration-200"
                aria-label="Next blog post"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )} */}
        </div>

        {/* Content Section */}
        <div className="lg:w-1/2 p-8 lg:px-20 lg:py-6 flex flex-col">
          {/* Blog Tag */}
          {currentBlog.tags && currentBlog.tags.length > 0 && (
            <div className="mb-4">
              <span className="inline-block text-black py-1 rounded-full text-base font-medium uppercase tracking-wide">
                {currentBlog.tags[0]}
              </span>
            </div>
          )}

          {/* Title */}
          <h2 className="text-3xl lg:text-4xl font-semibold text-black mb-6 leading-tight">
            {currentBlog.title}
          </h2>

          {/* Summary */}
          <div className="text-black mb-8 line-clamp-4 text-xl">
            {currentBlog.summary}
          </div>

          {/* Read Article Link */}
          <Link
            to={`/blog/${currentBlog.readMoreLink}`}
            className="group inline-flex items-center text-black hover:text-grey font-medium transition-colors duration-200 border-b border-black hover:group w-max mt-auto"
          >
            Read Article
            <svg className="ml-2 w-4 h-4 transition-all duration-200 group-hover:ml-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Dots Indicator */}
      {blogs.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {blogs.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === currentIndex
                  ? 'bg-black'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Progress Bar */}
      {isAutoPlaying && blogs.length > 1 && (
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-200">
          <div 
            className="h-full bg-black transition-all duration-100 ease-linear"
            style={{
              width: '100%',
              animation: `progress 5000ms linear infinite`
            }}
          />
        </div>
      )}
    </div>
  );
};

export default BlogCarousel;
