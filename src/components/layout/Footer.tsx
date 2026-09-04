import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Twitter, Youtube } from 'lucide-react';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">BlueForce</h3>
            <p className="text-gray-300 mb-4">
              {t('footer.tagline')}
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-white">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-white">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-white">
                <Linkedin size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-white">
                <Youtube size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('footer.quickLinks')}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white">
                  {t('header.home')}
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-gray-300 hover:text-white">
                  {t('header.howItWorks')}
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-gray-300 hover:text-white">
                  {t('header.services')}
                </Link>
              </li>
              <li>
                <Link to="#" className="text-gray-300 hover:text-white">
                  {t('footer.aboutUs')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('footer.legal')}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="#" className="text-gray-300 hover:text-white">
                  {t('footer.privacy')}
                </Link>
              </li>
              <li>
                <Link to="#" className="text-gray-300 hover:text-white">
                  {t('footer.terms')}
                </Link>
              </li>
              <li>
                <Link to="#" className="text-gray-300 hover:text-white">
                  {t('footer.faq')}
                </Link>
              </li>
              <li>
                <Link to="#" className="text-gray-300 hover:text-white">
                  {t('footer.careers')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('footer.contact')}</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin size={18} className="mr-2 mt-1 flex-shrink-0" />
                <span className="text-gray-300">
                  {t('footer.address')}
                </span>
              </li>
              <li className="flex items-center">
                <Phone size={18} className="mr-2 flex-shrink-0" />
                <span className="text-gray-300">
                  {t('footer.phone')}
                </span>
              </li>
              <li className="flex items-center">
                <Mail size={18} className="mr-2 flex-shrink-0" />
                <span className="text-gray-300">
                  {t('footer.email')}
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-white">{t('footer.subscribeTitle')}</h3>
            <form className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder={t('footer.emailPlaceholder')}
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {t('footer.subscribe')}
              </button>
            </form>
            <p className="text-xs text-gray-400 mt-2">{t('footer.subscribeNote')}</p>
          </div>
          <div className="text-center text-gray-400 text-sm">
            <p>&copy; {new Date().getFullYear()} BlueForce. {t('footer.copyright')}</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
