'use client';

import React from 'react';
import Image from 'next/image';
import { Icons } from '@/common/assets';
import Link from 'next/link';

export default function ClinicsReporting() {
  const cardsData = [
    {
      id: '1',
      title: 'Submit End Of Day',
      description: "Record today's clinic operations",
      route: '/submission/eod/1'
    },
    {
      id: '2',
      title: 'Submit End of Month',
      description: 'Submit monthly performance summary',
      route: '/submission/eom/1'
    },
    {
      id: '3',
      title: 'Review EOD Submissions',
      description: 'Access your EOD recorded reports here',
      route: '/review/list/eod'
    },
    {
      id: '4',
      title: 'Review EOM Submissions',
      description: 'Access your EOM recorded reports here',
      route: '/review/list/eom'
    }
  ];

  return (
    <React.Fragment>
      <div className="text-center mb-13">
        <div className="flex justify-center mb-8">
          <Image src={Icons.logo} alt="logo" />
        </div>
        <h1 className="text-black text-2xl font-semibold mb-4">
          Clinics Reporting
        </h1>
        <p className="text-gray-800 max-w-2xl mx-auto">
          Manage clinic reports, submit daily and monthly summaries, track
          records, and maintain compliance, all in one place.
        </p>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        {cardsData.map((card) => (
          <Link
            tabIndex={0}
            key={card.id}
            href={card.route}
            aria-label={`Navigate to ${card.title}`}
            className="flex flex-col justify-center h-37 cursor-pointer group border border-gray-200 rounded-xl p-6 text-center hover:shadow-[0px_4px_25px_0px_rgba(125,176,45,0.25)] hover:border-primary-300 transition-all"
          >
            <h3 className="text-[18px] font-medium group-hover:text-primary-500 group-hover:text-xl group-hover:font-bold transition-all">
              {card.title}
            </h3>
            <p className="text-base text-gray-700 mt-2">{card.description}</p>
          </Link>
        ))}
      </div>
    </React.Fragment>
  );
}
