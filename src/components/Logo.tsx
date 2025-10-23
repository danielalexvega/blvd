import { FC } from "react";
import { Link } from "react-router-dom";

const Logo: FC = () => (
  <Link to="/">
    <div className="flex gap-4 items-center h-[50px] w-[120px] lg:w-full lg:max-w-28 2xl:max-w-40">
      <img src="/BLVD | Wordmark Black.svg" alt="Logo" className="h-full SVGInline-svg motion-safe:transition-colors-svg" />
    </div>
  </Link>
);

export default Logo;