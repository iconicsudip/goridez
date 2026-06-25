import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-brand-panel border-t border-brand-border mt-20 py-12">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1 md:col-span-2">
          <Link href="/" className="text-2xl font-bold font-heading mb-4 inline-block">
            GoRidez <span className="gradient-text">United</span>
          </Link>
          <p className="text-gray-600 leading-relaxed max-w-sm">
            Experience the ultimate luxury travel across Rajasthan with our premium fleet of self-drive cars, chauffeur services, and palace villa stays.
          </p>
        </div>
        
        <div>
          <h4 className="text-lg font-bold font-heading mb-4 text-green-700">Services</h4>
          <ul className="flex flex-col gap-2">
            <li><Link href="/self-drive" className="text-gray-600 hover:text-gray-900 transition-colors">Self-Drive Rentals</Link></li>
            <li><Link href="/chauffeur" className="text-gray-600 hover:text-gray-900 transition-colors">Chauffeur Driven</Link></li>
            <li><Link href="/taxi" className="text-gray-600 hover:text-gray-900 transition-colors">One-Way Taxi</Link></li>
            <li><Link href="/tours" className="text-gray-600 hover:text-gray-900 transition-colors">Tour Packages</Link></li>
            <li><Link href="/villas" className="text-gray-600 hover:text-gray-900 transition-colors">Villa + Car</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-lg font-bold font-heading mb-4 text-green-700">Legal</h4>
          <ul className="flex flex-col gap-2">
            <li><Link href="/privacy" className="text-gray-600 hover:text-gray-900 transition-colors">Privacy Policy</Link></li>
            <li><Link href="/terms" className="text-gray-600 hover:text-gray-900 transition-colors">Terms of Service</Link></li>
            <li><Link href="/contact" className="text-gray-600 hover:text-gray-900 transition-colors">Contact Us</Link></li>
          </ul>
        </div>
      </div>
      
      <div className="container mx-auto px-4 mt-12 pt-8 border-t border-gray-300 text-center text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} GoRidez United. All rights reserved.
      </div>
    </footer>
  );
}
