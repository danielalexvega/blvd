import React from "react";
import BlogListItem from "./BlogListItem";
// import Divider from "../Divider";
// import PageSection from "../PageSection";

// Updated to use summary string instead of rich text
type Blog = Readonly<{
  imageSrc?: string;
  title: string;
  description: string;
  readMoreLink: string;
  itemId: string;
}>;

type BlogListProps = Readonly<{
  blogs: Blog[];
}>;

const BlogList: React.FC<BlogListProps> = ({ blogs }) => {
  // Debug logging
  console.log('BlogList Debug:', {
    blogsCount: blogs.length,
    blogs: blogs
  });

  if (blogs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No blog posts found.</p>
      </div>
    );
  }

  // Group blogs into alternating rows of 3 and 2
  const groupedBlogs = [];
  let currentIndex = 0;
  let groupIndex = 0;

  while (currentIndex < blogs.length) {
    const groupSize = groupIndex % 2 === 0 ? 3 : 2; // Alternate between 3 and 2
    const group = blogs.slice(currentIndex, currentIndex + groupSize);
    groupedBlogs.push(group);
    currentIndex += groupSize;
    groupIndex++;
  }

  const renderBlogGroup = (group: Blog[], groupIndex: number) => (
    <div key={groupIndex} className="mb-16">
      <div className={`grid gap-8 max-w-8xl mx-auto px-4 ${
        group.length === 3 
          ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
          : 'grid-cols-1 md:grid-cols-2'
      }`}>
        {group.map((blog, index) => (
          <div key={`${groupIndex}-${index}`} className="flex flex-col">
            <BlogListItem
              imageSrc={blog.imageSrc}
              title={blog.title}
              description={blog.description}
              readMoreLink={blog.readMoreLink}
              className="h-full"
              itemId={blog.itemId}
            />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col">
      {groupedBlogs.map((group, index) => renderBlogGroup(group, index))}
    </div>
  );
};

export default BlogList;
