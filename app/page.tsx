'use client';

import React from 'react';
import Link from 'next/link';
import { Building, Users, ChartBar, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-700 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-extrabold sm:text-5xl sm:tracking-tight lg:text-6xl">
              Securely Tradable Debts
            </h1>
            <p className="mt-6 text-xl font-medium">
              Tokenize high-margin manufacturing debt, enabling crypto investors to fund manufacturers and earn real-world yields.
            </p>
            <div className="mt-10 flex gap-4">
              <Link
                href="/manufacturer/apply"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Apply as Manufacturer
              </Link>
              <Link
                href="/manufacturer/dashboard"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
              >
                Manufacturer Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Role Cards */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Platform Roles
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              Our platform connects multiple stakeholders in the debt tokenization ecosystem.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Manufacturer */}
            <div className="bg-white overflow-hidden shadow-lg rounded-lg border border-gray-100">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Building className="h-12 w-12 text-indigo-500" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-medium text-gray-900">Manufacturer</h3>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-gray-600">
                    Manufacturers can apply for funding by tokenizing their debt, providing necessary documentation, and receiving funds from investors.
                  </p>
                  <div className="mt-6">
                    <Link
                      href="/manufacturer/apply"
                      className="inline-flex items-center text-indigo-600 hover:text-indigo-800"
                    >
                      Apply as Manufacturer
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Investor */}
            <div className="bg-white overflow-hidden shadow-lg rounded-lg border border-gray-100">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ChartBar className="h-12 w-12 text-indigo-500" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-medium text-gray-900">Investor</h3>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-gray-600">
                    Investors can browse available opportunities, purchase investment lots, and earn real-world yields from successful manufacturing projects.
                  </p>
                  <div className="mt-6">
                    <Link
                      href="/marketplace"
                      className="inline-flex items-center text-indigo-600 hover:text-indigo-800"
                    >
                      View Marketplace
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* DAO */}
            <div className="bg-white overflow-hidden shadow-lg rounded-lg border border-gray-100">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-12 w-12 text-indigo-500" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-medium text-gray-900">DAO</h3>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-gray-600">
                    DAO members vote on proposals, including setting lot sizes, share prices, and maximum investment limits for approved applications.
                  </p>
                  <div className="mt-6">
                    <Link
                      href="/dao"
                      className="inline-flex items-center text-indigo-600 hover:text-indigo-800"
                    >
                      View DAO Proposals
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              How It Works
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              Our platform simplifies the process of debt tokenization for manufacturers and investors.
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="bg-white shadow-md rounded-lg p-6 border border-gray-100">
                <div className="inline-flex h-12 w-12 rounded-full bg-indigo-100 text-indigo-600 items-center justify-center">
                  <span className="text-xl font-bold">1</span>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Manufacturer Application</h3>
                <p className="mt-2 text-gray-600">
                  Manufacturers submit an application with detailed company information, financial documents, and proposed investment terms.
                </p>
              </div>

              <div className="bg-white shadow-md rounded-lg p-6 border border-gray-100">
                <div className="inline-flex h-12 w-12 rounded-full bg-indigo-100 text-indigo-600 items-center justify-center">
                  <span className="text-xl font-bold">2</span>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Diligence & DAO Approval</h3>
                <p className="mt-2 text-gray-600">
                  Applications undergo thorough diligence review, followed by DAO voting on terms and approval for marketplace listing.
                </p>
              </div>

              <div className="bg-white shadow-md rounded-lg p-6 border border-gray-100">
                <div className="inline-flex h-12 w-12 rounded-full bg-indigo-100 text-indigo-600 items-center justify-center">
                  <span className="text-xl font-bold">3</span>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Investment & Returns</h3>
                <p className="mt-2 text-gray-600">
                  Investors purchase debt tokens in the marketplace, and manufacturers make regular payments that are distributed as returns.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
