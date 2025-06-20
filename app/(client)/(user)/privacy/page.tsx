import Container from "@/components/Container";
import React from "react";

const PrivacyPage = () => {
  return (
    <Container className="max-w-3xl sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-2">1. What We Collect</h2>
          <p>
            We collect personal information such as your name, email address,
            shipping address, and payment details when you make a purchase or
            interact with our website. This helps us process orders and improve
            your shopping experience.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">2. How We Use It</h2>
          <p>
            Your information is used to complete transactions, deliver orders,
            and send you updates about new arrivals, sales, and exclusive
            promotions—only if you subscribe. We also use it to enhance site
            performance and customer service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">3. Keeping Your Info Safe</h2>
          <p>
            We take security seriously. We use encrypted payment gateways and
            secure servers to protect your data from unauthorized access, loss,
            or misuse. Your trust is important to us.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">4. Your Choices</h2>
          <p>
            You can request access to, update, or delete your information at any
            time. You can also unsubscribe from marketing emails via the link
            provided in each message. For any privacy-related concerns, feel
            free to <a href="/contact" className="text-blue-600 underline">Contact Us</a>.
          </p>
        </section>
      </div>
    </Container>
  );
};

export default PrivacyPage;
