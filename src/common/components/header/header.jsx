'use client';

import React from 'react';
import Image from 'next/image';
import { Icons } from '@/common/assets';
import { Button } from '@/common/components/button/button';
import { DropdownCom } from '@/common/components/dropdown/dropdown';
import {
  Avatar,
  AvatarImage,
  AvatarFallback
} from '@/common/components/avatar/avatar';

export default function Header({ children }) {
  const handleMenuClick = (e) => {
    console.log('click', e);
  };

  const items = [
    {
      label: '1st menu item',
      key: '1'
    },
    {
      label: '2nd menu item',
      key: '2'
    }
  ];

  const menuProps = {
    items,
    onClick: handleMenuClick
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 bg-white border-b border-secondary-50 p-6">
        <div className="flex items-center justify-between">
          <div>
            <Image src={Icons.logo} alt="logo" />
          </div>
          <div className="flex items-center space-x-3">
            <DropdownCom menu={menuProps} />
            <Button size="sm" variant="ghost" className="!px-1.5 h-8.5">
              <Image src={Icons.fullScreen} alt="fullscreen" />
            </Button>
            <Button size="sm" variant="ghost" className="!px-1.5 h-8.5">
              <Image src={Icons.download} alt="download" />
            </Button>
            <Button size="sm" variant="ghost" className="!px-1.5 h-8.5">
              <Image src={Icons.setting} alt="setting" />
            </Button>
            <Button size="sm" variant="ghost" className="!px-1.5 h-8.5">
              <Image src={Icons.help} alt="help" />
            </Button>
            <Avatar className="w-8.5 h-8.5">
              <AvatarImage src={Icons.userAvatar.src} />
              <AvatarFallback></AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
