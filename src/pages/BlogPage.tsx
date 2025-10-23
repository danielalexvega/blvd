import React, { useCallback, useState, useEffect } from "react";
import PageSection from "../components/PageSection";
import { useAppContext } from "../context/AppContext";
import { createClient } from "../utils/client";
import { DeliveryError } from "@kontent-ai/delivery-sdk";
import BlogList from "../components/blog/BlogList";
import BlogCarousel from "../components/blog/BlogCarousel";
import { Page, BlogPost } from "../model/content-types";
import { useSearchParams } from "react-router-dom";
import { defaultPortableRichTextResolvers, isEmptyRichText } from "../utils/richtext";
import { PortableText } from "@portabletext/react";
import { transformToPortableText } from "@kontent-ai/rich-text-resolver";
import { LanguageCodenames, CollectionCodenames } from "../model";
import { IRefreshMessageData, IRefreshMessageMetadata, IUpdateMessageData, applyUpdateOnItemAndLoadLinkedItems } from "@kontent-ai/smart-link";
import { useCustomRefresh, useLivePreview } from "../context/SmartLinkContext";
import { createElementSmartLink, createItemSmartLink } from "../utils/smartlink";
import { useSuspenseQueries } from "@tanstack/react-query";
import { Replace } from "../utils/types";

const useBlogPage = (isPreview: boolean, lang: string | null) => {
  const { environmentId, apiKey, collection } = useAppContext();
  const [searchParams] = useSearchParams();
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleLiveUpdate = useCallback((data: IUpdateMessageData) => {
    if (page) {
      // Use applyUpdateOnItemAndLoadLinkedItems to ensure all linked content is updated
      applyUpdateOnItemAndLoadLinkedItems(
        page,
        data,
        (codenamesToFetch) => createClient(environmentId, apiKey, isPreview)
          .items()
          .inFilter("system.codename", [...codenamesToFetch])
          .toPromise()
          .then(res => res.data.items)
      ).then((updatedItem) => {
        if (updatedItem) {
          setPage(updatedItem as Page);
        }
      });
    }
  }, [page, environmentId, apiKey, isPreview]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    const collectionParam = searchParams.get("collection");
    const collectionFilter = collectionParam ?? collection ?? "boulevard";

    console.log('Fetching blog page with params:', {
      environmentId,
      isPreview,
      lang: lang ?? "default",
      collection: collectionFilter
    });

    createClient(environmentId, apiKey, isPreview)
      .items<Page>()
      .type("page")
      .equalsFilter("system.codename", "blog")
      .languageParameter((lang ?? "default") as LanguageCodenames)
      .collections([collectionFilter as CollectionCodenames])
      .limitParameter(1)
      .toPromise()
      .then((res: any) => {
        console.log('Blog page fetched successfully:', res.data.items[0]);
        setPage(res.data.items[0] || null);
        setLoading(false);
      })
      .catch((err: any) => {
        console.error('Error fetching blog page:', err);
        if (err instanceof DeliveryError) {
          setPage(null);
          setError('Failed to load blog page');
        } else {
          setError('An unexpected error occurred');
          throw err;
        }
        setLoading(false);
      });
  }, [environmentId, apiKey, isPreview, lang, searchParams, collection]);

  useLivePreview(handleLiveUpdate);

  return { page, loading, error };
};

const useBlogPosts = (isPreview: boolean, lang: string | null) => {
  const { environmentId, apiKey, collection } = useAppContext();
  const [searchParams] = useSearchParams();
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleLiveUpdate = useCallback((data: IUpdateMessageData) => {
    // Update the specific blog post in the list
    setBlogPosts(prevPosts => {
      return prevPosts.map(post => {
        if (post.system.codename === data.item.codename) {
          // Apply the update and handle the Promise
          applyUpdateOnItemAndLoadLinkedItems(
            post,
            data,
            (codenamesToFetch) => createClient(environmentId, apiKey, isPreview)
              .items()
              .inFilter("system.codename", [...codenamesToFetch])
              .toPromise()
              .then(res => res.data.items)
          ).then((updatedItem) => {
            if (updatedItem) {
              setBlogPosts(prev => prev.map(p =>
                p.system.codename === data.item.codename ? updatedItem as BlogPost : p
              ));
            }
          });
          return post; // Return the current post while waiting for the update
        }
        return post;
      });
    });
  }, [environmentId, apiKey, isPreview]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    const collectionParam = searchParams.get("collection");
    const collectionFilter = collectionParam ?? collection ?? "boulevard";

    console.log('Fetching blog posts with params:', {
      environmentId,
      isPreview,
      lang: lang ?? "default",
      collection: collectionFilter
    });

    createClient(environmentId, apiKey, isPreview)
      .items<BlogPost>()
      .type("blog_post")
      .languageParameter((lang ?? "default") as LanguageCodenames)
      .collections([collectionFilter as CollectionCodenames])
      .toPromise()
      .then(res => {
        console.log('Blog posts fetched successfully:', res.data.items.length, 'posts');
        setBlogPosts(res.data.items);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching blog posts:', err);
        if (err instanceof DeliveryError) {
          setBlogPosts([]);
          setError('Failed to load blog posts');
        } else {
          setError('An unexpected error occurred');
          throw err;
        }
        setLoading(false);
      });
  }, [environmentId, apiKey, isPreview, lang]);

  useLivePreview(handleLiveUpdate);

  return { blogPosts, loading, error };
};

const BlogPage: React.FC = () => {
  const { environmentId, apiKey } = useAppContext();
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get("preview") === "true";
  const lang = searchParams.get("lang");

  const { page: blogPage, loading: blogPageLoading, error: blogPageError } = useBlogPage(isPreview, lang);
  const { blogPosts, loading: blogPostsLoading, error: blogPostsError } = useBlogPosts(isPreview, lang);

  const [blogPageData] = useSuspenseQueries({
    queries: [
      {
        queryKey: ["landing_page"],
        queryFn: () =>
          createClient(environmentId, apiKey, isPreview)
            .items()
            .type("landing_page")
            .limitParameter(1)
            .toPromise()
            .then(res =>
              res.data.items[0] as Replace<Page, { elements: Partial<Page["elements"]> }> ?? null
            )
            .catch((err) => {
              if (err instanceof DeliveryError) {
                return null;
              }
              throw err;
            }),
      },
    ],
  });

  const onRefresh = useCallback(
    (_: IRefreshMessageData, metadata: IRefreshMessageMetadata, originalRefresh: () => void) => {
      if (metadata.manualRefresh) {
        originalRefresh();
      } else {
        blogPageData.refetch();
      }
    },
    [blogPageData],
  );

  useCustomRefresh(onRefresh);

  // Debug logging
  console.log('BlogPage Debug:', {
    blogPage: blogPage ? 'loaded' : 'null',
    blogPageLoading,
    blogPageError,
    blogPosts: blogPosts ? `${blogPosts.length} posts` : 'null',
    blogPostsLoading,
    blogPostsError,
    blogPostsData: blogPosts
  });

  if (blogPageLoading) {
    return <div className="flex-grow">Loading blog page...</div>;
  }

  if (blogPageError) {
    return <div className="flex-grow">Error loading blog page: {blogPageError}</div>;
  }

  if (blogPostsLoading) {
    return <div className="flex-grow">Loading blog posts...</div>;
  }

  if (blogPostsError) {
    return <div className="flex-grow">Error loading blog posts: {blogPostsError}</div>;
  }

  if (!blogPage) {
    return <div className="flex-grow">Blog page not found.</div>;
  }

  return (
    <div className="flex flex-col gap-12">
      <PageSection color="bg-white">
        <div className="flex flex-col gap-16 lg:gap-0 lg:flex-col items-center py-16 lg:py-0 lg:pt-[104px] lg:pb-[160px] content-center">
          <div className="flex flex-col flex-1 gap-6 content-center">
            <h1 className="text-black text-[160px] font-bold"
              {...createItemSmartLink(blogPage.system.id)}
              {...createElementSmartLink("headline")}
            >
              {blogPage.elements.headline.value}
            </h1>
            {/* <p className="text-body-lg text-body-color"
              {...createItemSmartLink(blogPage.system.id)}
              {...createElementSmartLink("subheadline")}
            >
              {blogPage.elements.subheadline.value}
            </p> */}
          </div>
          
          {/* Blog Carousel */}
          <div className="w-full mt-8">
            <BlogCarousel
              blogs={blogPosts.slice(0, 3).map(post => ({
                imageSrc: post.elements.image?.value?.[0]?.url,
                title: post.elements.title?.value || 'Untitled',
                summary: post.elements.summary?.value || '',
                readMoreLink: post.elements.url_slug?.value || '#',
                itemId: post.system.id,
                tags: post.elements.blog_post_tags?.value?.map(tag => tag.name) || [],
              }))}
            />
          </div>
          {blogPage.elements.hero_image?.value[0]?.url && (
            <div className="flex flex-col flex-1">
              <img
                width={670}
                height={440}
                src={blogPage.elements.hero_image?.value[0]?.url}
                alt={blogPage.elements.hero_image?.value[0]?.description ?? ""}
                className="rounded-lg"
              />
            </div>
          )}
        </div>
      </PageSection>

      {!isEmptyRichText(blogPage.elements.body.value) && (
        <PageSection color="bg-white">
          <div className="flex flex-col pt-10 mx-auto gap-6"
            {...createItemSmartLink(blogPage.system.id)}
            {...createElementSmartLink("body")}
          >
            <PortableText
              value={transformToPortableText(blogPage.elements.body.value)}
              components={defaultPortableRichTextResolvers}
            />
          </div>
        </PageSection>
      )}

      <PageSection color="bg-white">
        <div className="pb-[160px] pt-[104px]">
          <BlogList
            blogs={blogPosts.map(post => {
              console.log('Mapping blog post:', {
                title: post.elements.title?.value,
                image: post.elements.image?.value?.[0]?.url,
                url_slug: post.elements.url_slug?.value,
                summary: post.elements.summary?.value
              });
              
              return {
                imageSrc: post.elements.image?.value?.[0]?.url,
                title: post.elements.title?.value || 'Untitled',
                description: post.elements.summary?.value || '',
                readMoreLink: post.elements.url_slug?.value || '#',
                itemId: post.system.id,
              };
            })}
          />
        </div>
      </PageSection>
    </div>
  );
};

export default BlogPage;
