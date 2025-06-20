import Container from "@/components/Container";
import React from "react";

const AboutPage = () => {
  return (
    <Container className="max-w-6xl lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-6">About Leure Luxe</h1>
      <p className="mb-4">
        Leure Luxe is a curated accessories destination that offers a wide selection of premium, preloved, and on-sale pieces. We are passionate about bringing timeless style and affordable luxury to everyone who values elegance and individuality.
      </p>
      <p className="mb-4">
        From designer handbags to statement jewelry and fashion must-haves, each item at Leure Luxe is carefully selected to ensure quality, authenticity, and value. Our preloved collection gives iconic items a second life—making luxury more sustainable and accessible.
      </p>
      <p>
        Whether you're looking for a treasured vintage find or the latest trending accessory, Leure Luxe is your go-to source. We believe that style should be expressive, elevated, and within reach—without compromising on quality or conscience.
      </p>
    </Container>
  );
};

export default AboutPage;
