import { Link } from 'react-router-dom'
import { Bus, Facebook, Twitter, Instagram, Mail, Phone, MapPin, Globe } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  return (
    <footer className="border-t border-border bg-card/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-sky-500 to-maroon-700 p-2 rounded-lg"><Bus className="h-5 w-5 text-white" /></div>
              <span className="font-display text-xl font-bold"><span className="text-gradient">Twende</span></span>
            </Link>
            <p className="text-sm text-muted-foreground">Your AI-powered travel companion for seamless bus booking across East Africa. Let's Go!</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Globe className="h-3 w-3" />
              <span>🇰🇪 🇺🇬 🇷🇼 🇨🇩 🇹🇿</span>
            </div>
            <div className="flex gap-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors"><Facebook className="h-5 w-5" /></a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors"><Twitter className="h-5 w-5" /></a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors"><Instagram className="h-5 w-5" /></a>
            </div>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">Home</Link></li>
              <li><Link to="/search" className="text-sm text-muted-foreground hover:text-primary transition-colors">Search Trips</Link></li>
              <li><Link to="/bookings" className="text-sm text-muted-foreground hover:text-primary transition-colors">My Bookings</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-4">Popular Routes</h4>
            <ul className="space-y-2">
              <li><Link to="/search?origin=Nairobi&destination=Kampala" className="text-sm text-muted-foreground hover:text-primary transition-colors">Nairobi → Kampala 🇰🇪🇺🇬</Link></li>
              <li><Link to="/search?origin=Nairobi&destination=Kigali" className="text-sm text-muted-foreground hover:text-primary transition-colors">Nairobi → Kigali 🇰🇪🇷🇼</Link></li>
              <li><Link to="/search?origin=Kampala&destination=Kigali" className="text-sm text-muted-foreground hover:text-primary transition-colors">Kampala → Kigali 🇺🇬🇷🇼</Link></li>
              <li><Link to="/search?origin=Kigali&destination=Goma" className="text-sm text-muted-foreground hover:text-primary transition-colors">Kigali → Goma 🇷🇼🇨🇩</Link></li>
              <li><Link to="/search?origin=Nairobi&destination=Mombasa" className="text-sm text-muted-foreground hover:text-primary transition-colors">Nairobi → Mombasa 🇰🇪</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="h-4 w-4 text-primary" /><span>Nairobi, Kenya (HQ)</span></li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground"><Phone className="h-4 w-4 text-primary" /><span>+254 700 123 456</span></li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground"><Mail className="h-4 w-4 text-primary" /><span>hello@twende.africa</span></li>
            </ul>
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground">Offices in:</p>
              <p className="text-xs text-muted-foreground mt-1">Kampala • Kigali • Goma • Dar es Salaam</p>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            <p className="text-sm text-muted-foreground">© {currentYear} Twende. All rights reserved.</p>
            <span className="hidden sm:inline text-muted-foreground">•</span>
            <p className="text-sm text-muted-foreground">Built with ❤️ by <span className="text-primary font-semibold">AlfredoCAMP</span></p>
          </div>
          <div className="flex gap-6">
            <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
