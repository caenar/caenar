import { GalleryItem, GridOptions, ProjectImage } from "@/lib/types";
import Image from "next/image";

type GalleryProps = {
  images: ProjectImage[];
  style: string;
  gridOptions?: GridOptions;
  items: GalleryItem[];
};

export default function Gallery({
  images,
  style,
  gridOptions,
  items,
}: GalleryProps) {
  const wrapperClass =
    style === "default"
      ? "grid grid-cols-2 md:grid-cols-3 gap-4"
      : style === "masonry"
        ? "grid grid-cols-2 md:grid-cols-4 gap-4"
        : "grid gap-4"; // featured

  function renderContent() {
    switch (style) {
      case "default":
        return items.map((item, i) => (
          <div key={`gallery-item-${i}`}>
            <Image
              priority
              src={images[i].image_url}
              width={2000}
              height={2000}
              alt={item.alt}
            />
          </div>
        ));
    }
  }

  return <div className={wrapperClass}>{renderContent()}</div>;
}
