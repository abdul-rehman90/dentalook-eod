'use client';

import React from 'react';
import Image from 'next/image';
import { Icons } from '@/common/assets';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardTitle,
  CardHeader,
  CardDescription
} from '@/common/components/card/card';

export default function Index() {
  const router = useRouter();

  const cardsData = [
    {
      id: '1',
      title: 'Submit End Of Day',
      description: "Record today's clinic operations",
      route: '/reports/eod/1'
    },
    {
      id: '2',
      title: 'Submit End of Month',
      description: 'Submit monthly performance summary',
      route: '/reports/eom/1'
    },
    {
      id: '3',
      title: 'Review EOD Submissions',
      description: 'Access your EOD recorded reports here',
      route: '/reports/eod/history'
    },
    {
      id: '4',
      title: 'Review EOM Submissions',
      description: 'Access your EOM recorded reports here',
      route: '/reports/eom/history'
    }
  ];

  const handleCardClick = (route) => {
    router.push(route);
  };

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
          <Card
            key={card.id}
            tabIndex={0}
            role="button"
            aria-label={`Navigate to ${card.title}`}
            className="justify-center h-37 cursor-pointer group hover:shadow-[0px_4px_25px_0px_rgba(125,176,45,0.25)] hover:border-primary-300 hover:border-2 transition-all"
            onClick={() => handleCardClick(card.route)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleCardClick(card.route);
              }
            }}
          >
            <CardHeader className="text-black text-center">
              <CardTitle className="text-[18px] font-medium group-hover:text-primary-500 group-hover:text-xl group-hover:font-bold transition-all">
                {card.title}
              </CardTitle>
              <CardDescription className="text-base">
                {card.description}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </React.Fragment>
  );
}
