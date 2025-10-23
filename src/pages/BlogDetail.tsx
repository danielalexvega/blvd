import React, { useCallback } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { createClient } from "../utils/client";
import { useAppContext } from "../context/AppContext";
import { BlogPost, LanguageCodenames } from "../model";
import { DeliveryError } from "@kontent-ai/delivery-sdk";
import PageContent from "../components/PageContent";
import { IRefreshMessageData, IRefreshMessageMetadata, IUpdateMessageData, applyUpdateOnItemAndLoadLinkedItems } from "@kontent-ai/smart-link";
import { useCustomRefresh, useLivePreview } from "../context/SmartLinkContext";
import {
  createElementSmartLink,
  createItemSmartLink,
} from "../utils/smartlink";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const BlogDetail: React.FC = () => {
  const { environmentId, apiKey } = useAppContext();
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get("preview") === "true";
  const lang = searchParams.get("lang");
  const queryClient = useQueryClient();

  const blogPostQuery = useQuery({
    queryKey: [`blog-post_${slug}`, isPreview, lang],
    queryFn: () =>
      createClient(environmentId, apiKey, isPreview)
        .items<BlogPost>()
        .type("blog_post")
        .equalsFilter("elements.url_slug", slug ?? "")
        .languageParameter((lang ?? "default") as LanguageCodenames)
        .depthParameter(3)
        .toPromise()
        .then((res) => res.data.items[0])
        .catch((err) => {
          if (err instanceof DeliveryError) {
            return null;
          }
          throw err;
        }),
  });

  const handleLiveUpdate = useCallback((data: IUpdateMessageData) => {
    if (blogPostQuery.data) {
      applyUpdateOnItemAndLoadLinkedItems(
        blogPostQuery.data,
        data,
        (codenamesToFetch) => createClient(environmentId, apiKey, isPreview)
          .items()
          .inFilter("system.codename", [...codenamesToFetch])
          .toPromise()
          .then(res => res.data.items as BlogPost[])
      ).then((updatedItem) => {
        if (updatedItem) {
          queryClient.setQueryData([`blog-post_${slug}`, isPreview, lang], updatedItem);
        }
      });
    }
  }, [blogPostQuery.data, environmentId, apiKey, isPreview, slug, lang, queryClient]);

  useLivePreview(handleLiveUpdate);

  const onRefresh = useCallback(
    (_: IRefreshMessageData, metadata: IRefreshMessageMetadata, originalRefresh: () => void) => {
      if (metadata.manualRefresh) {
        originalRefresh();
      } else {
        blogPostQuery.refetch();
      }
    },
    [blogPostQuery],
  );

  useCustomRefresh(onRefresh);

  const blogPost = blogPostQuery.data;

  if (!blogPost) {
    return <div className="flex-grow" />;
  }

  return (
    <div className="flex flex-col px-16">
      {/* Header Section with Grid */}
      <div
        className="px-4 pt-16"
        style={{
          gridTemplateColumns: 'repeat(12, minmax(0, 1fr))',
          gap: '0'
        }}
      >
        <div className="grid" style={{ gridTemplateColumns: 'repeat(12, minmax(0, 1fr))', gap: '0' }}>
          {/* Back to Blog Link */}
          <div className="col-span-5">
            <Link
              to="/blog"
              className="text-black hover:text-gray-700 transition-colors duration-200 font-libre"
              style={{ fontSize: '14px', fontWeight: '500' }}
            >
              ← Boulevard Blog
            </Link>
          </div>

          {/* Tags and Title Section */}
          <div className="col-span-6 space-y-1">
            {/* Blog Post Tags */}
            {blogPost.elements.blog_post_tags?.value && blogPost.elements.blog_post_tags.value.length > 0 && (
              <p
                className="uppercase text-gray-600"
                style={{ fontSize: '16px', fontWeight: '500' }}
                {...createItemSmartLink(blogPost.system.id)}
                {...createElementSmartLink("blog_post_tags")}
              >
                {blogPost.elements.blog_post_tags.value.map(tag => tag.name).join(' • ')}
              </p>
            )}

            {/* Industry Tags */}
            {blogPost.elements.industry_tags?.value && blogPost.elements.industry_tags.value.length > 0 && (
              <p
                className="uppercase text-gray-600"
                style={{ fontSize: '16px', fontWeight: '500' }}
                {...createItemSmartLink(blogPost.system.id)}
                {...createElementSmartLink("industry_tags")}
              >
                {blogPost.elements.industry_tags.value.map(tag => tag.name).join(' • ')}
              </p>
            )}

            {/* Title */}
            <h2
              className="text-black font-semibold font-libre"
              style={{ fontSize: '48px', fontWeight: '500', lineHeight: '50px' }}
              {...createItemSmartLink(blogPost.system.id)}
              {...createElementSmartLink("title")}
            >
              {blogPost.elements.title?.value}
            </h2>
          </div>
        </div>
      </div>

      {/* Hero Image Section */}
      <div className="w-full" style={{ marginTop: '5rem', marginBottom: '5rem' }}>
        <img
          width="100%"
          height="auto"
          src={blogPost.elements.image?.value[0]?.url}
          alt={blogPost.elements.image?.value[0]?.description ?? ""}
          className="w-full h-auto object-cover"
          {...createItemSmartLink(blogPost.system.id)}
          {...createElementSmartLink("image")}
        />
      </div>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto flex flex-col px-4 mr-[15%]">
        <PageContent 
          body={blogPost.elements.body!} 
          itemId={blogPost.system.id} 
          elementName="body" 
        />
      </div>
    </div>
  );
};

export default BlogDetail;
