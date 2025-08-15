import React from 'react';
import { Link } from 'wouter';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to BazaarLive
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Your premier fashion marketplace
          </p>
          <div className="space-x-4">
            <Link href="/fashion/women">
              <button className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700">
                Shop Women's Fashion
              </button>
            </Link>
            <Link href="/fashion/men">
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
                Shop Men's Fashion
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}