import { Mail } from "lucide-react";
import logo from "../assets/logo.svg";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {/* Left Section */}
          <div>
            <img src={logo} alt="SkillSwap Logo" className="h-10 w-auto" />

            <p className="mt-8 text-gray-600 leading-8 max-w-md">
                          Experience the power of AI with Quick.ai. <br />
                          Transform your content creation with our suite of premium AI
                          tools. Write articles, generate images, and enhance your workflow
            </p>
          </div>

          {/* Middle Section */}
          <div className="lg:mx-auto">
            <h3 className="text-xl font-semibold text-gray-900">Company</h3>

            <ul className="mt-6 space-y-4">
              <li>
                <a
                  href="/"
                  className="text-gray-600 hover:text-indigo-600 transition">
                  Home
                </a>
              </li>

              <li>
                <a
                  href="/about"
                  className="text-gray-600 hover:text-indigo-600 transition">
                  About Us
                </a>
              </li>

              <li>
                <a
                  href="/contact"
                  className="text-gray-600 hover:text-indigo-600 transition">
                  Contact Us
                </a>
              </li>

              <li>
                <a
                  href="/privacy"
                  className="text-gray-600 hover:text-indigo-600 transition">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Right Section */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              Subscribe to our newsletter
            </h3>

            <p className="mt-5 text-gray-600">
              Get the latest updates, articles, and learning resources delivered
              to your inbox.
            </p>

            <form className="mt-7 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />

                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full rounded-lg border border-gray-300 py-3 pl-11 pr-4 outline-none focus:border-indigo-600 transition"
                />
              </div>

              <button
                type="submit"
                className="rounded-lg bg-primary px-6 py-3 font-medium text-white hover:bg-indigo-700 transition cursor-pointer whitespace-nowrap">
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-14 border-t border-gray-200 pt-8 text-center">
          <p className="text-gray-500">
            Copyright © {new Date().getFullYear()} Quick.ai.  All Rights
            Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
