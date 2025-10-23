import React from "react";
import { Link } from "react-router-dom";
import { createItemSmartLink } from "../../utils/smartlink";

type BlogListItemProps = Readonly<{
  imageSrc?: string;
  title: string;
  description: string;
  readMoreLink: string;
  className?: string;
  itemId: string;
}>;

const BlogListItem: React.FC<BlogListItemProps> = ({
  imageSrc,
  title,
  description,
  readMoreLink,
  className,
  itemId,
}) => {
  return (
    <div className={`flex flex-col gap-6 w-full ${className}`}
    {...createItemSmartLink(itemId)}
    >
      {/* Image */}
      <div className="w-full h-[700px] overflow-hidden rounded-md">
        <img
          width="100%"
          height="700px"
          src={imageSrc}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Content */}
      <div className="flex flex-col gap-4">
        {/* Title */}
        <h2 className="text-2xl font-bold text-black leading-tight">
          {title}
        </h2>
        
        {/* Description */}
        <div className="text-gray-600 text-base leading-relaxed line-clamp-3">
          {description}
        </div>
        
        {/* Read Article Link */}
        <Link 
          to={`/blog/${readMoreLink}`}
          className="group inline-flex items-center text-black font-medium transition-colors duration-200 border-b border-black w-max"
        >
          Read Article
          <svg className="ml-2 w-4 h-4 transition-all duration-200 group-hover:ml-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
};

export default BlogListItem;
