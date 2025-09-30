'use client';

import Image from 'next/image';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Icons } from '@/common/assets';
import { Input, Card, Row, Col, Form } from 'antd';
import { AuthService } from '@/common/services/auth';
import { Button } from '@/common/components/button/button';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ResetPasswordForm() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    if (values.new_password !== values.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      const storedEmail = sessionStorage.getItem('email');
      const response = await AuthService.resetPassword({
        ...values,
        email: storedEmail
      });

      if (response.status === 200) {
        toast.success('Password reset successful! You can now login.');
        router.push('/login');
      }
    } catch (error) {
      let errorMessage =
        error?.response?.data?.message ??
        'Something went wrong. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-white">
      <Row className="h-full">
        {/* Left side with image */}
        <Col xs={0} sm={0} md={12}>
          <div className="dentalook-bg"></div>
        </Col>

        {/* Right side with reset password form */}
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
              <h4 className="text-xl text-[#404856]">Reset Password</h4>
              <p className="text-sm text-gray-500 text-center">
                Enter the OTP sent to your email and set your new password.
              </p>
            </div>

            <Form
              form={form}
              layout="vertical"
              autoComplete="off"
              onFinish={onFinish}
              name="reset-password"
            >
              <Form.Item
                name="new_password"
                label="New Password"
                rules={[
                  { required: true, message: 'New password is required' }
                ]}
              >
                <Input.Password
                  placeholder="Enter new password"
                  className="!p-2 !rounded-md !bg-[#F9FAFB] !text-[#6B7280]"
                />
              </Form.Item>

              <Form.Item
                name="confirm_password"
                label="Confirm Password"
                rules={[
                  { required: true, message: 'Confirm password is required' }
                ]}
              >
                <Input.Password
                  placeholder="Confirm new password"
                  className="!p-2 !rounded-md !bg-[#F9FAFB] !text-[#6B7280]"
                />
              </Form.Item>

              <Form.Item
                name="otp"
                label="OTP"
                rules={[{ required: true, message: 'OTP is required' }]}
              >
                <Input.OTP
                  length={6}
                  inputMode="numeric"
                  className="!rounded-md"
                  formatter={(str) => str.toUpperCase()}
                />
              </Form.Item>

              <Form.Item>
                <Button
                  size="lg"
                  type="submit"
                  variant="secondary"
                  isLoading={loading}
                  className="w-full h-9 !shadow-none text-black !rounded-lg"
                >
                  Reset Password
                </Button>
              </Form.Item>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => router.push('/login')}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Back to Login
                </button>
              </div>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
