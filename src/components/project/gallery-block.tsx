import type { ProjectImage, GalleryItem, GridOptions } from "@/lib/types";
import Image from "next/image";
import React from "react";

type GalleryProps = {
  images: ProjectImage[];
  style: "default" | "masonry" | "featured";
  gridOptions?: GridOptions;
  items: GalleryItem[];
};

export default function Gallery({
  images,
  style,
  gridOptions,
  items,
}: GalleryProps) {
  function getWrapperClass() {
    console.log(gridOptions);

    if (style === "default") {
      const columns = gridOptions?.columns ? "" : "grid-cols-2";
      const gap = gridOptions?.gap ? `[gap:${gridOptions.gap}]` : "gap-4";
      const align = gridOptions?.align ? `items-${gridOptions.align}` : "";

      return `grid ${columns} ${gap} ${align}`;
    } else if (style === "masonry") {
      const columns = gridOptions?.columns ? "" : "grid-cols-2 md:grid-cols-4";
      const gap = gridOptions?.gap ? `[gap:${gridOptions.gap}]` : "gap-4";
      const align = gridOptions?.align ? `items-${gridOptions.align}` : "";

      return `grid ${columns} ${gap} ${align}`;
    } else {
      const columns = gridOptions?.columns ? "" : "gap-4";
      const gap = gridOptions?.gap ? `[gap:${gridOptions.gap}]` : "gap-4";
      const align = gridOptions?.align ? `items-${gridOptions.align}` : "";

      return `grid ${columns} ${gap} ${align}`;
    }
  }

  const styleClass: React.CSSProperties = {};
  if (gridOptions?.columns)
    styleClass.gridTemplateColumns = gridOptions.columns;

  switch (style) {
    case "default":
      return (
        <div className={getWrapperClass()} style={styleClass}>
          {items.map((item, i) => {
            const image = images.find((img) => img.order === item.index);
            if (!image) return null;

            return (
              <div key={`gallery-item-${i}`}>
                <Image
                  priority
                  src={image.image_url}
                  width={2000}
                  height={2000}
                  alt={item.alt}
                  className="rounded-md object-cover"
                />
                {item.desc && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {item.desc}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      );

    case "masonry": {
      const columns = 4;

      const columnItems: GalleryItem[][] = Array.from(
        { length: columns },
        () => [],
      );

      items.forEach((item, index) => {
        const col = index % columns;
        columnItems[col].push(item);
      });

      return (
        <div className={getWrapperClass()}>
          {columnItems.map((col, colIndex) => (
            <div key={`col-${colIndex}`} className="flex flex-col gap-4">
              {col.map((item, i) => {
                const image = images.find((img) => img.order === item.index);
                if (!image) return null;

                return (
                  <React.Fragment key={`gallery-item-${i}`}>
                    <Image
                      priority
                      src={image.image_url}
                      width={2000}
                      height={2000}
                      alt={item.alt}
                      className="h-auto max-w-full rounded-lg object-cover"
                    />
                    {item.desc && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {item.desc}
                      </p>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          ))}
        </div>
      );
    }
  }
}
