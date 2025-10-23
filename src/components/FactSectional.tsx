import React from "react";
import { FactSectional, PercentageFact } from "../model";
import { createElementSmartLink, createItemSmartLink } from "../utils/smartlink";

type FactSectionalProps = {
  data: FactSectional;
};

const FactSectionalComponent: React.FC<FactSectionalProps> = ({ data }) => {
  const style = data.elements.style?.value?.[0]?.codename || "gold";
  const isBlackStyle = style === "black";

  // Gold style: light background, gold percentages, dark text
  // Black style: black background, white percentages, gold descriptions

  const containerClasses = isBlackStyle 
    ? "bg-black text-white" 
    : "bg-creme text-black";

  const titleClasses = isBlackStyle
    ? "text-white font-bold text-4xl lg:text-5xl"
    : "text-black font-bold text-4xl lg:text-5xl";

  const percentageClasses = isBlackStyle
    ? "text-white font-bold text-6xl lg:text-7xl"
    : "text-pct_yellow font-bold text-6xl lg:text-7xl";

  const labelClasses = isBlackStyle
    ? "text-pct_yellow font-medium text-lg lg:text-xl"
    : "text-black font-medium text-lg lg:text-xl";

  const disclaimerClasses = isBlackStyle
    ? "text-gray-300 text-sm"
    : "text-gray-600 text-sm";

  return (
    <div className={`py-16 lg:py-24 ${containerClasses}`} {...createItemSmartLink(data.system.id)}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Title */}
        {data.elements.title?.value && (
          <div className="text-center mb-12 lg:mb-16">
            <h2 
              className={titleClasses}
              {...createElementSmartLink("title")}
            >
              {data.elements.title.value}
            </h2>
          </div>
        )}

        {/* Percentage Facts Grid */}
        {data.elements.percentage_facts?.linkedItems && data.elements.percentage_facts.linkedItems.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
            {data.elements.percentage_facts.linkedItems.map((fact: PercentageFact) => (
              <div 
                key={fact.system.id} 
                className="text-center"
                {...createItemSmartLink(fact.system.id)}
              >
                {/* Percentage Value */}
                {fact.elements.percentage_value?.value && (
                  <div 
                    className={percentageClasses}
                    {...createElementSmartLink("percentage_value")}
                  >
                    {fact.elements.percentage_value.value}%
                  </div>
                )}
                
                {/* Label */}
                {fact.elements.label?.value && (
                  <div 
                    className={`mt-2 ${labelClasses}`}
                    {...createElementSmartLink("label")}
                  >
                    {fact.elements.label.value}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Disclaimer */}
        {data.elements.disclaimer?.value && (
          <div className="text-center">
            <p 
              className={disclaimerClasses}
              {...createElementSmartLink("disclaimer")}
            >
              {data.elements.disclaimer.value}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FactSectionalComponent;
