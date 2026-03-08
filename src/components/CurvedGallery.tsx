import Image from "next/image";

type CurvedImage = {
  src: string;
  alt: string;
};

export default function CurvedGallery({
  left,
  center,
  right,
}: {
  left: CurvedImage;
  center: CurvedImage;
  right: CurvedImage;
}) {
  return (
    <div className="curvedWrap">
      <div className="curvedStage">
        <figure className="panel left">
          <Image
            src={left.src}
            alt={left.alt}
            fill
            sizes="(max-width: 1024px) 33vw, 33vw"
            className="curvedImg"
          />
        </figure>
        <figure className="panel center">
          <Image
            src={center.src}
            alt={center.alt}
            fill
            sizes="(max-width: 1024px) 34vw, 34vw"
            className="curvedImg"
            priority
          />
        </figure>
        <figure className="panel right">
          <Image
            src={right.src}
            alt={right.alt}
            fill
            sizes="(max-width: 1024px) 33vw, 33vw"
            className="curvedImg"
          />
        </figure>
      </div>
      <div className="aperture top" />
      <div className="aperture bottom" />
    </div>
  );
}
