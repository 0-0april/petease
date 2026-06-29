import React from 'react';
import { Link } from 'react-router-dom';

const features = [
  {
    icon: (
      <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    title: 'Pet Adoption',
    description: 'Browse and adopt pets from loving owners. Find your perfect companion today.'
  },
  {
    icon: (
      <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    title: 'Vet Appointments',
    description: 'Book consultations, anti-rabies vaccines, and spay/neuter services with ease.'
  },
  {
    icon: (
      <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    title: 'Medical Records',
    description: 'Keep track of your pet\'s complete medical history, medications, and treatments.'
  },
  {
    icon: (
      <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    title: 'Direct Messaging',
    description: 'Message pet owners directly to ask questions before requesting adoption.'
  },
  {
    icon: (
      <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
    title: 'Real-time Notifications',
    description: 'Stay updated on adoption requests, appointment confirmations, and more.'
  },
  {
    icon: (
      <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: 'Verified Adoptions',
    description: 'All adoptions are processed with official waivers witnessed by vet staff.'
  }
];

const steps = [
  { step: '01', title: 'Create an Account', description: 'Register as a pet owner or adopter in minutes.' },
  { step: '02', title: 'Browse or List Pets', description: 'Find pets available for adoption or list your own.' },
  { step: '03', title: 'Connect & Adopt', description: 'Message owners, request adoption, and complete the process.' },
  { step: '04', title: 'Book Vet Services', description: 'Schedule appointments for your new or existing pets.' }
];

const Landing = () => {
  return (
    <div className="min-h-screen bg-white">

      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <span className="text-2xl font-bold text-primary">PetEase</span>
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-gray-700 hover:text-primary px-4 py-2 rounded-md">
                Login
              </Link>
              <Link to="/register" className="bg-primary text-white px-5 py-2 rounded-md hover:bg-primary-dark">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-green-50 to-white py-24 px-4">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 text-center lg:text-left">
            <span className="inline-block bg-green-100 text-primary text-sm font-semibold px-4 py-1 rounded-full mb-4">
              Pet Adoption & Veterinary System
            </span>
            <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-6">
              Find a Friend.<br />
              <span className="text-primary">Care for Life.</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-xl">
              PetEase connects pet owners, adopters, and veterinary staff in one seamless platform. Adopt, manage, and care for your pets with ease.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/register" className="bg-primary text-white px-8 py-3 rounded-md hover:bg-primary-dark text-center font-semibold">
                Start Adopting
              </Link>
              <Link to="/login" className="border-2 border-primary text-primary px-8 py-3 rounded-md hover:bg-green-50 text-center font-semibold">
                Sign In
              </Link>
            </div>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-4 max-w-md w-full">
            <img src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=300" alt="Dog" className="rounded-2xl object-cover w-full h-48 shadow-md" />
            <img src="https://images.unsplash.com/photo-1574158622682-e40e69881006?w=300" alt="Cat" className="rounded-2xl object-cover w-full h-48 shadow-md mt-8" />
            <img src="https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=300" alt="Cat 2" className="rounded-2xl object-cover w-full h-48 shadow-md -mt-4" />
            <img src="https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=300" alt="Dog 2" className="rounded-2xl object-cover w-full h-48 shadow-md mt-4" />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-primary py-12 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
          {[
            { value: '500+', label: 'Pets Adopted' },
            { value: '1,200+', label: 'Registered Users' },
            { value: '300+', label: 'Appointments Booked' },
            { value: '50+', label: 'Vet Services' }
          ].map((stat, i) => (
            <div key={i}>
              <p className="text-4xl font-bold">{stat.value}</p>
              <p className="text-green-200 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900">Everything You Need</h2>
            <p className="text-gray-600 mt-3 max-w-xl mx-auto">
              A complete platform for pet adoption and veterinary care management.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-green-50 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
            <p className="text-gray-600 mt-3">Get started in just a few simple steps.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute mt-8 ml-32 w-full h-0.5 bg-green-100" />
                )}
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Appointment Types */}
      <section className="py-20 px-4 bg-green-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900">Veterinary Services</h2>
            <p className="text-gray-600 mt-3">Professional care for your pets, scheduled at your convenience.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Consultation',
                schedule: 'Every Monday',
                description: 'General health checkups and medical consultations with our licensed veterinarians.',
                color: 'border-primary'
              },
              {
                title: 'Anti-Rabies Vaccine',
                schedule: 'Weekdays',
                description: 'Keep your pets protected with our regular anti-rabies vaccination program.',
                color: 'border-blue-500'
              },
              {
                title: 'Spay / Neuter',
                schedule: 'By Schedule',
                description: 'Scheduled spay and neuter services announced by our veterinary staff.',
                color: 'border-purple-500'
              }
            ].map((service, i) => (
              <div key={i} className={`bg-white rounded-xl p-6 shadow-sm border-t-4 ${service.color}`}>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">{service.title}</h3>
                <p className="text-sm text-primary font-medium mb-3">{service.schedule}</p>
                <p className="text-gray-600 text-sm">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-primary">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Ready to Find Your Pet?</h2>
          <p className="text-green-200 text-lg mb-8">
            Join hundreds of pet owners and adopters already using PetEase.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="bg-white text-primary px-8 py-3 rounded-md hover:bg-gray-100 font-semibold">
              Create Free Account
            </Link>
            <Link to="/login" className="border-2 border-white text-white px-8 py-3 rounded-md hover:bg-green-700 font-semibold">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <p className="text-white text-xl font-bold">PetEase</p>
            <p className="text-sm mt-1">Pet Adoption & Veterinary Appointment System</p>
          </div>
          <div className="flex space-x-6 text-sm">
            <Link to="/login" className="hover:text-white">Login</Link>
            <Link to="/register" className="hover:text-white">Register</Link>
          </div>
          <p className="text-sm">© {new Date().getFullYear()} PetEase. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
};

export default Landing;
