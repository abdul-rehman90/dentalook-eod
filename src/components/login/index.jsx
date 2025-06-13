'use client';

import Image from 'next/image';
import { Icons } from '@/common/assets';
import { Input, Card, Row, Col } from 'antd';
import { Button } from '@/common/components/button/button';

export default function LoginForm() {
  return (
    <div className="h-screen bg-white">
      <Row className="h-full">
        {/* Left side with image */}
        <Col xs={0} sm={0} md={12}>
          <div className="dentalook-bg"></div>
        </Col>

        {/* Right side with login form */}
        <Col
          xs={24}
          sm={24}
          md={12}
          className="!flex items-center justify-center p-8"
        >
          <Card className="w-full max-w-md !rounded-xl">
            <div className="flex flex-col items-center gap-4 mb-6">
              <div>
                <Image src={Icons.logo} alt="logo" />
              </div>
              <h4 className="text-xl text-[#404856]">Login to Dental Look</h4>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-[#111928] mb-1">
                  First name
                </label>
                <Input
                  placeholder="Enter first name"
                  className="!p-2 !rounded-md !bg-[#F9FAFB] !text-[#6B7280]"
                />
              </div>
              <div>
                <label className="block text-xs text-[#111928] mb-1">
                  Password
                </label>
                <Input.Password
                  placeholder="Enter password"
                  className="!p-2 !rounded-md !bg-[#F9FAFB] !text-[#6B7280]"
                />
              </div>
              <Button
                size="lg"
                variant="secondary"
                className="w-full h-9 !shadow-none text-black !rounded-lg"
              >
                Login
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
