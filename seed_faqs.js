const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const faqs = [
    {
      question: "What are the requirements to rent a self-drive car?",
      answer: "To rent a self-drive vehicle, you must be at least 21 years old and possess a valid original driving license (Indian or International), a valid government ID (Aadhar/Passport), and a credit/debit card for the security deposit."
    },
    {
      question: "Is the security deposit fully refundable?",
      answer: "Yes, the security deposit is 100% fully refundable. It will be returned to your original payment method immediately upon returning the vehicle in the same condition it was provided, assuming no damages or traffic violations."
    },
    {
      question: "Are tolls and parking included in the chauffeur service?",
      answer: "Our elite chauffeur service covers the vehicle, fuel, and the driver's allowance. However, state border taxes, toll booth fees, and parking charges during your trip are usually settled directly by the client unless a specific 'All-Inclusive' package is selected."
    },
    {
      question: "Can I take the rental car outside Rajasthan?",
      answer: "Yes, our vehicles hold all-India permits. However, if you plan to travel across state borders, please inform our team in advance so we can ensure all state-specific documentation and permits are strictly in order for a seamless journey."
    },
    {
      question: "What happens if the vehicle breaks down during my trip?",
      answer: "While all our vehicles are rigorously maintained and inspected before every trip, in the rare event of a breakdown, we provide 24/7 dedicated roadside assistance. We will either fix the issue immediately on-site or provide a premium replacement vehicle at no extra cost."
    }
  ];

  for (const faq of faqs) {
    await prisma.fAQ.create({ data: faq });
  }
  
  console.log("Successfully added FAQs!");
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
