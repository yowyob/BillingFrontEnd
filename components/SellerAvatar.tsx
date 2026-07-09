import React from "react";

interface Props {
  name?: string;
  imageUrl?: string;
  size?: number;
  className?: string;
}

const SellerAvatar = ({ name, imageUrl, size = 32, className = "" }: Props) => {
  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageUrl}
        alt={name || "Seller"}
        className={`rounded-full object-cover shrink-0 ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <span
      className={`rounded-full bg-secondary-super-light text-secondary-mid flex items-center justify-center font-black shrink-0 ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {(name || "?").charAt(0).toUpperCase()}
    </span>
  );
};

export default SellerAvatar;
