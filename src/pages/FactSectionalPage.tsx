import React from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { createClient } from "../utils/client";
import { useAppContext } from "../context/AppContext";
import { FactSectional, LanguageCodenames } from "../model";
import FactSectionalComponent from "../components/FactSectional";
import { useQuery } from "@tanstack/react-query";
import { DeliveryError } from "@kontent-ai/delivery-sdk";

const FactSectionalPage: React.FC = () => {
  const { environmentId, apiKey } = useAppContext();
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get("preview") === "true";
  const lang = searchParams.get("lang");

  const { data: factSectional, isLoading, error } = useQuery({
    queryKey: ["fact-sectional", slug, lang, isPreview],
    queryFn: async () => {
      try {
        const response = await createClient(environmentId, apiKey, isPreview)
          .items<FactSectional>()
          .type("fact_sectional")
          .equalsFilter("system.codename", slug ?? "")
          .languageParameter((lang ?? "default") as LanguageCodenames)
          .depthParameter(3)
          .toPromise();

        return response.data.items[0] ?? null;
      } catch (err) {
        if (err instanceof DeliveryError) {
          return null;
        }
        throw err;
      }
    },
    enabled: !!slug,
  });

  if (isLoading) {
    return <div className="flex-grow">Loading...</div>;
  }

  if (error || !factSectional) {
    return <div className="flex-grow">Fact sectional not found.</div>;
  }

  return <FactSectionalComponent data={factSectional} />;
};

export default FactSectionalPage;
