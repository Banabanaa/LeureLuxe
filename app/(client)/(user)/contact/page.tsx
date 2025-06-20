"use client";

import Container from "@/components/Container";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import React, { useState, useRef } from "react";

const ContactPage = () => {
  const [messageSent, setMessageSent] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const form = formRef.current;
    if (!form) return;

    const formData = new FormData(form);

    const res = await fetch("https://formspree.io/f/xnnvbvwz", {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json",
      },
    });

    if (res.ok) {
      setMessageSent(true);
      form.reset();
    } else {
      alert("There was an error sending your message. Please try again.");
    }
  };

  return (
    <Container className="max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
      <p className="mb-6">
        We&apos;d love to hear from you. Please fill out the form below and
        we&apos;ll get back to you as soon as possible.
      </p>

      {messageSent && (
        <div className="mb-4 p-4 bg-green-100 text-green-800 rounded-md">
          ✅ Message has been sent. Kindly wait for our response. Thank you!
        </div>
      )}

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-0.5">
          <Label htmlFor="name">Name</Label>
          <Input type="text" name="name" required />
        </div>
        <div className="space-y-0.5">
          <Label htmlFor="email">Email</Label>
          <Input type="email" name="email" required />
        </div>
        <div className="space-y-0.5">
          <Label htmlFor="message">Message</Label>
          <Textarea name="message" rows={6} required />
        </div>
        <button
          type="submit"
          className="bg-darkColor/80 text-white px-6 py-3 rounded-md text-sm font-semibold hover:bg-darkColor hoverEffect"
        >
          Send Message
        </button>
      </form>
    </Container>
  );
};

export default ContactPage;
