'use client';

import Image from 'next/image';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Icons } from '@/common/assets';
import { useRouter } from 'next/navigation';
import { Input, Card, Row, Col, Form } from 'antd';
import { AuthService } from '@/common/services/auth';
import { Button } from '@/common/components/button/button';

export default function ForgotPasswordForm() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const response = await AuthService.forgotPassword({
        email: values.email
      });
      if (response.status === 200) {
        toast.success(
          'Password reset instructions have been sent to your email.'
        );
        sessionStorage.setItem('email', values.email);
        router.push('/reset-password');
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

        {/* Right side with forgot password form */}
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
              <h4 className="text-xl text-[#404856]">Forgot Password</h4>
              <p className="text-sm text-gray-500 text-center">
                Enter your email and we’ll send you a link to reset your
                password.
              </p>
            </div>

            <Form
              form={form}
              layout="vertical"
              autoComplete="off"
              onFinish={onFinish}
              name="forgot-password"
            >
              <Form.Item
                name="email"
                label="Email"
                rules={[{ required: true, message: 'Email is required' }]}
              >
                <Input
                  placeholder="Enter email"
                  className="!p-2 !rounded-md !bg-[#F9FAFB] !text-[#6B7280]"
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
                  Send Reset Link
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
