import React from "react";
import BlogListItem from "./BlogListItem";
import Divider from "../Divider";
import PageSection from "../PageSection";

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

  const blogItems = blogs.map((blog, index) => (
    <div key={index}>
      <PageSection key={index} color="bg-white">
        <div className="max-w-6xl mx-auto">
          <BlogListItem
            key={index}
            imageSrc={blog.imageSrc}
            title={blog.title}
            description={blog.description}
            readMoreLink={blog.readMoreLink}
            className="pt-[98px] pb-[150px]"
            itemId={blog.itemId}
          />
        </div>
      </PageSection>
      <Divider key={`divider-${index}`} />
    </div>
  ));

  return (
    <div className="flex flex-col">
      {blogItems}
    </div>
  );
};

export default BlogList;
