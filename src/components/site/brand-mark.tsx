import Image from "next/image";

import logo from "../../../public/assets/brand/ecsc-logo-color.png";

/**
 * The color logo: "EL CERRITO" arced over the extruded "SUPPLY CO.", cropped
 * from the brand files without the "Community, Collaboration, Co-op" tagline.
 * Its letter faces are white, so it only reads on the dark sign behind it.
 */
export function BrandMark() {
  return (
    <Image
      src={logo}
      alt="El Cerrito Supply Co."
      sizes="(max-width: 900px) 160px, 13vw"
      preload
      className="block h-full w-auto"
    />
  );
}
