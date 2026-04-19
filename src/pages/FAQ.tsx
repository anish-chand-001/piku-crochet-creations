import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const faqData = [
  {
    section: "Frequently Asked Questions (FAQs)",
    items: [
      {
        question: "1. Do you accept returns or exchanges?",
        answer: "No. All products are handcrafted and made to order.\nReturns or exchanges are not accepted after order confirmation.\n\nException applies only if you receive a damaged or defective product due to our error."
      },
      {
        question: "2. What should I do if I receive a damaged or defective product?",
        answer: "Follow these steps:\n\n• Record a clear unboxing video from the moment you receive the parcel\n• Do not pause or cut the video\n• Capture the full opening process\n\nThen:\n\n• Send the video and product images within 24 hours of delivery\n• Share via email or Instagram\n\nAfter verification, a replacement or store credit will be provided."
      },
      {
        question: "3. Is unboxing video mandatory for claims?",
        answer: "Yes. Claims without a proper unboxing video will not be accepted."
      },
      {
        question: "4. When will a replacement not be accepted?",
        answer: "Claims will be rejected in these cases:\n\n• Product damaged due to improper use, washing, or storage\n• Product used, altered, or mishandled after delivery\n• Minor variations in color, size, or design\n• Claim submitted after 24 hours of delivery"
      },
      {
        question: "5. Can I return or cancel custom orders?",
        answer: "Orders cannot be canceled once payment is completed.\n\nFor immediate changes:\n\nContact within 1 hour of placing the order"
      }
    ]
  },
  {
    section: "Orders",
    items: [
      {
        question: "How do I place an order?",
        answer: "You can browse our products and place your order directly through the website. Once your payment is completed, your order will be confirmed."
      },
      {
        question: "Do you offer custom crochet products?",
        answer: "Yes, we offer custom-made crochet items. To place a custom order, please contact us via email or Instagram with your requirements."
      }
    ]
  },
  {
    section: "Payments",
    items: [
      {
        question: "What payment methods do you accept?",
        answer: "We currently accept payments via UPI."
      },
      {
        question: "Is full payment required?",
        answer: "Yes, full payment is required for all website orders. For custom orders, a 70% advance is required to begin work, and the remaining amount must be paid before dispatch."
      }
    ]
  },
  {
    section: "Shipping",
    items: [
      {
        question: "How long will it take to receive my order?",
        answer: "Orders usually take 7–14 business days for preparation and 3–7 working days for delivery after dispatch.\nCustom orders may take longer depending on design complexity."
      }
    ]
  },
  {
    section: "Returns & Replacement",
    items: [
      {
        question: "Do you accept returns or refunds?",
        answer: "No, we do not accept returns or refunds."
      },
      {
        question: "What if I receive a damaged product?",
        answer: "If the product is damaged due to our fault, you must record a clear unboxing video and contact us within 24 hours of delivery. After verification, a replacement or store credit will be provided if applicable."
      }
    ]
  },
  {
    section: "Product Care",
    items: [
      {
        question: "How should I care for my crochet products?",
        answer: "• Hand wash gently in cold water\n• Do not machine wash\n• Air dry only"
      }
    ]
  },
  {
    section: "Policies",
    items: [
      {
        question: "Return & Refund Policy",
        answer: "At Piku Crochet, each product is handmade with care. Due to the nature of our products, we follow a strict policy.\n\n• No returns or refunds are accepted once a product is purchased\n• Replacement is only applicable for damaged items caused by our fault\n• A clear unboxing video is required\n• The issue must be reported within 24 hours of delivery\n\nCustom-made products are strictly non-returnable and non-refundable."
      },
      {
        question: "Custom Orders Policy",
        answer: "Custom orders are not placed through the website. You can contact us via:\n\nEmail: mehtapalak.crocheter@gmail.com\nInstagram: @pikucrochet\n\nPayment Terms:\n• 70% advance is required to begin work\n• Remaining payment must be completed before dispatch\n\nProcessing Time:\nCustom orders take longer than regular orders and depend on design complexity.\n\nCancellation Policy:\nOrders can only be cancelled if work has not started. Once production begins, cancellation is not allowed.\n\nRefund Policy:\nAll custom orders are strictly non-refundable."
      },
      {
        question: "Shipping Policy",
        answer: "Order Processing:\nAll products are handmade and made to order. Orders are processed in sequence and typically require 7–14 business days for preparation. Custom orders may take longer.\n\nShipping & Delivery:\n• We ship worldwide through trusted courier services\n• Tracking details are shared after dispatch\n• Delivery usually takes 3–7 working days after dispatch\n\nShipping Charges:\n• Standard shipping is ₹150 (may vary based on location and order weight)\n• Custom or bulk orders may have different shipping charges, which will be communicated in advance\n\nDelivery Delays:\nDelays may occur due to courier issues, weather conditions, holidays, or remote locations. We are not responsible for delays once the order is dispatched.\n\nIncorrect Address:\nCustomers must provide accurate details. If a parcel is returned due to incorrect information, re-shipping charges will apply.\n\nDamaged Packages:\nIf your parcel arrives damaged, refuse delivery if possible. Otherwise, record an unboxing video and contact us within 24 hours.\n\nInternational Shipping:\n• Available worldwide\n• Delivery times vary by country\n• Customers are responsible for customs duties and taxes\n• Delays due to customs are beyond our control"
      },
      {
        question: "Privacy Policy",
        answer: "We respect your privacy and are committed to protecting your personal information.\n\nInformation Collected:\n• Name\n• Email address\n• Phone number\n• Shipping address\n\nUsage of Information:\nYour information is used to process orders, provide updates, and offer customer support.\n\nData Protection:\nWe take reasonable measures to protect your data and do not sell or share it with third parties, except when required for order fulfillment (such as shipping partners)."
      },
      {
        question: "Terms & Conditions",
        answer: "By using our website, you agree to the following:\n\n• All orders are subject to availability and acceptance\n• Full payment is required before processing\n• Products are handmade, so slight variations may occur\n• Delivery timelines are estimates and may vary\n• We are not responsible for courier delays after dispatch\n• Customers must provide accurate information\n• We are not liable for misuse of products\n"
      },
      {
        question: "Contact Us",
        answer: "Piku Crochet\n\nEmail: mehtapalak.crocheter@gmail.com\nInstagram: @pikucrochet\n\nResponse Time: 24–48 hours"
      }
    ]
  }
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  const toggleAccordion = (index: string) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#FDF8F2] pt-28 pb-20 px-6 sm:px-12 font-body">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-stone-800 mb-4 font-display">
            FAQs & Policies
          </h1>
          <p className="text-stone-600 text-lg">
            Everything you need to know about our products, orders, and policies.
          </p>
        </div>

        <div className="space-y-10">
          {faqData.map((section, sectionIndex) => (
            <div key={sectionIndex} className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-stone-100">
              <h2 className="text-2xl font-semibold text-stone-800 mb-6 font-display border-b border-stone-100 pb-4">
                {section.section}
              </h2>
              
              <div className="space-y-4">
                {section.items.map((item, itemIndex) => {
                  const uniqueIndex = `${sectionIndex}-${itemIndex}`;
                  const isOpen = openIndex === uniqueIndex;
                  
                  return (
                    <div 
                      key={uniqueIndex} 
                      className="border border-stone-200 rounded-xl overflow-hidden transition-all duration-300 hover:border-primary/30"
                    >
                      <button
                        className="w-full flex items-center justify-between p-4 md:p-5 text-left bg-white hover:bg-stone-50 transition-colors"
                        onClick={() => toggleAccordion(uniqueIndex)}
                      >
                        <span className="font-medium text-stone-800 pr-4">{item.question}</span>
                        {isOpen ? (
                          <ChevronUp className="w-5 h-5 text-primary flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-stone-400 flex-shrink-0" />
                        )}
                      </button>
                      
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                          >
                            <div className="p-4 md:p-5 text-stone-600 border-t border-stone-100 bg-stone-50/50 whitespace-pre-line leading-relaxed">
                              {item.answer}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQ;
