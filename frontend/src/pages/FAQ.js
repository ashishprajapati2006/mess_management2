import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import { UtensilsCrossed } from 'lucide-react';

function FAQ() {
  const navigate = useNavigate();

  const faqs = [
    {
      category: 'For Students',
      questions: [
        {
          q: 'How do I subscribe to a mess?',
          a: 'Simply search for messes in your area, browse through their menus and ratings, select a mess, choose your preferred plan (monthly or weekly), and complete the secure payment process.'
        },
        {
          q: 'Can I cancel my subscription?',
          a: 'Yes, you can pause or cancel your subscription anytime from your dashboard. However, refunds are subject to the mess owner\'s policy and timing of cancellation.'
        },
        {
          q: 'How do I skip a meal?',
          a: 'You can skip any meal by providing at least 2 hours notice. Go to your dashboard, select the subscription, choose "Skip Meal", and select the date and meal type you want to skip.'
        },
        {
          q: 'What payment methods are accepted?',
          a: 'We accept all major payment methods through Razorpay including credit/debit cards, UPI, net banking, and digital wallets.'
        },
        {
          q: 'How can I file a complaint?',
          a: 'If you have any issues with food quality or service, you can file a complaint directly from the mess details page or your dashboard. Our admin team will review and take appropriate action.'
        }
      ]
    },
    {
      category: 'For Mess Owners',
      questions: [
        {
          q: 'How do I register my mess?',
          a: 'Sign up as a mess owner, provide your mess details including location, pricing, and contact information. Our admin team will verify your mess within 24-48 hours before it goes live.'
        },
        {
          q: 'How do I update my menu?',
          a: 'From your owner dashboard, select your mess and click "Update Menu". You can add or modify items for each day of the week and each meal time.'
        },
        {
          q: 'How do I receive payments?',
          a: 'Payments are processed through Razorpay and automatically transferred to your registered bank account based on your payment settlement schedule.'
        },
        {
          q: 'What if I receive multiple complaints?',
          a: 'Our admin team reviews all complaints carefully. Multiple unresolved complaints may result in warnings or temporary suspension until issues are resolved.'
        },
        {
          q: 'Can I offer both dine-in and delivery?',
          a: 'Yes, when registering your mess, you can choose "Both" as your mess type to offer both dine-in and delivery services to students.'
        }
      ]
    },
    {
      category: 'General',
      questions: [
        {
          q: 'Is my payment information secure?',
          a: 'Absolutely! We use Razorpay\'s secure payment gateway with industry-standard encryption. We never store your payment information on our servers.'
        },
        {
          q: 'How do ratings work?',
          a: 'Students can rate messes on a scale of 1-5 stars and leave reviews. All ratings are verified and help other students make informed decisions.'
        },
        {
          q: 'What happens if a mess is not verified?',
          a: 'Unverified messes are not visible to students in search results. Only verified messes that meet our quality standards are shown to potential subscribers.'
        },
        {
          q: 'Can I have multiple subscriptions?',
          a: 'Yes, you can subscribe to multiple messes simultaneously if you need different meal options or backup arrangements.'
        },
        {
          q: 'How do I contact support?',
          a: 'You can reach our support team through the Contact Us page, via email at support@smartmess.com, or call us at +91 98765 43210 during business hours.'
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50" data-testid="faq-page">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
              <UtensilsCrossed className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">Smart Mess</span>
            </div>
            <Button onClick={() => navigate('/')} variant="outline" data-testid="back-home-btn">Back to Home</Button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 text-center mb-6">Frequently Asked Questions</h1>
        <p className="text-xl text-gray-600 text-center mb-16">
          Find answers to common questions about Smart Mess System
        </p>

        <div className="space-y-8">
          {faqs.map((category, idx) => (
            <div key={idx} data-testid={`faq-category-${idx}`}>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{category.category}</h2>
              <Accordion type="single" collapsible className="w-full">
                {category.questions.map((item, qIdx) => (
                  <AccordionItem key={qIdx} value={`item-${idx}-${qIdx}`} data-testid={`faq-item-${idx}-${qIdx}`}>
                    <AccordionTrigger className="text-left">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-700">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>

        {/* Still Have Questions */}
        <div className="mt-16 bg-gradient-to-br from-blue-50 to-white p-8 rounded-2xl border border-blue-100 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Still Have Questions?</h2>
          <p className="text-gray-600 mb-6">
            Can't find the answer you're looking for? Our support team is here to help.
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => navigate('/contact')} data-testid="contact-support-btn">
              Contact Support
            </Button>
            <Button variant="outline" onClick={() => navigate('/feedback')} data-testid="send-feedback-btn">
              Send Feedback
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FAQ;