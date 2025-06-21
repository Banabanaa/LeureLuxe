import React, { HTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

const Tag = (props: HTMLAttributes<HTMLDivElement>) => {
  const { className, children, ...rest } = props;

  return (
    <div
      {...rest}
      className={twMerge(
        "inline-flex border border-lime-500 text-lime-600 px-4 py-1.5 rounded-full uppercase items-center text-sm font-medium shadow-sm bg-lime-50",
        className
      )}
    >
      <span className="mr-2">&#10038;</span>
      {children}
    </div>
  );
};

export default Tag;
