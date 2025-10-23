import { FC, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Container from "../components/Container";
import { Event } from "../model";
import { formatDate } from "../utils/date";
import { transformToPortableText } from "@kontent-ai/rich-text-resolver";
import { defaultPortableRichTextResolvers } from "../utils/richtext";
import { PortableText } from "@portabletext/react";
import { createItemSmartLink, createElementSmartLink } from "../utils/smartlink";
import ButtonLink from "../components/ButtonLink";
import { createClient } from "../utils/client";
import { useAppContext } from "../context/AppContext";
import { DeliveryError } from "@kontent-ai/delivery-sdk";
import { useSearchParams } from "react-router-dom";
import { LanguageCodenames } from "../model";

const EventPage: FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { environmentId, apiKey, collection } = useAppContext();
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get("preview") === "true";
  const lang = searchParams.get("lang");
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    console.log('Looking for event with slug:', slug);
    console.log('Using collection:', collection ?? "pittsburgh_symphony_orchestra");
    console.log('Environment ID:', environmentId);

    // Try without collection filter first
    createClient(environmentId, apiKey, isPreview)
      .items<Event>()
      .type("event")
      .depthParameter(3)
      .languageParameter((lang ?? "default") as LanguageCodenames)
      .toPromise()
      .then(res => {
        console.log('All events found:', res.data.items.length);
        console.log('Event codenames:', res.data.items.map(e => e.system.codename));
        console.log('Event collections:', res.data.items.map(e => e.system.collection));
        
        // Find by system codename since url_slug doesn't exist in the Event type
        const foundEvent = res.data.items.find(e => e.system.codename === slug);
        console.log('Found event by codename:', foundEvent);
        setEvent(foundEvent || null);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching events:', err);
        if (err instanceof DeliveryError) {
          setEvent(null);
        } else {
          throw err;
        }
        setLoading(false);
      });
  }, [slug, environmentId, apiKey, collection, isPreview, lang]);

  if (loading) {
    return <div className="flex-grow flex items-center justify-center">Loading...</div>;
  }

  if (!event) {
    return <div className="flex-grow flex items-center justify-center">Event not found for slug: {slug}</div>;
  }
  return (
    <div className="flex-grow">
      {/* Hero Section */}
      <div className="relative w-full h-[600px] lg:h-[700px]">
        {/* Background Image */}
        <div className="absolute inset-0"
          {...createItemSmartLink(event.system.id)}
          {...createElementSmartLink("image")}
        >
          <img
            className="object-cover w-full h-full"
            src={`${event.elements.image.value[0]?.url}?auto=format&w=1920`}
            alt={event.elements.image.value[0]?.description ?? "Event image"}
          />
        </div>
        
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        
        {/* Content overlay */}
        <div className="absolute inset-0 flex items-end">
          <Container className="pb-8">
            <div className="flex justify-between items-end">
              <div className="max-w-2xl">
                <h1 className="text-white font-sans text-[70px] leading-tight mb-6 font-light"
                  {...createItemSmartLink(event.system.id)}
                  {...createElementSmartLink("name")}
                >
                  {event.elements.name.value}
                </h1>
              </div>
              <div className="text-white font-sans text-[16px]">
                {event.elements.start_date?.value && event.elements.end_date?.value && (
                  <span>
                    {formatDate(event.elements.start_date.value)} - {formatDate(event.elements.end_date.value)}
                  </span>
                )}
              </div>
            </div>
          </Container>
        </div>
      </div>

      {/* Main Content */}
      <Container className="py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Description Section */}
            {event.elements.description?.value && (
              <div
                {...createItemSmartLink(event.system.id)}
                {...createElementSmartLink("description")}
              >
                <div className="prose prose-lg max-w-none">
                  <PortableText
                    value={transformToPortableText(event.elements.description.value)}
                    components={defaultPortableRichTextResolvers}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-100 p-6 rounded-lg sticky top-8">
              {/* Event Dates */}
              {event.elements.start_date?.value && event.elements.end_date?.value && (
                <div className="mb-6">
                  <p className="text-lg font-semibold text-gray-dark">
                    {formatDate(event.elements.start_date.value)} - {formatDate(event.elements.end_date.value)}
                  </p>
                </div>
              )}

              {/* Get Tickets Button */}
              <div className="mb-6">
                <ButtonLink 
                  href="#" 
                  className="w-full bg-burgundy hover:bg-burgundy text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
                >
                  Get Tickets
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </ButtonLink>
              </div>

              {/* Venue Information */}
              <div className="space-y-2">
                <p className="text-sm text-gray-light italic">Pittsburgh Symphony Orchestra</p>
                <p className="text-lg font-bold text-gray-dark">HEINZ HALL</p>
                <p className="text-sm text-gray-light">
                  {event.elements.event_type?.value?.map(t => t.name).join(" , ")}
                </p>
              </div>

            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default EventPage;
