import React, { useState } from 'react';
import { X, Mail, Send, Check } from 'lucide-react';

export default function ContactModal({ isOpen, onClose }) {
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setEmail('');
      setMessage('');
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="min-h-full flex items-center justify-center p-4 sm:p-6">
        <div
          className="relative bg-white rounded-3xl max-w-lg w-full text-left shadow-2xl p-6 sm:p-8 border border-neutral-100"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-900 transition-colors"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>

          <h3 className="font-serif text-2xl sm:text-3xl font-normal text-neutral-900 mb-1">
            Get In Touch
          </h3>
          <p className="text-xs text-neutral-500 mb-5">
            Suggest a specimen or inquire about partnership opportunities.
          </p>

          {submitted ? (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-[#E87A90]/20 text-[#E87A90] flex items-center justify-center">
                <Check size={20} strokeWidth={2.5} />
              </div>
              <p className="text-sm font-medium text-neutral-900">Message received</p>
              <p className="text-xs text-neutral-400">Our curation team will get back to you shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="curator@example.com"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent bg-neutral-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Message or Product Inquiry
                </label>
                <textarea
                  rows={3}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Share your inquiry or product suggestion..."
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent bg-neutral-50/50 resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-neutral-600 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-medium text-white bg-neutral-900 hover:bg-black transition-colors flex items-center space-x-1.5"
                >
                  <span>Send Message</span>
                  <Send size={12} />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

