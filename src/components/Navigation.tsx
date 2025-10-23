import { FC, useState, useEffect, useRef } from "react";
import { NavLink, useSearchParams } from "react-router";
import { createClient } from "../utils/client";
import { CollectionCodenames, LandingPage, LanguageCodenames } from "../model";
import { DeliveryError } from "@kontent-ai/delivery-sdk";
import { useSuspenseQueries } from "@tanstack/react-query";
import { useAppContext } from "../context/AppContext";
import { createPreviewLink } from "../utils/link";

const Navigation: FC = () => {
  const { environmentId, apiKey, collection } = useAppContext();
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get("preview") === "true";
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);

  const lang = searchParams.get("lang");
  const collectionParam = searchParams.get("collection")
  const collectionFilter = collectionParam ?? collection ?? "patient_resources";

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const [navigation] = useSuspenseQueries({
    queries: [
      {
        queryKey: ["navigation"],
        queryFn: () =>
          createClient(environmentId, apiKey, isPreview)
            .items<LandingPage>()
            .type("landing_page")
            .limitParameter(1)
            .languageParameter((lang ?? "default") as LanguageCodenames)
            .collections([collectionFilter as CollectionCodenames])
            .toPromise()
            .then(res => res.data.items[0]?.elements.subpages.linkedItems.map(subpage => ({
              name: subpage.elements.headline.value,
              link: subpage.elements.url.value,
              subpages: subpage.elements.subpages.linkedItems.map(subSubpage => ({
                name: subSubpage.elements.headline?.value || '',
                link: subSubpage.elements.url?.value || '',
              }))
            })))
            .catch((err) => {
              if (err instanceof DeliveryError) {
                return null;
              }
              throw err;
            }),
      },
    ],
  });

  const createMenuLink = (item: { name: string; link: string; subpages?: Array<{ name: string; link: string }> }) => {
    const hasSubpages = item.subpages && item.subpages.length > 0;
    const isActive = activeDropdown === item.name;

    return (
      <li key={item.name} className="relative">
        <div
          className="flex items-center gap-1 cursor-pointer"
          onMouseEnter={() => hasSubpages && setActiveDropdown(item.name)}
          onMouseLeave={() => hasSubpages && setActiveDropdown(null)}
        >
          <NavLink 
            to={createPreviewLink(item.link, isPreview)} 
            className="text-black hover:text-gray-700 font-normal transition-colors duration-200"
          >
            {item.name}
          </NavLink>
          {hasSubpages && (
            <svg 
              className={`w-3 h-3 transition-transform duration-200 ${isActive ? 'rotate-180' : ''}`} 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        
        {hasSubpages && isActive && (
          <div 
            className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50"
            onMouseEnter={() => setActiveDropdown(item.name)}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <div className="p-6">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
                    {item.name}
                  </h3>
                  <ul className="space-y-2">
                    {item.subpages?.slice(0, Math.ceil((item.subpages?.length || 0) / 2)).map((subpage) => (
                      <li key={subpage.name}>
                        <NavLink
                          to={createPreviewLink(subpage.link, isPreview)}
                          className="block text-sm text-gray-600 hover:text-black transition-colors duration-200"
                        >
                          {subpage.name}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </div>
                {item.subpages && item.subpages.length > 4 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
                      More
                    </h3>
                    <ul className="space-y-2">
                      {item.subpages.slice(Math.ceil((item.subpages?.length || 0) / 2)).map((subpage) => (
                        <li key={subpage.name}>
                          <NavLink
                            to={createPreviewLink(subpage.link, isPreview)}
                            className="block text-sm text-gray-600 hover:text-black transition-colors duration-200"
                          >
                            {subpage.name}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </li>
    );
  };

  return (
    <nav ref={navRef}>
      <menu className="flex flex-row gap-8 items-center list-none">
        {
          navigation.data?.map((item) => createMenuLink(item))
        }
      </menu>
    </nav>
  );
};

export default Navigation;
