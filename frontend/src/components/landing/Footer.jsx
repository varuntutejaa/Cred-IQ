import { Link } from 'react-router-dom'
import { Shield, Github, Twitter, Linkedin } from 'lucide-react'

const LINKS = {
  Product:  ['Features', 'How It Works', 'Pricing', 'Changelog'],
  Company:  ['About', 'Blog', 'Careers', 'Contact'],
  Resources:['Documentation', 'API Reference', 'Status', 'Security'],
  Legal:    ['Privacy Policy', 'Terms of Service', 'Cookie Policy'],
}

export default function Footer() {
  return (
    <footer className="border-t border-white/5 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-accent-purple flex items-center justify-center">
                <Shield size={14} className="text-white" />
              </div>
              <span className="text-lg font-bold">Cred<span className="gradient-text">IQ</span></span>
            </Link>
            <p className="text-xs text-dark-400 leading-relaxed mb-4">
              Trust Through Verifiable Work. The developer identity platform for the modern hiring ecosystem.
            </p>
            <div className="flex gap-3">
              {[Github, Twitter, Linkedin].map((Icon, i) => (
                <button key={i} className="w-8 h-8 rounded-lg glass glass-hover flex items-center justify-center">
                  <Icon size={14} className="text-dark-300" />
                </button>
              ))}
            </div>
          </div>

          {/* Link groups */}
          {Object.entries(LINKS).map(([group, links]) => (
            <div key={group}>
              <p className="text-xs font-semibold text-dark-200 uppercase tracking-wider mb-3">{group}</p>
              <ul className="space-y-2">
                {links.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-sm text-dark-400 hover:text-white transition-colors">{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-dark-400">
            © {new Date().getFullYear()} CredIQ. All rights reserved.
          </p>
          <p className="text-xs text-dark-400">
            Built with ❤️ for the developer community
          </p>
        </div>
      </div>
    </footer>
  )
}
